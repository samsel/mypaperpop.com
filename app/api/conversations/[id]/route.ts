import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/drizzle';
import { verifyConversationOwnership } from '@/lib/db/queries';
import { conversations, messages, coloredPhotos } from '@/lib/db/schema';
import { eq, and, asc, inArray } from 'drizzle-orm';
import { getSignedSketchImageUrls, deleteSketchImages, getDisplayPath } from '@/lib/storage';
import { PENDING_IMAGE_PATH } from '@/lib/usage/limits';
import { logger } from '@/lib/logger';
import { withLogging } from '@/lib/api/with-logging';
import { withAuth } from '@/lib/api/middleware';

// GET — Load full conversation with all messages
export const GET = withLogging(withAuth(async (
    _request: NextRequest,
    session,
    { params }: { params: Promise<{ id: string }> }
) => {
    try {
        const { id } = await params;
        const convId = parseInt(id, 10);
        if (isNaN(convId)) {
            return NextResponse.json({ error: 'Invalid conversation ID' }, { status: 400 });
        }

        // Verify ownership
        const [conversation] = await db
            .select()
            .from(conversations)
            .where(and(eq(conversations.id, convId), eq(conversations.userId, session.user.id)))
            .limit(1);

        if (!conversation) {
            return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
        }

        // Load all messages with LEFT JOIN on colored_photos
        const rows = await db
            .select({
                msg: messages,
                cp: {
                    id: coloredPhotos.id,
                    photoPath: coloredPhotos.photoPath,
                    compositePath: coloredPhotos.compositePath,
                },
            })
            .from(messages)
            .leftJoin(coloredPhotos, eq(coloredPhotos.messageId, messages.id))
            .where(eq(messages.conversationId, convId))
            .orderBy(asc(messages.createdAt));

        // Batch-sign all image URLs (display + original + colored photos), skipping pending reservations
        const allPaths: string[] = [];
        for (const { msg, cp } of rows) {
            if (msg.imagePath && msg.imagePath !== PENDING_IMAGE_PATH) {
                allPaths.push(getDisplayPath(msg.imagePath));
                allPaths.push(msg.imagePath);
            }
            if (cp?.photoPath) {
                allPaths.push(cp.photoPath, getDisplayPath(cp.photoPath));
            }
            if (cp?.compositePath) {
                allPaths.push(cp.compositePath, getDisplayPath(cp.compositePath));
            }
        }

        let signedUrlMap = new Map<string, string>();
        if (allPaths.length > 0) {
            try {
                signedUrlMap = await getSignedSketchImageUrls(allPaths, 3600);
            } catch (signError) {
                logger.warn('api/conversations/[id]', 'Batch image signing failed', { convId });
            }
        }

        const messagesWithUrls = rows.map(({ msg, cp }) => {
            let imageUrl: string | null = null;
            let downloadUrl: string | null = null;
            if (msg.imagePath && msg.imagePath !== PENDING_IMAGE_PATH) {
                imageUrl = signedUrlMap.get(getDisplayPath(msg.imagePath)) ?? signedUrlMap.get(msg.imagePath) ?? null;
                downloadUrl = signedUrlMap.get(msg.imagePath) ?? null;
            }

            let coloredPhoto = null;
            if (cp?.id) {
                coloredPhoto = {
                    id: cp.id,
                    photoUrl: signedUrlMap.get(getDisplayPath(cp.photoPath)) || signedUrlMap.get(cp.photoPath) || null,
                    compositeUrl: cp.compositePath
                        ? (signedUrlMap.get(getDisplayPath(cp.compositePath)) || signedUrlMap.get(cp.compositePath) || null)
                        : null,
                    compositeDownloadUrl: cp.compositePath
                        ? (signedUrlMap.get(cp.compositePath) || null)
                        : null,
                };
            }

            return {
                id: msg.id,
                role: msg.role,
                content: msg.content,
                imageUrl,
                downloadUrl,
                promptUsed: msg.promptUsed,
                rating: msg.rating,
                coloredPhoto,
                createdAt: msg.createdAt instanceof Date ? msg.createdAt.toISOString() : msg.createdAt,
            };
        });

        const conversationData = {
            ...conversation,
            createdAt: conversation.createdAt instanceof Date ? conversation.createdAt.toISOString() : conversation.createdAt,
            updatedAt: conversation.updatedAt instanceof Date ? conversation.updatedAt.toISOString() : conversation.updatedAt,
        };

        return NextResponse.json({ conversation: conversationData, messages: messagesWithUrls }, {
            headers: { 'Cache-Control': 'private, max-age=30, stale-while-revalidate=15' },
        });
    } catch (error) {
        logger.error('api/conversations/[id]', 'Get conversation failed', undefined, error);
        return NextResponse.json({ error: 'Failed to fetch conversation' }, { status: 500 });
    }
}));

// DELETE — Delete conversation and all images
export const DELETE = withLogging(withAuth(async (
    _request: NextRequest,
    session,
    { params }: { params: Promise<{ id: string }> }
) => {
    try {
        const { id } = await params;
        const convId = parseInt(id, 10);
        if (isNaN(convId)) {
            return NextResponse.json({ error: 'Invalid conversation ID' }, { status: 400 });
        }

        // Verify ownership
        const conversation = await verifyConversationOwnership(convId, session.user.id);
        if (!conversation) {
            return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
        }

        // Collect image paths before deleting (needed for S3 cleanup)
        const allMessages = await db
            .select({ id: messages.id, imagePath: messages.imagePath })
            .from(messages)
            .where(eq(messages.conversationId, convId));

        const imagePaths = allMessages
            .map(m => m.imagePath)
            .filter((p): p is string => !!p && p !== PENDING_IMAGE_PATH);

        // Collect colored photo + composite paths for this conversation's messages
        const messageIds = allMessages.map(m => m.id);
        let coloredPhotoPaths: string[] = [];
        if (messageIds.length > 0) {
            const cpRows = await db
                .select({ photoPath: coloredPhotos.photoPath, compositePath: coloredPhotos.compositePath })
                .from(coloredPhotos)
                .where(inArray(coloredPhotos.messageId, messageIds));
            coloredPhotoPaths = cpRows.flatMap(r =>
                [r.photoPath, r.compositePath].filter((p): p is string => !!p)
            );
        }

        const pathsToDelete = [...imagePaths, ...coloredPhotoPaths];

        // Delete DB first, then best-effort S3 cleanup.
        // This order prevents orphaned DB references to deleted S3 objects.
        await db.delete(conversations).where(eq(conversations.id, convId));

        // Best-effort S3 cleanup (colored photo files + sketches)
        if (pathsToDelete.length > 0) {
            deleteSketchImages(pathsToDelete).catch((deleteErr) => {
                logger.error('api/conversations/[id]', 'Image cleanup failed during conversation delete', { convId }, deleteErr);
            });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        logger.error('api/conversations/[id]', 'Delete conversation failed', undefined, error);
        return NextResponse.json({ error: 'Failed to delete conversation' }, { status: 500 });
    }
}));
