import { afterEach, describe, expect, it, vi } from 'vitest';

const generateObjectMock = vi.fn();

async function loadChatModule() {
    vi.resetModules();

    vi.doMock('@/lib/ai/braintrust', () => ({
        generateObject: generateObjectMock,
        generateText: vi.fn(),
    }));

    vi.doMock('@/lib/ai/config', () => ({
        chatModel: { modelId: 'test-gemini' },
        searchGroundingModel: { modelId: 'test-gemini-search' },
        geminiProviderOptions: { google: { thinkingLevel: 'minimal' } },
        chatConfig: { maxHistoryMessages: 500 },
    }));

    vi.doMock('@/lib/logger', () => ({
        logger: {
            info: vi.fn(),
            warn: vi.fn(),
            error: vi.fn(),
        },
    }));

    return import('@/lib/ai/chat');
}

afterEach(() => {
    vi.resetModules();
    vi.restoreAllMocks();
});

describe('evaluatePrompt planner contract', () => {
    it('passes explicit schema guidance to the planner provider', async () => {
        generateObjectMock.mockResolvedValueOnce({
            object: {
                verdict: 'ENGAGE',
                message: 'Hi there!',
                suggestions: ['A funny robot'],
            },
        });

        const { evaluatePrompt } = await loadChatModule();

        await expect(evaluatePrompt([{ role: 'user', content: 'hi' }], null))
            .resolves.toMatchObject({ verdict: 'ENGAGE' });

        expect(generateObjectMock).toHaveBeenCalledWith(expect.objectContaining({
            schemaName: 'MyPaperPopPlannerResult',
            schemaDescription: expect.stringContaining('Always return a top-level verdict'),
            temperature: 0,
        }));
        expect(generateObjectMock.mock.calls[0]?.[0].schemaDescription)
            .toContain('Do not return response, prompt, negative_prompt, style_raw, or aspect_ratio');
    });

    it('rejects planner schema/provider failures instead of guessing a fallback generation', async () => {
        const providerError = Object.assign(
            new Error('No object generated: response did not match schema.'),
            {
                text: JSON.stringify({
                    prompt: 'A baby elephant',
                    negative_prompt: 'ugly',
                    style_raw: 'cinematic',
                    aspect_ratio: '16:9',
                }),
            },
        );
        generateObjectMock.mockRejectedValueOnce(providerError);

        const { AiServiceUnavailableError, evaluatePrompt } = await loadChatModule();

        await expect(evaluatePrompt([
            { role: 'user', content: 'A baby elephant holding a daisy' },
        ], null)).rejects.toBeInstanceOf(AiServiceUnavailableError);
    });

    it('rejects GENERATE results that omit required image-planning fields', async () => {
        generateObjectMock.mockResolvedValueOnce({
            object: {
                verdict: 'GENERATE',
                enhancedPrompt: 'A baby elephant',
            },
        });

        const { AiServiceUnavailableError, evaluatePrompt } = await loadChatModule();

        await expect(evaluatePrompt([
            { role: 'user', content: 'A baby elephant holding a daisy' },
        ], null)).rejects.toBeInstanceOf(AiServiceUnavailableError);
    });
});
