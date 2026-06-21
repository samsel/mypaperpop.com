import { asc, eq, sql } from 'drizzle-orm';
import { db } from '@/lib/db/drizzle';
import { verifyConversationOwnership } from '@/lib/db/queries';
import { conversations, messages, type Conversation, type Message } from '@/lib/db/schema';
import { getAgeGroupModifier, DEFAULT_AGE_GROUP } from '@/lib/ai/age-groups';
import { AiServiceUnavailableError, checkChildSafety, evaluatePrompt, generateFollowUp, searchForContext } from '@/lib/ai/chat';
import { generateAndStoreImage } from '@/lib/ai/image-generation';
import { buildImagePrompt, getPaperLayout, extractSubjectFromPrompt, IMAGE_GENERATION_FAILED_SUFFIX } from '@/lib/ai/prompts/image';
import { buildRedrawSubject, chooseImageGenerationMode } from '@/lib/ai/image-generation-mode';
import { getSignedSketchImageUrl } from '@/lib/storage';
import { logBraintrust, traceBraintrust } from '@/lib/ai/braintrust';
import {
    checkAndDeductQuota,
    cleanupStaleReservations,
    PENDING_IMAGE_PATH,
    refundCredit,
    withQuotaLock,
} from '@/lib/usage/limits';
import { getRequestContext, logger } from '@/lib/logger';

type ChatMessage = {
    role: 'user' | 'assistant';
    content: string;
};

type SourceImageContext = {
    base64: string;
    dataUrl: string;
};

export type TurnClientMessage = {
    id: number;
    role: string;
    content: string | null;
    imageUrl?: string | null;
    downloadUrl?: string | null;
    promptUsed?: string | null;
    suggestions?: string[];
};

export type ConversationTurnResult =
    | {
        status: 'ok';
        conversation?: Conversation;
        messages: TurnClientMessage[];
        remaining?: number;
    }
    | {
        status: 'no_credits';
        message: string;
        messages?: TurnClientMessage[];
        remaining: 0;
        resetTime?: string;
    };

export async function runNewConversationTurn(input: {
    userId: number;
    userEmail?: string | null;
    prompt: string;
    ageGroup?: string;
}): Promise<ConversationTurnResult> {
    return runConversationTurn({
        mode: 'new',
        userId: input.userId,
        userEmail: input.userEmail,
        content: input.prompt,
        ageGroup: input.ageGroup,
    });
}

export async function runExistingConversationTurn(input: {
    userId: number;
    userEmail?: string | null;
    conversationId: number;
    content: string;
    ageGroup?: string;
}): Promise<ConversationTurnResult> {
    return runConversationTurn({
        mode: 'existing',
        userId: input.userId,
        userEmail: input.userEmail,
        conversationId: input.conversationId,
        content: input.content,
        ageGroup: input.ageGroup,
    });
}

async function runConversationTurn(input: {
    mode: 'new' | 'existing';
    userId: number;
    userEmail?: string | null;
    conversationId?: number;
    content: string;
    ageGroup?: string;
}): Promise<ConversationTurnResult> {
    const ctx = getRequestContext();

    return traceBraintrust(
        'runConversationTurn',
        async (span) => {
            span?.log({
                input: {
                    mode: input.mode,
                    userId: input.userId,
                    userEmail: input.userEmail,
                    conversationId: input.conversationId,
                    content: input.content,
                    ageGroup: input.ageGroup,
                },
                metadata: {
                    requestId: ctx?.requestId,
                    method: ctx?.method,
                    path: ctx?.path,
                },
                tags: ['conversation-turn', input.mode],
            });

            const result = await runConversationTurnInternal(input);

            span?.log({
                output: summarizeConversationTurnResult(result),
                metadata: {
                    status: result.status,
                    messageCount: result.messages?.length ?? 0,
                    remaining: result.status === 'ok' ? result.remaining : result.remaining,
                },
            });

            return result;
        },
        {
            type: 'task',
            event: {
                metadata: {
                    requestId: ctx?.requestId,
                    userId: input.userId,
                    userEmail: input.userEmail,
                    conversationId: input.conversationId,
                    ageGroup: input.ageGroup,
                },
                tags: ['production', 'ai-product-path'],
            },
        },
    );
}

