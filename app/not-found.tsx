import Link from 'next/link';
import { Home } from 'lucide-react';
import { PaperpopWordmark, StickerBurst } from '@/components/paper-studio';

export default function NotFound() {
  return (
    <div className="b-paper flex min-h-[100dvh] flex-col bg-[var(--paper)] text-[var(--ink)]">
      <header className="flex shrink-0 items-center justify-between px-5 py-5 sm:px-8 lg:px-11">
        <Link href="/" aria-label="MyPaperPop home">
          <PaperpopWordmark className="text-3xl" markSize={28} />
        </Link>
        <Link
          href="/"
          className="paper-hover inline-flex items-center gap-2 rounded-full border-[1.5px] border-[var(--ink)] bg-white px-4 py-2 text-sm font-semibold"
        >
          <Home className="h-4 w-4" aria-hidden="true" />
          Back home
        </Link>
      </header>

      <main className="grid flex-1 place-items-center px-4 pb-20 pt-8 text-center sm:px-8 sm:pb-24 sm:pt-12">
        <section className="w-full max-w-4xl">
          <div className="relative mx-auto inline-block">
            <div className="font-display text-[clamp(7rem,22vw,13.75rem)] leading-none text-[var(--orange)]">
              404
            </div>
            <StickerBurst
              size={88}
              fill="var(--yellow)"
              className="absolute -right-7 top-3 rotate-[14deg] sm:-right-12 sm:top-7"
            />
          </div>

          <h1 className="mx-auto mt-5 max-w-3xl font-display text-[clamp(2.5rem,8vw,3.5rem)] leading-none">
            This page didn&apos;t get drawn.
          </h1>
          <p className="mx-auto mt-4 max-w-[31rem] text-base leading-7 text-[var(--ink)]/75 sm:text-[17px]">
            The link may be broken, or it might have moved. Try making something new instead.
          </p>

          <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/home"
              className="paper-hover inline-flex min-h-12 w-full max-w-[15rem] items-center justify-center gap-2 rounded-full border-[1.5px] border-[var(--ink)] bg-[var(--ink)] px-5 text-sm font-semibold text-[var(--paper)] sm:w-auto sm:max-w-none"
            >
              <Home className="h-4 w-4" aria-hidden="true" />
              Make a coloring page
            </Link>
          </div>

          <p className="mt-8 font-hand text-lg text-[var(--ink)]/55">
            (error code: 404 - page not found)
          </p>
        </section>
      </main>
    </div>
  );
}
