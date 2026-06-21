import { db } from '@/lib/db/drizzle';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { encode } from 'next-auth/jwt';
import { cookies } from 'next/headers';
import { env } from '@/lib/env';

/**
 * Dev-only endpoint: Create a session for a test user by email.
 * Used by Playwright auth setup to bypass Google OAuth (which blocks automated browsers).
 *
 * Guarded by:
 * 1. NODE_ENV must be 'development'
 * 2. Must provide TEST_AUTH_SECRET that matches server-side secret
 */
export async function POST(request: Request) {
  if (process.env.NODE_ENV !== 'development') {
    return Response.json({ error: 'Not available' }, { status: 404 });
  }

  const secret = env.TEST_AUTH_SECRET;
  if (!secret) {
    return Response.json(
      { error: 'TEST_AUTH_SECRET not configured' },
      { status: 500 }
    );
  }

  const body = await request.json();
  const { email, authSecret } = body;

  if (!email || authSecret !== secret) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const result = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (result.length === 0) {
    return Response.json({ error: 'User not found' }, { status: 404 });
  }

  const user = result[0];

  // Optionally grant credits for testing (resets credit_balance to the given value)
  if (typeof body.grantCredits === 'number' && body.grantCredits > 0) {
    await db
      .update(users)
      .set({ creditBalance: body.grantCredits })
      .where(eq(users.id, user.id));
  }

  // Generate Auth.js-compatible JWT
  const token = await encode({
    token: {
      userId: user.id,
      name: user.name,
      email: user.email,
      sub: String(user.id),
    },
    secret: env.AUTH_SECRET,
    salt: 'authjs.session-token',
  });

  // Set the Auth.js session cookie
  const cookieStore = await cookies();
  cookieStore.set('authjs.session-token', token, {
    httpOnly: true,
    secure: false, // Dev-only endpoint — never runs in production
    sameSite: 'lax',
    maxAge: 86400,
    path: '/',
  });

  return Response.json({ ok: true, userId: user.id });
}