async function runConversationTurnInternal(input: {
    mode: 'new' | 'existing';
    userId: number;
    userEmail?: string | null;
    conversationId?: number;
    content: string;
    ageGroup?: string;
}): Promise<ConversationTurnResult> {
    const title = input.content.slice(0, 60);
    const ageModifier = getAgeGroupModifier(input.ageGroup || DEFAULT_AGE_GROUP);

    const existingConversation = input.mode === 'existing'
        ? await verifyConversationOwnership(input.conversationId!, input.userId)
        : null;

    if (input.mode === 'existing' && !existingConversation) {
        throw new ConversationTurnNotFoundError();
    }

    const history = input.mode === 'existing'
        ? await loadHistory(input.conversationId!)
        : [];

    const lastPrompt = [...history].reverse().find(m => m.promptUsed)?.promptUsed || null;
    const cleanLastPrompt = lastPrompt ? extractSubjectFromPrompt(lastPrompt) : null;
    const sourceImage = await resolveSourceImage(history);
    const chatMessages = buildChatMessages(history, input.content);

    const groundedContext = await traceBraintrust(
        'grounding',
        async (span) => {
            span?.log({
                input: {
                    content: input.content,
                    userId: input.userId,
                    conversationId: input.conversationId,
                },
            });

            const output = await searchForContext(
                input.content,
                input.userId,
                input.conversationId,
            );

            span?.log({
                metadata: {
                    groundedContextPresent: Boolean(output),
                    sourceCount: output?.sourceCount ?? 0,
                    searchQueryCount: output?.searchQueryCount ?? 0,
                },
                output,
            });

            return output;
        },
        { type: 'function' },
    );

    const safety = await traceBraintrust(
        'safety',
        async (span) => {
            span?.log({
                input: {
                    messages: chatMessages,
                    userId: input.userId,
                    conversationId: input.conversationId,
                    groundedVisualBrief: groundedContext?.brief ?? null,
                },
            });

            const output = await checkChildSafety(
                chatMessages,
                input.userId,
                input.conversationId,
                groundedContext?.brief ?? null,
            );

            span?.log({
                metadata: {
                    safetyAllowed: output.allowed,
                    safetyCategories: output.categories,
                    safetyConfidence: output.confidence,
                },
                output,
            });

            return output;
        },
        { type: 'function' },
    );

    if (!safety.allowed) {
        const conversation = await ensureConversation(input, title);
        const assistantMsg = await saveTextTurn(
            conversation.id,
            input.content,
            safety.userMessage || "I can't draw that because it isn't appropriate for children.",
        );

        return {
            status: 'ok',
            conversation: input.mode === 'new' ? conversation : undefined,
            messages: [{
                id: assistantMsg.id,
                role: 'assistant',
                content: assistantMsg.content,
                suggestions: [],
            }],
        };
    }

    const evaluation = await traceBraintrust(
        'planning',
        async (span) => {
            span?.log({
                input: {
                    messages: chatMessages,
                    currentImagePrompt: cleanLastPrompt,
                    ageGroup: input.ageGroup,
                    hasSourceImage: Boolean(sourceImage),
                    groundedVisualBrief: groundedContext?.brief ?? null,
                },
            });

            const output = await evaluatePrompt(
                chatMessages,
                cleanLastPrompt,
                input.ageGroup,
                sourceImage?.base64,
                groundedContext?.brief ?? null,
            );

            span?.log({
                metadata: {
                    plannerVerdict: output.verdict,
                    paperOrientation: output.paperOrientation,
                    hasEnhancedPrompt: Boolean(output.enhancedPrompt),
                    suggestionCount: output.suggestions?.length ?? 0,
                },
                output,
            });

            return output;
        },
        { type: 'function' },
    );

    if (evaluation.verdict !== 'GENERATE') {
        const conversation = await ensureConversation(input, title);
        const assistantMsg = await saveTextTurn(
            conversation.id,
            input.content,
            evaluation.message || "Tell me one specific thing you'd like to turn into a coloring page.",
        );

        return {
            status: 'ok',
            conversation: input.mode === 'new' ? conversation : undefined,
            messages: [{
                id: assistantMsg.id,
                role: 'assistant',
                content: assistantMsg.content,
                suggestions: evaluation.suggestions || [],
            }],
        };
    }

    await cleanupStaleReservations(input.userId);

    const promptContext = await traceBraintrust(
        'prompt-construction',
        async (span) => {
            const promptForImage = evaluation.enhancedPrompt || input.content;
            const imageGenerationMode = chooseImageGenerationMode({
                latestUserMessage: input.content,
                hasPreviousImage: !!sourceImage,
            });
            const subjectForImage = imageGenerationMode === 'redraw-from-prompt'
                ? buildRedrawSubject({
                    previousSubject: cleanLastPrompt,
                    userInstruction: input.content,
                    enhancedPrompt: promptForImage,
                })
                : promptForImage;
            const paperLayout = getPaperLayout(evaluation.paperOrientation!);
            const styledPrompt = buildImagePrompt(subjectForImage, ageModifier, paperLayout);
            const output = {
                promptForImage,
                imageGenerationMode,
                subjectForImage,
                paperLayout,
                styledPrompt,
            };

            span?.log({
                input: {
                    content: input.content,
                    cleanLastPrompt,
                    enhancedPrompt: evaluation.enhancedPrompt,
                    ageGroup: input.ageGroup,
                    paperOrientation: evaluation.paperOrientation,
                    hasPreviousImage: Boolean(sourceImage),
                },
                metadata: {
                    imageGenerationMode,
                    paperOrientation: paperLayout.orientation,
                    paperWidthPx: paperLayout.widthPx,
                    paperHeightPx: paperLayout.heightPx,
                    hasPreviousImage: Boolean(sourceImage),
                },
                output,
            });

            return output;
        },
        { type: 'function' },
    );
    const { promptForImage, imageGenerationMode, paperLayout, styledPrompt } = promptContext;
    const quotaReservation = await traceBraintrust(
        'quota',
        async (span) => {
            span?.log({
                input: {
                    userId: input.userId,
                    conversationId: input.conversationId,
                    mode: input.mode,
                },
            });

            const output = await reserveImageTurn(input, title);

            span?.log({
                metadata: {
                    quotaAllowed: output.allowed,
                    reservationId: output.allowed ? output.reservationId : undefined,
                    deductedCredit: output.allowed ? output.quota.deductedCredit : undefined,
                    remaining: output.allowed ? output.quota.remaining.totalRemaining : 0,
                },
                output: output.allowed ? {
                    conversationId: output.conversation.id,
                    reservationId: output.reservationId,
                    quota: output.quota,
                } : output.result,
            });

            return output;
        },
        { type: 'function' },
    );

    if (!quotaReservation.allowed) {
        return quotaReservation.result;
    }

    const { conversation, reservationId, quota } = quotaReservation;

    try {
        const followUpPromise = traceBraintrust(
            'follow-up',
            async (span) => {
                span?.log({
                    input: {
                        promptForImage,
                        messages: chatMessages,
                    },
                });

                const output = await generateFollowUp(promptForImage, chatMessages);

                span?.log({
                    metadata: {
                        suggestionCount: output.suggestions.length,
                    },
                    output,
                });

                return output;
            },
            { type: 'function' },
        );
        logger.info('ai/conversation-turn', 'Image generation mode selected', {
            userId: input.userId,
            conversationId: conversation.id,
            imageGenerationMode,
            hasPreviousImage: !!sourceImage,
        });
        const { storagePath } = await traceBraintrust(
            'image-generation',
            async (span) => {
                span?.log({
                    input: {
                        styledPrompt,
                        userId: input.userId,
                        imageGenerationMode,
                        hasSourceImage: imageGenerationMode === 'edit-previous' && Boolean(sourceImage),
                        paperLayout,
                    },
                });

                const output = await generateAndStoreImage(
                    styledPrompt,
                    input.userId,
                    imageGenerationMode === 'edit-previous' ? sourceImage?.dataUrl : undefined,
                    paperLayout,
                );

                span?.log({
                    metadata: {
                        storagePath: output.storagePath,
                        imageGenerationMode,
                    },
                    output,
                });

                return output;
            },
            { type: 'function' },
        );
        const signedUrl = await getSignedSketchImageUrl(storagePath, 3600);
        const followUp = await followUpPromise;

        await traceBraintrust(
            'persistence',
            async (span) => {
                span?.log({
                    input: {
                        reservationId,
                        storagePath,
                        promptUsed: styledPrompt,
                        followUpMessage: followUp.message,
                    },
                });

                await db.update(messages).set({
                    content: followUp.message,
                    imagePath: storagePath,
                    promptUsed: styledPrompt,
                }).where(eq(messages.id, reservationId));

                span?.log({
                    output: {
                        reservationId,
                        storagePath,
                    },
                });
            },
            { type: 'function' },
        );

        return {
            status: 'ok',
            conversation: input.mode === 'new' ? conversation : undefined,
            messages: [{
                id: reservationId,
                role: 'assistant',
                content: followUp.message,
                imageUrl: signedUrl,
                downloadUrl: signedUrl,
                promptUsed: styledPrompt,
                suggestions: followUp.suggestions,
            }],
            remaining: quota.remaining.totalRemaining,
        };
    } catch (error) {
        if (quota.deductedCredit) {
            try {
                await traceBraintrust(
                    'refund',
                    async (span) => {
                        span?.log({ input: { userId: input.userId } });
                        await refundCredit(input.userId);
                        span?.log({
                            metadata: {
                                refunded: true,
                                userId: input.userId,
                            },
                        });
                    },
                    { type: 'function' },
                );
            } catch (refundErr) {
                logger.error('ai/conversation-turn', 'Credit refund failed', { userId: input.userId }, refundErr);
                logBraintrust({
                    error: refundErr instanceof Error ? refundErr.message : String(refundErr),
                    metadata: {
                        step: 'refund',
                        refunded: false,
                        userId: input.userId,
                    },
                });
            }
        }

        logger.error('ai/conversation-turn', 'Image generation failed, saving text-only response', {
            userId: input.userId,
            conversationId: conversation.id,
            hasSourceImage: !!sourceImage,
            imageGenerationMode,
        }, error);

        const fallbackContent = 'Something went wrong while drawing. Please try again.' + IMAGE_GENERATION_FAILED_SUFFIX;
        await db.update(messages).set({
            content: fallbackContent,
            imagePath: null,
        }).where(eq(messages.id, reservationId));

        return {
            status: 'ok',
            conversation: input.mode === 'new' ? conversation : undefined,
            messages: [{
                id: reservationId,
                role: 'assistant',
                content: fallbackContent,
            }],
        };
    }
}

