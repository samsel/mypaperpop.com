'use client';

import { useEffect, useRef, type ReactNode } from 'react';

/**
 * Lightweight scroll-reveal using IntersectionObserver.
 * Adds `data-visible="true"` when the element enters the viewport.
 * CSS handles all animations — see globals.css `.reveal-*` classes.
 *
 * @param stagger — delay in ms between sibling children (applied via CSS custom property)
 * @param className — additional classes (must include a `.reveal-*` animation class)
 */
export function Reveal({
  children,
  className = '',
  stagger,
}: {
  children: ReactNode;
  className?: string;
  stagger?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Respect prefers-reduced-motion
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mq.matches) {
      el.setAttribute('data-visible', 'true');
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.setAttribute('data-visible', 'true');
          observer.disconnect();
        }
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={className}
      style={stagger ? { '--reveal-stagger': `${stagger}ms` } as React.CSSProperties : undefined}
    >
      {children}
    </div>
  );
}
