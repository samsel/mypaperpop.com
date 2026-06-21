'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useDrag, usePinch } from '@use-gesture/react';
import { haptics } from '@/lib/haptics';

interface LightboxProps {
  images: string[];
  index: number;
  onClose: () => void;
  onIndexChange: (index: number) => void;
}

const MIN_SCALE = 1;
const MAX_SCALE = 4;
const DOUBLE_TAP_SCALE = 2;
const DISMISS_THRESHOLD = 120;
const DISMISS_VELOCITY = 0.5;
const NAV_THRESHOLD = 80;
const NAV_VELOCITY = 0.3;

export function Lightbox({ images, index, onClose, onIndexChange }: LightboxProps) {
  const [scale, setScale] = useState(1);
  const [translate, setTranslate] = useState({ x: 0, y: 0 });
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [backdropOpacity, setBackdropOpacity] = useState(1);
  const lastTapRef = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  const currentImage = images[index];
  const hasNext = index < images.length - 1;
  const hasPrev = index > 0;

  // Reset zoom when switching images
  useEffect(() => {
    setScale(1);
    setTranslate({ x: 0, y: 0 });
    setDragOffset({ x: 0, y: 0 });
    setBackdropOpacity(1);
  }, [index]);

  // Keyboard navigation
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight' && hasNext) {
        onIndexChange(index + 1);
        haptics.light();
      }
      if (e.key === 'ArrowLeft' && hasPrev) {
        onIndexChange(index - 1);
        haptics.light();
      }
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [index, hasNext, hasPrev, onClose, onIndexChange]);

  // Clamp translate so image stays within bounds when zoomed
  const clampTranslate = useCallback(
    (tx: number, ty: number, s: number) => {
      if (s <= 1) return { x: 0, y: 0 };
      const img = imageRef.current;
      if (!img) return { x: tx, y: ty };
      const rect = img.getBoundingClientRect();
      const baseW = rect.width / s; // unscaled dimensions
      const baseH = rect.height / s;
      const maxX = (baseW * (s - 1)) / 2;
      const maxY = (baseH * (s - 1)) / 2;
      return {
        x: Math.max(-maxX, Math.min(maxX, tx)),
        y: Math.max(-maxY, Math.min(maxY, ty)),
      };
    },
    []
  );

  // Double-tap to toggle zoom
  const handleImageClick = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      const now = Date.now();
      if (now - lastTapRef.current < 300) {
        // Double tap
        e.preventDefault();
        if (scale > 1) {
          setScale(1);
          setTranslate({ x: 0, y: 0 });
        } else {
          setScale(DOUBLE_TAP_SCALE);
          setTranslate({ x: 0, y: 0 });
        }
        lastTapRef.current = 0;
      } else {
        lastTapRef.current = now;
      }
    },
    [scale]
  );

  // Pinch-to-zoom
  usePinch(
    ({ offset: [s], memo }) => {
      const newScale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, s));
      setScale(newScale);
      if (newScale <= 1) {
        setTranslate({ x: 0, y: 0 });
      }
      return memo;
    },
    {
      target: containerRef,
      scaleBounds: { min: MIN_SCALE, max: MAX_SCALE },
      rubberband: true,
    }
  );

  // Drag: pan when zoomed, swipe-to-dismiss or swipe-to-navigate when not zoomed
  const bindDrag = useDrag(
    ({ active, movement: [mx, my], velocity: [vx, vy], direction: [dirX, dirY], cancel }) => {
      if (scale > 1) {
        // Pan mode when zoomed
        if (active) {
          setIsDragging(true);
          const clamped = clampTranslate(translate.x + mx, translate.y + my, scale);
          setDragOffset({ x: clamped.x - translate.x, y: clamped.y - translate.y });
        } else {
          setIsDragging(false);
          const clamped = clampTranslate(translate.x + mx, translate.y + my, scale);
          setTranslate(clamped);
          setDragOffset({ x: 0, y: 0 });
        }
        return;
      }

      // Not zoomed — gesture detection
      const absX = Math.abs(mx);
      const absY = Math.abs(my);

      if (active) {
        setIsDragging(true);

        // Determine primary axis
        if (absY > absX) {
          // Vertical — dismiss gesture
          setDragOffset({ x: 0, y: my });
          setBackdropOpacity(Math.max(0.3, 1 - Math.abs(my) / 400));
        } else {
          // Horizontal — nav gesture
          setDragOffset({ x: mx, y: 0 });
        }
      } else {
        setIsDragging(false);

        if (absY > absX) {
          // Vertical release — dismiss?
          if (Math.abs(my) > DISMISS_THRESHOLD || vy > DISMISS_VELOCITY) {
            haptics.light();
            onClose();
          } else {
            setDragOffset({ x: 0, y: 0 });
            setBackdropOpacity(1);
          }
        } else {
          // Horizontal release — navigate?
          if ((absX > NAV_THRESHOLD || vx > NAV_VELOCITY) && dirX < 0 && hasNext) {
            haptics.light();
            onIndexChange(index + 1);
          } else if ((absX > NAV_THRESHOLD || vx > NAV_VELOCITY) && dirX > 0 && hasPrev) {
            haptics.light();
            onIndexChange(index - 1);
          }
          setDragOffset({ x: 0, y: 0 });
          setBackdropOpacity(1);
        }
      }
    },
    { filterTaps: true, pointer: { touch: true } }
  );

  const imageTransform =
    scale > 1
      ? `scale(${scale}) translate(${(translate.x + dragOffset.x) / scale}px, ${(translate.y + dragOffset.y) / scale}px)`
      : `translate(${dragOffset.x}px, ${dragOffset.y}px)`;

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 flex items-center justify-center select-none"
      style={{ touchAction: 'none' }}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/90 backdrop-blur-sm"
        style={{
          opacity: backdropOpacity,
          transition: isDragging ? 'none' : 'opacity 200ms ease',
        }}
        onClick={onClose}
      />

      {/* Image counter */}
      {images.length > 1 && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 text-white/70 text-sm font-medium bg-black/30 px-3 py-1 rounded-full">
          {index + 1} of {images.length}
        </div>
      )}

      {/* Close button */}
      <button
        className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
        onClick={onClose}
        aria-label="Close"
      >
        <X className="w-6 h-6 text-white" />
      </button>

      {/* Desktop navigation arrows */}
      {hasPrev && (
        <button
          className="hidden sm:flex absolute left-4 z-10 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 items-center justify-center transition-colors"
          onClick={() => { onIndexChange(index - 1); haptics.light(); }}
          aria-label="Previous image"
        >
          <ChevronLeft className="w-6 h-6 text-white" />
        </button>
      )}
      {hasNext && (
        <button
          className="hidden sm:flex absolute right-4 z-10 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 items-center justify-center transition-colors"
          onClick={() => { onIndexChange(index + 1); haptics.light(); }}
          aria-label="Next image"
        >
          <ChevronRight className="w-6 h-6 text-white" />
        </button>
      )}

      {/* Image */}
      <div
        {...bindDrag()}
        className="relative z-[1] flex items-center justify-center p-4 w-full h-full"
        onClick={handleImageClick}
      >
        <img
          ref={imageRef}
          src={currentImage}
          alt="Full-size coloring page"
          className="max-w-full max-h-full object-contain"
          style={{
            transform: imageTransform,
            transition: isDragging ? 'none' : 'transform 200ms ease',
            willChange: 'transform',
          }}
          draggable={false}
        />
      </div>
    </div>
  );
}
