import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db/drizzle';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { sendFeedbackEmail } from '@/lib/email/feedback';
import { logger } from '@/lib/logger';
import { withLogging } from '@/lib/api/with-logging';
import { withValidation } from '@/lib/api/middleware';

const feedbackSchema = z.object({
  message: z.string().min(10, 'Message must be at least 10 characters').max(2000, 'Message is too long'),
});

export const POST = withLogging(withValidation(feedbackSchema, async (_request, session, data) => {
  try {
    const [user] = await db
      .select({ name: users.name, email: users.email })
      .from(users)
      .where(eq(users.id, session.user.id))
      .limit(1);

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    await sendFeedbackEmail({
      userName: user.name || 'Unknown',
      userEmail: user.email,
      message: data.message,
    });

    logger.info('api/feedback', 'Feedback sent', { userId: session.user.id });

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('api/feedback', 'Failed to send feedback', undefined, error);
    return NextResponse.json(
      { error: 'Failed to send feedback' },
      { status: 500 }
    );
  }
}));
