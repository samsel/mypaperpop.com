'use client';

import { useEffect, useState } from 'react';

const LOADING_MESSAGES = [
    'Planning the page...',
    'Drawing bold outlines...',
    'Keeping it printer-ready...',
    'Almost ready to color...',
];

export function SketchLoadingAnimation() {
    const [messageIndex, setMessageIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setMessageIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
        }, 2500);
        return () => clearInterval(interval);
    }, []);

    return (
        <div
            data-testid="sketch-loading-preview"
            className="w-full rounded-lg border-[1.5px] border-[var(--ink)] bg-[var(--paper)] p-3 shadow-[0_10px_24px_rgba(31,26,23,0.12)]"
            aria-live="polite"
        >
            <div className="relative mx-auto aspect-[8.5/11] max-h-[46dvh] min-h-[260px] w-full max-w-[320px] overflow-hidden rounded-sm border border-black/15 bg-white shadow-inner">
                <div className="sketch-paper-sheen absolute inset-0" />
                <svg
                    className="absolute inset-[10%] h-[80%] w-[80%] text-[var(--ink)]"
                    viewBox="0 0 220 285"
                    fill="none"
                    aria-hidden="true"
                >
                    <path
                        className="sketch-draw-line sketch-draw-line-1"
                        d="M58 104C78 70 136 69 157 103C179 138 152 185 110 185C67 185 37 139 58 104Z"
                        stroke="currentColor"
                        strokeWidth="6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                    <path
                        className="sketch-draw-line sketch-draw-line-2"
                        d="M86 99C82 83 76 72 65 61M134 99C139 82 147 70 158 58M89 138H91M131 138H133M91 162C104 173 120 173 132 162"
                        stroke="currentColor"
                        strokeWidth="6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                    <path
                        className="sketch-draw-line sketch-draw-line-3"
                        d="M55 213C82 199 139 199 167 213M43 236C75 222 147 222 179 236"
                        stroke="currentColor"
                        strokeWidth="5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </svg>
                <div className="absolute bottom-3 right-3 h-9 w-9 rotate-[-20deg] rounded-sm border-[1.5px] border-[var(--ink)] bg-[var(--orange)] shadow-[3px_3px_0_rgba(31,26,23,0.18)]">
                    <div className="absolute left-1/2 top-[-22px] h-7 w-3 -translate-x-1/2 rounded-t-sm border border-[var(--ink)] bg-[#f8d887]" />
                </div>
            </div>

            <p className="mt-3 text-center text-sm font-semibold text-[var(--orange)] transition-opacity duration-300">
                {LOADING_MESSAGES[messageIndex]}
            </p>
        </div>
    );
}
