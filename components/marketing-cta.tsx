import Link from 'next/link';

interface MarketingCtaProps {
  children?: React.ReactNode;
}

export function MarketingCta({ children = <>Get started free &rarr;</> }: MarketingCtaProps) {
  return (
    <Link
      href="/#sign-in"
      className="paper-hover inline-flex items-center gap-2 rounded-full border-[1.5px] border-[var(--ink)] bg-[var(--ink)] px-6 py-3 text-lg font-semibold text-[var(--paper)]"
    >
      {children}
    </Link>
  );
}
