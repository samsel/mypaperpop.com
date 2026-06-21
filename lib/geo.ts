import { headers } from 'next/headers';
import { getCurrencyForCountry, type SupportedCurrency } from '@/lib/payments/config';
import { env } from '@/lib/env';

export async function getCountryCode(): Promise<string> {
  const h = await headers();
  return h.get('cf-ipcountry') || env.DEV_COUNTRY || 'US';
}

export async function getUserCurrency(): Promise<SupportedCurrency> {
  return getCurrencyForCountry(await getCountryCode());
}
