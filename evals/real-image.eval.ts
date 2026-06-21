import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Eval, type EvalCase, type EvalScorer } from 'braintrust';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import sharp from 'sharp';
import { z } from 'zod';
import { generateObject, imageAttachment } from '../lib/ai/braintrust';
import { getAgeGroupModifier } from '../lib/ai/age-groups';
import { analyzeColoringPageQuality, preprocessColoringPageImage } from '../lib/ai/image-quality';
import { buildImagePrompt, getPaperLayout, type PaperOrientation } from '../lib/ai/prompts/image';
import {
    configureEvalEnv,
    failedRows,
    loadJsonl,
    parseEvalArgs,
    requireProviderEnv,
} from './eval-utils';

configureEvalEnv();

type RealImageCategory = 'normal' | 'age-fit' | 'regression';

type RealImageInput = {
    category: RealImageCategory;
    subject: string;
    ageGroup: string;
    paperOrientation: PaperOrientation;
};

type RealImageJudge = {
    subjectFidelity: number;
    coloringPageStyle: number;
    printability: number;
    ageFit: number;
    composition: number;
    childAppropriate: boolean;
    forbiddenVisualsPresent: boolean;
    overall: number;
    rationale: string;
};

type RealImageOutput = {
    artifactPath: string;
    rawImageArtifact: unknown;
    printableImageArtifact: unknown;
    promptLength: number;
    width: number;
    height: number;
    darkPixelPercent: number;
    darkPixelPasses: boolean;
    judge: RealImageJudge;
};

type RealImageExpected = {
    subjectTerms: string[];
    forbiddenVisuals?: string[];
    minSubjectFidelity: number;
    minColoringPageStyle: number;
    minPrintability: number;
    minAgeFit: number;
    minOverall: number;
};

type RealImageMetadata = {
    id: string;
    risk: string;
    priority: 'P0' | 'P1' | 'P2';
    notes?: string;
};

type RealImageCase = EvalCase<RealImageInput, RealImageExpected, RealImageMetadata>;

const { maxConcurrency, noSendLogs, projectName, projectId, trialCount } = parseEvalArgs();
const runId = new Date().toISOString().replace(/[:.]/g, '-');
const artifactDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '.runs', `real-image-${runId}`);
const judgeProvider = process.env.AI_EVAL_JUDGE_PROVIDER || 'gemini';
const judgeModelName = process.env.AI_EVAL_JUDGE_MODEL || 'gemini-2.5-flash-lite';
const judgeBaseUrl = process.env.AI_EVAL_JUDGE_BASE_URL || (judgeProvider === 'ollama' ? 'http://localhost:11434/v1' : undefined);
const google = createGoogleGenerativeAI({ apiKey: process.env.GEMINI_API_KEY });
const vlmJudgeModel = google(judgeModelName);
const geminiProviderOptions = {
    google: { thinkingLevel: 'minimal' as const },
};
const xaiImageGenerationUrl = 'https://api.x.ai/v1/images/generations';
const xaiImageModel = 'grok-imagine-image-quality';
const xaiImageResolution = '1k';

const imageJudgeSchema = z.object({
    subjectFidelity: z.number().min(1).max(5).describe('1-5 score: requested subject and required terms are visually present.'),
    coloringPageStyle: z.number().min(1).max(5).describe('1-5 score: clean black-and-white coloring page line art, not a photo/poster/filled illustration.'),
    printability: z.number().min(1).max(5).describe('1-5 score: sparse enough to print and color, with open areas and no dense fills.'),
    ageFit: z.number().min(1).max(5).describe('1-5 score: visual complexity matches the requested age group.'),
    composition: z.number().min(1).max(5).describe('1-5 score: main subject is large, centered/composed well, and not cropped.'),
    childAppropriate: z.boolean().describe('False if the image contains unsafe, adult, graphic, scary, or otherwise non-child-appropriate content.'),
    forbiddenVisualsPresent: z.boolean().describe('True if any forbidden visual listed in the prompt appears.'),
    overall: z.number().min(1).max(5).describe('1-5 overall quality for a MyPaperPop coloring page.'),
    rationale: z.string().describe('One concise sentence explaining the score.'),
});

