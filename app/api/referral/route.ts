import { getOrCreateReferralCode, getReferralStats } from '@/lib/db/queries';
import { withLogging } from '@/lib/api/with-logging';
import { withAuth } from '@/lib/api/middleware';
import { REFERRAL_CREDITS } from '@/lib/payments/config';
import { env } from '@/lib/env';

export const GET = withLogging(withAuth(async (_request, session) => {
  const userId = session.user.id;
  const [referralCode, stats] = await Promise.all([
    getOrCreateReferralCode(userId),
    getReferralStats(userId),
  ]);

  const baseUrl = env.BASE_URL;
  const referralUrl = `${baseUrl}/?ref=${referralCode}`;

  return Response.json({
    referralCode,
    referralUrl,
    creditsPerReferral: REFERRAL_CREDITS,
    totalReferrals: stats.totalReferrals,
    totalCreditsEarned: stats.totalCreditsEarned,
  });
}));
