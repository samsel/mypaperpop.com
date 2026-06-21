'use client';

import { useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { usePostHog } from 'posthog-js/react';
import { DismissibleBanner } from '@/components/dismissible-banner';

export function PurchaseSuccessBanner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const posthog = usePostHog();
  const [dismissed, setDismissed] = useState(false);

  const purchased = searchParams.get('purchased');
  const balance = searchParams.get('balance');

  if (!purchased || dismissed) return null;

  const purchasedCount = parseInt(purchased, 10);
  const balanceCount = balance ? parseInt(balance, 10) : null;

  if (isNaN(purchasedCount) || purchasedCount <= 0) return null;

  const handleDismiss = () => {
    setDismissed(true);
    posthog?.capture('credits_purchased', { credits: purchasedCount, balance: balanceCount });

    // Clean purchase params from URL without triggering navigation
    const params = new URLSearchParams(searchParams.toString());
    params.delete('purchased');
    params.delete('balance');
    const remaining = params.toString();
    const path = window.location.pathname + (remaining ? `?${remaining}` : '');
    router.replace(path);
  };

  return (
    <DismissibleBanner
      colorClass="bg-[var(--orange)]"
      onDismiss={handleDismiss}
    >
      You purchased {purchasedCount} coloring {purchasedCount === 1 ? 'page' : 'pages'}!
      {balanceCount != null && (
        <> You now have {balanceCount} coloring {balanceCount === 1 ? 'page' : 'pages'}.</>
      )}
    </DismissibleBanner>
  );
}
