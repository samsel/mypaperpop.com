'use client';

import useSWR from 'swr';
import { fetcher } from '@/lib/fetcher';
import { apiClient } from '@/lib/api-client';
import { usePostHog } from 'posthog-js/react';

interface PendingReferral {
  id: number;
  refereeName: string | null;
  refereeEmail: string;
  creditsEarned: number;
  createdAt: string;
}

interface PendingReferralsResponse {
  referrals: PendingReferral[];
}

export function usePendingReferrals() {
  const posthog = usePostHog();
  const { data, mutate, isLoading } = useSWR<PendingReferralsResponse>(
    '/api/referrals/pending',
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  );

  const pending = data?.referrals ?? [];
  const current = pending[0] ?? null;

  const dismiss = async (referralId: number) => {
    // Optimistic update: remove from local cache immediately
    mutate(
      (prev) => {
        if (!prev) return prev;
        return {
          referrals: prev.referrals.filter((r) => r.id !== referralId),
        };
      },
      { revalidate: false }
    );

    try {
      await apiClient.post(`/api/referrals/${referralId}/dismiss`);
      posthog?.capture('referral_notification_dismissed', { referralId });
    } catch {
      // Revalidate on failure to restore truth
      mutate();
    }
  };

  return {
    current,
    pendingCount: pending.length,
    dismiss,
    isLoading,
  };
}
