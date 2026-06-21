import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db/drizzle';
import { sql } from 'drizzle-orm';
import { PENDING_IMAGE_PATH } from '@/lib/usage/limits';
import { getSignedSketchImageUrls, getThumbnailPath } from '@/lib/storage';
import { conversationTurnErrorResponse, runNewConversationTurn } from '@/lib/ai/conversation-turn';
import { logger } from '@/lib/logger';
import { withLogging } from '@/lib/api/with-logging';
import { withRateLimit, generationLimiter } from '@/lib/api/rate-limit';
import { withAuth, withValidation } from '@/lib/api/middleware';

const createConversationSchema = z.object({
    prompt: z.string().min(1, 'Prompt is required').max(2000, 'Prompt is too long'),
    ageGroup: z.string().optional(),
});

// POST — Create a new conversation (evaluate → CLARIFY or GENERATE)
export const POST = withLogging(withRateLimit(generationLimiter, withValidation(createConversationSchema, async (_request, session, data) => {
    try {
        const result = await runNewConversationTurn({
            userId: session.user.id,
            userEmail: session.user.email,
            prompt: data.prompt,
            ageGroup: data.ageGroup,
        });

        if (result.status === 'no_credits') {
            return NextResponse.json(
                {
                    error: 'no_credits',
                    message: result.message,
                    resetTime: result.resetTime,
                    creditBalance: 0,
                },
                { status: 429 },
            );
        }

        return NextResponse.json(result);
    } catch (error) {
        const response = conversationTurnErrorResponse(error, 'api/conversations');
        return NextResponse.json(response.body, { status: response.status });
    }
})));

// GET — List conversations for sidebar
export const GET = withLogging(withAuth(async (_request: NextRequest, session) => {
    try {
        const rows = await db.execute<{
            id: number;
            title: string;
            created_at: Date;
            updated_at: Date;
            image_path: string | null;
        }>(sql`
            SELECT c.id, c.title, c.created_at, c.updated_at, latest_img.image_path
            FROM conversations c
            LEFT JOIN LATERAL (
                SELECT m.image_path FROM messages m
                WHERE m.conversation_id = c.id
                    AND m.image_path IS NOT NULL
                    AND m.image_path != ${PENDING_IMAGE_PATH}
                ORDER BY m.created_at DESC LIMIT 1
            ) latest_img ON true
            WHERE c.user_id = ${session.user.id}
            ORDER BY c.updated_at DESC LIMIT 100
        `);

        const thumbPaths = rows
            .filter((row) => row.image_path)
            .flatMap((row) => [getThumbnailPath(row.image_path!), row.image_path!]);

        let signedUrlMap = new Map<string, string>();
        if (thumbPaths.length > 0) {
            try {
                signedUrlMap = await getSignedSketchImageUrls(thumbPaths, 3600);
            } catch (signError) {
                logger.warn('api/conversations', 'Batch thumbnail signing failed');
            }
        }

        const results = rows.map((row) => {
            let thumbnailUrl: string | null = null;
            if (row.image_path) {
                thumbnailUrl = signedUrlMap.get(getThumbnailPath(row.image_path)) ?? signedUrlMap.get(row.image_path) ?? null;
            }
            return {
                id: row.id,
                title: row.title,
                thumbnailUrl,
                updatedAt: row.updated_at instanceof Date ? row.updated_at.toISOString() : row.updated_at,
                createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : row.created_at,
            };
        });

        return NextResponse.json(results, {
            headers: { 'Cache-Control': 'private, no-store' },
        });
    } catch (error) {
        logger.error('api/conversations', 'List conversations failed', undefined, error);
        return NextResponse.json(
            { error: 'Failed to fetch conversations' },
            { status: 500 }
        );
    }
}));
