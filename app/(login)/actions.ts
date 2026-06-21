'use server';

import { z } from 'zod';
import { eq, and, isNotNull } from 'drizzle-orm';
import { db } from '@/lib/db/drizzle';
import {
  users,
  conversations,
  messages,
  coloredPhotos,
  activityLogs,
  ActivityType,
} from '@/lib/db/schema';
import { cookies } from 'next/headers';
import { getUser } from '@/lib/db/queries';
import { validatedActionWithUser } from '@/lib/auth/middleware';
import { signIn as authSignIn, signOut as authSignOut } from '@/auth';
import { logger } from '@/lib/logger';
import { VALID_STRIPE_PRICE_IDS } from '@/lib/payments/config';

export async function signInWithGoogle(formData: FormData) {
  const redirectParam = formData.get('redirect') as string | null;
  const priceIdParam = formData.get('priceId') as string | null;

  // Validate before storing: only set deferred-checkout cookies for known values
  if (redirectParam === 'checkout' && priceIdParam && VALID_STRIPE_PRICE_IDS.has(priceIdParam)) {
    const cookieStore = await cookies();
    cookieStore.set('pending_redirect', redirectParam, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      path: '/',
      maxAge: 600,
    });
    cookieStore.set('pending_priceId', priceIdParam, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      path: '/',
      maxAge: 600,
    });
  }

  await authSignIn('google', { redirectTo: '/api/post-auth-redirect' });
}

export async function signOut() {
  const user = await getUser();
  if (user) {
    await logActivity(user.id, ActivityType.SIGN_OUT);
  }

  // Use redirect: false so the server action returns normally.
  // The client caller then does window.location.href = '/' for a hard
  // page reload, which clears the SWR cache and all client state.
  // Without this, authSignOut throws NEXT_REDIRECT causing a soft
  // navigation that preserves stale SWR-cached user data.
  await authSignOut({ redirect: false });
}

async function logActivity(
  userId: number,
  type: ActivityType,
) {
  await db.insert(activityLogs).values({
    userId,
    action: type,
  });
}

const deleteAccountSchema = z.object({
  verifyParams: z.literal('DELETE'),
});

export const deleteAccount = validatedActionWithUser(
  deleteAccountSchema,
  async (_data, _, user): Promise<{ error: string }> => {
    await logActivity(user.id, ActivityType.DELETE_ACCOUNT);

    // Clean up S3 images from conversations before cascade delete
    try {
      const { deleteSketchImages } = await import('@/lib/storage');
      const imageRows = await db
        .select({ imagePath: messages.imagePath })
        .from(messages)
        .innerJoin(
          conversations,
          eq(messages.conversationId, conversations.id)
        )
        .where(
          and(
            eq(conversations.userId, user.id),
            isNotNull(messages.imagePath)
          )
        );

      const paths = imageRows
        .map((r) => r.imagePath)
        .filter((p): p is string => !!p);

      // Also collect colored photo + composite S3 paths
      const coloredPhotoRows = await db
        .select({ photoPath: coloredPhotos.photoPath, compositePath: coloredPhotos.compositePath })
        .from(coloredPhotos)
        .where(eq(coloredPhotos.userId, user.id));
      const coloredPaths = coloredPhotoRows.flatMap(r =>
        [r.photoPath, r.compositePath].filter((p): p is string => !!p)
      );

      await deleteSketchImages([...paths, ...coloredPaths]);
    } catch (e) {
      logger.error(
        'actions/deleteAccount',
        'Image cleanup failed during account deletion',
        { userId: user.id },
        e
      );
    }

    // Always sign out so the JWT is invalidated, even if the DB delete fails.
    let deleteError: unknown;
    try {
      await db.delete(users).where(eq(users.id, user.id));
    } catch (err) {
      deleteError = err;
      logger.error('actions/deleteAccount', 'DB delete failed', { userId: user.id }, err);
    } finally {
      try { await authSignOut({ redirect: false }); }
      catch (signOutErr) { logger.error('actions/deleteAccount', 'signOut failed', { userId: user.id }, signOutErr); }
    }
    if (deleteError) throw deleteError;
    return { error: '' };
  }
);
