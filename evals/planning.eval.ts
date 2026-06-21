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

type ChatMessage = {
    role: 'user' | 'assistant';
    content: string;
};

type EvalInput = {
    messages: ChatMessage[];
    currentImagePrompt: string | null;
    ageGroup?: string;
    groundedVisualBrief?: string | null;
};

type EvalOutput = {
    verdict: 'GENERATE' | 'CLARIFY' | 'ENGAGE';
    enhancedPrompt?: string;
    paperOrientation?: 'portrait' | 'landscape';
    message?: string;
    suggestions?: string[];
};

type EvalExpected = {
    verdict: EvalOutput['verdict'];
    paperOrientation?: EvalOutput['paperOrientation'];
    enhancedPromptIncludes?: string[];
    enhancedPromptExcludes?: string[];
    suggestionCountMin?: number;
};

type EvalMetadata = {
    id: string;
    risk: string;
    notes?: string;
};

type PlanningCase = EvalCase<EvalInput, EvalExpected, EvalMetadata>;

const { maxConcurrency, noSendLogs, projectName, projectId, trialCount } = parseEvalArgs();

function loadCases(): PlanningCase[] {
    return loadJsonl<PlanningCase>(import.meta.url, 'planning-cases.jsonl');
}

const verdictExact: EvalScorer<EvalInput, EvalOutput, EvalExpected, EvalMetadata> = ({ output, expected }) => ({
    name: 'verdict_exact',
    score: output.verdict === expected.verdict ? 1 : 0,
    metadata: {
        expected: expected.verdict,
        actual: output.verdict,
    },
});

const orientationExact: EvalScorer<EvalInput, EvalOutput, EvalExpected, EvalMetadata> = ({ output, expected }) => {
    if (expected.verdict !== 'GENERATE' || !expected.paperOrientation) {
        return null;
    }

    return {
        name: 'orientation_exact',
        score: output.paperOrientation === expected.paperOrientation ? 1 : 0,
        metadata: {
            expected: expected.paperOrientation,
            actual: output.paperOrientation ?? null,
        },
    };
};

const enhancedPromptIncludes: EvalScorer<EvalInput, EvalOutput, EvalExpected, EvalMetadata> = ({ output, expected }) => {
    if (expected.verdict !== 'GENERATE' || !expected.enhancedPromptIncludes?.length) {
        return null;
    }

    const misses = expected.enhancedPromptIncludes.filter((term) => !includesText(output.enhancedPrompt, term));

    return {
        name: 'enhanced_prompt_includes',
        score: misses.length === 0 ? 1 : 0,
        metadata: { misses },
    };
};

const enhancedPromptExcludes: EvalScorer<EvalInput, EvalOutput, EvalExpected, EvalMetadata> = ({ output, expected }) => {
    if (expected.verdict !== 'GENERATE' || !expected.enhancedPromptExcludes?.length) {
        return null;
    }

    const hits = expected.enhancedPromptExcludes.filter((term) => includesUnnegatedText(output.enhancedPrompt, term));

    return {
        name: 'enhanced_prompt_excludes',
        score: hits.length === 0 ? 1 : 0,
        metadata: { hits },
    };
};

const nonGenerateResponseUseful: EvalScorer<EvalInput, EvalOutput, EvalExpected, EvalMetadata> = ({ output, expected }) => {
    if (expected.verdict === 'GENERATE') {
        return null;
    }

    const minimum = expected.suggestionCountMin ?? 1;
    const messageOk = Boolean(output.message?.trim());
    const suggestionsOk = (output.suggestions?.length ?? 0) >= minimum;

    return {
        name: 'non_generate_response_useful',
        score: messageOk && suggestionsOk ? 1 : 0,
        metadata: {
            messageOk,
            expectedSuggestionCountMin: minimum,
            actualSuggestionCount: output.suggestions?.length ?? 0,
        },
    };
};

async function runPlanningTask(input: EvalInput, hooks: { metadata: EvalMetadata }): Promise<EvalOutput> {
    if (!process.env.GEMINI_API_KEY) {
        throw new Error('GEMINI_API_KEY is required for AI evals.');
    }

    const { evaluatePrompt } = await import('../lib/ai/chat');
    return evaluatePrompt(
        input.messages,
        input.currentImagePrompt,
        input.ageGroup,
        null,
        input.groundedVisualBrief ?? null,
    );
}

async function main() {
    if (!requireProviderEnv()) return;

    const result = await Eval<EvalInput, EvalOutput, EvalExpected, EvalMetadata>(
        projectName,
        {
            data: loadCases,
            projectId,
            task: runPlanningTask,
            scores: [
                verdictExact,
                orientationExact,
                enhancedPromptIncludes,
                enhancedPromptExcludes,
                nonGenerateResponseUseful,
            ],
            experimentName: `planning-routing-${new Date().toISOString()}`,
            description: 'MyPaperPop planning/routing evals for credit-boundary, orientation, age-fit, and prompt-quality regressions.',
            maxConcurrency,
            trialCount,
            metadata: {
                mode: 'app-provider-path',
                imageGeneration: 'disabled',
                xaiCalls: false,
                targetProvider: 'app-default',
                targetModel: 'app-default',
            },
            tags: ['planning', 'routing', 'app-provider'],
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
