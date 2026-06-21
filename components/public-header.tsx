'use client';

import Link from 'next/link';
import { PaperpopWordmark } from '@/components/paper-studio';

interface PublicHeaderProps {
  isAuthenticated: boolean;
  /** Use anchor links (#pricing, #sign-up) instead of page links. Used on the landing page. */
  useAnchors?: boolean;
}

export function PublicHeader({ isAuthenticated, useAnchors }: PublicHeaderProps) {
  const pricingHref = useAnchors ? '#pricing' : '/#pricing';

  return (
    <nav data-testid="public-header" className="sticky top-0 z-40 border-b-[1.5px] border-[var(--ink)] bg-[var(--paper)]/95 backdrop-blur-md">
      <div className="mx-auto flex h-12 max-w-7xl items-center justify-between px-4 sm:h-16 sm:px-6 lg:px-10">
        <Link href="/" className="flex items-center gap-2" aria-label="MyPaperPop home">
          <PaperpopWordmark className="text-[1.55rem] sm:text-3xl" markSize={28} />
        </Link>

        <div className="flex items-center gap-5">
          <div className="hidden items-center gap-5 text-sm font-semibold text-[var(--ink)] md:flex">
            <Link href="/coloring-pages/dinosaur-world">Ideas</Link>
            <a href={pricingHref}>Pricing</a>
            <Link href="/faq">FAQ</Link>
          </div>
          {isAuthenticated ? (
            <Link href="/home" className="paper-hover inline-flex h-11 shrink-0 items-center justify-center whitespace-nowrap rounded-full border-[1.5px] border-[var(--ink)] bg-[var(--ink)] px-4 text-sm font-semibold leading-none text-[var(--paper)]">
              Go to app
            </Link>
          ) : (
            <button
              className="paper-hover min-h-11 whitespace-nowrap rounded-full border-[1.5px] border-[var(--ink)] bg-[var(--ink)] px-3 py-1.5 text-xs font-semibold text-[var(--paper)] sm:px-4 sm:py-2 sm:text-sm"
              onClick={() => {
                if (useAnchors) {
                  window.location.hash = 'sign-up';
                } else {
                  window.location.href = '/#sign-up';
                }
              }}
            >
              Get started free
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
