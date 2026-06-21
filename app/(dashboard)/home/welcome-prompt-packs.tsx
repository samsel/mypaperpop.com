'use client';

import type React from 'react';
import { cn } from '@/lib/utils';
import type { DailyContent } from '@/lib/daily-prompts';
import { StickerBurst } from '@/components/paper-studio';

const howItWorksSteps = [
    { number: '01', title: 'Describe', body: 'Type any idea.' },
    { number: '02', title: 'Draw', body: 'Get a clean page.' },
    { number: '03', title: 'Refine', body: 'Ask for tweaks.' },
    { number: '04', title: 'Print', body: 'Print or color.' },
];

interface WelcomePromptPacksProps {
    dailyContent: DailyContent;
    activeCategory: string;
    categoryChipsRef: React.RefObject<HTMLDivElement | null>;
    categoryPillIndicator: { left: number; top: number; width: number; height: number } | null;
    pillsDrag: React.MutableRefObject<{ active: boolean; startX: number; scrollLeft: number; moved: boolean }>;
    onCategoryChange: (categoryId: string) => void;
    onPromptSelect: (text: string) => void;
    onPromptPackSelected: (pack: { id: string; shortName: string }) => void;
}

export function WelcomePromptPacks({
    dailyContent,
    activeCategory,
    categoryChipsRef,
    categoryPillIndicator,
    pillsDrag,
    onCategoryChange,
    onPromptSelect,
    onPromptPackSelected,
}: WelcomePromptPacksProps) {
    const prompts = activeCategory === 'for-you'
        ? dailyContent.forYou
        : dailyContent.themes.find((theme) => theme.id === activeCategory)?.prompts || [];

    return (
        <div className="min-h-0 flex-1 min-w-0 overflow-y-auto w-full bg-white animate-in fade-in duration-500">
            <div className="mx-auto flex min-h-full w-full max-w-[860px] min-w-0 flex-col px-4 py-4 sm:px-6 lg:px-8 lg:py-6">
                <section className="flex min-w-0 flex-col">
                    <div className="relative flex items-center justify-center py-1 lg:py-1">
                        <div className="absolute right-[12%] top-7 z-10 hidden -rotate-3 rounded-sm border-[1.5px] border-[var(--ink)] bg-[#ffd4bd] px-4 py-2 font-hand text-sm text-[var(--ink)] shadow-[3px_4px_0_rgba(31,26,23,0.18)] md:block">
                            fresh sheet
                        </div>
                        <div className="paper-sheet relative w-full max-w-[210px] rotate-[-1.2deg] overflow-hidden bg-white p-2 shadow-[5px_7px_0_rgba(31,26,23,0.18)] sm:max-w-[500px] sm:p-4 lg:max-w-[270px] lg:rotate-[-1.6deg] lg:p-2.5 lg:shadow-[6px_8px_0_rgba(31,26,23,0.18)]">
                            <div className="flex justify-start px-1 pb-1.5 text-[8px] font-bold uppercase tracking-[0.14em] text-[var(--ink)]/48 sm:pb-3 sm:text-[10px] lg:pb-2 lg:text-[8px]">
                                <span>mypaperpop</span>
                            </div>
                            <div className="grid aspect-[1.72/1] place-items-center rounded-sm border-[1.5px] border-dashed border-[var(--ink)]/35 bg-[#fbf6ec] p-2.5 sm:aspect-[1.36/1] sm:p-6 lg:aspect-[1.72/1] lg:p-3">
                                <div className="text-center">
                                    <StickerBurst size={30} className="mx-auto sm:size-[58px] lg:size-8" />
                                    <h1 data-testid="chat-welcome" className="mt-1.5 font-display text-base leading-none text-[var(--ink)] sm:mt-3 sm:text-4xl lg:mt-2 lg:text-lg">
                                        Your sheet is ready.
                                    </h1>
                                    <p className="mt-1 font-hand text-xs text-[var(--ink)]/65 sm:mt-2 sm:text-lg lg:mt-1 lg:text-xs">describe an idea to create your coloring sheet</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mx-auto mt-3 w-full max-w-[760px] min-w-0 sm:mt-4 lg:mt-3">
                        <ol
                            aria-label="How it works"
                            className="grid min-w-0 grid-cols-4 gap-1.5 sm:gap-2"
                            data-testid="home-how-it-works"
                        >
                            {howItWorksSteps.map((step) => (
                                <li key={step.number} className="min-w-0 rounded-md border border-dashed border-[var(--ink)]/18 bg-[#fbf6ec]/70 px-1.5 py-1.5 sm:px-2.5 sm:py-2.5 lg:py-2">
                                    <div className="flex min-w-0 flex-col items-center gap-1 text-center sm:flex-row sm:items-start sm:gap-2 sm:text-left">
                                        <span className="grid size-6 shrink-0 place-items-center rounded-full border-[1.5px] border-[var(--ink)] bg-[#ffd4bd] font-display text-[10px] leading-none text-[var(--ink)] shadow-[1.5px_2px_0_rgba(31,26,23,0.14)] sm:mt-0.5 sm:size-7 sm:text-[11px]">
                                            {step.number}
                                        </span>
                                        <div className="min-w-0">
                                            <p className="text-[10px] font-bold leading-tight text-[var(--ink)] sm:text-[13px]">{step.title}</p>
                                            <p className="mt-0.5 hidden text-[11px] leading-snug text-[var(--ink)]/62 sm:block lg:text-[10px] xl:text-xs">{step.body}</p>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ol>
                    </div>

                    <div className="mt-3 min-w-0 border-t border-dashed border-[var(--ink)]/25 pt-3 sm:mt-4 lg:mt-3 lg:pt-2">
                        <div className="mb-3 flex min-w-0 flex-col gap-3 lg:gap-2">
                            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--ink)]/55 sm:text-[11px]">or start with one of these</p>
                            <PromptPackTabs
                                dailyContent={dailyContent}
                                activeCategory={activeCategory}
                                categoryChipsRef={categoryChipsRef}
                                categoryPillIndicator={categoryPillIndicator}
                                pillsDrag={pillsDrag}
                                onCategoryChange={onCategoryChange}
                                onPromptPackSelected={onPromptPackSelected}
                            />
                        </div>

                        <div
                            key={activeCategory}
                            className="grid min-w-0 grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3 sm:gap-3 lg:gap-2 card-stagger-in"
                            data-testid="prompt-pack-prompts"
                        >
                            {prompts.map((prompt) => (
                                <button
                                    key={prompt}
                                    onClick={() => onPromptSelect(prompt)}
                                    className="paper-hover min-h-11 overflow-hidden rounded-md border border-black/12 bg-white px-3 py-2 text-left text-xs font-medium leading-snug text-[var(--ink)] shadow-sm transition-all duration-150 active:scale-[0.99] sm:min-h-[92px] sm:py-3 sm:text-sm lg:min-h-9 lg:py-1.5"
                                >
                                    <span className="line-clamp-1 sm:line-clamp-none">&quot;{prompt}&quot;</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}

function PromptPackTabs({
    dailyContent,
    activeCategory,
    categoryChipsRef,
    categoryPillIndicator,
    pillsDrag,
    onCategoryChange,
    onPromptPackSelected,
}: Pick<WelcomePromptPacksProps,
    'dailyContent' |
    'activeCategory' |
    'categoryChipsRef' |
    'categoryPillIndicator' |
    'pillsDrag' |
    'onCategoryChange' |
    'onPromptPackSelected'
>) {
    return (
        <div
            className="min-w-0 max-w-full overflow-x-auto pb-1 sm:overflow-visible sm:pb-0"
            data-testid="prompt-pack-tabs"
            onMouseDown={(e) => {
                pillsDrag.current = { active: true, startX: e.pageX, scrollLeft: e.currentTarget.scrollLeft, moved: false };
            }}
            onMouseMove={(e) => {
                if (!pillsDrag.current.active) return;
                const dx = e.pageX - pillsDrag.current.startX;
                if (Math.abs(dx) > 3) pillsDrag.current.moved = true;
                e.currentTarget.scrollLeft = pillsDrag.current.scrollLeft - dx;
            }}
            onMouseUp={() => { pillsDrag.current.active = false; }}
            onMouseLeave={() => { pillsDrag.current.active = false; }}
            onClickCapture={(e) => {
                if (pillsDrag.current.moved) {
                    e.stopPropagation();
                    e.preventDefault();
                    pillsDrag.current.moved = false;
                }
            }}
        >
            <div ref={categoryChipsRef} className="relative flex w-full flex-wrap gap-1 sm:gap-2">
                {categoryPillIndicator && (
                    <div
                        className="absolute top-0 h-full rounded-full bg-[var(--ink)] shadow-[0_2px_0_rgba(31,26,23,0.12)] transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]"
                        style={{
                            left: categoryPillIndicator.left,
                            top: categoryPillIndicator.top,
                            width: categoryPillIndicator.width,
                            height: categoryPillIndicator.height,
                        }}
                    />
                )}
                <button
                    onClick={() => onCategoryChange('for-you')}
                    data-category-selected={activeCategory === 'for-you'}
                    className={tabClassName(activeCategory === 'for-you')}
                    data-testid="prompt-pack-for-you"
                >
                    For You
                </button>
                {dailyContent.themes.map((theme) => (
                    <button
                        key={theme.id}
                        onClick={() => {
                            onCategoryChange(theme.id);
                            onPromptPackSelected({ id: theme.id, shortName: theme.shortName });
                        }}
                        data-category-selected={activeCategory === theme.id}
                        className={tabClassName(activeCategory === theme.id)}
                        data-testid={`prompt-pack-${theme.id}`}
                    >
                        {theme.shortName}
                    </button>
                ))}
            </div>
        </div>
    );
}

function tabClassName(isActive: boolean) {
    return cn(
        'relative z-10 min-h-11 shrink-0 rounded-full border-[1.5px] px-2 py-1.5 text-[11px] font-semibold transition-[color,background-color,transform] duration-200 active:scale-95 sm:px-3.5 sm:py-2 sm:text-sm',
        isActive
            ? 'border-transparent bg-transparent text-[var(--paper)]'
            : 'bg-white text-[var(--ink)]/65 hover:bg-[var(--paper-card)] hover:text-[var(--ink)]'
    );
}
