import Link from 'next/link';
import { CookieSettingsButton } from '@/components/cookie-consent-banner';
import { PaperpopWordmark } from '@/components/paper-studio';

export function PublicFooter() {
  return (
    <footer className="border-t-[1.5px] border-[var(--ink)] bg-[var(--paper)] px-4 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 text-sm text-[var(--ink)]/65 sm:flex-row sm:items-center sm:justify-between">
        <PaperpopWordmark className="text-3xl" markSize={28} />
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <span>&copy; mypaperpop {new Date().getFullYear()}</span>
          <Link href="/privacy">privacy</Link>
          <Link href="/terms">terms</Link>
          <Link href="/faq">faq</Link>
          <Link href="/coloring-pages/dinosaur-world">dinosaurs</Link>
          <Link href="/coloring-pages/unicorn">unicorns</Link>
          <Link href="/coloring-pages/animals">animals</Link>
          <Link href="/coloring-pages/teacher-worksheets">teachers</Link>
          <a href="mailto:goodcreatorllc@gmail.com">contact</a>
          <CookieSettingsButton className="cursor-pointer" />
        </div>
      </div>
    </footer>
  );
}
