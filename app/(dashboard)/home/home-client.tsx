'use client';

import { useState, useEffect, useRef, useMemo, useLayoutEffect, useCallback } from 'react';
import type { CSSProperties } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import { apiClient } from '@/lib/api-client';
import { mutate } from 'swr';
import { usePostHog } from 'posthog-js/react';
import { AGE_GROUP_OPTIONS, DEFAULT_AGE_GROUP } from '@/lib/ai/age-groups';
import type { AgeGroup } from '@/lib/ai/age-groups';
import { haptics } from '@/lib/haptics';
import { toast } from 'sonner';
import { Lightbox } from '@/components/lightbox';
import type { DisplayMessage } from './message-bubble';
import { ChatThread } from './chat-thread';
import { ChatComposer } from './chat-composer';
import { ConversationLoadingSkeleton } from './conversation-loading-skeleton';
import { printImage, saveImage } from './image-actions';
import { WelcomePromptPacks } from './welcome-prompt-packs';
import { ColorShowDialog } from './color-show-dialog';
import type { DailyContent } from '@/lib/daily-prompts';

// Lazy-load components not needed on initial render
const ConfettiBurst = dynamic(() => import('@/components/confetti-burst').then(m => ({ default: m.ConfettiBurst })), { ssr: false });
interface HomeClientProps {
    userId: number;
    dailyContent: DailyContent;
    usageInfo: {
        freeRemaining: number;
        creditBalance: number;
        totalRemaining: number;
    };
}

