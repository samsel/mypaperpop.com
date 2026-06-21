import { getPendingReferralNotifications } from '@/lib/db/queries';
import { withLogging } from '@/lib/api/with-logging';
import { withAuth } from '@/lib/api/middleware';

function maskEmail(email: string): string {
  const [local, domain] = email.split('@');
  if (!domain || !local) return '***';
  const maskedLocal = local.length <= 2
    ? local[0] + '***'
    : local[0] + '***' + local[local.length - 1];
  return `${maskedLocal}@${domain}`;
}

export const GET = withLogging(withAuth(async (_request, session) => {
  const pending = await getPendingReferralNotifications(session.user.id);

  return Response.json({
    referrals: pending.map((r) => ({
      id: r.id,
      refereeName: r.refereeName || null,
      refereeEmail: maskEmail(r.refereeEmail),
      creditsEarned: r.creditsEarned,
      createdAt: r.createdAt.toISOString(),
    })),
  });
}));
