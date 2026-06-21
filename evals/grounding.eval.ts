import { Eval, type EvalCase, type EvalScorer } from 'braintrust';
import {
    configureEvalEnv,
    failedRows,
    includesText,
    includesUnnegatedText,
    loadJsonl,
    parseEvalArgs,
    requireProviderEnv,
} from './eval-utils';

configureEvalEnv();

type GroundingInput = {
    userMessage: string;
};

type GroundingOutput = {
    brief: string;
    sourceCount: number;
    searchQueryCount: number;
} | null;

type GroundingExpected = {
    referenceType: 'character' | 'creature' | 'factual/non-character' | 'ordinary subject';
    briefIncludes: string[];
    briefExcludes: string[];
    sourceCountMin?: number;
};

type GroundingMetadata = {
    id: string;
    risk: string;
    priority: 'P0' | 'P1' | 'P2';
    notes?: string;
};

type GroundingCase = EvalCase<GroundingInput, GroundingExpected, GroundingMetadata>;

const { maxConcurrency, noSendLogs, projectName, projectId, trialCount } = parseEvalArgs();

function loadCases(): GroundingCase[] {
    return loadJsonl<GroundingCase>(import.meta.url, 'grounding-cases.jsonl');
}

const referenceTypeExact: EvalScorer<GroundingInput, GroundingOutput, GroundingExpected, GroundingMetadata> = ({ output, expected }) => {
    const expectedPrefix = `Reference type: ${expected.referenceType}`;
    return {
        name: 'reference_type_exact',
        score: output?.brief.trim().toLowerCase().startsWith(expectedPrefix.toLowerCase()) ? 1 : 0,
        metadata: {
            expected: expectedPrefix,
            actual: output?.brief.split('.')[0] ?? null,
        },
    };
};

const briefIncludes: EvalScorer<GroundingInput, GroundingOutput, GroundingExpected, GroundingMetadata> = ({ output, expected }) => {
    const misses = expected.briefIncludes.filter((term) => !includesText(output?.brief, term));
    return {
        name: 'grounded_brief_includes',
        score: misses.length === 0 ? 1 : 0,
        metadata: { misses },
    };
};

const briefExcludes: EvalScorer<GroundingInput, GroundingOutput, GroundingExpected, GroundingMetadata> = ({ output, expected }) => {
    const hits = expected.briefExcludes.filter((term) => includesUnnegatedText(output?.brief, term));
    return {
        name: 'grounded_brief_excludes',
        score: hits.length === 0 ? 1 : 0,
        metadata: { hits },
    };
};

const sourceCountMinimum: EvalScorer<GroundingInput, GroundingOutput, GroundingExpected, GroundingMetadata> = ({ output, expected }) => {
    const minimum = expected.sourceCountMin ?? 0;
    return {
        name: 'grounding_source_count_min',
        score: (output?.sourceCount ?? 0) >= minimum ? 1 : 0,
        metadata: {
            expectedMinimum: minimum,
            actual: output?.sourceCount ?? 0,
        },
    };
};

async function runGroundingTask(input: GroundingInput): Promise<GroundingOutput> {
    const { searchForContext } = await import('../lib/ai/chat');
    return searchForContext(input.userMessage);
}

async function main() {
    if (!requireProviderEnv()) return;

    const result = await Eval<GroundingInput, GroundingOutput, GroundingExpected, GroundingMetadata>(
        projectName,
        {
            data: loadCases,
            projectId,
            task: runGroundingTask,
            scores: [
                referenceTypeExact,
                briefIncludes,
                briefExcludes,
                sourceCountMinimum,
            ],
            experimentName: `search-grounding-${new Date().toISOString()}`,
            description: 'MyPaperPop search-grounding evals for named references, factual/non-character preservation, and mascot-invention risk.',
            maxConcurrency,
            trialCount,
            metadata: {
                mode: 'app-provider-path',
                imageGeneration: 'disabled',
                xaiCalls: false,
                targetProvider: 'app-default',
                targetModel: 'app-default',
            },
            tags: ['grounding', 'app-provider'],
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