export function HomeClient({ userId, dailyContent, usageInfo }: HomeClientProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const conversationParam = searchParams.get('c');
    const newParam = searchParams.get('new');

    const [currentUsage, setCurrentUsage] = useState(usageInfo);
    const [conversationId, setConversationId] = useState<number | null>(
        conversationParam ? parseInt(conversationParam, 10) : null
    );
    const [prompt, setPrompt] = useState('');
    const [messages, setMessages] = useState<DisplayMessage[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingConversation, setIsLoadingConversation] = useState(false);
    const posthog = usePostHog();
    const [ageGroup, setAgeGroup] = useState<AgeGroup>(DEFAULT_AGE_GROUP);
    const [confettiKey, setConfettiKey] = useState(0);
    const [showScrollToBottom, setShowScrollToBottom] = useState(false);
    const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
    const [activeCategory, setActiveCategory] = useState('for-you');
    const chatContainerRef = useRef<HTMLDivElement>(null);
    const bottomRef = useRef<HTMLDivElement>(null);
    const textAreaRef = useRef<HTMLTextAreaElement>(null);
    const ageGroupContainerRef = useRef<HTMLDivElement>(null);
    const categoryChipsRef = useRef<HTMLDivElement>(null);
    const [pillIndicator, setPillIndicator] = useState<{ left: number; width: number } | null>(null);
    const [categoryPillIndicator, setCategoryPillIndicator] = useState<{ left: number; top: number; width: number; height: number } | null>(null);
    const lastProcessedNewParam = useRef<string | null>(null);
    const lastLoadedConversationId = useRef<number | null>(null);
    const revealedMessageIds = useRef<Set<string>>(new Set());
    const justLoadedRef = useRef(false);
    const pillsDrag = useRef({ active: false, startX: 0, scrollLeft: 0, moved: false });
    const [colorShowOpen, setColorShowOpen] = useState(false);
    const [colorShowMessage, setColorShowMessage] = useState<DisplayMessage | null>(null);
    const [isColorShowUploading, setIsColorShowUploading] = useState(false);
    const [showAgeHint, setShowAgeHint] = useState(false);
    const coloredPhotoTargetMsgRef = useRef<DisplayMessage | null>(null);
    const keyboardInset = useMobileKeyboardInset();

    // Handle "New conversation" reset via ?new= param
    useEffect(() => {
        if (newParam && newParam !== lastProcessedNewParam.current) {
            lastProcessedNewParam.current = newParam;
            setConversationId(null);
            setMessages([]);
            setPrompt('');
            setIsLoading(false);
            setActiveCategory('for-you');
            lastLoadedConversationId.current = null;
            router.replace('/home');
        }
    }, [newParam, router]);

    // Handle loading a conversation from URL param ?c=ID
    useEffect(() => {
        const paramId = conversationParam ? parseInt(conversationParam, 10) : null;
        if (paramId && paramId !== lastLoadedConversationId.current) {
            lastLoadedConversationId.current = paramId;
            setConversationId(paramId);
            setActiveCategory('for-you');
            loadConversation(paramId);
        }
    }, [conversationParam]);

    // Auto-scroll via sentinel
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages.length, isLoading]);

    useEffect(() => {
        setCurrentUsage(usageInfo);
    }, [usageInfo]);

    useEffect(() => {
        const stored = localStorage.getItem('mypaperpop_age_group');
        if (stored && AGE_GROUP_OPTIONS.some((o) => o.value === stored)) {
            setAgeGroup(stored as AgeGroup);
        }
    }, []);

    useEffect(() => {
        localStorage.setItem('mypaperpop_age_group', ageGroup);
    }, [ageGroup]);

    // First-visit age hint tooltip
    useEffect(() => {
        if (localStorage.getItem(`mypaperpop_age_hint_dismissed_${userId}`)) return;
        const showTimer = setTimeout(() => setShowAgeHint(true), 500);
        return () => clearTimeout(showTimer);
    }, []);

    const dismissAgeHint = useCallback(() => {
        setShowAgeHint(false);
        localStorage.setItem(`mypaperpop_age_hint_dismissed_${userId}`, '1');
    }, [userId]);

    // Sliding pill indicator — measure selected button position
    const updatePillIndicator = useCallback(() => {
        const container = ageGroupContainerRef.current;
        if (!container) return;
        const selectedBtn = container.querySelector<HTMLButtonElement>('[data-age-selected="true"]');
        if (!selectedBtn) return;
        const containerRect = container.getBoundingClientRect();
        const btnRect = selectedBtn.getBoundingClientRect();
        setPillIndicator({
            left: btnRect.left - containerRect.left,
            width: btnRect.width,
        });
    }, []);

    // Update pill indicator before paint to avoid flash of invisible selected pill
    useLayoutEffect(() => {
        updatePillIndicator();
    }, [ageGroup, updatePillIndicator]);

    // Sliding pill indicator for category chips
    const updateCategoryPillIndicator = useCallback(() => {
        const container = categoryChipsRef.current;
        if (!container) return;
        const selectedBtn = container.querySelector<HTMLButtonElement>('[data-category-selected="true"]');
        if (!selectedBtn) return;
        const containerRect = container.getBoundingClientRect();
        const btnRect = selectedBtn.getBoundingClientRect();
        setCategoryPillIndicator({
            left: btnRect.left - containerRect.left,
            top: btnRect.top - containerRect.top,
            width: btnRect.width,
            height: btnRect.height,
        });
    }, []);

    useLayoutEffect(() => {
        updateCategoryPillIndicator();
    }, [activeCategory, updateCategoryPillIndicator]);

    // Scroll-to-bottom FAB visibility
    useEffect(() => {
        const el = chatContainerRef.current;
        if (!el) return;
        const checkScroll = () => {
            const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
            setShowScrollToBottom(distanceFromBottom > 200);
        };
        // Check initial position (e.g. after conversation load)
        checkScroll();
        el.addEventListener('scroll', checkScroll, { passive: true });
        return () => el.removeEventListener('scroll', checkScroll);
    }, [messages.length, isLoadingConversation]);

    // Derive lightbox images array and index map from messages (for multi-image navigation)
    const { lightboxImages, messageToImageIndex } = useMemo(() => {
        const imgs: string[] = [];
        const indexMap = new Map<number, number>();
        messages.forEach((m, i) => {
            if (m.imageUrl) {
                indexMap.set(i, imgs.length);
                imgs.push(m.downloadUrl || m.imageUrl);
            }
        });
        return { lightboxImages: imgs, messageToImageIndex: indexMap };
    }, [messages]);

    // Clear stagger ref after messages render with animation
    useEffect(() => {
        if (justLoadedRef.current && messages.length > 0) {
            const timer = setTimeout(() => { justLoadedRef.current = false; }, messages.length * 50 + 300);
            return () => clearTimeout(timer);
        }
    }, [messages]);

    // Pre-fill prompt from landing page demo (localStorage bridge)
    useEffect(() => {
        try {
            const demoPrompt = localStorage.getItem('mpp_demo_prompt');
            if (demoPrompt && messages.length === 0 && !conversationParam) {
                setPrompt(demoPrompt);
                localStorage.removeItem('mpp_demo_prompt');
            }
        } catch {}
    }, []);
    const isLimitReached = currentUsage.totalRemaining === 0;

    async function loadConversation(id: number) {
        setIsLoadingConversation(true);
        try {
            const data = await apiClient.get<{
                conversation: { id: number; title: string };
                messages: Array<{
                    id: number;
                    role: string;
                    content: string | null;
                    imageUrl: string | null;
                    downloadUrl: string | null;
                    promptUsed: string | null;
                    rating: number | null;
                    coloredPhoto?: {
                        id: number;
                        photoUrl: string | null;
                        compositeUrl: string | null;
                        compositeDownloadUrl: string | null;
                    } | null;
                }>;
            }>(`/api/conversations/${id}`);

            const loadedMessages: DisplayMessage[] = data.messages.map((msg) => ({
                id: String(msg.id),
                role: msg.role as 'user' | 'assistant',
                content: msg.content || undefined,
                imageUrl: msg.imageUrl || undefined,
                downloadUrl: msg.downloadUrl || undefined,
                promptUsed: msg.promptUsed || undefined,
                rating: msg.rating ?? undefined,
                coloredPhoto: msg.coloredPhoto || undefined,
            }));
            justLoadedRef.current = true;
            setMessages(loadedMessages);
        } catch {
            setMessages([]);
            setConversationId(null);
            router.replace('/home');
        } finally {
            setIsLoadingConversation(false);
        }
    }

    function addLoadingBubble(): { loadingId: string; cancelTimer: () => void } {
        const loadingId = `${Date.now()}-gen`;
        setMessages((prev) => [
            ...prev,
            { id: loadingId, role: 'assistant' as const, isTyping: true },
        ]);
        setIsLoading(true);

        // Keep ambiguous follow-ups in a neutral thinking state. If the request is
        // truly generating, it will usually run long enough to show the sketching state.
        const timerId = setTimeout(() => {
            setMessages((prev) =>
                prev.map((msg) =>
                    msg.id === loadingId ? { ...msg, isTyping: false, isGenerating: true } : msg
                )
            );
        }, 8000);

        const cancelTimer = () => clearTimeout(timerId);

        return { loadingId, cancelTimer };
    }

    function handleGenerationError(error: unknown, loadingId: string) {
        haptics.error();
        const errMsg = error instanceof Error ? error.message : '';
        let content: string;
        if (errMsg.includes('no_credits') || errMsg.includes('429')) {
            setCurrentUsage((prev) => ({ ...prev, totalRemaining: 0 }));
            mutate('/api/user');
            content = "No coloring pages remaining. Get more to keep creating!";
        } else if (errMsg.includes('ai_service_unavailable') || errMsg.includes('temporarily unavailable')) {
            content = 'Technical issue: the coloring page helper is temporarily unavailable. Please try again soon.';
        } else {
            content = 'Something went wrong while drawing. Please try again.';
        }
        setMessages((prev) =>
            prev.map((msg) =>
                msg.id === loadingId
                    ? { id: loadingId, role: 'assistant' as const, content, isError: true }
                    : msg
            )
        );
    }

    function handleGenerationSuccess({ convId, isFirst, prompt, imageUrl }: {
        convId: number;
        isFirst: boolean;
        prompt: string;
        imageUrl?: string;
    }) {
        if (isFirst || imageUrl) {
            setConfettiKey((k) => k + 1);
            haptics.success();
        }
        posthog.capture('image_generated', {
            conversation_id: convId,
            is_first_in_conversation: isFirst,
            prompt,
            image_url: imageUrl,
            age_group: ageGroup,
        });
        mutate('/api/conversations');
        mutate('/api/user');
    }

    async function submitConversationTurn(userText: string) {
        const { loadingId, cancelTimer } = addLoadingBubble();

        try {
            if (!conversationId) {
                const data = await apiClient.post<{
                    conversation: { id: number; title: string };
                    messages: Array<{
                        id: number;
                        role: string;
                        content: string | null;
                        imageUrl: string | null;
                        downloadUrl: string | null;
                        promptUsed: string | null;
                        suggestions?: string[];
                    }>;
                    remaining?: number;
                }>('/api/conversations', {
                    prompt: userText,
                    ageGroup,
                });

                const newConvId = data.conversation.id;
                setConversationId(newConvId);
                lastLoadedConversationId.current = newConvId;
                router.replace(`/home?c=${newConvId}`);

                const assistantMsg = data.messages.find((m) => m.role === 'assistant');
                const hasImage = !!assistantMsg?.imageUrl;

                if (hasImage) {
                    // GENERATE path — image was created
                    if (data.remaining !== undefined) {
                        setCurrentUsage((prev) => ({ ...prev, totalRemaining: data.remaining! }));
                    } else {
                        setCurrentUsage((prev) => ({ ...prev, totalRemaining: Math.max(0, prev.totalRemaining - 1) }));
                    }

                    const realId = String(assistantMsg?.id || loadingId);
                    revealedMessageIds.current.add(realId);
                    setMessages((prev) =>
                        prev.map((msg) =>
                            msg.id === loadingId
                                ? {
                                      id: realId,
                                      role: 'assistant' as const,
                                      content: assistantMsg?.content || undefined,
                                      imageUrl: assistantMsg?.imageUrl || undefined,
                                      downloadUrl: assistantMsg?.downloadUrl || undefined,
                                      promptUsed: assistantMsg?.promptUsed || undefined,
                                      suggestions: assistantMsg?.suggestions,
                                  }
                                : msg
                        )
                    );

                    handleGenerationSuccess({ convId: newConvId, isFirst: true, prompt: userText, imageUrl: assistantMsg?.imageUrl || undefined });
                } else {
                    // CLARIFY path — text + suggestions only, no image
                    const realId = String(assistantMsg?.id || loadingId);
                    setMessages((prev) =>
                        prev.map((msg) =>
                            msg.id === loadingId
                                ? {
                                      id: realId,
                                      role: 'assistant' as const,
                                      content: assistantMsg?.content || undefined,
                                      suggestions: assistantMsg?.suggestions,
                                  }
                                : msg
                        )
                    );
                    mutate('/api/conversations');
                }
            } else {
                const data = await apiClient.post<{
                    messages: Array<{
                        id: number;
                        role: string;
                        content: string | null;
                        imageUrl?: string | null;
                        downloadUrl?: string | null;
                        promptUsed?: string | null;
                        suggestions?: string[];
                    }>;
                    remaining?: number;
                }>(`/api/conversations/${conversationId}/messages`, {
                    content: userText,
                    ageGroup,
                });

                const newMsgs = data.messages.map((m) => ({
                    id: String(m.id),
                    role: m.role as 'user' | 'assistant',
                    content: m.content || undefined,
                    imageUrl: m.imageUrl || undefined,
                    downloadUrl: m.downloadUrl || undefined,
                    promptUsed: m.promptUsed || undefined,
                    suggestions: m.suggestions,
                }));

                const assistantMsg = newMsgs.find((m) => m.role === 'assistant');
                const hasImage = !!assistantMsg?.imageUrl;

                newMsgs.forEach((m) => {
                    if (m.role === 'assistant' && m.imageUrl) {
                        revealedMessageIds.current.add(m.id);
                    }
                });

                setMessages((prev) => {
                    const filtered = prev.filter((msg) => msg.id !== loadingId);
                    return [...filtered, ...newMsgs];
                });

                if (data.remaining !== undefined) {
                    setCurrentUsage((prev) => ({ ...prev, totalRemaining: data.remaining! }));
                }

                if (hasImage) {
                    handleGenerationSuccess({ convId: conversationId, isFirst: false, prompt: userText, imageUrl: assistantMsg?.imageUrl || undefined });
                }
            }
        } catch (err: unknown) {
            cancelTimer();
            handleGenerationError(err, loadingId);
        } finally {
            cancelTimer();
            setIsLoading(false);
        }
    }

    async function handleSendMessage() {
        if (!prompt.trim() || isLoading) return;
        if (isLimitReached) return;

        haptics.submit();
        const userText = prompt.trim();
        setPrompt('');
        if (textAreaRef.current) {
            textAreaRef.current.style.height = 'auto';
            textAreaRef.current.blur();
        }

        // Add user message optimistically
        const userMsgId = `${Date.now()}-user`;
        setMessages((prev) => [
            ...prev,
            { id: userMsgId, role: 'user', content: userText },
        ]);

        await submitConversationTurn(userText);
    }

    async function handleDownload(msg: DisplayMessage) {
        await saveImage(msg);
    }

    function fillPrompt(text: string) {
        haptics.selection();
        setPrompt(text);
        setTimeout(() => textAreaRef.current?.focus(), 0);
    }

    function handleAgeGroupChange(nextAgeGroup: AgeGroup) {
        if (nextAgeGroup !== ageGroup) haptics.selection();
        setAgeGroup(nextAgeGroup);
        if (showAgeHint) dismissAgeHint();
    }

    function handleCategoryChange(categoryId: string) {
        if (categoryId !== activeCategory) haptics.selection();
        setActiveCategory(categoryId);
    }

    function handleUploadColoredPhoto(msg: DisplayMessage) {
        coloredPhotoTargetMsgRef.current = msg;
        setColorShowMessage(msg);
        setColorShowOpen(true);
    }

    async function handleColoredPhotoSelected(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file || !coloredPhotoTargetMsgRef.current || !conversationId) return;

        const targetMsg = coloredPhotoTargetMsgRef.current;

        // Reset file input so same file can be re-selected
        e.target.value = '';

        // Guard: ensure the target message still exists in current conversation state
        // (user may have switched conversations while file picker was open)
        if (!messages.some(m => m.id === targetMsg.id)) return;

        // Client-side file size check to avoid unnecessary memory pressure
        const MAX_FILE_SIZE = 11 * 1024 * 1024; // 11 MB
        if (file.size > MAX_FILE_SIZE) {
            toast.error('Photo is too large. Please use a photo under 11 MB.');
            return;
        }

        // Set uploading state
        setIsColorShowUploading(true);
        setMessages((prev) =>
            prev.map((m) => (m.id === targetMsg.id ? { ...m, isUploadingColoredPhoto: true } : m))
        );

        try {
            // Read file as base64
            const base64 = await new Promise<string>((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => {
                    const result = reader.result as string;
                    // Strip data URL prefix
                    resolve(result.split(',')[1]);
                };
                reader.onerror = reject;
                reader.readAsDataURL(file);
            });

            const data = await apiClient.post<{
                coloredPhoto: {
                    id: number;
                    photoUrl: string | null;
                    compositeUrl: string | null;
                    compositeDownloadUrl: string | null;
                };
            }>(`/api/conversations/${conversationId}/messages/${targetMsg.id}/colored-photo`, {
                photoBase64: base64,
            });

            // Update message with colored photo data
            setMessages((prev) =>
                prev.map((m) =>
                    m.id === targetMsg.id
                        ? { ...m, isUploadingColoredPhoto: false, coloredPhoto: data.coloredPhoto }
                        : m
                )
            );

            posthog.capture('showcase_photo_uploaded', {
                conversation_id: conversationId,
                message_id: targetMsg.id,
            });

            setColorShowOpen(false);
            setColorShowMessage(null);
            coloredPhotoTargetMsgRef.current = null;
            setIsColorShowUploading(false);
            toast.success('Photo uploaded!');
            setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 0);
        } catch (error) {
            setMessages((prev) =>
                prev.map((m) => (m.id === targetMsg.id ? { ...m, isUploadingColoredPhoto: false } : m))
            );
            setIsColorShowUploading(false);
            const message = error instanceof Error ? error.message : '';
            toast.error(message || 'Failed to upload photo. Please try again with a JPG or PNG if this was an HEIC.');
        }
    }

    const lastAssistantIndex = useMemo(() => {
        for (let i = messages.length - 1; i >= 0; i--) {
            if (messages[i].role === 'assistant' && !messages[i].isGenerating) return i;
        }
        return -1;
    }, [messages]);

    function handleSuggestionClick(text: string) {
        if (isLoading) return;
        haptics.light();
        // Clear suggestions from current messages to prevent re-clicking
        setMessages((prev) =>
            prev.map((msg) => (msg.suggestions ? { ...msg, suggestions: undefined } : msg))
        );
        // Add user message and continue conversation
        const userMsgId = `${Date.now()}-user`;
        setMessages((prev) => [
            ...prev,
            { id: userMsgId, role: 'user', content: text },
        ]);
        submitConversationTurn(text);
    }

    async function handleRating(msg: DisplayMessage, value: number | null) {
        if (!conversationId) return;
        haptics.light();
        const previousRating = msg.rating;

        // Optimistic update
        setMessages((prev) =>
            prev.map((m) => (m.id === msg.id ? { ...m, rating: value } : m))
        );

        try {
            await apiClient.patch(`/api/conversations/${conversationId}/messages/${msg.id}`, {
                rating: value,
            });
            posthog.capture('message_rated', {
                conversation_id: conversationId,
                message_id: msg.id,
                rating: value,
            });
        } catch {
            // Revert on failure
            setMessages((prev) =>
                prev.map((m) => (m.id === msg.id ? { ...m, rating: previousRating } : m))
            );
        }
    }

    // Memoized callbacks for MessageBubble
    const handleRevealEnd = useCallback((msgId: string) => {
        revealedMessageIds.current.delete(msgId);
    }, []);

    const handlePrint = useCallback((msg: DisplayMessage) => {
        printImage(msg);
        posthog.capture('image_print_clicked', {
            conversation_id: conversationId,
            message_id: msg.id,
        });
    }, [conversationId, posthog]);

    const handleLightboxOpen = useCallback((imageIndex: number) => {
        setLightboxIndex(imageIndex);
    }, []);

    if (isLoadingConversation) {
        return <ConversationLoadingSkeleton />;
    }

    return (
        <main
            className="absolute inset-0 flex flex-col bg-[#f7f1e6] text-[var(--ink)]"
            style={{ '--mobile-keyboard-inset': `${keyboardInset}px` } as CSSProperties}
        >
            {confettiKey > 0 && <ConfettiBurst key={confettiKey} />}
            {messages.length === 0 ? (
                <WelcomePromptPacks
                    dailyContent={dailyContent}
                    activeCategory={activeCategory}
                    categoryChipsRef={categoryChipsRef}
                    categoryPillIndicator={categoryPillIndicator}
                    pillsDrag={pillsDrag}
                    onCategoryChange={handleCategoryChange}
                    onPromptSelect={fillPrompt}
                    onPromptPackSelected={(pack) => {
                        posthog.capture('prompt_pack_selected', {
                            pack_id: pack.id,
                            pack_name: pack.shortName,
                        });
                    }}
                />
            ) : (
                <ChatThread
                    messages={messages}
                    chatContainerRef={chatContainerRef}
                    bottomRef={bottomRef}
                    messageToImageIndex={messageToImageIndex}
                    lastAssistantIndex={lastAssistantIndex}
                    isLoading={isLoading}
                    isLimitReached={isLimitReached}
                    keyboardInset={keyboardInset}
                    showScrollToBottom={showScrollToBottom}
                    revealedMessageIds={revealedMessageIds}
                    shouldStaggerMessages={justLoadedRef.current}
                    onDownload={handleDownload}
                    onPrint={handlePrint}
                    onRate={handleRating}
                    onSuggestionClick={handleSuggestionClick}
                    onLightboxOpen={handleLightboxOpen}
                    onRevealEnd={handleRevealEnd}
                    onUploadColoredPhoto={handleUploadColoredPhoto}
                    onScrollToBottom={() => {
                        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
                        setShowScrollToBottom(false);
                    }}
                />
            )}

            <ChatComposer
                prompt={prompt}
                isLoading={isLoading}
                isLimitReached={isLimitReached}
                keyboardInset={keyboardInset}
                ageGroup={ageGroup}
                showAgeHint={showAgeHint}
                pillIndicator={pillIndicator}
                textAreaRef={textAreaRef}
                ageGroupContainerRef={ageGroupContainerRef}
                onPromptChange={setPrompt}
                onSendMessage={handleSendMessage}
                onAgeGroupChange={handleAgeGroupChange}
                onDismissAgeHint={dismissAgeHint}
            />

            <ColorShowDialog
                open={colorShowOpen}
                message={colorShowMessage}
                isUploading={isColorShowUploading}
                onOpenChange={(open) => {
                    setColorShowOpen(open);
                    if (!open) {
                        setColorShowMessage(null);
                        if (!isColorShowUploading) coloredPhotoTargetMsgRef.current = null;
                    }
                }}
                onFileSelected={handleColoredPhotoSelected}
            />

            {/* Lightbox overlay with gestures */}
            {lightboxIndex !== null && lightboxImages.length > 0 && (
                <Lightbox
                    images={lightboxImages}
                    index={lightboxIndex}
                    onClose={() => setLightboxIndex(null)}
                    onIndexChange={setLightboxIndex}
                />
            )}

        </main>
    );
}