function loadCases(): RealImageCase[] {
    return loadJsonl<RealImageCase>(import.meta.url, 'real-image-cases.jsonl');
}

const subjectFidelityMin: EvalScorer<RealImageInput, RealImageOutput, RealImageExpected, RealImageMetadata> = ({ output, expected }) => ({
    name: 'vlm_subject_fidelity_min',
    score: output.judge.subjectFidelity >= expected.minSubjectFidelity ? 1 : 0,
    metadata: {
        expectedMin: expected.minSubjectFidelity,
        actual: output.judge.subjectFidelity,
        subjectTerms: expected.subjectTerms,
    },
});

const coloringPageStyleMin: EvalScorer<RealImageInput, RealImageOutput, RealImageExpected, RealImageMetadata> = ({ output, expected }) => ({
    name: 'vlm_coloring_page_style_min',
    score: output.judge.coloringPageStyle >= expected.minColoringPageStyle ? 1 : 0,
    metadata: {
        expectedMin: expected.minColoringPageStyle,
        actual: output.judge.coloringPageStyle,
    },
});

const printabilityMin: EvalScorer<RealImageInput, RealImageOutput, RealImageExpected, RealImageMetadata> = ({ output, expected }) => ({
    name: 'vlm_printability_min',
    score: output.judge.printability >= expected.minPrintability ? 1 : 0,
    metadata: {
        expectedMin: expected.minPrintability,
        actual: output.judge.printability,
    },
});

const ageFitMin: EvalScorer<RealImageInput, RealImageOutput, RealImageExpected, RealImageMetadata> = ({ output, expected }) => ({
    name: 'vlm_age_fit_min',
    score: output.judge.ageFit >= expected.minAgeFit ? 1 : 0,
    metadata: {
        expectedMin: expected.minAgeFit,
        actual: output.judge.ageFit,
    },
});

const overallMin: EvalScorer<RealImageInput, RealImageOutput, RealImageExpected, RealImageMetadata> = ({ output, expected }) => ({
    name: 'vlm_overall_min',
    score: output.judge.overall >= expected.minOverall ? 1 : 0,
    metadata: {
        expectedMin: expected.minOverall,
        actual: output.judge.overall,
        rationale: output.judge.rationale,
    },
});

const childAppropriate: EvalScorer<RealImageInput, RealImageOutput, RealImageExpected, RealImageMetadata> = ({ output }) => ({
    name: 'vlm_child_appropriate',
    score: output.judge.childAppropriate ? 1 : 0,
    metadata: {
        actual: output.judge.childAppropriate,
    },
});

const forbiddenVisualsAbsent: EvalScorer<RealImageInput, RealImageOutput, RealImageExpected, RealImageMetadata> = ({ output, expected }) => {
    if (!expected.forbiddenVisuals?.length) return null;
    return {
        name: 'vlm_forbidden_visuals_absent',
        score: output.judge.forbiddenVisualsPresent ? 0 : 1,
        metadata: {
            forbiddenVisuals: expected.forbiddenVisuals,
            actual: output.judge.forbiddenVisualsPresent,
        },
    };
};

const darkPixelGate: EvalScorer<RealImageInput, RealImageOutput, RealImageExpected, RealImageMetadata> = ({ output }) => ({
    name: 'dark_pixel_gate_passes',
    score: output.darkPixelPasses ? 1 : 0,
    metadata: {
        darkPixelPercent: output.darkPixelPercent,
    },
});

