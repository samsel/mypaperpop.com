import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getSession } from '@/lib/auth/session'
import { getUserByReferralCode, processReferral } from '@/lib/db/queries'
import { db } from '@/lib/db/drizzle'
import { conversations, users } from '@/lib/db/schema'
import { eq, sql } from 'drizzle-orm'
import { logger } from '@/lib/logger'
import { withLogging } from '@/lib/api/with-logging'
import { env } from '@/lib/env'

export const GET = withLogging(async function GET() {
  const cookieStore = await cookies()
  const pendingRedirect = cookieStore.get('pending_redirect')?.value
  const pendingPriceId = cookieStore.get('pending_priceId')?.value
  const pendingReferral = cookieStore.get('pending_referral')?.value

  cookieStore.delete('pending_redirect')
  cookieStore.delete('pending_priceId')

  const baseUrl = env.BASE_URL

  // Process referral (fail-open — errors logged, never block redirect)
  // Delete pending_referral only after processing to avoid silent drops if session is unavailable
  if (pendingReferral) {
    try {
      const session = await getSession()
      if (session?.user?.id) {
        const userId = session.user.id

        // Detect new users reliably: must have been created recently AND have
        // no conversations yet. The time window (15 min) is generous to handle
        // slow OAuth flows, and the no-conversations check prevents existing
        // users from being credited on subsequent logins.
        const [user] = await db
          .select({
            email: users.email,
            isNew: sql<boolean>`NOW() - ${users.createdAt} < interval '15 minutes'
              AND NOT EXISTS (SELECT 1 FROM ${conversations} WHERE ${conversations.userId} = ${userId})`,
          })
          .from(users)
          .where(eq(users.id, userId))
          .limit(1)

        if (user?.isNew) {
          const referrer = await getUserByReferralCode(pendingReferral)
          if (referrer && referrer.id !== userId) {
            await processReferral(referrer.id, userId, user.email)
            logger.info('referral', 'Referral processed', {
              referrerId: referrer.id,
              refereeId: userId,
              code: pendingReferral,
            })
          }
        }
      }
    } catch (err) {
      logger.error('referral', 'Failed to process referral', { code: pendingReferral }, err as Error)
    }
    cookieStore.delete('pending_referral')
  }

  if (pendingRedirect === 'checkout' && pendingPriceId) {
    return NextResponse.redirect(
      new URL(`/api/checkout-redirect?priceId=${pendingPriceId}`, baseUrl)
    )
  }

  return NextResponse.redirect(new URL('/home', baseUrl))
});