function summarizeConversationTurnResult(result: ConversationTurnResult): Record<string, unknown> {
    return {
        status: result.status,
        conversationId: result.status === 'ok' ? result.conversation?.id : undefined,
        messages: result.messages?.map((message) => ({
            id: message.id,
            role: message.role,
            content: message.content,
            imageUrl: message.imageUrl,
            downloadUrl: message.downloadUrl,
            promptUsed: message.promptUsed,
            suggestions: message.suggestions,
        })),
        remaining: result.status === 'ok' ? result.remaining : result.remaining,
        resetTime: result.status === 'no_credits' ? result.resetTime : undefined,
    };
}

async function loadHistory(conversationId: number): Promise<Message[]> {
    return db
        .select()
        .from(messages)
        .where(eq(messages.conversationId, conversationId))
        .orderBy(asc(messages.createdAt));
}

function buildChatMessages(history: Message[], latestContent: string): ChatMessage[] {
    return [
        ...history
            .filter(m => m.role === 'user' || m.role === 'assistant')
            .map(m => ({
                role: m.role as 'user' | 'assistant',
                content: m.role === 'assistant' && m.promptUsed
                    ? `[Generated image: ${extractSubjectFromPrompt(m.promptUsed)}]\n${m.content || ''}`
                    : m.content || '',
            })),
        { role: 'user' as const, content: latestContent },
    ];
}

