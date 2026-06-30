import { uploadSketchImageBuffer, generateAndUploadVariants } from '@/lib/storage';
import { imageConfig } from './config';
import { imageAttachment, logBraintrust, traceBraintrust } from './braintrust';
import { logger } from '@/lib/logger';
import type { PaperLayout } from './prompts/image';
import { createStubColoringPageBuffer, shouldStubImageGeneration } from './image-generation-stub';
import {
    getImageGenerationRetryDelayMs,
    isRetriableFetchError,
    isRetriableImageGenerationStatus,
    MAX_IMAGE_GENERATION_ATTEMPTS,
    sleep,
} from './image-generation-retry';
import { analyzeColoringPageQuality, preprocessColoringPageImage } from './image-quality';

const MAX_QUALITY_RETRIES = 1;
const QUALITY_RETRY_PROMPT = [
    '',
    'Quality correction for printable coloring page:',
    '- The previous attempt may have had too much black ink, hatching, texture, shaded road/buildings, dense city windows, or filled dark areas.',
    '- Redraw with sparse clean contour lines, large open white spaces, no hatching, no crosshatching, no texture fills, no shadows, no filled black patches.',
    '- Keep the requested subject and setting intact.',
].join('\n');

/**
 * Generate an image and upload it to S3 storage.
 * Returns the stored image path. Raw model output stays server-side.
 *
 * @param sourceImageUrl Optional source image for multi-turn editing.
 *   Accepts a base64 data URI (`data:image/png;base64,...`) or a public URL.
 *   When provided, uses the xAI /v1/images/edits endpoint with the `image`
 *   object format. Without it, uses /v1/images/generations.
 */
