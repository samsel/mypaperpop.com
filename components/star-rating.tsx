'use client';

import { useState, useCallback } from 'react';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StarRatingProps {
    value: number | null;
    onChange: (rating: number | null) => void;
}

const BURST_PARTICLES = 8;
const BURST_ANGLES = Array.from({ length: BURST_PARTICLES }, (_, i) => (360 / BURST_PARTICLES) * i);

function CelebrationBurst({ starIndex }: { starIndex: number }) {
    return (
        <div
            className="pointer-events-none absolute inset-0"
            style={{ left: `${starIndex * 28 + 14}px` }}
        >
            {BURST_ANGLES.map((angle) => (
                <div
                    key={angle}
                    className="absolute left-0 top-1/2 h-1 w-1 animate-star-burst rounded-full bg-[var(--orange)]"
                    style={{
                        '--burst-angle': `${angle}deg`,
                        '--burst-distance': `${16 + Math.random() * 8}px`,
                    } as React.CSSProperties}
                />
            ))}
        </div>
    );
}

export function StarRating({ value, onChange }: StarRatingProps) {
    const [hoverIndex, setHoverIndex] = useState<number | null>(null);
    const [burstStar, setBurstStar] = useState<number | null>(null);
    const [popStar, setPopStar] = useState<number | null>(null);

    const handleClick = useCallback(
        (starValue: number) => {
            if (value === starValue) {
                // Toggle off — no celebration
                onChange(null);
            } else {
                onChange(starValue);
                setBurstStar(starValue);
                setPopStar(starValue);
                setTimeout(() => setBurstStar(null), 500);
                setTimeout(() => setPopStar(null), 300);
            }
        },
        [value, onChange]
    );

    const displayValue = hoverIndex ?? value ?? 0;

    return (
        <div
            className="relative flex items-center gap-0.5"
            onMouseLeave={() => setHoverIndex(null)}
        >
            {[1, 2, 3, 4, 5].map((starValue) => {
                const isFilled = starValue <= displayValue;
                const isPop = popStar === starValue;

                return (
                    <button
                        key={starValue}
                        onClick={() => handleClick(starValue)}
                        onMouseEnter={() => setHoverIndex(starValue)}
                        className={cn(
                            'p-1 rounded-md transition-all duration-150',
                            isFilled
                                ? 'text-[var(--orange)] hover:scale-110'
                                : 'text-[var(--ink)]/25 hover:scale-110 hover:text-[var(--ink)]/45',
                            isPop && 'animate-star-pop'
                        )}
                        aria-label={`Rate ${starValue} star${starValue > 1 ? 's' : ''}`}
                    >
                        <Star
                            className="w-4 h-4"
                            fill={isFilled ? 'currentColor' : 'none'}
                            strokeWidth={isFilled ? 0 : 1.5}
                        />
                    </button>
                );
            })}
            {burstStar !== null && <CelebrationBurst starIndex={burstStar - 1} />}
        </div>
    );
}