async function ensureConversation(
    input: { mode: 'new' | 'existing'; userId: number; conversationId?: number },
    title: string,
): Promise<Conversation> {
    if (input.mode === 'existing') {
        return { id: input.conversationId! } as Conversation;
    }

    const [conversation] = await db
        .insert(conversations)
        .values({ userId: input.userId, title })
        .returning();

    return conversation;
}

async function saveTextTurn(
    conversationId: number,
    userContent: string,
    assistantContent: string,
): Promise<Message> {
    await Promise.all([
        db.insert(messages).values({ conversationId, role: 'user', content: userContent }),
        db.update(conversations).set({ updatedAt: sql`now()` }).where(eq(conversations.id, conversationId)),
    ]);

    const [assistantMsg] = await db
        .insert(messages)
        .values({
            conversationId,
            role: 'assistant',
            content: assistantContent,
        })
        .returning();

    return assistantMsg;
}

async function reserveImageTurn(
    input: { mode: 'new' | 'existing'; userId: number; conversationId?: number; content: string },
    title: string,
): Promise<
    | {
        allowed: true;
        conversation: Conversation;
        reservationId: number;
        quota: Awaited<ReturnType<typeof checkAndDeductQuota>>;
    }
    | {
        allowed: false;
        result: ConversationTurnResult;
    }