function useMobileKeyboardInset() {
    const [keyboardInset, setKeyboardInset] = useState(0);

    useEffect(() => {
        const visualViewport = window.visualViewport;
        const virtualKeyboard = (navigator as Navigator & {
            virtualKeyboard?: EventTarget & {
                overlaysContent?: boolean;
                boundingRect?: DOMRect;
            };
        }).virtualKeyboard;

        if (virtualKeyboard && 'overlaysContent' in virtualKeyboard) {
            virtualKeyboard.overlaysContent = true;
        }

        const isLikelyMobileViewport = () => (
            window.matchMedia('(pointer: coarse)').matches ||
            window.matchMedia('(max-width: 768px)').matches
        );

        const hasFocusedEditable = () => {
            const activeElement = document.activeElement;
            if (!activeElement) return false;
            return activeElement instanceof HTMLTextAreaElement ||
                activeElement instanceof HTMLInputElement ||
                activeElement instanceof HTMLSelectElement ||
                activeElement.getAttribute('contenteditable') === 'true';
        };

        const updateInset = () => {
            if (!isLikelyMobileViewport() || !hasFocusedEditable()) {
                setKeyboardInset(0);
                return;
            }

            const viewportInset = visualViewport
                ? Math.max(0, window.innerHeight - visualViewport.height - visualViewport.offsetTop)
                : 0;
            const keyboardRect = virtualKeyboard?.boundingRect;
            const keyboardRectInset = keyboardRect ? Math.max(0, window.innerHeight - keyboardRect.top) : 0;
            const nextInset = Math.max(viewportInset, keyboardRectInset);
            setKeyboardInset(nextInset > 80 ? Math.round(nextInset) : 0);
        };

        updateInset();
        visualViewport?.addEventListener('resize', updateInset);
        visualViewport?.addEventListener('scroll', updateInset);
        virtualKeyboard?.addEventListener('geometrychange', updateInset);
        window.addEventListener('orientationchange', updateInset);
        window.addEventListener('resize', updateInset);
        document.addEventListener('focusin', updateInset);
        document.addEventListener('focusout', updateInset);

        return () => {
            visualViewport?.removeEventListener('resize', updateInset);
            visualViewport?.removeEventListener('scroll', updateInset);
            virtualKeyboard?.removeEventListener('geometrychange', updateInset);
            window.removeEventListener('orientationchange', updateInset);
            window.removeEventListener('resize', updateInset);
            document.removeEventListener('focusin', updateInset);
            document.removeEventListener('focusout', updateInset);
        };
    }, []);

    return keyboardInset;
}
