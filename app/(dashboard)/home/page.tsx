import { Suspense } from 'react';
import { getUser } from '@/lib/db/queries';
import { redirect } from 'next/navigation';
import { getUsageInfo } from '@/lib/usage/limits';
import { getDailyContent } from '@/lib/daily-prompts';
import { HomeClient } from './home-client';

// Force dynamic rendering - never cache this page
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function HomePage() {
    const user = await getUser();

    if (!user) {
        redirect('/#sign-in');
    }

    // Fetch usage information - always fresh
    const usageInfo = await getUsageInfo(user.id);
    const dailyContent = getDailyContent();

    return (
        <Suspense fallback={null}>
            <HomeClient
                userId={user.id}
                dailyContent={dailyContent}
                usageInfo={{
                    freeRemaining: usageInfo.freeRemaining,
                    creditBalance: usageInfo.creditBalance,
                    totalRemaining: usageInfo.totalRemaining,
                }}
            />
        </Suspense>
    );
}