export async function generateAndStoreImage(
    prompt: string,
    userId: number,
    sourceImageUrl?: string,
    layout?: PaperLayout,
): Promise<{ storagePath: string }> {
    const isEdit = !!sourceImageUrl;
    const apiUrl = isEdit ? imageConfig.editApiUrl : imageConfig.apiUrl;
    const paperLayout = layout ?? imageConfig.defaultPaperLayout;

    if (shouldStubImageGeneration()) {
        logger.info('ai/image-generation', 'Using stubbed image generation', {
            promptLength: prompt.length,
            hasSourceImage: isEdit,
            paperOrientation: paperLayout.orientation,
            paperWidthPx: paperLayout.widthPx,
            paperHeightPx: paperLayout.heightPx,
        });

        const stubBuffer = await createStubColoringPageBuffer(prompt, paperLayout);
        const { path: storagePath, buffer } = await uploadSketchImageBuffer(stubBuffer, userId);

        generateAndUploadVariants(buffer, storagePath).catch((err) => {
            logger.error('ai/image-generation', 'Background variant generation failed', { storagePath }, err);
        });

        return { storagePath };
    }

    const requestBody: Record<string, unknown> = {
        model: imageConfig.model,
        prompt,
        response_format: 'b64_json',
        resolution: imageConfig.resolution,
    };
    if (isEdit) {
        requestBody.image = {
            url: sourceImageUrl,
            type: 'image_url',
        };
    } else {
        requestBody.aspect_ratio = paperLayout.aspectRatio;
    }

    logger.info('ai/image-generation', 'xAI API request', {
        url: apiUrl,
        model: imageConfig.model,
        aspectRatio: isEdit ? undefined : paperLayout.aspectRatio,
        resolution: imageConfig.resolution,
        paperOrientation: paperLayout.orientation,
        paperWidthPx: paperLayout.widthPx,
        paperHeightPx: paperLayout.heightPx,
        promptLength: prompt.length,
        hasSourceImage: isEdit,
    });
    let bestPrintableBuffer: Buffer | null = null;
    let bestQuality: Awaited<ReturnType<typeof analyzeColoringPageQuality>> | null = null;
    let usedQualityRetry = false;

    for (let qualityAttempt = 0; qualityAttempt <= MAX_QUALITY_RETRIES; qualityAttempt += 1) {
        const attemptPrompt = qualityAttempt === 0 ? prompt : `${prompt}${QUALITY_RETRY_PROMPT}`;
        const attemptRequestBody = {
            ...requestBody,
            prompt: attemptPrompt,
        };

        const { printableBuffer, quality } = await traceBraintrust(
            'xai-image-api',
            async (span) => {
                span?.log({
                    input: {
                        prompt: attemptPrompt,
                        sourceImage: describeSourceImageForBraintrust(sourceImageUrl),
                    },
                    metadata: {
                        provider: 'xai',
                        model: imageConfig.model,
                        url: apiUrl,
                        endpoint: isEdit ? 'images.edits' : 'images.generations',
                        aspectRatio: isEdit ? undefined : paperLayout.aspectRatio,
                        resolution: imageConfig.resolution,
                        paperOrientation: paperLayout.orientation,
                        paperWidthPx: paperLayout.widthPx,
                        paperHeightPx: paperLayout.heightPx,
                        promptLength: attemptPrompt.length,
                        hasSourceImage: isEdit,
                        qualityAttempt,
                    },
                });

                const { response, duration: fetchDuration } = await requestImageGeneration({
                    apiUrl,
                    requestBody: attemptRequestBody,
                    promptLength: attemptPrompt.length,
                    hasSourceImage: isEdit,
                });

                if (!response.ok) {
                    const errorText = await response.text();
                    logger.error('ai/image-generation', 'xAI API request failed', {
                        url: apiUrl,
                        model: imageConfig.model,
                        status: response.status,
                        duration: fetchDuration,
                        responseBody: errorText.slice(0, 500),
                        promptLength: attemptPrompt.length,
                        hasSourceImage: isEdit,
                        qualityAttempt,
                    });
                    span?.log({
                        error: `xAI API error ${response.status}: ${errorText.slice(0, 500)}`,
                        metadata: {
                            status: response.status,
                            duration: fetchDuration,
                            responseBodyLength: errorText.length,
                        },
                    });
                    throw new Error(`xAI API error ${response.status}: ${errorText}`);
                }

                const data = await response.json();
                const image = data?.data?.[0];
                const rawBase64 = image?.b64_json;
                const imageUrl = image?.url;
                if (!rawBase64 && !imageUrl) {
                    logger.error('ai/image-generation', 'xAI returned no usable image payload', {
                        hasData: Array.isArray(data?.data),
                        keys: image ? Object.keys(image) : [],
                        qualityAttempt,
                    });
                    span?.log({
                        error: 'xAI returned empty image data',
                        metadata: {
                            status: response.status,
                            duration: fetchDuration,
                            hasData: Array.isArray(data?.data),
                            responseKeys: image ? Object.keys(image) : [],
                        },
                    });
                    throw new Error('xAI returned empty image data');
                }

                logger.info('ai/image-generation', 'xAI API response', {
                    status: response.status,
                    duration: fetchDuration,
                    responseFormat: rawBase64 ? 'b64_json' : 'url',
                    responseSize: rawBase64?.length ?? 0,
                    qualityAttempt,
                });

                const rawBuffer = rawBase64
                    ? Buffer.from(rawBase64, 'base64')
                    : await downloadImageBuffer(imageUrl);
                const printableBuffer = await preprocessColoringPageImage(rawBuffer, paperLayout);
                const quality = await analyzeColoringPageQuality(printableBuffer);

                span?.log({
                    metadata: {
                        status: response.status,
                        duration: fetchDuration,
                        responseFormat: rawBase64 ? 'b64_json' : 'url',
                        rawBytes: rawBuffer.length,
                        printableBytes: printableBuffer.length,
                        darkPixelPercent: quality.darkPixelPercent,
                        darkPixelPasses: quality.passes,
                        darkPixelReason: quality.reason,
                    },
                    output: {
                        rawImage: imageAttachment({
                            data: rawBuffer,
                            filename: `xai-raw-attempt-${qualityAttempt}.png`,
                        }),
                        printableImage: imageAttachment({
                            data: printableBuffer,
                            filename: `xai-printable-attempt-${qualityAttempt}.png`,
                        }),
                    },
                });

                return { printableBuffer, quality };
            },
            { type: 'llm' },
        );

        logger.info('ai/image-generation', 'Printable image quality analyzed', {
            darkPixelPercent: quality.darkPixelPercent,
            passes: quality.passes,
            reason: quality.reason,
            qualityAttempt,
            hasSourceImage: isEdit,
        });

        if (!bestQuality || quality.darkPixelRatio < bestQuality.darkPixelRatio) {
            bestQuality = quality;
            bestPrintableBuffer = printableBuffer;
        }

        if (quality.passes) break;

        if (qualityAttempt < MAX_QUALITY_RETRIES) {
            usedQualityRetry = true;
            logger.warn('ai/image-generation', 'Printable image too dense, retrying once', {
                darkPixelPercent: quality.darkPixelPercent,
                reason: quality.reason,
                hasSourceImage: isEdit,
            });
        }
    }

    if (!bestPrintableBuffer || !bestQuality) {
        throw new Error('Failed to prepare printable image');
    }

    if (!bestQuality.passes) {
        logger.warn('ai/image-generation', 'Using best available image after quality retry', {
            darkPixelPercent: bestQuality.darkPixelPercent,
            reason: bestQuality.reason,
            usedQualityRetry,
            hasSourceImage: isEdit,
        });
    }

    const printableBuffer = bestPrintableBuffer;
    const { path: storagePath, buffer } = await uploadSketchImageBuffer(printableBuffer, userId);
    logBraintrust({
        metadata: {
            step: 'image-storage',
            storagePath,
            userId,
            printableBytes: printableBuffer.length,
            uploadedBytes: buffer.length,
            darkPixelPercent: bestQuality.darkPixelPercent,
            darkPixelPasses: bestQuality.passes,
            usedQualityRetry,
        },
        output: {
            storedPrintableImage: imageAttachment({
                data: printableBuffer,
                filename: 'stored-printable.png',
            }),
        },
    });

    // Fire-and-forget variant generation (display + thumbnail WebP)
    generateAndUploadVariants(buffer, storagePath).catch((err) => {
        logger.error('ai/image-generation', 'Background variant generation failed', { storagePath }, err);
    });

    return { storagePath };
}

