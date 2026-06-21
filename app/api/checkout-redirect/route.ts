import { NextRequest, NextResponse } from 'next/server';
import { getUser } from '@/lib/db/queries';
import { getStripe } from '@/lib/payments/stripe';
import { VALID_STRIPE_PRICE_IDS } from '@/lib/payments/config';
import { logger } from '@/lib/logger';
import { withLogging } from '@/lib/api/with-logging';
import { env } from '@/lib/env';

export const GET = withLogging(async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const priceId = searchParams.get('priceId');
    const returnTo = searchParams.get('returnTo');
    const base = env.BASE_URL;

    if (!priceId) {
        return NextResponse.redirect(new URL('/pricing?error=missing_price', base));
    }

    // Validate priceId against known Stripe price IDs to prevent price manipulation
    if (!VALID_STRIPE_PRICE_IDS.has(priceId)) {
        return NextResponse.redirect(new URL('/pricing?error=invalid_price', base));
    }

    try {
        const user = await getUser();
        if (!user) {
            return NextResponse.redirect(new URL('/#sign-in', base));
        }

        // Create Stripe checkout session directly (can't use createCheckoutSession as it uses redirect())
        const session = await getStripe().checkout.sessions.create({
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

        // Redirect to Stripe Checkout
        return NextResponse.redirect(session.url!);
    } catch (error) {
        logger.error('checkout-redirect', 'Checkout redirect failed', { priceId }, error);
        return NextResponse.redirect(new URL('/pricing?error=checkout_failed', base));
    }
});
