'use client';

import type React from 'react';
import Link from 'next/link';
import { ArrowDown, Camera, Download, Gift, Printer } from 'lucide-react';
import type { DisplayMessage } from './message-bubble';
import { Button } from '@/components/ui/button';
import { StarRating } from '@/components/star-rating';
import { SketchLoadingAnimation } from '@/components/sketch-loading-animation';
import { ShowcaseCard } from '@/components/showcase-card';
import { cn } from '@/lib/utils';

interface ChatThreadProps {
    messages: DisplayMessage[];
    chatContainerRef: React.RefObject<HTMLDivElement | null>;
    bottomRef: React.RefObject<HTMLDivElement | null>;
    messageToImageIndex: Map<number, number>;
    lastAssistantIndex: number;
    isLoading: boolean;
    isLimitReached: boolean;
    keyboardInset: number;
    showScrollToBottom: boolean;
    revealedMessageIds: React.MutableRefObject<Set<string>>;
    shouldStaggerMessages: boolean;
    onDownload: (msg: DisplayMessage) => void;
    onPrint: (msg: DisplayMessage) => void;
    onRate: (msg: DisplayMessage, value: number | null) => void;
    onSuggestionClick: (text: string) => void;
    onLightboxOpen: (imageIndex: number) => void;
    onRevealEnd: (msgId: string) => void;
    onUploadColoredPhoto: (msg: DisplayMessage) => void;
    onScrollToBottom: () => void;
}

