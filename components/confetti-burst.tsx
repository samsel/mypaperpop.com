'use client';

import { useEffect } from 'react';
import confetti from 'canvas-confetti';

const COLORS = ['#ed6a3e', '#20486b', '#f4c2c2', '#a8c69f', '#f3d27e', '#fbf6ec'];

export function ConfettiBurst() {
  useEffect(() => {
    // Respect prefers-reduced-motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const end = Date.now() + 3000;
    let rafId: number;

    const frame = () => {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.6 },
        colors: COLORS,
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.6 },
        colors: COLORS,
      });

      if (Date.now() < end) {
        rafId = requestAnimationFrame(frame);
      }
    };

    frame();
    return () => cancelAnimationFrame(rafId);
  }, []);

  return null;
}