> {
    const lockResult = await withQuotaLock(input.userId, async (tx) => {
        const quota = await checkAndDeductQuota(input.userId, tx);
        if (!quota.allowed) return { allowed: false as const, quota };

        const conversation = input.mode === 'new'
            ? (await tx.insert(conversations).values({ userId: input.userId, title }).returning())[0]
            : ({ id: input.conversationId! } as Conversation);

        await tx.insert(messages).values({
            conversationId: conversation.id,
            role: 'user',
            content: input.content,
        });
        await tx.update(conversations).set({ updatedAt: sql`now()` }).where(eq(conversations.id, conversation.id));

        const [reservation] = await tx.insert(messages).values({
            conversationId: conversation.id,
            role: 'assistant',
            content: null,
            imagePath: PENDING_IMAGE_PATH,
        }).returning();

        return {
            allowed: true as const,
            quota,
            conversation,
            reservationId: reservation.id,
        };
    });

    if (lockResult.allowed) {
        return lockResult;
    }

    if (input.mode === 'existing') {
        const limitContent = "You've used all your coloring pages. Buy more to keep creating!";
        const assistantMsg = await saveTextTurn(input.conversationId!, input.content, limitContent);

        return {
            allowed: false,
            result: {
                status: 'no_credits',
                message: limitContent,
                messages: [{
                    id: assistantMsg.id,
                    role: 'assistant',
                    content: limitContent,
                }],
                remaining: 0,
                resetTime: lockResult.quota.resetTime?.toISOString(),
            },
        };
    }

    return {
        allowed: false,
        result: {
            status: 'no_credits',
            message: 'No coloring pages remaining',
            remaining: 0,
            resetTime: lockResult.quota.resetTime?.toISOString(),
        },
    };
}

async function resolveSourceImage(
    history: Message[],
): Promise<SourceImageContext | undefined> {
    const lastImageMsg = [...history].reverse().find(m => m.imagePath && m.imagePath !== PENDING_IMAGE_PATH);
    if (!lastImageMsg?.imagePath) return undefined;

    try {
        const signedUrl = await getSignedSketchImageUrl(lastImageMsg.imagePath, 300);
        const response = await fetch(signedUrl, {
            signal: AbortSignal.timeout(10_000),
        });
        if (!response.ok) return undefined;

        const contentLength = parseInt(response.headers.get('content-length') || '0', 10);
        const maxSourceImageBytes = 20 * 1024 * 1024;
        if (contentLength > maxSourceImageBytes) {
            logger.warn('ai/conversation-turn', 'Source image too large, skipping', {
                imagePath: lastImageMsg.imagePath,
                contentLength,
            });
            return undefined;
        }

        const buffer = Buffer.from(await response.arrayBuffer());
        if (buffer.length > maxSourceImageBytes) return undefined;

        const base64 = buffer.toString('base64');
        return {
            base64,
            dataUrl: `data:image/png;base64,${base64}`,
        };
    } catch (error) {
        logger.warn('ai/conversation-turn', 'Failed to load previous image context', {
            imagePath: lastImageMsg.imagePath,
        });
        return undefined;
    }
}

export class ConversationTurnNotFoundError extends Error {
    constructor() {
        super('Conversation not found');
        this.name = 'ConversationTurnNotFoundError';
    }
}

export function conversationTurnErrorResponse(error: unknown, route: string) {
    if (error instanceof ConversationTurnNotFoundError) {
        return {
            body: { error: 'Conversation not found' },
            status: 404,
        };
    }

    if (error instanceof AiServiceUnavailableError) {
        logger.error(route, 'AI service unavailable while running conversation turn', {
            provider: error.provider,
            code: error.code,
        }, error);
        return {
            body: {
                error: error.code,
                message: error.message,
                provider: error.provider,
            },
            status: 503,
        };
    }

    logger.error(route, 'Conversation turn failed', undefined, error);
    return {
        body: { error: 'Failed to process conversation turn' },
        status: 500,
    };
}
