import Link from 'next/link';
import { Lock } from 'lucide-react';

export function QuotaLimitContent() {
    return (
        <>
            <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full border-[1.5px] border-[var(--ink)] bg-[var(--yellow)]">
                <Lock className="h-5 w-5 text-[var(--ink)]" />
            </div>
            <h3 className="mb-1 font-display text-2xl text-[var(--ink)]">No coloring pages remaining</h3>
            <p className="mb-4 text-sm text-[var(--ink)]/65">
                You&apos;ve used all your coloring pages for today.
            </p>
            <Link
                href="/pricing"
                className="paper-hover inline-flex items-center justify-center rounded-full border-[1.5px] border-[var(--ink)] bg-[var(--ink)] px-6 py-2.5 text-sm font-semibold text-[var(--paper)]"
            >
                Get More Coloring Pages
            </Link>
        </>
    );
}

export function QuotaLimitCard() {
    return (
        <div className="self-center my-6 max-w-md w-full animate-in fade-in">
            <div className="paper-sheet bg-white p-6 text-center">
                <QuotaLimitContent />
            </div>
        </div>
    );
}
