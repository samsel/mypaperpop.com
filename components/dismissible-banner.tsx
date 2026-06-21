'use client';

import { X } from 'lucide-react';

interface DismissibleBannerProps {
  children: React.ReactNode;
  colorClass: string;
  onDismiss: () => void;
  ariaLabel?: string;
}

export function DismissibleBanner({ children, colorClass, onDismiss, ariaLabel = 'Dismiss' }: DismissibleBannerProps) {
  return (
    <div className={`${colorClass} flex shrink-0 items-center justify-between gap-3 border-b-[1.5px] border-[var(--ink)] px-4 py-3 text-[var(--ink)]`}>
      <p className="text-sm font-semibold">{children}</p>
      <button
        onClick={onDismiss}
        className="shrink-0 rounded-full border-[1.5px] border-[var(--ink)] bg-white p-1 transition-colors hover:bg-[var(--paper-card)]"
        aria-label={ariaLabel}
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
