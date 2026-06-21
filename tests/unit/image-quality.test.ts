import sharp from 'sharp';
import { describe, expect, it } from 'vitest';
import {
    analyzeColoringPageQuality,
    MAX_DARK_PIXEL_RATIO,
    preprocessColoringPageImage,
} from '@/lib/ai/image-quality';

describe('image quality gate', () => {
    it('passes blank white pages with no dark ink', async () => {
        const buffer = await sharp({
            create: {
                width: 100,
                height: 100,
                channels: 3,
                background: 'white',
            },
        })
            .png()
            .toBuffer();

        const quality = await analyzeColoringPageQuality(buffer);

        expect(quality.passes).toBe(true);
        expect(quality.darkPixelPercent).toBe(0);
    });

    it('rejects fully black pages', async () => {
        const buffer = await sharp({
            create: {
                width: 100,
                height: 100,
                channels: 3,
                background: 'black',
            },
        })
            .png()
            .toBuffer();

        const quality = await analyzeColoringPageQuality(buffer);

        expect(quality.passes).toBe(false);
        expect(quality.darkPixelPercent).toBe(100);
    });

    it('passes sparse coloring-page line art', async () => {
        const buffer = await sharp({
            create: {
                width: 100,
                height: 100,
                channels: 3,
                background: 'white',
            },
        })
            .composite([{
                input: Buffer.from('<svg width="100" height="100"><circle cx="50" cy="50" r="25" fill="none" stroke="black" stroke-width="4"/></svg>'),
            }])
            .png()
            .toBuffer();

        const quality = await analyzeColoringPageQuality(buffer);

        expect(quality.passes).toBe(true);
        expect(quality.darkPixelRatio).toBeLessThan(MAX_DARK_PIXEL_RATIO);
    });

    it('rejects pages with too much black ink', async () => {
        const buffer = await sharp({
            create: {
                width: 100,
                height: 100,
                channels: 3,
                background: 'white',
            },
        })
            .composite([{
                input: Buffer.from('<svg width="100" height="100"><rect x="0" y="0" width="50" height="100" fill="black"/></svg>'),
            }])
            .png()
            .toBuffer();

        const quality = await analyzeColoringPageQuality(buffer);

        expect(quality.passes).toBe(false);
        expect(quality.darkPixelRatio).toBeGreaterThan(MAX_DARK_PIXEL_RATIO);
        expect(quality.reason).toContain('too much black ink');
    });

    it('uses a lower threshold so pale gray texture does not become black ink', async () => {
        const raw = await sharp({
            create: {
                width: 100,
                height: 100,
                channels: 3,
                background: '#d0d0d0',
            },
        })
            .png()
            .toBuffer();

        const printable = await preprocessColoringPageImage(raw, {
            orientation: 'landscape',
            aspectRatio: '4:3',
            widthPx: 100,
            heightPx: 100,
        });
        const quality = await analyzeColoringPageQuality(printable);

        expect(quality.passes).toBe(true);
        expect(quality.darkPixelPercent).toBe(0);
    });

    it('ignores transparent dark pixels when measuring printable ink', async () => {
        const buffer = await sharp({
            create: {
                width: 100,
                height: 100,
                channels: 4,
                background: { r: 0, g: 0, b: 0, alpha: 0 },
            },
        })
            .png()
            .toBuffer();

        const quality = await analyzeColoringPageQuality(buffer);

        expect(quality.passes).toBe(true);
        expect(quality.darkPixelPercent).toBe(0);
    });
});
