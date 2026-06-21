import { afterEach, describe, expect, it, vi } from 'vitest';
import {
    getImageGenerationRetryDelayMs,
    isRetriableFetchError,
    isRetriableImageGenerationStatus,
    MAX_IMAGE_GENERATION_ATTEMPTS,
    sleep,
} from '@/lib/ai/image-generation-retry';

afterEach(() => {
    vi.unstubAllEnvs();
});

describe('image generation retry policy', () => {
    it('retries transient provider failures only', () => {
        expect(MAX_IMAGE_GENERATION_ATTEMPTS).toBe(3);

        expect(isRetriableImageGenerationStatus(429)).toBe(true);
        expect(isRetriableImageGenerationStatus(500)).toBe(true);
        expect(isRetriableImageGenerationStatus(599)).toBe(true);
        expect(isRetriableImageGenerationStatus(600)).toBe(false);
        expect(isRetriableImageGenerationStatus(502)).toBe(true);
        expect(isRetriableImageGenerationStatus(503)).toBe(true);
        expect(isRetriableImageGenerationStatus(504)).toBe(true);

        expect(isRetriableImageGenerationStatus(400)).toBe(false);
        expect(isRetriableImageGenerationStatus(401)).toBe(false);
        expect(isRetriableImageGenerationStatus(403)).toBe(false);
        expect(isRetriableImageGenerationStatus(422)).toBe(false);
    });

    it('retries fetch timeouts and network failures', () => {
        expect(isRetriableFetchError(new DOMException('The operation timed out.', 'TimeoutError'))).toBe(true);
        expect(isRetriableFetchError(new DOMException('The operation was aborted.', 'AbortError'))).toBe(true);
        expect(isRetriableFetchError(new Error('fetch failed'))).toBe(true);
        expect(isRetriableFetchError(new Error('FETCH FAILED'))).toBe(true);
        expect(isRetriableFetchError(new Error('invalid json'))).toBe(false);
        expect(isRetriableFetchError('fetch failed')).toBe(false);
    });

    it('uses no retry delay in tests', () => {
        expect(getImageGenerationRetryDelayMs(1)).toBe(0);
    });

    it('uses linear retry delay outside the test environment', () => {
        vi.stubEnv('NODE_ENV', 'production');
        vi.stubEnv('VITEST', 'false');

        expect(getImageGenerationRetryDelayMs(2)).toBe(1000);
    });

    it('sleep resolves after the requested timeout', async () => {
        await expect(sleep(0)).resolves.toBeUndefined();
    });
});
