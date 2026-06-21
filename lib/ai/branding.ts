import sharp from 'sharp';

const BRANDING_TEXT = 'www.myPaperPop.com';

/**
 * Stamp "www.myPaperPop.com" branding at the bottom of an image buffer.
 * Uses Sharp SVG composite — no extra dependencies.
 */
export async function applyBranding(buffer: Buffer): Promise<Buffer> {
    const { width = 1024, height = 1024 } = await sharp(buffer).metadata();

    const fontSize = Math.min(20, Math.max(12, Math.round(width * 0.018)));
    const padding = 10;

    const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <text
        x="${width - padding}"
        y="${height - padding}"
        text-anchor="end"
        font-family="Arial, Helvetica, sans-serif"
        font-size="${fontSize}"
        fill="#999"
        fill-opacity="0.8"
      >${BRANDING_TEXT}</text>
    </svg>`;

    return sharp(buffer)
        .composite([{ input: Buffer.from(svg), top: 0, left: 0 }])
        .png()
        .toBuffer();
}
