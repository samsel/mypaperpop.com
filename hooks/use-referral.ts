'use client';

import { useState, useCallback } from 'react';
import useSWR from 'swr';
import { fetcher } from '@/lib/fetcher';
import { usePostHog } from 'posthog-js/react';

interface ReferralData {
  referralCode: string;
  referralUrl: string;
  totalReferrals: number;
  totalCreditsEarned: number;
}

export function useReferral() {
  const { data, isLoading } = useSWR<ReferralData>('/api/referral', fetcher, { revalidateOnFocus: false });
  const posthog = usePostHog();
  const [copied, setCopied] = useState(false);
  const referralUrl = data?.referralUrl ?? '';
  const referralCode = data?.referralCode ?? '';
  const totalReferrals = data?.totalReferrals ?? 0;
  const totalCreditsEarned = data?.totalCreditsEarned ?? 0;

  const copyLink = useCallback(async () => {
    if (!referralUrl) return;
    try {
      await navigator.clipboard.writeText(referralUrl);
      setCopied(true);
      posthog.capture('referral_link_copied');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API may fail in some contexts
    }
  }, [referralUrl, posthog]);

  return { referralUrl, referralCode, totalReferrals, totalCreditsEarned, copied, copyLink, isLoading };
}
