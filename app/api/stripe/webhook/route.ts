import Stripe from 'stripe';
import { handleCheckoutCompleted, getStripe } from '@/lib/payments/stripe';
import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import { withLogging } from '@/lib/api/with-logging';
import { db } from '@/lib/db/drizzle';
import { stripeWebhookEvents } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { env } from '@/lib/env';
import { isUniqueViolation } from '@/lib/db/utils';

const webhookSecret = env.STRIPE_WEBHOOK_SECRET;

export const POST = withLogging(async function POST(request: NextRequest) {
  if (!webhookSecret) {
    logger.error('stripe/webhook', 'STRIPE_WEBHOOK_SECRET not configured');
    return NextResponse.json({ error: 'Webhook not configured' }, { status: 500 });
  }

  const payload = await request.text();
  const signature = request.headers.get('stripe-signature') as string;

  let event: Stripe.Event;

  try {
    event = getStripe().webhooks.constructEvent(payload, signature, webhookSecret);
  } catch (err) {
    logger.error('stripe/webhook', 'Signature verification failed', undefined, err);
    return NextResponse.json(
      { error: 'Webhook signature verification failed.' },
      { status: 400 }
    );
  }

  // Idempotency check: skip already-processed events.
  // We check first (SELECT) so that retries of already-processed events
  // short-circuit without re-running handleCheckoutCompleted.
  try {
    const existing = await db
      .select({ id: stripeWebhookEvents.id })
      .from(stripeWebhookEvents)
      .where(eq(stripeWebhookEvents.id, event.id))
      .limit(1);
    if (existing.length > 0) {
      return NextResponse.json({ received: true });
    }
  } catch (checkErr) {
    logger.error('stripe/webhook', 'Idempotency pre-check failed, processing anyway', { eventId: event.id }, checkErr);
  }

  // Process the event
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      await handleCheckoutCompleted(session);
      break;
    }
    default:
      logger.warn('stripe/webhook', 'Unhandled event type', { eventType: event.type });
  }

  // Record the event AFTER successful processing.
  // If processing fails above, the event is NOT recorded and Stripe retries will work.
  // The creditPurchases.stripeSessionId unique constraint is the second layer of
  // idempotency that prevents double-crediting even if this insert races.
  try {
    await db.insert(stripeWebhookEvents).values({ id: event.id });
  } catch (dbErr: unknown) {
    if (!isUniqueViolation(dbErr)) {
      logger.error('stripe/webhook', 'Failed to record processed event', { eventId: event.id }, dbErr);
    }
  }

  return NextResponse.json({ received: true });
});
