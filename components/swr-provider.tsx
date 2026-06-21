'use client';

import { SWRConfig } from 'swr';
import { fetcher } from '@/lib/fetcher';

export function SWRProvider({ children }: { children: React.ReactNode }) {
  return (
    <SWRConfig
      value={{
        fetcher,
        dedupingInterval: 10000,
        focusThrottleInterval: 300000,
      }}
    >
      {children}
    </SWRConfig>
  );
}
