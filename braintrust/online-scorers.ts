import { projects, type SpanData, type Trace } from 'braintrust';

const projectName = process.env.BRAINTRUST_PROJECT_NAME || 'My Project';
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
    slug: 'mypaperpop-trace-completed',
    description: 'Scores 1 when a production conversation trace returns an ok status and does not fall back after image generation.',
    ifExists: 'replace',
    tags: ['mypaperpop', 'production', 'trace-health'],
    handler: async ({ output }: ScorerArgs) => {
        if (!output || output.status !== 'ok') return 0;
        return hasImageGenerationFailure(output) ? 0 : 1;
    },
});

project.scorers.create({
    name: 'MyPaperPop image delivered when required',
    slug: 'mypaperpop-generated-image-delivered',
    description: 'Scores non-generation traces as passing, and generation traces by requiring an assistant image URL, download URL, and stored prompt.',
    ifExists: 'replace',
    tags: ['mypaperpop', 'production', 'image-generation'],
    handler: async ({ output, trace }: ScorerArgs) => {
        const spans = await getSpans(trace);
        const plannedGenerate = spans.some((span) => (
            spanName(span) === 'planning'
            && readPath(span.output, ['verdict']) === 'GENERATE'
        ));

        if (!plannedGenerate) return 1;

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
    slug: 'mypaperpop-pipeline-spans-present',
    description: 'Scores 1 when traces contain the expected child spans for the path the planner selected.',
    ifExists: 'replace',
    tags: ['mypaperpop', 'production', 'trace-shape'],
    handler: async ({ trace }: ScorerArgs) => {
        const spans = await getSpans(trace);
        const names = new Set(spans.map(spanName).filter(Boolean));
        const base = ['grounding', 'safety', 'planning'];

        if (!base.every((name) => names.has(name))) return 0;

        const plannedGenerate = spans.some((span) => (
            spanName(span) === 'planning'
            && readPath(span.output, ['verdict']) === 'GENERATE'
        ));

        if (!plannedGenerate) return 1;

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

function readPath(value: unknown, path: string[]): unknown {
    let cursor = value;
    for (const key of path) {
        if (!cursor || typeof cursor !== 'object' || !(key in cursor)) return undefined;
        cursor = (cursor as Record<string, unknown>)[key];
    }
    return cursor;
}
