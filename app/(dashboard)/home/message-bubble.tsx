'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { Button } from '@/components/ui/button';
import { Download, Printer, Camera } from 'lucide-react';
import { StarRating } from '@/components/star-rating';
import { cn } from '@/lib/utils';

const SketchLoadingAnimation = dynamic(() => import('@/components/sketch-loading-animation').then(m => ({ default: m.SketchLoadingAnimation })), { ssr: false });
const ShowcaseCard = dynamic(() => import('@/components/showcase-card').then(m => ({ default: m.ShowcaseCard })), { ssr: false });

export interface DisplayMessage {
    id: string;
    role: 'user' | 'assistant';
    content?: string;
    imageUrl?: string;
    downloadUrl?: string;
    promptUsed?: string;
    suggestions?: string[];
    rating?: number | null;
    isGenerating?: boolean;
    isTyping?: boolean;
    isError?: boolean;
    isNudge?: boolean;
    coloredPhoto?: {
        id: number;
        photoUrl: string | null;
        compositeUrl: string | null;
        compositeDownloadUrl: string | null;
    } | null;
    isUploadingColoredPhoto?: boolean;
}

export interface MessageBubbleProps {
    msg: DisplayMessage;
    index: number;
    imageIndex?: number;
    isLastAssistant: boolean;
    isLoading: boolean;
    shouldReveal: boolean;
    staggerStyle?: React.CSSProperties;
    onDownload: (msg: DisplayMessage) => void;
    onPrint: (msg: DisplayMessage) => void;
    onRate: (msg: DisplayMessage, value: number | null) => void;
    onSuggestionClick: (text: string) => void;
    onLightboxOpen: (imageIndex: number) => void;
    onRevealEnd: (msgId: string) => void;
    onShowNudge: () => void;
    onUploadColoredPhoto: (msg: DisplayMessage) => void;
}

export const MessageBubble = React.memo(function MessageBubble({
    msg,
    imageIndex,
    isLastAssistant,
    isLoading,
    shouldReveal,
    staggerStyle,
    onDownload,
    onPrint,
    onRate,
    onSuggestionClick,
    onLightboxOpen,
    onRevealEnd,
    onShowNudge,
    onUploadColoredPhoto,
}: MessageBubbleProps) {
    const isUser = msg.role === 'user';

    if (msg.isTyping) {
        return <TypingIndicator />;
    }

    if (msg.isGenerating) {
        return <GeneratingIndicator />;
    }

    return (
        <div
            className={cn(
                'flex flex-col gap-1 max-w-[95%] sm:max-w-[92%] animate-in slide-in-from-bottom-2 fade-in',
                isUser ? 'self-end items-end' : 'self-start items-start'
            )}
            style={staggerStyle}
        >
            {msg.imageUrl && (
                <ImageMessageCard
                    msg={msg}
                    imageIndex={imageIndex}
                    shouldReveal={shouldReveal}
                    onDownload={onDownload}
                    onPrint={onPrint}
                    onShowNudge={onShowNudge}
                    onUploadColoredPhoto={onUploadColoredPhoto}
                    onLightboxOpen={onLightboxOpen}
                    onRevealEnd={onRevealEnd}
                />
            )}

            {msg.coloredPhoto && msg.imageUrl && (
                <ShowcaseCard
                    originalImageUrl={msg.imageUrl}
                    coloredPhotoUrl={msg.coloredPhoto.photoUrl}
                    compositeUrl={msg.coloredPhoto.compositeUrl}
                    compositeDownloadUrl={msg.coloredPhoto.compositeDownloadUrl}
                    caption={msg.content}
                    rating={msg.rating ?? null}
                    onRate={(r) => onRate(msg, r)}
                />
            )}

            {msg.content && !msg.coloredPhoto && (
                <MessageText isUser={isUser} isError={msg.isError} content={msg.content} />
            )}

            {!isUser && !msg.isGenerating && !msg.isError && msg.imageUrl && !msg.coloredPhoto && (
                <div className="mt-1">
                    <StarRating
                        value={msg.rating ?? null}
                        onChange={(r) => onRate(msg, r)}
                    />
                </div>
            )}

            {isLastAssistant && msg.suggestions && msg.suggestions.length > 0 && !isLoading && (
                <SuggestionChips suggestions={msg.suggestions} onSuggestionClick={onSuggestionClick} />
            )}
        </div>
    );
});

