'use client';

import { useLayoutEffect, useRef, useState, type RefObject } from 'react';
import { ArrowUp, Sparkles, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AGE_GROUP_OPTIONS } from '@/lib/ai/age-groups';
import type { AgeGroup } from '@/lib/ai/age-groups';
import { cn } from '@/lib/utils';
import { QuotaLimitContent } from './quota-limit';

interface ChatComposerProps {
    prompt: string;
    isLoading: boolean;
    isLimitReached: boolean;
    keyboardInset: number;
    ageGroup: AgeGroup;
    showAgeHint: boolean;
    pillIndicator: { left: number; width: number } | null;
    textAreaRef: RefObject<HTMLTextAreaElement | null>;
    ageGroupContainerRef: RefObject<HTMLDivElement | null>;
    onPromptChange: (value: string) => void;
    onSendMessage: () => void;
    onAgeGroupChange: (ageGroup: AgeGroup) => void;
    onDismissAgeHint: () => void;
}

export function ChatComposer({
    prompt,
    isLoading,
    isLimitReached,
    keyboardInset,
    ageGroup,
    showAgeHint,
    pillIndicator,
    textAreaRef,
    ageGroupContainerRef,
    onPromptChange,
    onSendMessage,
    onAgeGroupChange,
    onDismissAgeHint,
}: ChatComposerProps) {
    const rootRef = useRef<HTMLDivElement | null>(null);
    const [keyboardLift, setKeyboardLift] = useState(0);

    useLayoutEffect(() => {
        const root = rootRef.current;
        if (!root || keyboardInset <= 0) {
            setKeyboardLift(0);
            return;
        }

        const rect = root.getBoundingClientRect();
        const currentLift = Number(root.dataset.keyboardLift || 0);
        const unshiftedTop = rect.top + currentLift;
        const maxLift = Math.max(0, unshiftedTop - 8);
        setKeyboardLift(Math.min(keyboardInset, maxLift));
    }, [keyboardInset]);

    return (
        <div
            ref={rootRef}
            className="safe-area-bottom relative z-10 w-full border-t border-black/10 bg-white/88 px-4 py-3 shadow-[0_-10px_30px_rgba(31,26,23,0.08)] backdrop-blur-md transition-transform duration-150 ease-out sm:py-5 lg:py-3"
            data-keyboard-raised={keyboardLift > 0}
            data-keyboard-lift={keyboardLift}
            style={{ transform: keyboardLift > 0 ? `translateY(-${keyboardLift}px)` : undefined }}
        >
            <div className="relative mx-auto max-w-[860px]">
                <div className="relative overflow-hidden rounded-md border border-black/12 bg-white shadow-sm transition-colors duration-200 focus-within:ring-2 focus-within:ring-[var(--orange)]/25">
                    {!isLimitReached ? (
                        <>
                            <AgeGroupSelector
                                ageGroup={ageGroup}
                                showAgeHint={showAgeHint}
                                pillIndicator={pillIndicator}
                                ageGroupContainerRef={ageGroupContainerRef}
                                onAgeGroupChange={onAgeGroupChange}
                                onDismissAgeHint={onDismissAgeHint}
                            />
                            <PromptTextarea
                                prompt={prompt}
                                isLoading={isLoading}
                                textAreaRef={textAreaRef}
                                onPromptChange={onPromptChange}
                                onSendMessage={onSendMessage}
                            />
                        </>
                    ) : (
                        <div className="p-5 text-center">
                            <QuotaLimitContent />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function AgeGroupSelector({
    ageGroup,
    showAgeHint,
    pillIndicator,
    ageGroupContainerRef,
    onAgeGroupChange,
    onDismissAgeHint,
}: Pick<ChatComposerProps,
    'ageGroup' |
    'showAgeHint' |
    'pillIndicator' |
    'ageGroupContainerRef' |
    'onAgeGroupChange' |
    'onDismissAgeHint'
>) {
    return (
        <div className="border-b border-black/10 bg-[#fbf6ec] px-4 pt-3 pb-2 lg:pt-2 lg:pb-1.5">
            {showAgeHint && (
                <div className="relative mb-2 animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="relative rounded-lg border-[1.5px] border-[var(--ink)] bg-[var(--ink)] px-3 py-2 pr-7">
                        <p className="text-xs text-white">Pick your child&apos;s age for the right detail level</p>
                        <button
                            onClick={onDismissAgeHint}
                            className="absolute top-1.5 right-1.5 w-5 h-5 flex items-center justify-center rounded-sm text-neutral-400 hover:text-white hover:bg-white/10 transition-colors"
                            aria-label="Dismiss"
                        >
                            <X className="w-3 h-3" />
                        </button>
                    </div>
                    <div className="flex justify-center">
                        <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-neutral-950" />
                    </div>
                </div>
            )}
            <div ref={ageGroupContainerRef} className="scrollbar-hide relative grid min-w-0 grid-cols-4 gap-1.5 sm:flex sm:overflow-x-auto">
                {pillIndicator && (
                    <div
                        className="absolute top-0 h-full rounded-full bg-[var(--ink)] shadow-[0_2px_0_rgba(31,26,23,0.12)] transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]"
                        style={{ left: pillIndicator.left, width: pillIndicator.width }}
                    />
                )}
                {AGE_GROUP_OPTIONS.map((option) => (
                    <button
                        key={option.value}
                        data-testid="age-group-pill"
                        data-value={option.value}
                        data-age-selected={option.value === ageGroup}
                        onClick={() => onAgeGroupChange(option.value)}
                        className={cn(
                            'relative z-10 min-h-10 min-w-0 shrink-0 truncate rounded-full border-[1.5px] px-2 py-1 text-[11px] font-semibold transition-transform duration-200 active:scale-95 sm:px-3 sm:text-xs lg:min-h-8',
                            option.value === ageGroup
                                ? 'border-[var(--ink)] bg-[var(--ink)] text-white'
                                : 'border-[var(--ink)] bg-white text-[var(--ink)]/65 hover:text-[var(--ink)]'
                        )}
                    >
                        <span className="sm:hidden">{mobileAgeLabel(option.value)}</span>
                        <span className="hidden sm:inline">{option.label}</span>
                    </button>
                ))}
            </div>
            <p className="mt-1.5 text-[11px] font-medium text-[var(--ink)]/60 transition-all duration-300">
                {AGE_GROUP_OPTIONS.find((option) => option.value === ageGroup)?.description}
            </p>
        </div>
    );
}

function mobileAgeLabel(value: AgeGroup) {
    if (value === 'under-4') return 'Under 4';
    if (value === '4-7') return '4-7';
    if (value === '8-11') return '8-11';
    return '12+';
}

function PromptTextarea({
    prompt,
    isLoading,
    textAreaRef,
    onPromptChange,
    onSendMessage,
}: Pick<ChatComposerProps, 'prompt' | 'isLoading' | 'textAreaRef' | 'onPromptChange' | 'onSendMessage'>) {
    const canSend = !!prompt.trim() && !isLoading;

    return (
        <>
            <textarea
                data-testid="chat-input"
                ref={textAreaRef}
                value={prompt}
                onChange={(e) => {
                    onPromptChange(e.target.value);
                    e.target.style.height = 'auto';
                    e.target.style.height = `${e.target.scrollHeight}px`;
                }}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        onSendMessage();
                    }
                }}
                placeholder="Describe your idea..."
                disabled={isLoading}
                rows={1}
                className="max-h-32 w-full resize-none rounded-b-md border-0 bg-white py-4 pl-5 pr-14 text-base text-[var(--ink)] placeholder:font-hand placeholder:text-[var(--ink)]/45 focus:outline-none focus:ring-0 lg:py-3"
                enterKeyHint="send"
                style={{ minHeight: '44px' }}
            />
            <Button
                data-testid="chat-send"
                onClick={onSendMessage}
                disabled={!canSend}
                size="icon"
                className={cn(
                    'absolute right-2.5 bottom-2.5 h-10 w-10 rounded-md transition-all duration-200 active:scale-95',
                    canSend
                        ? 'bg-[var(--orange)] text-white'
                        : 'bg-[var(--paper-card)] text-[var(--ink)]/30'
                )}
            >
                {isLoading ? (
                    <Sparkles className="w-4 h-4 animate-spin" />
                ) : (
                    <ArrowUp className="w-5 h-5" />
                )}
            </Button>
        </>
    );
}
