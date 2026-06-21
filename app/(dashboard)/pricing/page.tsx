import type { Metadata } from 'next';
import Link from 'next/link';
import { PricingCards } from '@/components/pricing-cards';
import { getUserCurrency } from '@/lib/geo';
import { FREE_DAILY_LIMIT, CREDIT_PACKS, formatPrice } from '@/lib/payments/config';
import { JsonLd } from '@/components/seo/json-ld';
import { Button } from '@/components/ui/button';
import { StickerBurst } from '@/components/paper-studio';

const small = CREDIT_PACKS.small;
const large = CREDIT_PACKS.large;

const pricingSchema = {
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  name: 'MyPaperPop Pricing Plans',
  itemListElement: [
    {
      '@type': 'ListItem',
      position: 1,
      item: {
        '@type': 'Product',
        name: 'Free Plan',
        description: `${FREE_DAILY_LIMIT} free AI coloring pages per day. No credit card required.`,
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'USD',
          availability: 'https://schema.org/InStock',
        },
      },
    },
    {
      '@type': 'ListItem',
      position: 2,
      item: {
        '@type': 'Product',
        name: small.name,
        description: `${small.credits} AI coloring pages. ${small.description} Purchased pages never expire.`,
        offers: {
          '@type': 'Offer',
          price: (small.pricing.usd.priceSmallestUnit / 100).toFixed(2),
          priceCurrency: 'USD',
          availability: 'https://schema.org/InStock',
        },
      },
    },
    {
      '@type': 'ListItem',
      position: 3,
      item: {
        '@type': 'Product',
        name: large.name,
        description: `${large.credits} AI coloring pages. ${large.description} Purchased pages never expire.`,
        offers: {
          '@type': 'Offer',
          price: (large.pricing.usd.priceSmallestUnit / 100).toFixed(2),
          priceCurrency: 'USD',
          availability: 'https://schema.org/InStock',
        },
      },
    },
  ],
};

export const metadata: Metadata = {
  title: 'Pricing — Free + Paid Coloring Pages',
  description:
    `Start with ${FREE_DAILY_LIMIT} free AI coloring pages every day. Need more? Buy ${small.credits} coloring pages for ${formatPrice('usd', small.pricing.usd.priceSmallestUnit)} or ${large.credits} for ${formatPrice('usd', large.pricing.usd.priceSmallestUnit)}. Purchased pages never expire.`,
  alternates: {
    canonical: '/pricing',
  },
};

export default async function PricingPage({
  searchParams,
}: {
  searchParams?: Promise<{ purchased?: string; balance?: string }>;
}) {
  const currency = await getUserCurrency();
  const params = await searchParams;
  const purchased = params?.purchased ? parseInt(params.purchased, 10) : 0;
  const balance = params?.balance ? parseInt(params.balance, 10) : null;

  if (purchased > 0) {
    return (
      <main className="b-paper grid h-full place-items-center overflow-y-auto bg-[var(--paper)] px-4 py-10">
        <JsonLd data={pricingSchema} />
        <section className="paper-sheet mx-auto max-w-3xl bg-white p-7 text-center sm:p-10">
          <StickerBurst size={74} className="mx-auto" />
          <p className="mt-4 text-[11px] font-bold uppercase text-[var(--ink)]/55">Coloring pages added</p>
          <h1 className="mt-2 font-display text-5xl leading-none sm:text-6xl">
            {purchased} fresh coloring {purchased === 1 ? 'page' : 'pages'}.
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-[var(--ink)]/70">
            Your pack is ready. {balance != null ? `You now have ${balance} paid coloring ${balance === 1 ? 'page' : 'pages'} in your account.` : 'Start drawing now or save your pages for later.'}
          </p>
          <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
            <Button asChild>
              <Link href="/home?new=1">Draw a new page</Link>
            </Button>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="b-paper h-full overflow-y-auto bg-[var(--paper)]">
      <JsonLd data={pricingSchema} />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
        <div className="text-center mb-12 border-b-[1.5px] border-[var(--ink)] pb-10">
          <p className="mb-3 text-[11px] font-bold uppercase text-[var(--ink)]/60">Coloring pages</p>
          <h1 className="font-display text-5xl text-[var(--ink)] mb-3">
            Pay once. Color forever.
          </h1>
          <p className="text-lg text-[var(--ink)]/70">
            Start free. Buy more coloring pages when you need them. Coloring pages are sold as packs.
          </p>
        </div>

        <PricingCards currency={currency} isAuthenticated={true} variant="app" />
      </div>
    </main>
  );
}
