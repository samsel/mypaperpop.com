import { Eval, type EvalCase, type EvalScorer } from 'braintrust';
import { isValidAgeGroup, getAgeGroupModifier } from '../lib/ai/age-groups';
import { buildImagePrompt, getPaperLayout } from '../lib/ai/prompts/image';
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

type AgeFitInput = {
    content: string;
    ageGroup: string;
    paperOrientation: 'portrait' | 'landscape';
    messages?: ChatMessage[];
    currentImagePrompt?: string | null;
    groundedVisualBrief?: string | null;
};

type AgeFitOutput = {
    verdict?: 'GENERATE' | 'CLARIFY' | 'ENGAGE';
    subject: string;
    styledPrompt: string;
    ageGroupValid: boolean;
};

type AgeFitExpected = {
    promptIncludes: string[];
    promptExcludes: string[];
    ageGroupValid: boolean;
};

type AgeFitMetadata = {
    id: string;
    risk: string;
    priority: 'P0' | 'P1' | 'P2';
    notes?: string;
};

type AgeFitCase = EvalCase<AgeFitInput, AgeFitExpected, AgeFitMetadata>;

const { maxConcurrency, noSendLogs, projectName, projectId, trialCount } = parseEvalArgs();

function loadCases(): AgeFitCase[] {
    return loadJsonl<AgeFitCase>(import.meta.url, 'age-fit-cases.jsonl');
}

const ageGroupValidExact: EvalScorer<AgeFitInput, AgeFitOutput, AgeFitExpected, AgeFitMetadata> = ({ output, expected }) => ({
    name: 'age_group_valid_exact',
    score: output.ageGroupValid === expected.ageGroupValid ? 1 : 0,
    metadata: {
        expected: expected.ageGroupValid,
        actual: output.ageGroupValid,
    },
});

const promptIncludes: EvalScorer<AgeFitInput, AgeFitOutput, AgeFitExpected, AgeFitMetadata> = ({ output, expected }) => {
    const misses = expected.promptIncludes.filter((term) => !includesText(output.styledPrompt, term));

    return {
        name: 'age_fit_prompt_includes',
        score: misses.length === 0 ? 1 : 0,
        metadata: { misses },
    };
};

const promptExcludes: EvalScorer<AgeFitInput, AgeFitOutput, AgeFitExpected, AgeFitMetadata> = ({ output, expected }) => {
    const hits = expected.promptExcludes.filter((term) => includesUnnegatedText(output.styledPrompt, term));

    return {
        name: 'age_fit_prompt_excludes',
        score: hits.length === 0 ? 1 : 0,
        metadata: { hits },
    };
};

const generateOnlyWhenProviderBacked: EvalScorer<AgeFitInput, AgeFitOutput, AgeFitExpected, AgeFitMetadata> = ({ output }) => {
    if (!output.verdict) return null;

    return {
        name: 'provider_age_fit_cases_generate',
        score: output.verdict === 'GENERATE' ? 1 : 0,
        metadata: {
            actual: output.verdict,
        },
    };
};

async function runAgeFitTask(input: AgeFitInput): Promise<AgeFitOutput> {
    const ageGroupValid = isValidAgeGroup(input.ageGroup);
    const ageModifier = getAgeGroupModifier(input.ageGroup);
    const paperLayout = getPaperLayout(input.paperOrientation);

    const { evaluatePrompt } = await import('../lib/ai/chat');
    const evaluation = await evaluatePrompt(
        input.messages ?? [{ role: 'user', content: input.content }],
        input.currentImagePrompt ?? null,
        input.ageGroup,
        null,
        input.groundedVisualBrief ?? null,
    );
    const subject = evaluation.verdict === 'GENERATE'
        ? evaluation.enhancedPrompt || input.content
        : input.content;

    return {
        verdict: evaluation.verdict,
        subject,
        styledPrompt: buildImagePrompt(subject, ageModifier, paperLayout),
        ageGroupValid,
    };
}

async function main() {
    if (!requireProviderEnv()) return;

    const result = await Eval<AgeFitInput, AgeFitOutput, AgeFitExpected, AgeFitMetadata>(
        projectName,
        {
            data: loadCases,
            projectId,
            task: runAgeFitTask,
            scores: [
                ageGroupValidExact,
                promptIncludes,
                promptExcludes,
                generateOnlyWhenProviderBacked,
            ],
            experimentName: `age-fit-prompt-${new Date().toISOString()}`,
            description: 'MyPaperPop age-fit and printable prompt evals for valid age bands, simplified complexity, subject fidelity, and line-art constraints.',
            maxConcurrency,
            trialCount,
            metadata: {
                mode: 'app-provider-path',
                imageGeneration: 'disabled',
                xaiCalls: false,
                targetProvider: 'app-default',
                targetModel: 'app-default',
            },
            tags: ['age-fit', 'printability', 'app-provider'],
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
