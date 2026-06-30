import { afterEach, describe, expect, it, vi } from 'vitest';

async function loadBraintrustModule() {
    vi.resetModules();
    vi.doMock('server-only', () => ({}));
    vi.doMock('ai', () => ({
        generateObject: vi.fn(),
        generateText: vi.fn(),
    }));

    const traced = vi.fn(async (fn) => fn({ log: vi.fn() }));
    const initLogger = vi.fn(() => ({ traced }));
    const wrapAISDK = vi.fn((sdk) => sdk);
    const currentSpan = vi.fn(() => ({ log: vi.fn() }));
    const Attachment = vi.fn(function Attachment(this: unknown, input: unknown) {
        return { attachment: input };
    });
    vi.doMock('braintrust', () => ({
        Attachment,
        currentSpan,
        initLogger,
        wrapAISDK,
    }));

    const module = await import('@/lib/ai/braintrust');
    return { module, initLogger, wrapAISDK };
}

afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
    vi.restoreAllMocks();
});

describe('Braintrust AI SDK tracing', () => {
    it('wraps AI SDK calls without requiring a Braintrust API key', async () => {
        vi.stubEnv('BRAINTRUST_API_KEY', '');

        const { module, initLogger, wrapAISDK } = await loadBraintrustModule();

        expect(initLogger).not.toHaveBeenCalled();
        expect(wrapAISDK).toHaveBeenCalledOnce();
        expect(module.generateObject).toEqual(expect.any(Function));
        expect(module.generateText).toEqual(expect.any(Function));
    });

    it('uses the MyPaperPop dev project by default', async () => {
        vi.stubEnv('BRAINTRUST_API_KEY', 'sk-test');
        vi.stubEnv('BRAINTRUST_PROJECT_NAME', '');
        vi.stubEnv('VERCEL_ENV', '');
        vi.stubEnv('NODE_ENV', 'development');

        const { initLogger } = await loadBraintrustModule();

        expect(initLogger).toHaveBeenCalledWith({
            projectName: 'mypaperpop.com-dev',
            apiKey: 'sk-test',
        });
    });

    it('uses the MyPaperPop production project in production', async () => {
        vi.stubEnv('BRAINTRUST_API_KEY', 'sk-test');
        vi.stubEnv('BRAINTRUST_PROJECT_NAME', '');
        vi.stubEnv('VERCEL_ENV', 'production');

        const { initLogger } = await loadBraintrustModule();

        expect(initLogger).toHaveBeenCalledWith({
            projectName: 'mypaperpop.com',
            apiKey: 'sk-test',
        });
    });

    it('initializes Braintrust when the API key is configured', async () => {
        vi.stubEnv('BRAINTRUST_API_KEY', 'sk-test');
        vi.stubEnv('BRAINTRUST_PROJECT_NAME', 'MyPaperPop Test');

        const { initLogger } = await loadBraintrustModule();

        expect(initLogger).toHaveBeenCalledWith({
            projectName: 'MyPaperPop Test',
            apiKey: 'sk-test',
        });
    });
});