async function requestImageGeneration(input: {
    apiUrl: string;
    requestBody: Record<string, unknown>;
    promptLength: number;
    hasSourceImage: boolean;
}): Promise<{ response: Response; duration: number }> {
    const fetchStart = Date.now();
    let lastError: unknown;

    for (let attempt = 1; attempt <= MAX_IMAGE_GENERATION_ATTEMPTS; attempt += 1) {
        try {
            const response = await fetch(input.apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${imageConfig.apiKey}`,
                },
                body: JSON.stringify(input.requestBody),
                signal: AbortSignal.timeout(60_000),
            });

            if (response.ok || !isRetriableImageGenerationStatus(response.status) || attempt === MAX_IMAGE_GENERATION_ATTEMPTS) {
                return { response, duration: Date.now() - fetchStart };
            }

            const errorText = await response.text();
            logger.warn('ai/image-generation', 'xAI API request failed, retrying', {
                url: input.apiUrl,
                model: imageConfig.model,
                status: response.status,
                attempt,
                maxAttempts: MAX_IMAGE_GENERATION_ATTEMPTS,
                responseBody: errorText.slice(0, 500),
                promptLength: input.promptLength,
                hasSourceImage: input.hasSourceImage,
            });

            await sleep(getImageGenerationRetryDelayMs(attempt));
        } catch (error) {
            lastError = error;
            if (!isRetriableFetchError(error) || attempt === MAX_IMAGE_GENERATION_ATTEMPTS) {
                throw error;
            }

            logger.warn('ai/image-generation', 'xAI API request errored, retrying', {
                url: input.apiUrl,
                model: imageConfig.model,
                attempt,
                maxAttempts: MAX_IMAGE_GENERATION_ATTEMPTS,
                error: error instanceof Error ? error.message : String(error),
                promptLength: input.promptLength,
                hasSourceImage: input.hasSourceImage,
            });

            await sleep(getImageGenerationRetryDelayMs(attempt));
        }
    }

    throw lastError instanceof Error ? lastError : new Error('xAI API request failed');
}

function describeSourceImageForBraintrust(sourceImageUrl?: string): Record<string, unknown> | null {
    if (!sourceImageUrl) return null;

    const dataUrlMatch = /^data:([^;,]+)?(;base64)?,(.*)$/s.exec(sourceImageUrl);
    if (dataUrlMatch) {
        const [, contentType, encoding, payload] = dataUrlMatch;
        return {
            present: true,
            kind: 'data-url',
            contentType: contentType || 'application/octet-stream',
            encoding: encoding ? 'base64' : 'url-encoded',
            byteEstimate: encoding ? Math.floor((payload.length * 3) / 4) : payload.length,
        };
    }

    return {
        present: true,
        kind: sourceImageUrl.startsWith('http://') || sourceImageUrl.startsWith('https://')
            ? 'remote-url'
            : 'other-url',
        length: sourceImageUrl.length,
    };
}

async function downloadImageBuffer(url: string): Promise<Buffer> {
    const response = await fetch(url, {
        signal: AbortSignal.timeout(30_000),
    });

    if (!response.ok) {
        throw new Error(`Failed to download xAI image URL: ${response.status}`);
    }

    const contentType = response.headers.get('content-type') ?? '';
    if (contentType && !contentType.startsWith('image/')) {
        throw new Error(`xAI image URL returned non-image content: ${contentType}`);
    }

    return Buffer.from(await response.arrayBuffer());
}
