import Stripe from 'stripe';
import { redirect } from 'next/navigation';
import { User } from '@/lib/db/schema';
import { VALID_STRIPE_PRICE_IDS, getPackByPriceId } from '@/lib/payments/config';
import { addCredits, getUserByStripeCustomerId } from '@/lib/db/queries';
import { logger } from '@/lib/logger';
import { db } from '@/lib/db/drizzle';
import { users } from '@/lib/db/schema';
import { and, eq, sql } from 'drizzle-orm';
import { env } from '@/lib/env';
import { isUniqueViolation } from '@/lib/db/utils';
import { capturePackPurchased } from '@/lib/analytics/posthog-server';

let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    _stripe = new Stripe(env.STRIPE_SECRET_KEY, {
      apiVersion: '2026-05-27.dahlia'
    });
  }
  return _stripe;
}

export async function createCheckoutSession({
  user,
  priceId,
  returnTo
}: {
  user: User | null;
  priceId: string;
  returnTo?: string;
}) {
  if (!VALID_STRIPE_PRICE_IDS.has(priceId)) {
    redirect('/pricing');
  }

  if (!user) {
    redirect(`/?redirect=checkout&priceId=${encodeURIComponent(priceId)}#sign-in`);
  }

  let session: Stripe.Checkout.Session;
  try {
    session = await getStripe().checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1
        }
      ],
      mode: 'payment',
      success_url: `${env.BASE_URL}/api/stripe/checkout?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${env.BASE_URL}/pricing`,
      customer: user.stripeCustomerId || undefined,
      client_reference_id: user.id.toString(),
      allow_promotion_codes: true,
      metadata: { priceId, ...(returnTo && { returnTo }) },
    });
  } catch (err) {
    logger.error('payments/stripe', 'Failed to create checkout session', {
      userId: user.id,
      priceId,
      ...getStripeErrorLogContext(err),
    });
    redirect(getCheckoutErrorRedirect(returnTo));
  }

  redirect(session.url!);
}

function getCheckoutErrorRedirect(returnTo?: string) {
  const path = returnTo?.startsWith('/') && !returnTo.startsWith('//') ? returnTo : '/pricing';
  const [pathname, search = ''] = path.split('?');
  const params = new URLSearchParams(search);
  params.set('checkout_error', 'payment_unavailable');
  return `${pathname}?${params.toString()}`;
}

function getStripeErrorLogContext(err: unknown) {
  if (!err || typeof err !== 'object') return { errorType: typeof err };

  const stripeError = err as {
    type?: string;
    code?: string;
    statusCode?: number;
    requestId?: string;
  };

  return {
    errorType: stripeError.type ?? err.constructor.name,
    errorCode: stripeError.code,
    statusCode: stripeError.statusCode,
    requestId: stripeError.requestId,
  };
}

/**
 * Handle a completed checkout session — look up pack from line items,
 * grant credits to user. Idempotent via unique stripeSessionId constraint.
 */
export async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const sessionId = session.id;
  const customerId = typeof session.customer === 'string'
    ? session.customer
    : session.customer?.id;

  // Read priceId from metadata first (avoids extra Stripe API call), fallback to line items
  let priceId = session.metadata?.priceId;
  if (!priceId) {
    const lineItems = await getStripe().checkout.sessions.listLineItems(sessionId);
    priceId = lineItems.data[0]?.price?.id;
  }

  if (!priceId) {
    throw new Error(`No price ID found in checkout session ${sessionId}`);
  }

  const packInfo = getPackByPriceId(priceId);
  if (!packInfo) {
    throw new Error(`Unknown price ID ${priceId} in checkout session ${sessionId}`);
  }

  // Find user by client_reference_id or customer ID
  let userId: number | null = null;
  if (session.client_reference_id) {
    userId = Number(session.client_reference_id);
  } else if (customerId) {
    const user = await getUserByStripeCustomerId(customerId);
    userId = user?.id ?? null;
  }

  if (!userId) {
    throw new Error(`Could not identify user for checkout session ${sessionId} (customer: ${customerId})`);
  }

  // Fetch receipt URL from Payment Intent (Stripe attaches it to the latest charge)
  let receiptUrl: string | null = null;
  try {
    const paymentIntentId = typeof session.payment_intent === 'string'
      ? session.payment_intent
      : session.payment_intent?.id;
    if (paymentIntentId) {
      const paymentIntent = await getStripe().paymentIntents.retrieve(paymentIntentId);
      const chargeId = typeof paymentIntent.latest_charge === 'string'
        ? paymentIntent.latest_charge
        : paymentIntent.latest_charge?.id;
      if (chargeId) {
        const charge = await getStripe().charges.retrieve(chargeId);
        receiptUrl = charge.receipt_url ?? null;
      }
    }
  } catch (err) {
    logger.warn('payments/stripe', 'Failed to fetch receipt URL', { sessionId });
  }

  // Grant credits (idempotent — unique constraint on stripeSessionId will reject duplicates)
  const pricePaid = packInfo.pack.pricing[packInfo.currency].priceSmallestUnit;
  try {
    await addCredits(userId, packInfo.pack.credits, packInfo.key, pricePaid, sessionId, packInfo.currency, receiptUrl);
    logger.info('payments/stripe', 'Credits granted', {
      userId,
      pack: packInfo.key,
      credits: packInfo.pack.credits,
      currency: packInfo.currency,
      sessionId,
    });
    await capturePackPurchased({
      userId,
      pack: packInfo.key,
      credits: packInfo.pack.credits,
      currency: packInfo.currency,
      priceSmallestUnit: pricePaid,
      stripeSessionId: sessionId,
      stripeCustomerId: customerId,
    });
  } catch (err: unknown) {
    if (isUniqueViolation(err)) {
      logger.info('payments/stripe', 'Checkout already processed (idempotent skip)', { sessionId });
      return;
    }
    throw err;
  }

  // Update stripeCustomerId if changed
  if (customerId) {
    await db
      .update(users)
      .set({ stripeCustomerId: customerId })
      .where(and(eq(users.id, userId), sql`stripe_customer_id IS DISTINCT FROM ${customerId}`));
  }
}
