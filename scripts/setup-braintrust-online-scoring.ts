import 'dotenv/config';

import {
    ONLINE_SCORER_SLUGS,
    ONLINE_SCORING_RULE_DESCRIPTION,
    ONLINE_SCORING_RULE_NAME,
} from '../braintrust/online-scoring-config';
import { resolveBraintrustProjectName } from '../lib/ai/braintrust-project';

type BraintrustFunction = {
    id: string;
    name?: string;
    slug?: string;
    project_id?: string;
    function_type?: string;
};

type BraintrustListResponse<T> =
    | T[]
    | {
        objects?: T[];
        data?: T[];
    };

const args = new Set(process.argv.slice(2));
const dryRun = args.has('--dry-run');
const jsonOutput = args.has('--json');

const apiUrl = normalizeBaseUrl(process.env.BRAINTRUST_API_URL || 'https://api.braintrust.dev');
const apiKey = process.env.BRAINTRUST_API_KEY;
const projectId = process.env.BRAINTRUST_PROJECT_ID;
const projectName = resolveBraintrustProjectName();
const samplingRate = parseUnitInterval(process.env.BRAINTRUST_ONLINE_SCORING_SAMPLING_RATE, 1);
const traceIdleSeconds = parsePositiveNumber(process.env.BRAINTRUST_ONLINE_SCORING_TRACE_IDLE_SECONDS, 10);
const ruleName = process.env.BRAINTRUST_ONLINE_SCORING_RULE_NAME?.trim() || ONLINE_SCORING_RULE_NAME;
const btqlFilter = optionalTrimmed(process.env.BRAINTRUST_ONLINE_SCORING_BTQL_FILTER);

async function main(): Promise<void> {
    if (!projectId && !dryRun) {
        throw new Error('BRAINTRUST_PROJECT_ID is required. Copy it from the target Braintrust project settings.');
    }
    if (!apiKey && !dryRun) {
        throw new Error('BRAINTRUST_API_KEY is required.');
    }

    const scorerFunctions = dryRun
        ? ONLINE_SCORER_SLUGS.map((slug): BraintrustFunction => ({
            id: `<${slug}-function-id>`,
            slug,
        }))
        : await Promise.all(ONLINE_SCORER_SLUGS.map((slug) => fetchScorerFunction(slug)));

    const payload = buildOnlineScoringPayload({
        projectId: projectId || '<braintrust-project-id>',
        ruleName,
        scorerFunctionIds: scorerFunctions.map((fn) => fn.id),
        samplingRate,
        traceIdleSeconds,
        btqlFilter,
    });

    if (dryRun) {
        writeResult({
            dryRun: true,
            apiUrl,
            projectName,
            scorerSlugs: ONLINE_SCORER_SLUGS,
            payload,
        });
        return;
    }

    const result = await braintrustJson('/v1/project_score', {
        method: 'PUT',
        body: JSON.stringify(payload),
    });

    writeResult({
        dryRun: false,
        apiUrl,
        projectName,
        projectId,
        scorerFunctions: scorerFunctions.map((fn) => ({
            id: fn.id,
            slug: fn.slug,
            name: fn.name,
        })),
        projectScore: result,
    });
}

function buildOnlineScoringPayload(input: {
    projectId: string;
    ruleName: string;
    scorerFunctionIds: string[];
    samplingRate: number;
    traceIdleSeconds: number;
    btqlFilter?: string;
}): Record<string, unknown> {
    return {
        project_id: input.projectId,
        name: input.ruleName,
        description: ONLINE_SCORING_RULE_DESCRIPTION,
        score_type: 'online',
        config: {
            online: {
                sampling_rate: input.samplingRate,
                scorers: input.scorerFunctionIds.map((id) => ({
                    type: 'function',
                    id,
                })),
                apply_to_root_span: true,
                scope: {
                    type: 'trace',
                    idle_seconds: input.traceIdleSeconds,
                },
                ...(input.btqlFilter ? { btql_filter: input.btqlFilter } : {}),
            },
        },
    };
}

async function fetchScorerFunction(slug: string): Promise<BraintrustFunction> {
    const params = new URLSearchParams({
        project_id: projectId!,
        slug,
        function_type: 'scorer',
        limit: '1',
    });
    const response = await braintrustJson<BraintrustListResponse<BraintrustFunction>>(`/v1/function?${params}`);
    const functions = Array.isArray(response)
        ? response
        : response.objects ?? response.data ?? [];
    const scorer = functions.find((fn) => fn.slug === slug) ?? functions[0];

    if (!scorer?.id) {
        throw new Error([
            `Could not find Braintrust scorer function for slug "${slug}" in project ID "${projectId}".`,
            `Run pnpm braintrust:push-scorers with BRAINTRUST_PROJECT_NAME="${projectName}" first,`,
            'then rerun pnpm braintrust:setup-online-scoring.',
        ].join(' '));
    }

    return scorer;
}

async function braintrustJson<T = unknown>(path: string, init: RequestInit = {}): Promise<T> {
    const response = await fetch(`${apiUrl}${path}`, {
        ...init,
        headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
            ...init.headers,
        },
    });

    const text = await response.text();
    const body = text ? JSON.parse(text) : null;

    if (!response.ok) {
        const detail = typeof body === 'object' && body !== null
            ? JSON.stringify(body)
            : text;
        throw new Error(`Braintrust API ${response.status} ${response.statusText}: ${detail}`);
    }

    return body as T;
}

function normalizeBaseUrl(value: string): string {
    return value.replace(/\/+$/, '');
}

function optionalTrimmed(value: string | undefined): string | undefined {
    const trimmed = value?.trim();
    return trimmed || undefined;
}

function parseUnitInterval(value: string | undefined, fallback: number): number {
    if (value === undefined || value.trim() === '') return fallback;
    const parsed = Number(value);
    if (!Number.isFinite(parsed) || parsed < 0 || parsed > 1) {
        throw new Error('BRAINTRUST_ONLINE_SCORING_SAMPLING_RATE must be a number between 0 and 1.');
    }
    return parsed;
}

function parsePositiveNumber(value: string | undefined, fallback: number): number {
    if (value === undefined || value.trim() === '') return fallback;
    const parsed = Number(value);
    if (!Number.isFinite(parsed) || parsed <= 0) {
        throw new Error('BRAINTRUST_ONLINE_SCORING_TRACE_IDLE_SECONDS must be greater than 0.');
    }
    return parsed;
}

function writeResult(value: unknown): void {
    if (jsonOutput) {
        console.info(JSON.stringify(value, null, 2));
        return;
    }

    if (dryRun) {
        console.info('Braintrust online scoring dry run:');
        console.info(JSON.stringify(value, null, 2));
        return;
    }

    console.info('Braintrust online scoring rule configured:');
    console.info(JSON.stringify(value, null, 2));
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
