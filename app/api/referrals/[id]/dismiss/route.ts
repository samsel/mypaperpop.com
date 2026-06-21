import { NextRequest } from 'next/server';
import { dismissReferralNotification } from '@/lib/db/queries';
import { withLogging } from '@/lib/api/with-logging';
import { withAuth } from '@/lib/api/middleware';

export const POST = withLogging(withAuth(async (
  _request: NextRequest,
  session,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = await params;
  const referralId = parseInt(id, 10);
  if (isNaN(referralId)) {
    return Response.json({ error: 'Invalid referral ID' }, { status: 400 });
  }

  const result = await dismissReferralNotification(referralId, session.user.id);
  if (!result) {
    return Response.json({ error: 'Not found' }, { status: 404 });
  }

  return Response.json({ success: true });
}));