function TypingIndicator() {
    return (
        <div className="flex flex-col items-start gap-2 max-w-[85%] animate-in fade-in slide-in-from-bottom-2">
            <div className="flex items-center gap-2 rounded-lg border-[1.5px] border-[var(--ink)] bg-white px-5 py-4">
                <span className="typing-dot h-[7px] w-[7px] rounded-full bg-[var(--ink)]/45" />
                <span className="typing-dot h-[7px] w-[7px] rounded-full bg-[var(--ink)]/45" />
                <span className="typing-dot h-[7px] w-[7px] rounded-full bg-[var(--ink)]/45" />
            </div>
        </div>
    );
}

function GeneratingIndicator() {
    return (
        <div className="flex w-full max-w-[min(100%,24rem)] flex-col items-start gap-2 animate-in fade-in slide-in-from-bottom-2">
            <SketchLoadingAnimation />
        </div>
    );
}

function ImageMessageCard({
    msg,
    imageIndex,
    shouldReveal,
    onDownload,
    onPrint,
    onShowNudge,
    onUploadColoredPhoto,
    onLightboxOpen,
    onRevealEnd,
}: Pick<MessageBubbleProps,
    'msg' |
    'imageIndex' |
    'shouldReveal' |
    'onDownload' |
    'onPrint' |
    'onShowNudge' |
    'onUploadColoredPhoto' |
    'onLightboxOpen' |
    'onRevealEnd'
>) {
    return (
        <div
            data-testid="message-image"
            className={cn(
                'paper-sheet mb-2 w-full overflow-hidden sm:max-w-[480px]',
                shouldReveal && 'animate-image-reveal'
            )}
            onAnimationEnd={() => onRevealEnd(msg.id)}
        >
            <div className="flex items-center justify-center bg-white p-4">
                <img
                    src={msg.imageUrl}
                    alt="Generated coloring page"
                    loading="lazy"
                    className="max-w-full h-auto max-h-[600px] cursor-zoom-in"
                    onError={(event) => {
                        if (msg.downloadUrl && event.currentTarget.src !== msg.downloadUrl) {
                            event.currentTarget.src = msg.downloadUrl;
                        }
                    }}
                    onClick={() => imageIndex !== undefined && onLightboxOpen(imageIndex)}
                />
            </div>
            <div className="paper-dashed flex items-center gap-1 bg-white p-3">
                <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs font-semibold text-[var(--ink)]/65 active:scale-95 hover:text-[var(--ink)]"
                    onClick={() => onDownload(msg)}
                >
                    <Download className="w-3.5 h-3.5 mr-1" /> Save
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs font-semibold text-[var(--ink)]/65 active:scale-95 hover:text-[var(--ink)]"
                    onClick={() => {
                        onPrint(msg);
                        onShowNudge();
                    }}
                >
                    <Printer className="w-3.5 h-3.5 mr-1" /> Print
                </Button>
                {!msg.coloredPhoto && (
                    <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs font-semibold text-[var(--ink)]/65 active:scale-95 hover:text-[var(--ink)]"
                        onClick={() => onUploadColoredPhoto(msg)}
                        disabled={msg.isUploadingColoredPhoto}
                        aria-busy={msg.isUploadingColoredPhoto}
                        aria-label={msg.isUploadingColoredPhoto ? 'Uploading colored photo' : 'Upload colored photo'}
                    >
                        {msg.isUploadingColoredPhoto ? (
                            <span className="mr-1 inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-[var(--ink)]/20 border-t-[var(--ink)]" role="status" />
                        ) : (
                            <Camera className="w-3.5 h-3.5 mr-1" />
                        )}
                        {msg.isUploadingColoredPhoto ? 'Uploading...' : 'Color & Show'}
                    </Button>
                )}
            </div>
        </div>
    );
}

function MessageText({ isUser, isError, content }: { isUser: boolean; isError?: boolean; content: string }) {
    return (
        <div
            className={cn(
                'rounded-lg border-[1.5px] border-[var(--ink)] px-5 py-3.5 text-[15px] leading-relaxed',
                isUser
                    ? 'bg-[var(--ink)] text-[var(--paper)]'
                    : cn(
                          'bg-white text-[var(--ink)]',
                          isError && 'bg-red-50 text-[var(--danger)]'
                      )
            )}
        >
            {content}
        </div>
    );
}

function SuggestionChips({
    suggestions,
    onSuggestionClick,
}: {
    suggestions: string[];
    onSuggestionClick: (text: string) => void;
}) {
    return (
        <div className="flex flex-wrap gap-2 mt-2 animate-in fade-in duration-500">
            {suggestions.map((suggestion) => (
                <button
                    key={suggestion}
                    onClick={() => onSuggestionClick(suggestion)}
                    className="paper-hover cursor-pointer rounded-full border-[1.5px] border-[var(--ink)] bg-white px-3.5 py-2 text-xs font-semibold text-[var(--ink)]"
                >
                    {suggestion}
                </button>
            ))}
        </div>
    );
}
