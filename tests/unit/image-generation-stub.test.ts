import sharp from 'sharp';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createStubColoringPageBuffer, shouldStubImageGeneration } from '@/lib/ai/image-generation-stub';

afterEach(() => {
    vi.unstubAllEnvs();
});

describe('image generation test stub', () => {
    it('is opt-in so production image generation still uses the provider', () => {
        vi.stubEnv('TEST_STUB_IMAGE_GENERATION', '');
        expect(shouldStubImageGeneration()).toBe(false);

        vi.stubEnv('TEST_STUB_IMAGE_GENERATION', 'true');
        expect(shouldStubImageGeneration()).toBe(true);
    });

    it('creates a printable local PNG without calling the image provider', async () => {
        const buffer = await createStubColoringPageBuffer('A test robot', {
            orientation: 'portrait',
            aspectRatio: '3:4',
            widthPx: 300,
            heightPx: 400,
        });

        const metadata = await sharp(buffer).metadata();
        expect(metadata.format).toBe('png');
        expect(metadata.width).toBe(300);
        expect(metadata.height).toBe(400);
        expect(buffer.length).toBeGreaterThan(1000);
    });

    it('falls back to a generic title for blank prompts', async () => {
        const buffer = await createStubColoringPageBuffer('   ', {
            orientation: 'landscape',
            aspectRatio: '4:3',
            widthPx: 400,
            heightPx: 300,
        });

        const metadata = await sharp(buffer).metadata();
        expect(metadata.width).toBe(400);
        expect(metadata.height).toBe(300);
    });
});
