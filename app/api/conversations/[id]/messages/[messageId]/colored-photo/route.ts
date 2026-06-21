import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db/drizzle';
import { conversations, messages, coloredPhotos } from '@/lib/db/schema';
import { eq, and, gte, sql } from 'drizzle-orm';
import { getSignedSketchImageUrls, getDisplayPath, deleteSketchImages } from '@/lib/storage';
import { processColoredPhoto } from '@/lib/image-processing/showcase';
import { verifyConversationOwnership } from '@/lib/db/queries';
import { PENDING_IMAGE_PATH } from '@/lib/usage/limits';
import { logger } from '@/lib/logger';
import { withLogging } from '@/lib/api/with-logging';
import { withValidation, withAuth } from '@/lib/api/middleware';

// Allow up to 60s for image processing (Sharp composite + S3 upload)
export const maxDuration = 60;

const DAILY_UPLOAD_LIMIT = 20;
const MAX_PHOTO_BYTES = 11 * 1024 * 1024; // 11 MB decoded
const PROCESSING_TIMEOUT_MS = 30_000;

// Validate image format by magic bytes (JPEG, PNG, WEBP, HEIC/HEIF/AVIF)
function isValidImage(buffer: Buffer): boolean {
    if (buffer.length < 12) return false;

    // JPEG: FF D8 FF
    if (buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF) return true;

    // PNG: 89 50 4E 47
    if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47) return true;

    // WEBP: RIFF header (bytes 0-3) + WEBP identifier (bytes 8-11)
    if (
        buffer[0] === 0x52 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x46 &&
        buffer[8] === 0x57 && buffer[9] === 0x45 && buffer[10] === 0x42 && buffer[11] === 0x50
    ) return true;

    // HEIC/HEIF/AVIF: ISO BMFF with ftyp box and known brands.
    if (buffer.toString('ascii', 4, 8) === 'ftyp') {
        const majorBrand = buffer.toString('ascii', 8, 12);
        if (['heic', 'heix', 'hevc', 'hevx', 'mif1', 'msf1', 'heif', 'avif', 'avis'].includes(majorBrand)) {
            return true;
        }
    }

    return false;
}

const schema = z.object({
    photoBase64: z.string().min(1).max(15_000_000), // ~11MB decoded
});

/** Build the standard coloredPhoto response shape from a DB row + signed URLs. */
async function buildColoredPhotoResponse(
    row: { id: number; photoPath: string; compositePath: string | null },
    signRawOnly = false,
) {
    const paths = signRawOnly
        ? [row.photoPath, row.compositePath].filter(Boolean) as string[]
        : [
            row.photoPath, getDisplayPath(row.photoPath),
            ...(row.compositePath ? [row.compositePath, getDisplayPath(row.compositePath)] : []),
        ];

    const signedUrls = await getSignedSketchImageUrls(paths, 3600);
    const photoUrl = signRawOnly
        ? (signedUrls.get(row.photoPath) || null)
        : (signedUrls.get(getDisplayPath(row.photoPath)) || signedUrls.get(row.photoPath) || null);

    const compositeUrl = row.compositePath
        ? (signRawOnly
            ? (signedUrls.get(row.compositePath) || null)
            : (signedUrls.get(getDisplayPath(row.compositePath)) || signedUrls.get(row.compositePath) || null))
        : null;

    const compositeDownloadUrl = row.compositePath
        ? (signedUrls.get(row.compositePath) || null)
        : null;

    return {
        coloredPhoto: {
            id: row.id,
            photoUrl,
            compositeUrl,
            compositeDownloadUrl,
        },
    };
}

