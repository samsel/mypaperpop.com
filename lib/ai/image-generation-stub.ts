import sharp from 'sharp';
import type { PaperLayout } from './prompts/image';

export function shouldStubImageGeneration(): boolean {
    return process.env.TEST_STUB_IMAGE_GENERATION === 'true';
}

function escapeSvgText(value: string): string {
    return value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
}

export async function createStubColoringPageBuffer(prompt: string, layout: PaperLayout): Promise<Buffer> {
    const width = layout.widthPx;
    const height = layout.heightPx;
    const title = escapeSvgText(prompt.replace(/\s+/g, ' ').trim().slice(0, 90) || 'Test coloring page');
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) * 0.18;

    const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <rect width="100%" height="100%" fill="#fff"/>
  <g fill="none" stroke="#111" stroke-width="${Math.max(8, Math.round(width * 0.018))}" stroke-linecap="round" stroke-linejoin="round">
    <rect x="${width * 0.08}" y="${height * 0.08}" width="${width * 0.84}" height="${height * 0.84}" rx="${width * 0.035}"/>
    <circle cx="${centerX}" cy="${centerY - radius * 0.45}" r="${radius}"/>
    <path d="M ${centerX - radius * 1.7} ${centerY + radius * 0.9} C ${centerX - radius * 0.8} ${centerY + radius * 0.1}, ${centerX + radius * 0.8} ${centerY + radius * 0.1}, ${centerX + radius * 1.7} ${centerY + radius * 0.9}"/>
    <path d="M ${centerX - radius * 0.65} ${centerY - radius * 0.45} h 1"/>
    <path d="M ${centerX + radius * 0.65} ${centerY - radius * 0.45} h 1"/>
    <path d="M ${centerX - radius * 0.55} ${centerY + radius * 0.2} C ${centerX - radius * 0.15} ${centerY + radius * 0.48}, ${centerX + radius * 0.15} ${centerY + radius * 0.48}, ${centerX + radius * 0.55} ${centerY + radius * 0.2}"/>
    <path d="M ${width * 0.18} ${height * 0.22} h ${width * 0.1}"/>
    <path d="M ${width * 0.72} ${height * 0.22} h ${width * 0.1}"/>
    <path d="M ${width * 0.2} ${height * 0.78} h ${width * 0.6}"/>
  </g>
  <text x="50%" y="${height * 0.14}" text-anchor="middle" font-family="Arial, sans-serif" font-size="${Math.max(24, Math.round(width * 0.045))}" fill="#111">${title}</text>
</svg>`;

    return sharp(Buffer.from(svg))
        .png()
        .toBuffer();
}