async function runRealImageTask(input: RealImageInput, hooks: { expected: RealImageExpected; metadata: RealImageMetadata }): Promise<RealImageOutput> {
    const layout = getPaperLayout(input.paperOrientation);
    const prompt = buildImagePrompt(input.subject, getAgeGroupModifier(input.ageGroup), layout);
    const rawImage = await requestXaiImage(prompt, layout.aspectRatio);
    const printableImage = await preprocessColoringPageImage(rawImage, layout);
    const quality = await analyzeColoringPageQuality(printableImage);
    const artifactPath = await writeImageArtifact(hooks.metadata.id, printableImage);
    const metadata = await sharp(printableImage).metadata();
    const judge = await judgeImage({
        printableImage,
        input,
        expected: hooks.expected,
        darkPixelPercent: quality.darkPixelPercent,
    });

    return {
        artifactPath,
        rawImageArtifact: imageAttachment({
            data: rawImage,
            filename: `${hooks.metadata.id}-raw.png`,
        }),
        printableImageArtifact: imageAttachment({
            data: printableImage,
            filename: `${hooks.metadata.id}-printable.png`,
        }),
        promptLength: prompt.length,
        width: metadata.width ?? 0,
        height: metadata.height ?? 0,
        darkPixelPercent: quality.darkPixelPercent,
        darkPixelPasses: quality.passes,
        judge,
    };
}

async function requestXaiImage(prompt: string, aspectRatio: '3:4' | '4:3'): Promise<Buffer> {
    const response = await fetch(xaiImageGenerationUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${process.env.XAI_API_KEY}`,
        },
        body: JSON.stringify({
            model: xaiImageModel,
            prompt,
            response_format: 'b64_json',
            resolution: xaiImageResolution,
            aspect_ratio: aspectRatio,
        }),
        signal: AbortSignal.timeout(90_000),
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`xAI image eval request failed ${response.status}: ${errorText.slice(0, 500)}`);
    }

    const data = await response.json();
    const rawBase64 = data?.data?.[0]?.b64_json;
    if (!rawBase64) {
        throw new Error('xAI image eval response did not include b64_json');
    }

    return Buffer.from(rawBase64, 'base64');
}

async function judgeImage(input: {
    printableImage: Buffer;
    input: RealImageInput;
    expected: RealImageExpected;
    darkPixelPercent: number;
}): Promise<RealImageJudge> {
    const imageDataUrl = `data:image/png;base64,${input.printableImage.toString('base64')}`;

    if (judgeProvider === 'gemini') {
        const { object } = await generateObject({
            model: vlmJudgeModel,
            schema: imageJudgeSchema,
            messages: [{
                role: 'user',
                content: [
                    {
                        type: 'text',
                        text: imageJudgePrompt(input),
                    },
                    {
                        type: 'image',
                        image: imageDataUrl,
                    },
                ],
            }],
            providerOptions: geminiProviderOptions,
            temperature: 0,
            maxOutputTokens: 500,
            abortSignal: AbortSignal.timeout(30_000),
        } as Parameters<typeof generateObject>[0]);

        return object as RealImageJudge;
    }

    return judgeImageWithOpenAiCompatible({
        imageDataUrl,
        text: imageJudgePrompt(input),
    });
}

function imageJudgePrompt(input: {
    input: RealImageInput;
    expected: RealImageExpected;
    darkPixelPercent: number;
}): string {
    const forbiddenVisuals = input.expected.forbiddenVisuals?.join(', ') || 'none';

    return [
        'Judge this MyPaperPop output image for a children\'s printable coloring-page app.',
        '',
        `Requested subject: ${input.input.subject}`,
        `Age group: ${input.input.ageGroup}`,
        `Paper orientation: ${input.input.paperOrientation}`,
        `Required subject terms: ${input.expected.subjectTerms.join(', ')}`,
        `Forbidden visuals: ${forbiddenVisuals}`,
        `Automated dark pixel percent after preprocessing: ${input.darkPixelPercent}`,
        '',
        'Score 1-5. Be strict: the image must be clean black-and-white line art with open colorable areas, child-safe, printable, and faithful to the requested subject.',
        'Return only JSON with these keys: subjectFidelity, coloringPageStyle, printability, ageFit, composition, childAppropriate, forbiddenVisualsPresent, overall, rationale.',
    ].join('\n');
}

async function judgeImageWithOpenAiCompatible(input: {
    imageDataUrl: string;
    text: string;
}): Promise<RealImageJudge> {
    if (!judgeBaseUrl) {
        throw new Error('AI_EVAL_JUDGE_BASE_URL is required for non-Gemini judge providers.');
    }

    const response = await fetch(`${judgeBaseUrl.replace(/\/$/, '')}/chat/completions`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${process.env.AI_EVAL_JUDGE_API_KEY || 'ollama'}`,
        },
        body: JSON.stringify({
            model: judgeModelName,
            messages: [{
                role: 'user',
                content: [
                    { type: 'text', text: input.text },
                    { type: 'image_url', image_url: { url: input.imageDataUrl } },
                ],
            }],
            response_format: { type: 'json_object' },
            temperature: 0,
            max_tokens: 500,
        }),
        signal: AbortSignal.timeout(60_000),
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Judge request failed ${response.status}: ${errorText.slice(0, 500)}`);
    }

    const data = await response.json();
    const content = data?.choices?.[0]?.message?.content;
    if (typeof content !== 'string') {
        throw new Error('Judge response did not include message.content');
    }

    const jsonText = content.trim().replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```$/i, '').trim();
    return imageJudgeSchema.parse(JSON.parse(jsonText)) as RealImageJudge;
}

