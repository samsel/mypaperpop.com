import sharp from 'sharp';
import type { PaperLayout } from './prompts/image';

export interface ColoringPageQuality {
    darkPixelRatio: number;
    darkPixelPercent: number;
    passes: boolean;
    reason?: string;
}

export const MAX_DARK_PIXEL_RATIO = 0.32;

export async function preprocessColoringPageImage(
    rawBuffer: Buffer,
    layout: PaperLayout,
    threshold = 170,
): Promise<Buffer> {
    return sharp(rawBuffer)
        .flatten({ background: '#ffffff' })
        .grayscale()
        .median(1)
        .threshold(threshold)
        .resize(layout.widthPx, layout.heightPx, {
            fit: 'contain',
            background: '#ffffff',
            withoutEnlargement: false,
        })
        .png()
        .toBuffer();
}

export async function analyzeColoringPageQuality(buffer: Buffer): Promise<ColoringPageQuality> {
    const image = sharp(buffer).ensureAlpha();
    const metadata = await image.metadata();
    const width = metadata.width ?? 0;
    const height = metadata.height ?? 0;
    if (width === 0 || height === 0) {
        return {
            darkPixelRatio: 1,
            darkPixelPercent: 100,
            passes: false,
            reason: 'invalid image dimensions',
        };
    }

    const raw = await image.raw().toBuffer();
    let darkPixels = 0;
    const totalPixels = width * height;

    for (let index = 0; index < raw.length; index += 4) {
        const alpha = raw[index + 3];
        if (alpha < 10) continue;

        const red = raw[index];
        const green = raw[index + 1];
        const blue = raw[index + 2];
        const luminance = 0.2126 * red + 0.7152 * green + 0.0722 * blue;
        if (luminance < 80) darkPixels += 1;
    }

    const darkPixelRatio = darkPixels / totalPixels;
    const darkPixelPercent = Number((darkPixelRatio * 100).toFixed(2));

    return {
        darkPixelRatio,
        darkPixelPercent,
        passes: darkPixelRatio <= MAX_DARK_PIXEL_RATIO,
        reason: darkPixelRatio <= MAX_DARK_PIXEL_RATIO
            ? undefined
            : `too much black ink (${darkPixelPercent}%)`,
    };
}
