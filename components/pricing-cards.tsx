'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { CREDIT_PACKS, FREE_TIER, formatPrice, type SupportedCurrency } from '@/lib/payments/config';
import { checkoutAction } from '@/lib/payments/actions';
import { Loader2 } from 'lucide-react';
import { useFormStatus } from 'react-dom';
import { cn } from '@/lib/utils';

function BuyButton({ appStyle = false, label = 'Get pack' }: { appStyle?: boolean; label?: string }) {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      disabled={pending}
      className={cn(
        'w-full h-12 font-semibold',
        appStyle
          ? 'bg-[var(--ink)] text-[var(--paper)]'
          : 'bg-[var(--ink)] text-[var(--paper)]'
      )}
    >
      {pending ? (
        <>
          <Loader2 className="animate-spin mr-2 h-4 w-4" />
          Loading...
        </>
      ) : (
        label
      )}
    </Button>
  );
}

interface PricingCardsProps {
  currency: SupportedCurrency;
  isAuthenticated: boolean;
  variant?: 'marketing' | 'app';
}

export function PricingCards({ currency, isAuthenticated, variant = 'marketing' }: PricingCardsProps) {
  const smallPricing = CREDIT_PACKS.small.pricing[currency];
  const largePricing = CREDIT_PACKS.large.pricing[currency];
  const [returnTo, setReturnTo] = useState('');
  const isApp = variant === 'app';

  useEffect(() => {
    setReturnTo(window.location.pathname + window.location.search);
  }, []);

  return (
    <div className="grid gap-4 md:grid-cols-3 md:gap-5">
      {/* Free */}
      <div className={cn(
        'flex flex-col border-[1.5px] border-[var(--ink)] bg-[var(--paper-card)] p-5 sm:p-7',
        isApp ? 'rounded-lg' : 'rounded-lg'
      )}>
        <h3 className="text-xs font-bold uppercase text-[var(--ink)]/65">{FREE_TIER.name}</h3>
        <div className="mt-4">
          <span className="font-display text-4xl text-[var(--ink)] sm:text-5xl">{formatPrice(currency, 0)}</span>
        </div>
        <p className="mt-3 text-sm leading-6 text-[var(--ink)]/70">{FREE_TIER.description}</p>
        <ul className="mt-5 flex-1 space-y-2.5 sm:mt-6 sm:space-y-3">
          {FREE_TIER.features.map((feature) => (
            <li key={feature} className="flex items-center gap-2.5 text-sm text-[var(--ink)]/75">
              <svg className="w-4 h-4 shrink-0 text-[var(--ink)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
              {feature}
            </li>
          ))}
        </ul>
        <div className="mt-6 sm:mt-8">
          {isAuthenticated ? (
            <Button asChild variant="outline" className="h-12 w-full">
              <Link href="/home">Get started</Link>
            </Button>
          ) : (
            <Button asChild variant="outline" className="h-12 w-full">
              <a href="#sign-up">Get started</a>
            </Button>
          )}
        </div>
      </div>

      {/* Starter Pack */}
      <div className={cn(
        'relative flex flex-col border-[1.5px] border-[var(--ink)] bg-[var(--yellow)] p-5 sm:p-7',
        isApp ? 'rounded-lg' : 'rounded-lg'
      )}>
        <span className="absolute left-1/2 -top-3 -translate-x-1/2 rounded-full border-[1.5px] border-[var(--ink)] bg-white px-3 py-1 text-xs font-bold text-[var(--ink)]">
          Most popular
        </span>
        <h3 className="text-xs font-bold uppercase text-[var(--ink)]/65">{CREDIT_PACKS.small.name}</h3>
        <div className="mt-4 flex items-baseline gap-1">
          <span className="font-display text-4xl text-[var(--ink)] sm:text-5xl">{formatPrice(currency, smallPricing.priceSmallestUnit)}</span>
          <span className="text-sm text-[var(--ink)]/60">per pack</span>
        </div>
        <p className="mt-3 text-sm leading-6 text-[var(--ink)]/75">{CREDIT_PACKS.small.description}</p>
        <ul className="mt-5 flex-1 space-y-2.5 sm:mt-6 sm:space-y-3">
          {CREDIT_PACKS.small.features.map((feature) => (
            <li key={feature} className="flex items-center gap-2.5 text-sm text-[var(--ink)]/75">
              <svg className="w-4 h-4 shrink-0 text-[var(--ink)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
              {feature}
            </li>
          ))}
        </ul>
        <div className="mt-6 sm:mt-8">
          {isAuthenticated ? (
            <form action={checkoutAction}>
              <input type="hidden" name="priceId" value={smallPricing.priceId} />
              <input type="hidden" name="returnTo" value={returnTo} />
              <BuyButton appStyle={isApp} label="Get small pack" />
            </form>
          ) : (
            <Button asChild className="h-12 w-full">
              <a href="#sign-up">Get small pack</a>
            </Button>
          )}
        </div>
      </div>

      {/* Value Pack */}
      <div className={cn(
        'relative flex flex-col border-[1.5px] border-[var(--ink)] bg-[var(--orange)] p-5 text-white sm:p-7',
        isApp ? 'rounded-lg' : 'rounded-lg'
      )}>
        <span className={cn(
          'absolute left-1/2 -top-3 -translate-x-1/2 rounded-full border-[1.5px] border-[var(--ink)] bg-[var(--ink)] px-3 py-1 text-xs font-bold text-[var(--paper)]'
        )}>
          Save 33%
        </span>
        <h3 className="text-xs font-bold uppercase text-white/80">{CREDIT_PACKS.large.name}</h3>
        <div className="mt-4 flex items-baseline gap-1">
          <span className="font-display text-4xl text-white sm:text-5xl">{formatPrice(currency, largePricing.priceSmallestUnit)}</span>
          <span className="text-sm text-white/75">per pack</span>
        </div>
        <p className="mt-3 text-sm leading-6 text-white/80">{CREDIT_PACKS.large.description}</p>
        <ul className="mt-5 flex-1 space-y-2.5 sm:mt-6 sm:space-y-3">
          {CREDIT_PACKS.large.features.map((feature) => (
            <li key={feature} className="flex items-center gap-2.5 text-sm text-white/85">
              <svg className="w-4 h-4 shrink-0 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
              {feature}
            </li>
          ))}
        </ul>
        <div className="mt-6 sm:mt-8">
          {isAuthenticated ? (
            <form action={checkoutAction}>
              <input type="hidden" name="priceId" value={largePricing.priceId} />
              <input type="hidden" name="returnTo" value={returnTo} />
              <BuyButton appStyle={isApp} label="Get large pack" />
            </form>
          ) : (
            <Button asChild className="h-12 w-full">
              <a href="#sign-up">Get large pack</a>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
