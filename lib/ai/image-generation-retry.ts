export const MAX_IMAGE_GENERATION_ATTEMPTS = 3;

export function isRetriableImageGenerationStatus(status: number): boolean {
    return status === 429 || (status >= 500 && status <= 599);
}

export function isRetriableFetchError(error: unknown): boolean {
    if (!(error instanceof Error)) return false;
    return error.name === 'AbortError'
        || error.name === 'TimeoutError'
        || error.message.toLowerCase().includes('fetch failed');
}

export function getImageGenerationRetryDelayMs(attempt: number): number {
    if (process.env.NODE_ENV === 'test' || process.env.VITEST === 'true') return 0;
    return 500 * attempt;
}

export function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