export function ChatThread({
    messages,
    chatContainerRef,
    bottomRef,
    messageToImageIndex,
    lastAssistantIndex,
    isLoading,
    isLimitReached,
    keyboardInset,
    showScrollToBottom,
    shouldStaggerMessages,
    onDownload,
    onPrint,
    onRate,
    onSuggestionClick,
    onLightboxOpen,
    onRevealEnd,
    onUploadColoredPhoto,
    onScrollToBottom,
}: ChatThreadProps) {
    return (
        <>
            <div
                ref={chatContainerRef}
                className="chat-scroll flex-1 overflow-x-hidden overflow-y-auto bg-white"
            >
                <div className="mx-auto flex min-h-full w-full max-w-[860px] min-w-0">
                    <section className={cn("flex min-h-[360px] min-w-0 flex-1 flex-col overflow-x-hidden bg-white", isLimitReached && "opacity-45")}>
                        <div
                            className="flex flex-1 flex-col gap-5 overflow-x-hidden p-4 sm:p-6 lg:px-8"
                            style={{ paddingBottom: `calc(1.5rem + ${keyboardInset}px)` }}
                        >
                            {messages.map((msg, index) => (
                                <TranscriptMessage
                                    key={msg.id}
                                    msg={msg}
                                    imageIndex={messageToImageIndex.get(index)}
                                    isLastAssistant={index === lastAssistantIndex}
                                    isLoading={isLoading}
                                    staggerStyle={staggerStyle(index, shouldStaggerMessages)}
                                    onDownload={onDownload}
                                    onPrint={onPrint}
                                    onRate={onRate}
                                    onSuggestionClick={onSuggestionClick}
                                    onLightboxOpen={onLightboxOpen}
                                    onUploadColoredPhoto={onUploadColoredPhoto}
                                />
                            ))}
                            <div ref={bottomRef} className="h-4" />
                        </div>
                    </section>
                </div>
            </div>

            {isLimitReached && (
                <div className="absolute inset-0 z-30 grid place-items-center bg-[var(--ink)]/35 px-4">
                    <div className="paper-sheet w-full max-w-[520px] rotate-[-1deg] bg-[var(--paper)] p-6 text-center sm:p-7">
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border-[1.5px] border-[var(--ink)] bg-[var(--orange)] text-white">
                            <Gift className="h-7 w-7" />
                        </div>
                        <h2 className="mt-4 font-display text-4xl leading-none">You&apos;re out of pages for today.</h2>
                        <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-[var(--ink)]/70">
                            Free pages refresh at midnight. Grab more coloring pages to keep refining this sketchpad now.
                        </p>
                        <div className="mt-5 grid gap-2 sm:grid-cols-2">
                            <Button asChild className="h-auto min-h-12 rounded-lg bg-[var(--orange)] font-display text-lg text-white hover:bg-[var(--orange)]">
                                <Link href="/pricing">25 coloring pages · $2.99</Link>
                            </Button>
                            <Button asChild className="h-auto min-h-12 rounded-lg font-display text-lg">
                                <Link href="/pricing">75 coloring pages · $6.99</Link>
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {showScrollToBottom && messages.length > 0 && (
                <button
                    onClick={onScrollToBottom}
                    className="paper-hover fixed bottom-24 right-4 z-20 flex h-10 w-10 items-center justify-center rounded-full border-[1.5px] border-[var(--ink)] bg-white transition-all active:scale-95 animate-in fade-in slide-in-from-bottom-2 sm:right-8 lg:right-[calc(50%-430px+2rem)]"
                    aria-label="Scroll to bottom"
                >
                    <ArrowDown className="h-5 w-5 text-[var(--ink)]" />
                </button>
            )}
        </>
    );
}

function TranscriptMessage({
    msg,
    imageIndex,
    isLastAssistant,
    isLoading,
    staggerStyle,
    onDownload,
    onPrint,
    onRate,
    onSuggestionClick,
    onLightboxOpen,
    onUploadColoredPhoto,
}: {
    msg: DisplayMessage;
    imageIndex?: number;
    isLastAssistant: boolean;
    isLoading: boolean;
    staggerStyle?: React.CSSProperties;
    onDownload: (msg: DisplayMessage) => void;
    onPrint: (msg: DisplayMessage) => void;
    onRate: (msg: DisplayMessage, value: number | null) => void;
    onSuggestionClick: (text: string) => void;
    onLightboxOpen: (imageIndex: number) => void;
    onUploadColoredPhoto: (msg: DisplayMessage) => void;
}) {
    if (msg.isNudge) return null;
    if (msg.isTyping) {
        return (
            <div className="self-start">
                <p className="mb-1 text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--orange)]">mypaperpop</p>
                <div className="flex w-fit items-center gap-2 rounded-lg border-[1.5px] border-[var(--ink)] bg-white px-4 py-3">
                    <span className="typing-dot h-[7px] w-[7px] rounded-full bg-[var(--ink)]/45" />
                    <span className="typing-dot h-[7px] w-[7px] rounded-full bg-[var(--ink)]/45" />
                    <span className="typing-dot h-[7px] w-[7px] rounded-full bg-[var(--ink)]/45" />
                </div>
            </div>
        );
    }
    if (msg.isGenerating) {
        return (
            <div className="w-full max-w-[min(100%,24rem)] self-start animate-in fade-in slide-in-from-bottom-2">
                <p className="mb-1 text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--orange)]">mypaperpop</p>
                <SketchLoadingAnimation />
            </div>
        );
    }

    const isUser = msg.role === 'user';
    const hasShowcase = Boolean(msg.coloredPhoto && msg.imageUrl);
    const assistantText = msg.content || (msg.imageUrl ? 'Here is the newest version. Want to add anything?' : '');
    const content = isUser ? msg.content : assistantText;
    if (!content && !msg.suggestions?.length && !msg.imageUrl && !hasShowcase) return null;

    return (
        <div
            className={cn('max-w-full animate-in fade-in slide-in-from-bottom-2', isUser ? 'self-end text-right' : 'self-start text-left')}
            style={staggerStyle}
        >
            <p className={cn(
                'mb-1 text-[11px] font-bold uppercase tracking-[0.12em]',
                isUser ? 'text-[var(--blue)]' : 'text-[var(--orange)]'
            )}>
                {isUser ? 'you' : 'mypaperpop'}
            </p>
            {content && (
                <div className={cn(
                    'max-w-[min(100%,28rem)] break-words text-sm leading-6',
                    isUser
                        ? 'rounded-lg border-[1.5px] border-[var(--ink)] bg-white px-3 py-2 text-[var(--ink)]'
                        : msg.isError
                            ? 'rounded-lg border-[1.5px] border-[var(--danger)] bg-red-50 px-3 py-2 text-[var(--danger)]'
                            : 'text-[var(--ink)]/82'
                )}>
                    {content}
                </div>
            )}
            {!isUser && msg.imageUrl ? (
                <div data-testid="message-image" className="mt-2 w-full max-w-[min(100%,34rem)] overflow-hidden rounded-md border border-black/15 bg-white p-2 shadow-[0_10px_24px_rgba(31,26,23,0.12)] sm:p-3">
                    <button
                        className="block w-full rounded-sm bg-white"
                        onClick={() => imageIndex !== undefined && onLightboxOpen(imageIndex)}
                        aria-label="Open coloring page"
                    >
                        <img
                            src={msg.imageUrl}
                            alt="Generated coloring page"
                            loading="lazy"
                            className="mx-auto h-auto max-h-[68dvh] max-w-full"
                            onError={(event) => {
                                if (msg.downloadUrl && event.currentTarget.src !== msg.downloadUrl) {
                                    event.currentTarget.src = msg.downloadUrl;
                                }
                            }}
                        />
                    </button>
                    <div className="mt-2 flex justify-center border-t border-black/10 pt-2">
                        <StarRating value={msg.rating ?? null} onChange={(r) => onRate(msg, r)} />
                    </div>
                    <div className={cn(
                        'mt-2 grid gap-1.5 border-t border-black/10 pt-2',
                        msg.coloredPhoto ? 'grid-cols-2' : 'grid-cols-3'
                    )}>
                        <Button size="sm" variant="outline" className="h-9 px-2 text-xs" onClick={() => onDownload(msg)}>
                            <Download className="h-3.5 w-3.5" /> Save
                        </Button>
                        <Button size="sm" variant="outline" className="h-9 px-2 text-xs" onClick={() => onPrint(msg)}>
                            <Printer className="h-3.5 w-3.5" /> Print
                        </Button>
                        {!msg.coloredPhoto && (
                            <Button
                                size="sm"
                                variant="secondary"
                                className="h-9 bg-[var(--blue)] px-2 text-xs text-white hover:bg-[var(--blue)]"
                                onClick={() => onUploadColoredPhoto(msg)}
                                disabled={msg.isUploadingColoredPhoto}
                                aria-label={msg.isUploadingColoredPhoto ? 'Uploading colored photo' : 'Upload colored photo'}
                            >
                                <Camera className="h-3.5 w-3.5" /> {msg.isUploadingColoredPhoto ? 'Uploading' : 'Color'}
                            </Button>
                        )}
                    </div>
                </div>
            ) : null}
            {!isUser && hasShowcase && msg.imageUrl && msg.coloredPhoto ? (
                <div data-testid="showcase-card" className="mt-2 w-full max-w-[min(100%,34rem)]">
                    <ShowcaseCard
                        originalImageUrl={msg.imageUrl}
                        coloredPhotoUrl={msg.coloredPhoto.photoUrl}
                        compositeUrl={msg.coloredPhoto.compositeUrl}
                        compositeDownloadUrl={msg.coloredPhoto.compositeDownloadUrl}
                        caption={msg.content}
                        rating={msg.rating ?? null}
                        onRate={(r) => onRate(msg, r)}
                    />
                </div>
            ) : null}
            {isLastAssistant && msg.suggestions && msg.suggestions.length > 0 && !isLoading && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                    {msg.suggestions.map((suggestion) => (
                        <button
                            key={suggestion}
                            data-testid="suggestion-chip"
                            onClick={() => onSuggestionClick(suggestion)}
                            className="paper-hover rounded-full border-[1.5px] border-[var(--ink)] bg-white px-3 py-1.5 text-xs font-semibold text-[var(--ink)]"
                        >
                            {suggestion}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

function staggerStyle(index: number, shouldStagger: boolean): React.CSSProperties | undefined {
    if (!shouldStagger) return undefined;

    return {
        animationDelay: `${index * 50}ms`,
        animationFillMode: 'backwards',
    };
}
