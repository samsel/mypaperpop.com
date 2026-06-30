import { projects, type SpanData, type Trace } from 'braintrust';
import { ONLINE_SCORER_SLUGS } from './online-scoring-config';
import { resolveBraintrustProjectName } from '../lib/ai/braintrust-project';

const projectName = resolveBraintrustProjectName();
const project = projects.create({ name: projectName });

type RootOutput = {
    status?: string;
    messages?: Array<{
        role?: string | null;
        content?: string | null;
        imageUrl?: string | null;
        downloadUrl?: string | null;
        promptUsed?: string | null;
        suggestions?: string[] | null;
    }>;
};

type ScorerArgs = {
    input?: unknown;
    output?: RootOutput;
    expected?: unknown;
    metadata?: Record<string, unknown>;
    trace?: Trace;
};

project.scorers.create({
    name: 'MyPaperPop trace completed',
    slug: ONLINE_SCORER_SLUGS[0],
    description: 'Scores 1 when a production conversation trace reaches a valid terminal state and does not fall back after image generation.',
    ifExists: 'replace',
    tags: ['mypaperpop', 'production', 'trace-health'],
    handler: async ({ output }: ScorerArgs) => {
        if (!output || !isValidTerminalStatus(output.status)) return 0;
        return hasImageGenerationFailure(output) ? 0 : 1;
    },
});

project.scorers.create({
    name: 'MyPaperPop image delivered when required',
    slug: ONLINE_SCORER_SLUGS[1],
    description: 'Scores non-generation traces as passing, and generation traces by requiring an assistant image URL, download URL, and stored prompt.',
    ifExists: 'replace',
    tags: ['mypaperpop', 'production', 'image-generation'],
    handler: async ({ output, trace }: ScorerArgs) => {
        if (output?.status === 'no_credits') return 1;

        const spans = await getSpans(trace);
        const plannedGenerate = spans.some((span) => (
            spanName(span) === 'planning'
            && readPath(span.output, ['verdict']) === 'GENERATE'
        ));

        if (!plannedGenerate) return 1;

        const quotaAllowed = spans.some((span) => (
            spanName(span) === 'quota'
            && readPath(span.metadata, ['quotaAllowed']) === true
        ));
        if (!quotaAllowed) return 1;

        const assistantMessages = output?.messages?.filter((message) => message.role === 'assistant') ?? [];
        const deliveredImage = assistantMessages.some((message) => (
            Boolean(message.imageUrl)
            && Boolean(message.downloadUrl)
            && Boolean(message.promptUsed)
            && !message.content?.includes('[image-generation-failed]')
        ));

        return deliveredImage ? 1 : 0;
    },
});

project.scorers.create({
    name: 'MyPaperPop pipeline spans present',
    slug: ONLINE_SCORER_SLUGS[2],
    description: 'Scores 1 when traces contain the expected child spans for the path the planner selected.',
    ifExists: 'replace',
    tags: ['mypaperpop', 'production', 'trace-shape'],
    handler: async ({ trace }: ScorerArgs) => {
        const spans = await getSpans(trace);
        const names = new Set(spans.map(spanName).filter(Boolean));
        const base = ['grounding', 'safety'];

        if (!base.every((name) => names.has(name))) return 0;

        const safetyRejected = spans.some((span) => (
            spanName(span) === 'safety'
            && readPath(span.output, ['allowed']) === false
        ));
        if (safetyRejected) return 1;

        if (!names.has('planning')) return 0;

        const plannedGenerate = spans.some((span) => (
            spanName(span) === 'planning'
            && readPath(span.output, ['verdict']) === 'GENERATE'
        ));

        if (!plannedGenerate) return 1;

        const preQuotaPath = [
            'prompt-construction',
            'quota',
        ];
        if (!preQuotaPath.every((name) => names.has(name))) return 0;

        const quotaAllowed = spans.some((span) => (
            spanName(span) === 'quota'
            && readPath(span.metadata, ['quotaAllowed']) === true
        ));
        if (!quotaAllowed) return 1;

        const generatePath = [
            'prompt-construction',
            'quota',
            'image-generation',
            'follow-up',
            'persistence',
        ];

        return generatePath.every((name) => names.has(name)) ? 1 : 0;
    },
});

async function getSpans(trace: ScorerArgs['trace']): Promise<SpanData[]> {
    if (!trace) return [];

    try {
        return await trace.getSpans({ includeScorers: false });
    } catch {
        return [];
    }
}

function spanName(span: SpanData): string {
    return typeof span.span_attributes?.name === 'string' ? span.span_attributes.name : '';
}

function hasImageGenerationFailure(output: RootOutput): boolean {
    return output.messages?.some((message) => message.content?.includes('[image-generation-failed]')) ?? false;
}

function isValidTerminalStatus(status: string | undefined): boolean {
    return status === 'ok' || status === 'no_credits';
}

function readPath(value: unknown, path: string[]): unknown {
    let cursor = value;
    for (const key of path) {
        if (!cursor || typeof cursor !== 'object' || !(key in cursor)) return undefined;
        cursor = (cursor as Record<string, unknown>)[key];
    }
    return cursor;
}
