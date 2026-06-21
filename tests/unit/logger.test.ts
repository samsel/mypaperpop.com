import { beforeEach, describe, expect, it, vi } from 'vitest';

async function loadLogger() {
    vi.resetModules();
    vi.stubEnv('POSTGRES_URL', 'postgres://user:password@localhost:5432/mypaperpop_test');
    vi.stubEnv('AUTH_SECRET', 'test-auth-secret');
    vi.stubEnv('GOOGLE_CLIENT_ID', 'test-google-client-id');
    vi.stubEnv('GOOGLE_CLIENT_SECRET', 'test-google-client-secret');
    vi.stubEnv('STRIPE_SECRET_KEY', 'sk_test_dummy');
    vi.stubEnv('STRIPE_WEBHOOK_SECRET', 'whsec_dummy');
    vi.stubEnv('BASE_URL', 'http://localhost:3000');
    vi.stubEnv('AWS_ENDPOINT_URL', 'http://localhost:9000');
    vi.stubEnv('AWS_ACCESS_KEY_ID', 'test-access-key');
    vi.stubEnv('AWS_SECRET_ACCESS_KEY', 'test-secret-key');
    vi.stubEnv('XAI_API_KEY', 'xai-test-key');
    vi.stubEnv('GEMINI_API_KEY', 'gemini-test-key');
    return import('@/lib/logger');
}

describe('logger payload shape', () => {
    beforeEach(() => {
        vi.unstubAllEnvs();
    });

    it('keeps arbitrary log context under one map-field parent', async () => {
        const { buildLogPayload } = await loadLogger();
        const payload = buildLogPayload('payments/stripe', {
            sessionId: 'cs_test_123',
            duration: 42,
            nested: {
                storagePath: 'users/1/image.png',
            },
        });

        expect(payload).toEqual({
            module: 'payments/stripe',
            context: {
                sessionId: 'cs_test_123',
                duration: 42,
                nested: {
                    storagePath: 'users/1/image.png',
                },
            },
        });
        expect(payload).not.toHaveProperty('sessionId');
        expect(payload).not.toHaveProperty('duration');
        expect(payload).not.toHaveProperty('storagePath');
    });

    it('redacts sensitive keys before sending context to Axiom', async () => {
        const { buildLogPayload } = await loadLogger();
        const payload = buildLogPayload('api', {
            authorization: 'Bearer secret',
            cookie: 'session=secret',
            nested: {
                apiToken: 'secret',
                safe: 'ok',
            },
        });

        expect(payload.context).toEqual({
            authorization: '[REDACTED]',
            cookie: '[REDACTED]',
            nested: {
                apiToken: '[REDACTED]',
                safe: 'ok',
            },
        });
    });

    it('summarizes errors instead of logging high-dimensional provider payloads', async () => {
        const { buildLogPayload } = await loadLogger();
        const error = Object.assign(new Error('Gemini failed'), {
            code: 'rate_limit',
            response: {
                headers: {
                    'x-gemini-service-tier': 'free',
                },
                body: {
                    usageMetadata: {
                        promptTokenCount: 100,
                    },
                },
            },
            requestBodyValues: {
                contents: [{ parts: [{ text: 'large prompt body' }] }],
            },
        });

        const payload = buildLogPayload('ai/chat', undefined, error);

        expect(payload).toMatchObject({
            module: 'ai/chat',
            err: {
                name: 'Error',
                message: 'Gemini failed',
                code: 'rate_limit',
            },
        });
        expect(payload.err).not.toHaveProperty('response');
        expect(payload.err).not.toHaveProperty('requestBodyValues');
    });
});