export const POST = withLogging(withValidation(schema, async (
    _request: NextRequest,
    session,
    data,
    routeContext: { params: Promise<{ id: string; messageId: string }> },
) => {
    try {
        const { id, messageId } = await routeContext.params;
        const convId = parseInt(id, 10);
        const msgId = parseInt(messageId, 10);
        if (isNaN(convId) || isNaN(msgId)) {
            return NextResponse.json({ error: 'Invalid IDs' }, { status: 400 });
        }

        // Verify conversation ownership (uses shared query helper)
        const conversation = await verifyConversationOwnership(convId, session.user.id);
        if (!conversation) {
            return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
        }

        // Verify message belongs to conversation and has an image
        const [message] = await db
            .select({ id: messages.id, imagePath: messages.imagePath, role: messages.role })
            .from(messages)
            .where(and(eq(messages.id, msgId), eq(messages.conversationId, convId)))
            .limit(1);
        if (!message || message.role !== 'assistant' || !message.imagePath || message.imagePath === PENDING_IMAGE_PATH) {
            return NextResponse.json({ error: 'Message not found or has no image' }, { status: 404 });
        }

        // Check if coloredPhoto already exists (idempotent)
        const [existing] = await db
            .select()
            .from(coloredPhotos)
            .where(eq(coloredPhotos.messageId, msgId))
            .limit(1);

        if (existing) {
            return NextResponse.json(await buildColoredPhotoResponse(existing));
        }

        // Best-effort daily rate limit: not atomic — concurrent uploads for different
        // messages may slightly exceed the limit. Acceptable for a 20/day soft cap.
        // The unique constraint on messageId prevents true duplicates per message.
        const [{ count: dailyCount }] = await db
            .select({ count: sql<number>`count(*)` })
            .from(coloredPhotos)
            .where(
                and(
                    eq(coloredPhotos.userId, session.user.id),
                    gte(coloredPhotos.createdAt, sql`now() - interval '1 day'`)
                )
            );
        if (Number(dailyCount) >= DAILY_UPLOAD_LIMIT) {
            return NextResponse.json({ error: 'Daily upload limit reached. Try again tomorrow.' }, { status: 429 });
        }

        // Decode base64 to buffer
        const photoBuffer = Buffer.from(data.photoBase64, 'base64');

        // Validate decoded byte size
        if (photoBuffer.length > MAX_PHOTO_BYTES) {
            return NextResponse.json({ error: 'Image too large. Maximum size is 11 MB.' }, { status: 400 });
        }

        // Validate it's actually an image
        if (photoBuffer.length === 0 || !isValidImage(photoBuffer)) {
            return NextResponse.json({ error: 'Invalid image format. Please upload a JPEG, PNG, WEBP, or HEIC image.' }, { status: 400 });
        }

        // Process: autoCrop, enhance, composite, upload — with timeout protection
        let result;
        try {
            result = await Promise.race([
                processColoredPhoto(photoBuffer, message.imagePath, session.user.id),
                new Promise<never>((_, reject) =>
                    setTimeout(() => reject(new Error('Processing timeout')), PROCESSING_TIMEOUT_MS)
                ),
            ]);
        } catch (timeoutOrProcessError) {
            logger.error('api/colored-photo', 'Photo processing failed or timed out', undefined, timeoutOrProcessError);
            return NextResponse.json({ error: 'Photo processing failed. Please try again.' }, { status: 500 });
        }

        // Insert row (unique constraint on messageId prevents duplicates from races)
        let coloredPhoto;
        try {
            [coloredPhoto] = await db.insert(coloredPhotos).values({
                messageId: msgId,
                userId: session.user.id,
                photoPath: result.photoPath,
                originalSketchPath: message.imagePath,
                compositePath: result.compositePath,
            }).returning();
        } catch (insertError: unknown) {
            // Unique constraint violation — concurrent request already inserted. Clean up S3 and return existing.
            const isUniqueViolation = insertError instanceof Error && insertError.message.includes('unique');
            if (isUniqueViolation) {
                // Clean up the S3 objects we just uploaded
                deleteSketchImages([result.photoPath, result.compositePath].filter(Boolean)).catch(() => {});
                // Return the existing row (may be null if message was deleted mid-flight)
                const [race] = await db.select().from(coloredPhotos).where(eq(coloredPhotos.messageId, msgId)).limit(1);
                if (race) {
                    return NextResponse.json(await buildColoredPhotoResponse(race));
                }
                // Message was deleted between insert and recovery — not an error, just return a friendly message
                return NextResponse.json({ error: 'Upload completed but the conversation was deleted.' }, { status: 409 });
            }
            // Not a unique violation — clean up and rethrow
            deleteSketchImages([result.photoPath, result.compositePath].filter(Boolean)).catch(() => {});
            throw insertError;
        }

        // Sign URLs — use raw PNG paths for immediate response
        // (display WebP variants are fire-and-forget and may not exist yet)
        return NextResponse.json(await buildColoredPhotoResponse(coloredPhoto, true));
    } catch (error) {
        logger.error('api/colored-photo', 'Colored photo upload failed', undefined, error);
        return NextResponse.json({ error: 'Failed to process colored photo' }, { status: 500 });
    }
}));

// DELETE — Remove a colored photo
export const DELETE = withLogging(withAuth(async (
    _request: NextRequest,
    session,
    routeContext: { params: Promise<{ id: string; messageId: string }> },
) => {
    try {
        const { id, messageId } = await routeContext.params;
        const convId = parseInt(id, 10);
        const msgId = parseInt(messageId, 10);
        if (isNaN(convId) || isNaN(msgId)) {
            return NextResponse.json({ error: 'Invalid IDs' }, { status: 400 });
        }

        // Verify conversation ownership
        const conversation = await verifyConversationOwnership(convId, session.user.id);
        if (!conversation) {
            return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
        }

        // Find the colored photo for this message owned by this user
        const [photo] = await db
            .select()
            .from(coloredPhotos)
            .where(and(eq(coloredPhotos.messageId, msgId), eq(coloredPhotos.userId, session.user.id)))
            .limit(1);

        if (!photo) {
            return NextResponse.json({ error: 'Colored photo not found' }, { status: 404 });
        }

        // Delete from DB first
        await db.delete(coloredPhotos).where(eq(coloredPhotos.id, photo.id));

        // Best-effort S3 cleanup
        const pathsToDelete = [photo.photoPath, photo.compositePath].filter(Boolean) as string[];
        if (pathsToDelete.length > 0) {
            deleteSketchImages(pathsToDelete).catch((err) => {
                logger.error('api/colored-photo', 'S3 cleanup failed on colored photo delete', { photoId: photo.id }, err);
            });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        logger.error('api/colored-photo', 'Colored photo delete failed', undefined, error);
        return NextResponse.json({ error: 'Failed to delete colored photo' }, { status: 500 });
    }
}));
