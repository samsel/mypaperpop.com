import { Eval, type EvalCase, type EvalScorer } from 'braintrust';
import {
    configureEvalEnv,
    failedRows,
    includesText,
    loadJsonl,
    parseEvalArgs,
    requireProviderEnv,
} from './eval-utils';

configureEvalEnv();

type ChatMessage = {
    role: string;
    content: string;
};

type FollowUpInput = {
    promptUsed: string;
    history?: ChatMessage[];
};

type FollowUpOutput = {
    message: string;
    suggestions: string[];
};

type FollowUpExpected = {
    suggestionCountMin: number;
    suggestionCountMax: number;
    maxSuggestionWords: number;
    maxMessageWords: number;
    messageIncludesAny?: string[];
    suggestionsExclude?: string[];
};

type FollowUpMetadata = {
    id: string;
    risk: string;
    priority: 'P0' | 'P1' | 'P2';
    notes?: string;
};

type FollowUpCase = EvalCase<FollowUpInput, FollowUpExpected, FollowUpMetadata>;

const { maxConcurrency, noSendLogs, projectName, projectId, trialCount } = parseEvalArgs();

function loadCases(): FollowUpCase[] {
    return loadJsonl<FollowUpCase>(import.meta.url, 'followup-cases.jsonl');
}

function wordCount(text: string): number {
    return text.trim().split(/\s+/).filter(Boolean).length;
}

const suggestionCountInRange: EvalScorer<FollowUpInput, FollowUpOutput, FollowUpExpected, FollowUpMetadata> = ({ output, expected }) => ({
    name: 'suggestion_count_in_range',
    score: output.suggestions.length >= expected.suggestionCountMin
        && output.suggestions.length <= expected.suggestionCountMax ? 1 : 0,
    metadata: {
        expectedMin: expected.suggestionCountMin,
        expectedMax: expected.suggestionCountMax,
        actual: output.suggestions.length,
    },
});

const suggestionsShort: EvalScorer<FollowUpInput, FollowUpOutput, FollowUpExpected, FollowUpMetadata> = ({ output, expected }) => {
    const tooLong = output.suggestions.filter((suggestion) => wordCount(suggestion) > expected.maxSuggestionWords);

    return {
        name: 'suggestions_under_word_limit',
        score: tooLong.length === 0 ? 1 : 0,
        metadata: {
            maxWords: expected.maxSuggestionWords,
            tooLong,
        },
    };
};

const messageShort: EvalScorer<FollowUpInput, FollowUpOutput, FollowUpExpected, FollowUpMetadata> = ({ output, expected }) => ({
    name: 'message_under_word_limit',
    score: wordCount(output.message) <= expected.maxMessageWords ? 1 : 0,
    metadata: {
        maxWords: expected.maxMessageWords,
        actualWords: wordCount(output.message),
    },
});

const messageSpecific: EvalScorer<FollowUpInput, FollowUpOutput, FollowUpExpected, FollowUpMetadata> = ({ output, expected }) => {
    if (!expected.messageIncludesAny?.length) return null;

    const matched = expected.messageIncludesAny.filter((term) => includesText(output.message, term));

    return {
        name: 'message_mentions_subject',
        score: matched.length > 0 ? 1 : 0,
        metadata: {
            expectedAny: expected.messageIncludesAny,
            matched,
            message: output.message,
        },
    };
};

const suggestionsAvoidGenericBadFits: EvalScorer<FollowUpInput, FollowUpOutput, FollowUpExpected, FollowUpMetadata> = ({ output, expected }) => {
    if (!expected.suggestionsExclude?.length) return null;

    const joinedSuggestions = output.suggestions.join(' | ');
    const forbidden = expected.suggestionsExclude.filter((term) => includesText(joinedSuggestions, term));

    return {
        name: 'suggestions_avoid_generic_bad_fits',
        score: forbidden.length === 0 ? 1 : 0,
        metadata: {
            forbidden,
            suggestions: output.suggestions,
        },
    };
};

async function runFollowUpTask(input: FollowUpInput): Promise<FollowUpOutput> {
    const { generateFollowUp } = await import('../lib/ai/chat');
    return generateFollowUp(input.promptUsed, input.history);
}

async function main() {
    if (!requireProviderEnv()) return;

    const result = await Eval<FollowUpInput, FollowUpOutput, FollowUpExpected, FollowUpMetadata>(
        projectName,
        {
            data: loadCases,
            projectId,
            task: runFollowUpTask,
            scores: [
                suggestionCountInRange,
                suggestionsShort,
                messageShort,
                messageSpecific,
                suggestionsAvoidGenericBadFits,
            ],
            experimentName: `followup-${new Date().toISOString()}`,
            description: 'MyPaperPop follow-up evals for reaction-message specificity and suggestion-chip structure after image generation.',
            maxConcurrency,
            trialCount,
            metadata: {
                mode: 'app-provider-path',
                imageGeneration: 'disabled',
                xaiCalls: false,
                targetProvider: 'app-default',
                targetModel: 'app-default',
            },
            tags: ['followup', 'app-provider'],
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
