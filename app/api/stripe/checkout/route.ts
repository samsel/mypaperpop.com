import { getSession } from '@/lib/auth/session';
import { NextRequest, NextResponse } from 'next/server';
import { handleCheckoutCompleted, getStripe } from '@/lib/payments/stripe';
import { getPackByPriceId } from '@/lib/payments/config';
import { db } from '@/lib/db/drizzle';
import { creditPurchases, users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { logger } from '@/lib/logger';
import { withLogging } from '@/lib/api/with-logging';
import { env } from '@/lib/env';

export const GET = withLogging(async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const sessionId = searchParams.get('session_id');
  const base = env.BASE_URL;

  if (!sessionId) {
    return NextResponse.redirect(new URL('/pricing', base));
  }

  try {
    const currentSession = await getSession();
    if (!currentSession) {
      return NextResponse.redirect(new URL('/#sign-in', base));
    }

    const session = await getStripe().checkout.sessions.retrieve(sessionId);

    // Verify the logged-in user matches the checkout session's user
    if (session.client_reference_id && currentSession.user.id !== Number(session.client_reference_id)) {
      logger.error('stripe/checkout', 'Checkout user mismatch', {
        loggedInUser: currentSession.user.id,
        checkoutUser: session.client_reference_id,
        sessionId,
      });
      return NextResponse.redirect(new URL('/pricing?error=user_mismatch', base));
    }

    // Try to grant credits if the webhook hasn't already processed this session.
    // If handleCheckoutCompleted throws (e.g. unknown price, user lookup failure),
    // we log the error but still redirect to /home — the webhook will eventually
    // retry and grant the credits. The user sees their dashboard immediately
    // instead of an error page.
    const alreadyProcessed = await db
      .select({ id: creditPurchases.id })
      .from(creditPurchases)
      .where(eq(creditPurchases.stripeSessionId, sessionId))
      .limit(1);
    if (alreadyProcessed.length === 0) {
      try {
        await handleCheckoutCompleted(session);
      } catch (checkoutErr) {
        logger.error('stripe/checkout', 'handleCheckoutCompleted failed, webhook will retry', { sessionId }, checkoutErr);
      }
    }

    // Build smart redirect URL
    const returnTo = session.metadata?.returnTo;
    const priceId = session.metadata?.priceId;
    const packInfo = priceId ? getPackByPriceId(priceId) : null;
    const purchased = packInfo?.pack.credits ?? 0;

    // Fetch updated credit balance
    let balance = 0;
    const [user] = await db
      .select({ creditBalance: users.creditBalance })
      .from(users)
      .where(eq(users.id, currentSession.user.id))
      .limit(1);
    if (user) balance = user.creditBalance;

    // If returnTo starts with /home, preserve the path (keeps ?c=123 etc.)
    let redirectUrl: URL;
    if (returnTo?.startsWith('/home')) {
      redirectUrl = new URL(returnTo, base);
    } else {
      redirectUrl = new URL('/home', base);
    }
    if (purchased > 0) redirectUrl.searchParams.set('purchased', String(purchased));
    redirectUrl.searchParams.set('balance', String(balance));

    return NextResponse.redirect(redirectUrl);
  } catch (error) {
    logger.error('stripe/checkout', 'Checkout processing failed', { sessionId }, error);
    return NextResponse.redirect(new URL('/pricing?error=checkout_failed', base));
  }
});
