import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { conversationTurnErrorResponse, runExistingConversationTurn } from '@/lib/ai/conversation-turn';
import { withLogging } from '@/lib/api/with-logging';
import { withRateLimit, generationLimiter } from '@/lib/api/rate-limit';
import { withValidation } from '@/lib/api/middleware';

const sendMessageSchema = z.object({
    content: z.string().min(1, 'Message content is required').max(2000, 'Message is too long'),
    ageGroup: z.string().optional(),
});

// POST — Send a message in an existing conversation (evaluate → CLARIFY or GENERATE)
export const POST = withLogging(withRateLimit(generationLimiter, withValidation(sendMessageSchema, async (
    _request: NextRequest,
    session,
    data,
    { params }: { params: Promise<{ id: string }> }
) => {
    try {
        const { id } = await params;
        const convId = parseInt(id, 10);
        if (isNaN(convId)) {
            return NextResponse.json({ error: 'Invalid conversation ID' }, { status: 400 });
        }

        const { content, ageGroup } = data;

        const result = await runExistingConversationTurn({
            userId: session.user.id,
            userEmail: session.user.email,
            conversationId: convId,
            content,
            ageGroup,
        });

        if (result.status === 'no_credits') {
            return NextResponse.json(
                {
                    error: 'no_credits',
                    message: result.message,
                    messages: result.messages,
                    remaining: result.remaining,
                    resetTime: result.resetTime,
                },
                { status: 429 }
            );
        }

        return NextResponse.json({
            messages: result.messages,
            remaining: result.remaining,
        });
    } catch (error) {
        const response = conversationTurnErrorResponse(error, 'api/conversations/messages');
        return NextResponse.json(response.body, { status: response.status });
    }
})));
