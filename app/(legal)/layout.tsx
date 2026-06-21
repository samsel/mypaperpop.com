import { PublicHeader } from '@/components/public-header';
import { PublicFooter } from '@/components/public-footer';

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="b-paper flex min-h-screen flex-col bg-[var(--paper)] text-[var(--ink)]">
      <PublicHeader isAuthenticated={false} />
      <main className="paper-legal mx-auto w-full max-w-3xl flex-1 px-4 py-10 sm:px-6 [&_.border]:border-[1.5px] [&_.border]:border-[var(--ink)] [&_.rounded-lg]:rounded-lg">
        {children}
      </main>
      <PublicFooter />
    </div>
  );
}