async function writeImageArtifact(id: string, buffer: Buffer): Promise<string> {
    await fs.mkdir(artifactDir, { recursive: true });
    const artifactPath = path.join(artifactDir, `${id}.png`);
    await fs.writeFile(artifactPath, buffer);
    return artifactPath;
}

async function main() {
    const requiredEnv = judgeProvider === 'gemini'
        ? ['XAI_API_KEY', 'GEMINI_API_KEY']
        : ['XAI_API_KEY'];
    if (!requireProviderEnv(requiredEnv)) return;

    const result = await Eval<RealImageInput, RealImageOutput, RealImageExpected, RealImageMetadata>(
        projectName,
        {
            data: loadCases,
            projectId,
            task: runRealImageTask,
            scores: [
                subjectFidelityMin,
                coloringPageStyleMin,
                printabilityMin,
                ageFitMin,
                overallMin,
                childAppropriate,
                forbiddenVisualsAbsent,
                darkPixelGate,
            ],
            experimentName: `real-image-quality-${runId}`,
            description: 'MyPaperPop real xAI image eval: image generations plus one configured VLM judge pass per image.',
            maxConcurrency,
            trialCount,
            metadata: {
                mode: 'real-xai-images-plus-configured-vlm-judge',
                imageGeneration: 'xai',
                xaiCalls: 25,
                vlmJudgeCalls: 25,
                artifactDir,
                targetProvider: 'app-default',
                targetImageProvider: 'xai',
                judgeProvider,
                judgeModel: judgeModelName,
            },
            tags: ['real-image-quality', 'xai', `${judgeProvider}-vlm`],
        },
        {
            noSendLogs,
            returnResults: true,
        },
    );

    const failed = failedRows(result.results);
    console.info(JSON.stringify({
        projectName,
        noSendLogs,
        trialCount,
        cases: result.results.length,
        failed: failed.length,
        artifactDir,
        scores: result.summary.scores,
    }, null, 2));

    if (failed.length > 0) {
        for (const row of failed) {
            console.error(JSON.stringify({
                id: row.metadata.id,
                scores: row.scores,
                input: row.input,
                expected: row.expected,
                output: row.output,
            }, null, 2));
        }
        process.exitCode = 1;
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
