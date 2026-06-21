'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { DismissibleBanner } from '@/components/dismissible-banner';

export function CheckoutErrorBanner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [dismissed, setDismissed] = useState(false);

  const checkoutError = searchParams.get('checkout_error');
  if (!checkoutError || dismissed) return null;

  const handleDismiss = () => {
    setDismissed(true);

    const params = new URLSearchParams(searchParams.toString());
    params.delete('checkout_error');
    const remaining = params.toString();
    router.replace(window.location.pathname + (remaining ? `?${remaining}` : ''));
  };

  return (
    <DismissibleBanner colorClass="bg-[var(--yellow)]" onDismiss={handleDismiss}>
      Checkout is not available right now. Please try again in a bit.
    </DismissibleBanner>
  );
}
