import { afterEach, describe, expect, it, vi } from 'vitest';
import { buildPackPurchasedPayload, capturePackPurchased } from '@/lib/analytics/posthog-server';

vi.mock('@/lib/logger', () => ({
  logger: {
    warn: vi.fn(),
  },
}));

const originalPostHogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
const originalPostHogHost = process.env.NEXT_PUBLIC_POSTHOG_HOST;

afterEach(() => {
  vi.restoreAllMocks();
  process.env.NEXT_PUBLIC_POSTHOG_KEY = originalPostHogKey;
  process.env.NEXT_PUBLIC_POSTHOG_HOST = originalPostHogHost;
});

describe('server PostHog analytics', () => {
  it('builds a clean pack_purchased event payload', () => {
    expect(buildPackPurchasedPayload({
      userId: 42,
      pack: 'large',
      credits: 75,
      currency: 'usd',
      priceSmallestUnit: 699,
      stripeSessionId: 'cs_live_123',
      stripeCustomerId: 'cus_123',
    }, 'ph_key')).toEqual({
      api_key: 'ph_key',
      event: 'pack_purchased',
      distinct_id: '42',
      properties: {
        user_id: 42,
        pack: 'large',
        credits: 75,
        currency: 'usd',
        price_smallest_unit: 699,
        stripe_session_id: 'cs_live_123',
        stripe_customer_id: 'cus_123',
        source: 'stripe_checkout',
      },
    });
  });

  it('omits empty Stripe customer IDs from the payload', () => {
    expect(buildPackPurchasedPayload({
      userId: 42,
      pack: 'small',
      credits: 25,
      currency: 'usd',
      priceSmallestUnit: 299,
      stripeSessionId: 'cs_live_123',
      stripeCustomerId: null,
    }, 'ph_key').properties.stripe_customer_id).toBeUndefined();
  });

  it('does not call PostHog when no key is configured', async () => {
    delete process.env.NEXT_PUBLIC_POSTHOG_KEY;
    const fetchMock = vi.spyOn(globalThis, 'fetch');

    await capturePackPurchased({
      userId: 1,
      pack: 'small',
      credits: 25,
      currency: 'usd',
      priceSmallestUnit: 299,
      stripeSessionId: 'cs_test_123',
    });

    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('posts pack_purchased to the configured PostHog host', async () => {
    process.env.NEXT_PUBLIC_POSTHOG_KEY = 'ph_key';
    process.env.NEXT_PUBLIC_POSTHOG_HOST = 'https://posthog.example.com/';
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('{}', { status: 200 }));

    await capturePackPurchased({
      userId: 7,
      pack: 'small',
      credits: 25,
      currency: 'eur',
      priceSmallestUnit: 299,
      stripeSessionId: 'cs_live_456',
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith(
      'https://posthog.example.com/capture/',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: expect.stringContaining('"event":"pack_purchased"'),
      }),
    );
  });

  it('posts pack_purchased to the default PostHog host', async () => {
    process.env.NEXT_PUBLIC_POSTHOG_KEY = 'ph_key';
    delete process.env.NEXT_PUBLIC_POSTHOG_HOST;
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('{}', { status: 200 }));

    await capturePackPurchased({
      userId: 8,
      pack: 'small',
      credits: 25,
      currency: 'usd',
      priceSmallestUnit: 299,
      stripeSessionId: 'cs_live_789',
    });

    expect(fetchMock).toHaveBeenCalledWith(
      'https://us.i.posthog.com/capture/',
      expect.objectContaining({ method: 'POST' }),
    );
  });

  it('logs a warning when PostHog returns an error response', async () => {
    process.env.NEXT_PUBLIC_POSTHOG_KEY = 'ph_key';
    process.env.NEXT_PUBLIC_POSTHOG_HOST = 'https://posthog.example.com';
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('{}', { status: 503 }));
    const { logger } = await import('@/lib/logger');

    await capturePackPurchased({
      userId: 9,
      pack: 'large',
      credits: 75,
      currency: 'usd',
      priceSmallestUnit: 699,
      stripeSessionId: 'cs_live_999',
    });

    expect(logger.warn).toHaveBeenCalledWith(
      'analytics/posthog',
      'Failed to capture pack_purchased',
      expect.objectContaining({
        status: 503,
        userId: 9,
        pack: 'large',
        stripeSessionId: 'cs_live_999',
      }),
    );
  });

  it('logs a warning when PostHog capture throws', async () => {
    process.env.NEXT_PUBLIC_POSTHOG_KEY = 'ph_key';
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('network down'));
    const { logger } = await import('@/lib/logger');

    await capturePackPurchased({
      userId: 10,
      pack: 'small',
      credits: 25,
      currency: 'usd',
      priceSmallestUnit: 299,
      stripeSessionId: 'cs_live_throw',
    });

    expect(logger.warn).toHaveBeenCalledWith(
      'analytics/posthog',
      'Failed to capture pack_purchased',
      expect.objectContaining({
        userId: 10,
        pack: 'small',
        stripeSessionId: 'cs_live_throw',
        error: 'network down',
      }),
    );
  });

  it('falls back to console warning when the app logger is unavailable', async () => {
    process.env.NEXT_PUBLIC_POSTHOG_KEY = 'ph_key';
    vi.spyOn(globalThis, 'fetch').mockRejectedValue('offline');
    const { logger } = await import('@/lib/logger');
    vi.mocked(logger.warn).mockImplementationOnce(() => {
      throw new Error('logger unavailable');
    });
    const consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);

    await capturePackPurchased({
      userId: 11,
      pack: 'small',
      credits: 25,
      currency: 'usd',
      priceSmallestUnit: 299,
      stripeSessionId: 'cs_live_console',
    });

    expect(consoleWarn).toHaveBeenCalledWith(
      '[analytics/posthog] Failed to capture pack_purchased',
      expect.objectContaining({
        userId: 11,
        pack: 'small',
        stripeSessionId: 'cs_live_console',
        error: 'offline',
      }),
    );
  });
});
