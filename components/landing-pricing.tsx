'use client';

import { type SupportedCurrency } from '@/lib/payments/config';
import { Reveal } from '@/components/reveal';
import { PricingCards } from '@/components/pricing-cards';

export function LandingPricing({ currency, isAuthenticated }: { currency: SupportedCurrency; isAuthenticated: boolean }) {
  return (
    <section id="pricing" data-testid="landing-pricing" className="scroll-mt-8 bg-[var(--paper)] px-4 py-12 sm:px-6 sm:py-20 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <Reveal className="reveal-fade-up">
          <p className="text-center text-xs font-bold uppercase text-[var(--ink)]/60">Pricing</p>
          <h2 className="mt-2 text-center font-display text-4xl leading-none sm:text-6xl">
            Pay once. Color forever.
          </h2>
          <p className="mx-auto mb-8 mt-3 max-w-xl text-center text-sm leading-6 text-[var(--ink)]/70 sm:mb-12 sm:mt-4 sm:text-base sm:leading-7">
            Start free. Buy more coloring pages when you need them. Purchased pages never expire.
          </p>
        </Reveal>

        <Reveal className="reveal-stagger-up">
          <PricingCards currency={currency} isAuthenticated={isAuthenticated} />
        </Reveal>
      </div>
    </section>
  );
}
