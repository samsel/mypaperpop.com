'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Polaroid } from '@/components/paper-studio';

type MobileGalleryItem = {
  src: string;
  prompt: string;
};

export function MobileGalleryCarousel({ items }: { items: MobileGalleryItem[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<number | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const updateActiveIndex = useCallback(() => {
    const scroller = scrollRef.current;
    if (!scroller) return;

    const cards = Array.from(scroller.querySelectorAll<HTMLElement>('[data-gallery-card]'));
    if (cards.length === 0) return;

    const scrollLeft = scroller.scrollLeft;
    let nextIndex = 0;
    let nearestDistance = Number.POSITIVE_INFINITY;

    cards.forEach((card, index) => {
      const distance = Math.abs(card.offsetLeft - scrollLeft);
      if (distance < nearestDistance) {
        nearestDistance = distance;
        nextIndex = index;
      }
    });

    setActiveIndex(nextIndex);
  }, []);

  const handleScroll = useCallback(() => {
    if (frameRef.current !== null) {
      window.cancelAnimationFrame(frameRef.current);
    }

    frameRef.current = window.requestAnimationFrame(() => {
      updateActiveIndex();
      frameRef.current = null;
    });
  }, [updateActiveIndex]);

  const scrollToIndex = useCallback((index: number) => {
    const scroller = scrollRef.current;
    const card = scroller?.querySelectorAll<HTMLElement>('[data-gallery-card]')[index];
    if (!scroller || !card) return;

    scroller.scrollTo({
      left: card.offsetLeft,
      behavior: 'smooth',
    });
    setActiveIndex(index);
  }, []);

  useEffect(() => {
    updateActiveIndex();

    return () => {
      if (frameRef.current !== null) {
        window.cancelAnimationFrame(frameRef.current);
      }
    };
  }, [updateActiveIndex]);

  return (
    <>
      <div className="relative -mx-4 overflow-hidden">
        <div
          ref={scrollRef}
          data-testid="mobile-gallery-carousel"
          className="flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4 [scrollbar-width:none] [-webkit-overflow-scrolling:touch] [&::-webkit-scrollbar]:hidden"
          aria-label="More example coloring pages"
          onScroll={handleScroll}
        >
          {items.map((item, index) => (
            <Polaroid
              key={item.src}
              image={item.src}
              prompt={item.prompt}
              className={[
                'w-[70vw] max-w-[280px] shrink-0 snap-start scroll-ml-4',
                index === 0 ? 'shadow-[5px_6px_0_var(--ink)]' : '',
              ].filter(Boolean).join(' ')}
              data-gallery-card=""
            />
          ))}
        </div>
        <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-[var(--paper)] to-transparent" />
      </div>
      <div data-testid="mobile-gallery-indicators" className="mt-1 flex items-center gap-1.5" aria-label="Example page position">
        {items.map((item, index) => {
          const isActive = activeIndex === index;
          return (
            <button
              key={item.src}
              type="button"
              className={[
                'h-2 rounded-full transition-all',
                isActive ? 'w-8 bg-[var(--orange)]' : 'w-2 bg-[var(--ink)]/25',
              ].join(' ')}
              aria-current={isActive ? 'true' : undefined}
              aria-label={`Show example ${index + 1}: ${item.prompt}`}
              data-testid="mobile-gallery-indicator"
              onClick={() => scrollToIndex(index)}
            />
          );
        })}
      </div>
    </>
  );
}
