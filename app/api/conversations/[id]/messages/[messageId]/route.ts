import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db/drizzle';
import { verifyConversationOwnership } from '@/lib/db/queries';
import { messages } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { logger } from '@/lib/logger';
import { withLogging } from '@/lib/api/with-logging';
import { withValidation } from '@/lib/api/middleware';

const patchSchema = z.object({
    rating: z.union([z.number().int().min(1).max(5), z.null()]),
});

// PATCH — Update message rating
export const PATCH = withLogging(withValidation(patchSchema, async (
    _request: NextRequest,
    session,
    data,
    { params }: { params: Promise<{ id: string; messageId: string }> }
) => {
    try {
        const { id, messageId } = await params;
        const convId = parseInt(id, 10);
        const msgId = parseInt(messageId, 10);
        if (isNaN(convId) || isNaN(msgId)) {
            return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
        }

        // Verify conversation ownership
        const conversation = await verifyConversationOwnership(convId, session.user.id);
        if (!conversation) {
            return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
        }

        const { rating } = data;

        // Update the message (verify it belongs to this conversation)
        const updated = await db
            .update(messages)
            .set({ rating: rating ?? null })
            .where(and(eq(messages.id, msgId), eq(messages.conversationId, convId)))
            .returning({ id: messages.id });

        if (updated.length === 0) {
            return NextResponse.json({ error: 'Message not found' }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            rating: rating ?? null,
        });
    } catch (error) {
        logger.error('api/conversations/messages', 'Update message failed', undefined, error);
        return NextResponse.json({ error: 'Failed to update message' }, { status: 500 });
    }
}));
