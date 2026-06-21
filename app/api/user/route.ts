import { NextResponse } from 'next/server';
import { getUser } from '@/lib/db/queries';
import { getUsageInfo } from '@/lib/usage/limits';
import { withLogging } from '@/lib/api/with-logging';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const GET = withLogging(async function GET() {
  const user = await getUser();
  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const usage = await getUsageInfo(user.id);

  return NextResponse.json(
    {
      id: user.id,
      name: user.name,
      email: user.email,
      image: user.image,
      creditBalance: user.creditBalance,
      freeRemaining: usage.freeRemaining,
      freeDailyLimit: usage.freeDailyLimit,
      totalRemaining: usage.totalRemaining,
      usage,
    },
    {
      headers: {
        'Cache-Control': 'private, no-store',
      },
    }
  );
});
