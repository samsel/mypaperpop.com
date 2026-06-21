'use client';

import { Mail, RefreshCw } from 'lucide-react';
import { PaperpopWordmark } from '@/components/paper-studio';

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const errorRef = error.digest ?? 'dashboard';

  return (
    <div className="b-paper flex h-full min-h-[32rem] flex-col bg-[var(--paper)] text-[var(--ink)]">
      <header className="hidden shrink-0 items-center border-b-[1.5px] border-[var(--ink)] bg-[var(--paper)] px-5 py-3 md:flex lg:px-7">
        <PaperpopWordmark className="text-2xl" markSize={24} />
      </header>

      <main className="grid flex-1 place-items-center px-4 py-10 text-center sm:px-8">
        <section className="paper-sheet grid w-full max-w-[34rem] place-items-center bg-[#fcebe7] p-6 sm:p-8">
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--danger)]">
            Something broke
          </p>
          <h2 className="mt-3 font-display text-[clamp(2.5rem,9vw,3.5rem)] leading-none">
            The crayon snapped.
          </h2>
          <p className="mt-4 max-w-[27rem] text-sm leading-6 text-[var(--ink)]/80 sm:text-[15px]">
            Our drawing service hiccuped. Your work is safe - your sketchpad will be there when you reload.
          </p>
          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            <button
              onClick={() => reset()}
              className="paper-hover inline-flex min-h-11 items-center justify-center gap-2 rounded-full border-[1.5px] border-[var(--ink)] bg-[var(--ink)] px-5 text-sm font-semibold text-[var(--paper)]"
            >
              <RefreshCw className="h-4 w-4" aria-hidden="true" />
              Reload page
            </button>
            <a
              href={`mailto:goodcreatorllc@gmail.com?subject=MyPaperPop%20error%20${encodeURIComponent(errorRef)}`}
              className="paper-hover inline-flex min-h-11 items-center justify-center gap-2 rounded-full border-[1.5px] border-[var(--ink)] bg-transparent px-5 text-sm font-semibold"
            >
              <Mail className="h-4 w-4" aria-hidden="true" />
              Email support
            </a>
          </div>
          <p className="mt-5 font-mono-paper text-[10.5px] text-[var(--ink)]/55">
            ref: {errorRef}
          </p>
        </section>
      </main>
    </div>
  );
}
