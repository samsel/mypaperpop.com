import sharp from 'sharp';
import { downloadSketchBuffer, uploadSketchImageBuffer, generateAndUploadVariants, deleteSketchImages } from '@/lib/storage';
import { logger } from '@/lib/logger';

/**
 * Attempt to auto-crop white/near-white borders from a photo.
 * Falls back to original buffer if trim fails or produces a tiny result.
 */
async function autoCrop(buffer: Buffer): Promise<Buffer> {
    try {
        const origMeta = await sharp(buffer).metadata();
        const { data: trimmed, info: trimInfo } = await sharp(buffer)
            .trim({ threshold: 20 })
            .toBuffer({ resolveWithObject: true });
        // Guard: if trim removed >80% of pixels, it was too aggressive — use original
        const origArea = (origMeta.width ?? 1) * (origMeta.height ?? 1);
        const trimArea = trimInfo.width * trimInfo.height;
        if (trimArea < origArea * 0.2) {
            return buffer;
        }
        return trimmed;
    } catch {
        return buffer;
    }
}

/**
 * Enhance colors: boost saturation, normalize contrast, slight sharpen,
 * and resize to max 1024px.
 */
async function enhance(buffer: Buffer): Promise<Buffer> {
    return sharp(buffer)
        .modulate({ saturation: 1.15 })
        .normalize()
        .sharpen({ sigma: 0.8 })
        .resize(1024, 1024, { fit: 'inside', withoutEnlargement: true })
        .png()
        .toBuffer();
}

/**
 * Generate a side-by-side composite image with subtle branding.
 * Clean gallery-style layout — the kid's artwork is the hero.
 * Canvas: 1640x910, warm off-white background.
 */
async function generateComposite(
    originalBuffer: Buffer,
    coloredBuffer: Buffer,
): Promise<Buffer> {
    const CANVAS_W = 1640;
    const CANVAS_H = 910;
    const PAD = 40;
    const GAP = 28;
    const PANEL_W = Math.floor((CANVAS_W - PAD * 2 - GAP) / 2); // 766
    const LABEL_ZONE = 52; // space for small label above images
    const FOOTER_ZONE = 48; // space for branding below images
    const PANEL_H = CANVAS_H - PAD - LABEL_ZONE - FOOTER_ZONE - PAD; // 730
    const IMG_TOP = PAD + LABEL_ZONE;
    const CORNER_R = 12;

    const bg = { r: 250, g: 250, b: 248, alpha: 1 }; // #FAFAF8 warm off-white

    // Resize + apply rounded corners in a single Sharp pipeline per image
    // (avoids materializing intermediate PNG buffers, reduces peak memory)
    const roundedMask = Buffer.from(
        `<svg width="${PANEL_W}" height="${PANEL_H}"><rect x="0" y="0" width="${PANEL_W}" height="${PANEL_H}" rx="${CORNER_R}" ry="${CORNER_R}" fill="white"/></svg>`,
    );
    const [originalRounded, coloredRounded] = await Promise.all([
        sharp(originalBuffer)
            .resize(PANEL_W, PANEL_H, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } })
            .composite([{ input: roundedMask, blend: 'dest-in' }])
            .png()
            .toBuffer(),
        sharp(coloredBuffer)
            .resize(PANEL_W, PANEL_H, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } })
            .composite([{ input: roundedMask, blend: 'dest-in' }])
            .png()
            .toBuffer(),
    ]);

    const leftX = PAD;
    const rightX = PAD + PANEL_W + GAP;
    const leftCenter = leftX + PANEL_W / 2;
    const rightCenter = rightX + PANEL_W / 2;

    // SVG overlay: rounded borders, labels, and branding
    const overlaySvg = `<svg width="${CANVAS_W}" height="${CANVAS_H}" xmlns="http://www.w3.org/2000/svg">
        <!-- Image borders -->
        <rect x="${leftX}" y="${IMG_TOP}" width="${PANEL_W}" height="${PANEL_H}" rx="${CORNER_R}" ry="${CORNER_R}" fill="none" stroke="#E8E5E0" stroke-width="1"/>
        <rect x="${rightX}" y="${IMG_TOP}" width="${PANEL_W}" height="${PANEL_H}" rx="${CORNER_R}" ry="${CORNER_R}" fill="none" stroke="#E8E5E0" stroke-width="1"/>
        <!-- Labels: minimal, lowercase, unobtrusive -->
        <text x="${leftCenter}" y="${PAD + 34}" text-anchor="middle" font-family="sans-serif" font-size="15" font-weight="500" fill="#C4BDB5" letter-spacing="0.5">By MyPaperPop</text>
        <text x="${rightCenter}" y="${PAD + 34}" text-anchor="middle" font-family="sans-serif" font-size="15" font-weight="500" fill="#C4BDB5" letter-spacing="0.5">Colored By Me</text>
        <!-- Branding footer -->
        <text x="${CANVAS_W / 2}" y="${CANVAS_H - PAD + 10}" text-anchor="middle" font-family="sans-serif" font-size="15" fill="#B8B0A8" letter-spacing="0.5">Made with MyPaperPop - mypaperpop.com</text>
    </svg>`;

    return sharp({
        create: {
            width: CANVAS_W,
            height: CANVAS_H,
            channels: 4,
            background: bg,
        },
    })
        .composite([
            { input: originalRounded, left: leftX, top: IMG_TOP },
            { input: coloredRounded, left: rightX, top: IMG_TOP },
            { input: Buffer.from(overlaySvg), left: 0, top: 0 },
        ])
        .png()
        .toBuffer();
}

export interface ShowcaseResult {
    photoPath: string;
    compositePath: string;
}

/**
 * Process a colored photo upload:
 * 1. Auto-crop + enhance the photo
 * 2. Fetch the original sketch from S3
 * 3. Generate a side-by-side composite
 * 4. Upload both to S3 (with fire-and-forget variants)
 */
export async function processColoredPhoto(
    photoBuffer: Buffer,
    originalSketchPath: string,
    userId: number,
): Promise<ShowcaseResult> {
    const start = Date.now();

    // 1. Process the colored photo (auto-rotate first to fix EXIF orientation from phone cameras)
    const rotated = await sharp(photoBuffer).rotate().toBuffer();
    const cropped = await autoCrop(rotated);
    const enhanced = await enhance(cropped);

    // 2. Fetch original sketch
    const originalBuffer = await downloadSketchBuffer(originalSketchPath);

    // 3. Generate composite
    const compositeBuffer = await generateComposite(originalBuffer, enhanced);

    // 4. Upload both to S3 (sequential for rollback on partial failure)
    const photoUpload = await uploadSketchImageBuffer(enhanced, userId);
    let compositeUpload: { path: string; buffer: Buffer };
    try {
        compositeUpload = await uploadSketchImageBuffer(compositeBuffer, userId);
    } catch (uploadErr) {
        // Photo uploaded but composite failed — clean up the orphaned photo
        deleteSketchImages([photoUpload.path]).catch(() => {});
        throw uploadErr;
    }

    // Fire-and-forget variant generation
    generateAndUploadVariants(enhanced, photoUpload.path).catch(() => {});
    generateAndUploadVariants(compositeBuffer, compositeUpload.path).catch(() => {});

    const duration = Date.now() - start;
    logger.info('image-processing/showcase', 'Showcase processing complete', {
        userId,
        originalSketchPath,
        photoPath: photoUpload.path,
        compositePath: compositeUpload.path,
        duration,
    });

    return {
        photoPath: photoUpload.path,
        compositePath: compositeUpload.path,
    };
}
