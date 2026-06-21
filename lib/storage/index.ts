import sharp from 'sharp';
import { PutObjectCommand, DeleteObjectsCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { logger } from '@/lib/logger';
import { env } from '@/lib/env';
import {
    deleteLocalTestObjects,
    getLocalTestObject,
    putLocalTestObject,
    shouldUseLocalTestStorage,
} from './local-test-storage';

// Lazy-import S3 client
let _s3: import('@aws-sdk/client-s3').S3Client;
let _bucket: string;

function getS3() {
    if (!_s3) {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const { s3, AWS_S3_BUCKET_NAME } = require('./s3-client');
        _s3 = s3;
        _bucket = AWS_S3_BUCKET_NAME;
    }
    return { s3: _s3, bucket: _bucket };
}

function shouldProxyStorageUrls(): boolean {
    const endpoint = new URL(env.AWS_ENDPOINT_URL);
    return endpoint.hostname === 'localhost' || endpoint.hostname === '127.0.0.1';
}

function getProxiedStorageUrl(key: string): string {
    return `/api/storage/${key.split('/').map(encodeURIComponent).join('/')}`;
}

/** Derive the display-variant path from an original PNG path. */
export function getDisplayPath(p: string): string {
    return p.replace(/\.png$/, '_display.webp');
}

/** Derive the thumbnail-variant path from an original PNG path. */
export function getThumbnailPath(p: string): string {
    return p.replace(/\.png$/, '_thumb.webp');
}

/**
 * Generate optimized WebP variants and upload them to S3.
 * Best-effort: logs warnings on failure, never throws.
 */
export async function generateAndUploadVariants(
    buffer: Buffer,
    originalPath: string
): Promise<void> {
    const variantStart = Date.now();
    try {
        const [thumbBuffer, displayBuffer] = await Promise.all([
            sharp(buffer)
                .resize(120, 120, { fit: 'cover' })
                .webp({ quality: 70 })
                .toBuffer(),
            sharp(buffer)
                .resize(800, 800, { fit: 'inside', withoutEnlargement: true })
                .webp({ quality: 80 })
                .toBuffer(),
        ]);

        const thumbPath = getThumbnailPath(originalPath);
        const displayPath = getDisplayPath(originalPath);

        const results = shouldUseLocalTestStorage()
            ? await Promise.allSettled([
                putLocalTestObject({ key: thumbPath, body: thumbBuffer, contentType: 'image/webp' }),
                putLocalTestObject({ key: displayPath, body: displayBuffer, contentType: 'image/webp' }),
            ])
            : await uploadS3Variants(thumbPath, thumbBuffer, displayPath, displayBuffer);

        const variantDuration = Date.now() - variantStart;
        for (const [i, result] of results.entries()) {
            if (result.status === 'rejected') {
                logger.warn('storage/s3', 'Variant upload failed', {
                    variant: i === 0 ? 'thumb' : 'display',
                    originalPath,
                    duration: variantDuration,
                    error: String(result.reason),
                });
            }
        }
        logger.info('storage/s3', 'Variant generation completed', { originalPath, duration: variantDuration });
    } catch (err) {
        logger.warn('storage/s3', 'Variant generation failed', {
            originalPath,
            duration: Date.now() - variantStart,
            error: String(err),
        });
    }
}

/**
 * Upload a Buffer directly to S3 storage.
 * @param buffer Raw PNG image buffer
 * @param userId User ID for organizing files
 * @returns Storage path and the same buffer
 */
export async function uploadSketchImageBuffer(
    buffer: Buffer,
    userId: number
): Promise<{ path: string; buffer: Buffer }> {
    const randomSuffix = crypto.randomUUID().replace(/-/g, '').slice(0, 8);
    const fileName = `${userId}/${Date.now()}_${randomSuffix}.png`;

    const uploadStart = Date.now();
    try {
        if (shouldUseLocalTestStorage()) {
            await putLocalTestObject({ key: fileName, body: buffer, contentType: 'image/png' });
        } else {
            const { s3, bucket } = getS3();
            await s3.send(new PutObjectCommand({
                Bucket: bucket,
                Key: fileName,
                Body: buffer,
                ContentType: 'image/png',
            }));
        }
    } catch (error) {
        const uploadDuration = Date.now() - uploadStart;
        logger.error('storage/s3', 'Upload failed', { fileName, userId, duration: uploadDuration }, error);
        throw new Error(`Failed to upload image: ${error}`);
    }
    const uploadDuration = Date.now() - uploadStart;

    logger.info('storage/s3', 'Upload succeeded', { fileName, duration: uploadDuration });

    return { path: fileName, buffer };
}

/**
 * Extract the object key from a URL or path.
 * Handles: plain keys (DB stored paths), S3 signed URLs, and legacy /sketches/ prefixes.
 */
function getObjectKey(imageUrlOrPath: string): string {
    let key: string;

    if (imageUrlOrPath.startsWith('http')) {
        // S3 signed URL — extract key from path after bucket name
        const url = new URL(imageUrlOrPath);
        const pathParts = url.pathname.split('/');
        // Path-style: /bucket/userId/file.png → drop first two segments (empty + bucket)
        const bucket = env.AWS_S3_BUCKET_NAME ?? 'sketches';
        const bucketIndex = pathParts.indexOf(bucket);
        if (bucketIndex !== -1) {
            key = pathParts.slice(bucketIndex + 1).join('/');
        } else {
            // Legacy URL format: /storage/v1/object/.../sketches/userId/file.png
            const marker = '/sketches/';
            const markerIndex = imageUrlOrPath.indexOf(marker);
            if (markerIndex !== -1) {
                key = imageUrlOrPath.slice(markerIndex + marker.length);
            } else {
                throw new Error('Invalid image URL format');
            }
        }
    } else if (imageUrlOrPath.startsWith('/sketches/')) {
        key = imageUrlOrPath.replace('/sketches/', '');
    } else {
        key = imageUrlOrPath;
    }

    // Defense-in-depth: reject path traversal attempts
    if (key.includes('../') || key.startsWith('/')) {
        throw new Error(`Invalid S3 key: path traversal detected`);
    }

    return key;
}

/**
 * Download a sketch image from S3 as a Buffer.
 * Used by the showcase feature to generate before/after composites.
 */
export async function downloadSketchBuffer(imagePath: string): Promise<Buffer> {
    const key = getObjectKey(imagePath);
    const downloadStart = Date.now();
    try {
        const bytes = shouldUseLocalTestStorage()
            ? (await getLocalTestObject(key)).body
            : Buffer.from(await downloadS3Object(key));
        const duration = Date.now() - downloadStart;
        logger.debug('storage/s3', 'Downloaded sketch buffer', { key, duration, bytes: bytes.length });
        return bytes;
    } catch (error) {
        const duration = Date.now() - downloadStart;
        logger.error('storage/s3', 'Download sketch buffer failed', { key, duration }, error);
        throw new Error(`Failed to download sketch: ${key}`);
    }
}

export async function getSignedSketchImageUrl(
    imageUrlOrPath: string,
    expiresInSeconds = 300
): Promise<string> {
    const { s3, bucket } = getS3();
    const key = getObjectKey(imageUrlOrPath);
    if (shouldProxyStorageUrls()) {
        return getProxiedStorageUrl(key);
    }

    const signStart = Date.now();
    try {
        const url = await getSignedUrl(
            s3,
            new GetObjectCommand({ Bucket: bucket, Key: key }),
            { expiresIn: expiresInSeconds }
        );
        const signDuration = Date.now() - signStart;
        logger.debug('storage/s3', 'Signed URL created', { key, duration: signDuration });
        return url;
    } catch (error) {
        const signDuration = Date.now() - signStart;
        logger.error('storage/s3', 'Signed URL creation failed', { key, duration: signDuration }, error);
        throw new Error(`Failed to create signed image URL for ${key}`);
    }
}

/**
 * Batch-sign multiple storage paths.
 * Returns a Map from the resolved object key to its signed URL.
 * Paths that fail to sign are omitted from the result (logged as warnings).
 *
 * Note: S3 presigning is CPU-only (no network), so individual getSignedUrl calls
 * are fast and can be parallelized with Promise.all.
 */
export async function getSignedSketchImageUrls(
    paths: string[],
    expiresInSeconds = 300
): Promise<Map<string, string>> {
    if (paths.length === 0) return new Map();

    const { s3, bucket } = getS3();
    const keys = paths.map(getObjectKey);
    if (shouldProxyStorageUrls()) {
        return new Map(keys.map((key) => [key, getProxiedStorageUrl(key)]));
    }

    const signStart = Date.now();

    const results = await Promise.allSettled(
        keys.map((key) =>
            getSignedUrl(
                s3,
                new GetObjectCommand({ Bucket: bucket, Key: key }),
                { expiresIn: expiresInSeconds }
            )
        )
    );

    const signDuration = Date.now() - signStart;
    logger.debug('storage/s3', 'Batch signed URLs created', {
        count: paths.length,
        duration: signDuration,
    });

    const result = new Map<string, string>();
    for (let i = 0; i < results.length; i++) {
        const entry = results[i];
        if (entry.status === 'rejected') {
            logger.warn('storage/s3', 'Batch sign: individual path failed', {
                path: keys[i],
                error: String(entry.reason),
            });
            continue;
        }
        result.set(keys[i], entry.value);
    }

    return result;
}

/**
 * Delete images (with their variants) from S3 storage.
 * S3 DeleteObjects supports up to 1000 keys per request, so we chunk if needed.
 */
export async function deleteSketchImages(imagePaths: string[]): Promise<void> {
    if (imagePaths.length === 0) return;

    const objects: { Key: string }[] = [];
    for (const path of imagePaths) {
        const key = getObjectKey(path);
        objects.push({ Key: key });
        if (key.endsWith('.png')) {
            objects.push({ Key: getDisplayPath(key) }, { Key: getThumbnailPath(key) });
        }
    }

    const deleteStart = Date.now();
    if (shouldUseLocalTestStorage()) {
        await deleteLocalTestObjects(objects.map((object) => object.Key));
        const deleteDuration = Date.now() - deleteStart;
        logger.info('storage/s3', 'Batch delete succeeded', { fileCount: objects.length, duration: deleteDuration });
        return;
    }

    const { s3, bucket } = getS3();
    // S3 DeleteObjects max is 1000 per request
    const CHUNK_SIZE = 1000;
    for (let i = 0; i < objects.length; i += CHUNK_SIZE) {
        const chunk = objects.slice(i, i + CHUNK_SIZE);
        try {
            await s3.send(new DeleteObjectsCommand({
                Bucket: bucket,
                Delete: { Objects: chunk, Quiet: true },
            }));
        } catch (error) {
            const deleteDuration = Date.now() - deleteStart;
            logger.error('storage/s3', 'Batch delete failed', { fileCount: chunk.length, duration: deleteDuration }, error);
            throw new Error(`Failed to batch-delete images: ${error}`);
        }
    }
    const deleteDuration = Date.now() - deleteStart;

    logger.info('storage/s3', 'Batch delete succeeded', { fileCount: objects.length, duration: deleteDuration });
}

async function uploadS3Variants(
    thumbPath: string,
    thumbBuffer: Buffer,
    displayPath: string,
    displayBuffer: Buffer,
) {
    const { s3, bucket } = getS3();
    return Promise.allSettled([
        s3.send(new PutObjectCommand({
            Bucket: bucket,
            Key: thumbPath,
            Body: thumbBuffer,
            ContentType: 'image/webp',
        })),
        s3.send(new PutObjectCommand({
            Bucket: bucket,
            Key: displayPath,
            Body: displayBuffer,
            ContentType: 'image/webp',
        })),
    ]);
}

async function downloadS3Object(key: string): Promise<Uint8Array> {
    const { s3, bucket } = getS3();
    const response = await s3.send(new GetObjectCommand({ Bucket: bucket, Key: key }));
    return response.Body!.transformToByteArray();
}
