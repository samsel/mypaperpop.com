'use client';

import posthog from 'posthog-js';
import { PostHogProvider as PHProvider } from 'posthog-js/react';
import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect, Suspense, useRef, useState, useCallback } from 'react';
import { hasAnalyticsConsent } from '@/lib/cookie-consent';
import { env } from '@/lib/env';

const posthogKey = env.NEXT_PUBLIC_POSTHOG_KEY;
const posthogHost = env.NEXT_PUBLIC_POSTHOG_HOST;

function PostHogInit() {
  const initialized = useRef(false);
  const [consented, setConsented] = useState(false);

  const checkConsent = useCallback(() => {
    setConsented(hasAnalyticsConsent());
  }, []);

  useEffect(() => {
    // Check consent on mount
    checkConsent();

    // Listen for consent changes
    function onConsentChange() {
      checkConsent();
    }
    window.addEventListener('cookie-consent-change', onConsentChange);
    return () => window.removeEventListener('cookie-consent-change', onConsentChange);
  }, [checkConsent]);

  useEffect(() => {
    if (!posthogKey || !consented) return;

    if (initialized.current) return;
    initialized.current = true;

    const init = () => {
      posthog.init(posthogKey, {
        api_host: posthogHost || 'https://us.i.posthog.com',
        capture_pageview: false,
        capture_pageleave: true,
      });
    };

    if (typeof requestIdleCallback === 'function') {
      requestIdleCallback(init);
    } else {
      setTimeout(init, 1);
    }
  }, [consented]);

  // If consent is revoked after init, opt out
  useEffect(() => {
    if (initialized.current && !consented) {
      posthog.opt_out_capturing();
    } else if (initialized.current && consented) {
      posthog.opt_in_capturing();
    }
  }, [consented]);

  return null;
}

function PostHogPageView() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!posthogKey || !pathname || !hasAnalyticsConsent()) return;

    let url = window.origin + pathname;
    const search = searchParams.toString();
    if (search) {
      url += '?' + search;
    }

    posthog.capture('$pageview', { $current_url: url });
  }, [pathname, searchParams]);

  return null;
}

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  if (!posthogKey) {
    return <>{children}</>;
  }

  return (
    <PHProvider client={posthog}>
      <PostHogInit />
      <Suspense fallback={null}>
        <PostHogPageView />
      </Suspense>
      {children}
    </PHProvider>
  );
}
