const DEFAULT_POSTHOG_HOST = 'https://us.i.posthog.com';
const POSTHOG_CAPTURE_TIMEOUT_MS = 3_000;

export type PackPurchasedEventInput = {
  userId: number;
  pack: string;
  credits: number;
  currency: string;
  priceSmallestUnit: number;
  stripeSessionId: string;
  stripeCustomerId?: string | null;
};

export function buildPackPurchasedPayload(input: PackPurchasedEventInput, apiKey: string) {
  return {
    api_key: apiKey,
    event: 'pack_purchased',
    distinct_id: String(input.userId),
    properties: {
      user_id: input.userId,
      pack: input.pack,
      credits: input.credits,
      currency: input.currency,
      price_smallest_unit: input.priceSmallestUnit,
      stripe_session_id: input.stripeSessionId,
      stripe_customer_id: input.stripeCustomerId ?? undefined,
      source: 'stripe_checkout',
    },
  };
}

export async function capturePackPurchased(input: PackPurchasedEventInput) {
  const apiKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  if (!apiKey) return;

  const host = (process.env.NEXT_PUBLIC_POSTHOG_HOST || DEFAULT_POSTHOG_HOST).replace(/\/$/, '');
  const payload = buildPackPurchasedPayload(input, apiKey);

  try {
    const response = await fetch(`${host}/capture/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(POSTHOG_CAPTURE_TIMEOUT_MS),
    });

    if (!response.ok) {
      await logPostHogWarning('Failed to capture pack_purchased', {
        status: response.status,
        userId: input.userId,
        pack: input.pack,
        stripeSessionId: input.stripeSessionId,
      });
    }
  } catch (error) {
    await logPostHogWarning('Failed to capture pack_purchased', {
      userId: input.userId,
      pack: input.pack,
      stripeSessionId: input.stripeSessionId,
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

async function logPostHogWarning(message: string, context: Record<string, unknown>) {
  try {
    const { logger } = await import('@/lib/logger');
    logger.warn('analytics/posthog', message, context);
  } catch {
    console.warn(`[analytics/posthog] ${message}`, context);
  }
}
