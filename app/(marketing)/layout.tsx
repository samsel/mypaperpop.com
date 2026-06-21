import { PublicHeader } from '@/components/public-header';
import { PublicFooter } from '@/components/public-footer';

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="b-paper flex min-h-screen flex-col bg-[var(--paper)] text-[var(--ink)]">
      <PublicHeader isAuthenticated={false} />
      <main className="paper-marketing flex-1 [&_.border]:border-[1.5px] [&_.border]:border-[var(--ink)] [&_.rounded-xl]:rounded-lg [&_section]:border-[var(--ink)]">
        {children}
      </main>
      <PublicFooter />
    </div>
  );
}
