import 'server-only';

import { db, type DbClient } from './drizzle';
import { users, creditPurchases, conversations, referrals } from './schema';
import { and, eq, sql, desc, count, isNull } from 'drizzle-orm';
import { getSession } from '@/lib/auth/session';
import { REFERRAL_CREDITS, REFERRAL_PACK_TYPE, MAX_REFERRALS } from '@/lib/payments/config';
import { isUniqueViolation } from './utils';

/**
 * Verify that a conversation belongs to a user. Returns { id } or null.
 * Lightweight SELECT (only id) — use when you don't need the full row.
 */
export async function verifyConversationOwnership(
  conversationId: number,
  userId: number
): Promise<{ id: number } | null> {
  const [row] = await db
    .select({ id: conversations.id })
    .from(conversations)
    .where(and(eq(conversations.id, conversationId), eq(conversations.userId, userId)))
    .limit(1);

  return row ?? null;
}

export async function getUser() {
  const session = await getSession();
  if (!session?.user?.id) return null;

  const results = await db
    .select()
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1);

  if (results.length === 0) {
    return null;
  }

  return results[0];
}

export async function getUserByStripeCustomerId(customerId: string) {
  const result = await db
    .select()
    .from(users)
    .where(eq(users.stripeCustomerId, customerId))
    .limit(1);

  return result.length > 0 ? result[0] : null;
}

/**
 * Atomically add credits to a user and record the purchase.
 * Uses unique stripeSessionId for idempotency (prevents double-crediting).
 */
export async function addCredits(
  userId: number,
  amount: number,
  packType: string,
  priceCents: number,
  stripeSessionId: string | null,
  currency: string = 'usd',
  receiptUrl: string | null = null,
) {
  await db.transaction(async (tx) => {
    // Insert purchase record (unique constraint on stripeSessionId prevents duplicates)
    await tx.insert(creditPurchases).values({
      userId,
      packType,
      creditsPurchased: amount,
      priceCents,
      stripeSessionId,
      currency,
      receiptUrl,
    });

    // Atomically increment credit balance
    await tx
      .update(users)
      .set({ creditBalance: sql`${users.creditBalance} + ${amount}` })
      .where(eq(users.id, userId));
  });
}

/**
 * Atomically deduct one credit. Returns new balance or null if insufficient.
 */
export async function deductCredit(userId: number, client: DbClient = db): Promise<number | null> {
  const [result] = await client
    .update(users)
    .set({ creditBalance: sql`${users.creditBalance} - 1` })
    .where(sql`${users.id} = ${userId} AND ${users.creditBalance} > 0`)
    .returning({ creditBalance: users.creditBalance });

  return result?.creditBalance ?? null;
}

/**
 * Refund one credit (e.g., if image generation fails after deduction).
 * Uses an atomic UPDATE — safe to call without an advisory lock.
 */
export async function refundCredit(userId: number) {
  await db
    .update(users)
    .set({ creditBalance: sql`${users.creditBalance} + 1` })
    .where(eq(users.id, userId));
}

/**
 * Get purchase history for a user, newest first.
 */
export async function getCreditPurchases(userId: number) {
  return db
    .select()
    .from(creditPurchases)
    .where(eq(creditPurchases.userId, userId))
    .orderBy(desc(creditPurchases.createdAt));
}

/**
 * Generate a 6-char alphanumeric code using the full 0-9A-Z alphabet (36^6 keyspace).
 */
function generateReferralCode(): string {
  const alphabet = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const bytes = crypto.getRandomValues(new Uint8Array(6));
  return Array.from(bytes, (b) => alphabet[b % alphabet.length]).join('');
}

/**
 * Get or lazily create a 6-char referral code for a user.
 * Retries on collision (unique constraint).
 */
export async function getOrCreateReferralCode(userId: number): Promise<string> {
  // Check if user already has a code
  const [user] = await db
    .select({ referralCode: users.referralCode })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (user?.referralCode) return user.referralCode;

  // Generate a new code, retry on collision
  for (let attempt = 0; attempt < 5; attempt++) {
    const code = generateReferralCode();
    try {
      const [updated] = await db
        .update(users)
        .set({ referralCode: code })
        .where(sql`${users.id} = ${userId} AND ${users.referralCode} IS NULL`)
        .returning({ referralCode: users.referralCode });

      if (updated?.referralCode) return updated.referralCode;

      // Another concurrent call already set a code — re-read
      const [reread] = await db
        .select({ referralCode: users.referralCode })
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);
      if (reread?.referralCode) return reread.referralCode;
    } catch (err: unknown) {
      if (!isUniqueViolation(err)) throw err;
      // Collision — retry with a new code
    }
  }
  throw new Error('Failed to generate unique referral code after 5 attempts');
}

/**
 * Look up a user by their referral code.
 */
export async function getUserByReferralCode(code: string) {
  const [user] = await db
    .select()
    .from(users)
    .where(sql`${users.referralCode} = ${code.toUpperCase()}`)
    .limit(1);

  return user ?? null;
}

/**
 * Process a referral: record it and grant credits to both parties.
 * All-or-nothing via transaction — no partial credit grants on failure.
 * Idempotent — unique constraint on refereeEmail prevents double-processing
 * (survives account deletion + re-signup).
 * Enforces per-referrer cap (MAX_REFERRALS).
 */
export async function processReferral(referrerId: number, refereeId: number, refereeEmail: string) {
  await db.transaction(async (tx) => {
    // Check per-referrer cap
    const [{ total }] = await tx
      .select({ total: count() })
      .from(referrals)
      .where(eq(referrals.referrerId, referrerId));

    if (Number(total) >= MAX_REFERRALS) {
      throw new Error(`Referrer ${referrerId} has reached the maximum of ${MAX_REFERRALS} referrals`);
    }

    // Insert referral record (unique refereeEmail prevents duplicates)
    await tx.insert(referrals).values({
      referrerId,
      refereeId,
      refereeEmail: refereeEmail.toLowerCase(),
      referrerCredited: REFERRAL_CREDITS,
    });

    // Grant credits to both parties (inside same transaction)
    await tx.insert(creditPurchases).values({
      userId: referrerId,
      packType: REFERRAL_PACK_TYPE,
      creditsPurchased: REFERRAL_CREDITS,
      priceCents: 0,
      stripeSessionId: null,
    });
    await tx
      .update(users)
      .set({ creditBalance: sql`${users.creditBalance} + ${REFERRAL_CREDITS}` })
      .where(eq(users.id, referrerId));

    await tx.insert(creditPurchases).values({
      userId: refereeId,
      packType: REFERRAL_PACK_TYPE,
      creditsPurchased: REFERRAL_CREDITS,
      priceCents: 0,
      stripeSessionId: null,
    });
    await tx
      .update(users)
      .set({ creditBalance: sql`${users.creditBalance} + ${REFERRAL_CREDITS}` })
      .where(eq(users.id, refereeId));
  });
}

/**
 * Get referral stats for a user (total referrals + total credits earned).
 */
export async function getReferralStats(userId: number) {
  const [result] = await db
    .select({
      totalReferrals: count(),
      totalCreditsEarned: sql<number>`COALESCE(SUM(${referrals.referrerCredited}), 0)`,
    })
    .from(referrals)
    .where(eq(referrals.referrerId, userId));

  return {
    totalReferrals: Number(result?.totalReferrals ?? 0),
    totalCreditsEarned: Number(result?.totalCreditsEarned ?? 0),
  };
}

/**
 * Get unseen referral notifications for a referrer (FIFO queue).
 * LEFT JOINs users to get referee name (may be null if account deleted).
 */
export async function getPendingReferralNotifications(userId: number) {
  return db
    .select({
      id: referrals.id,
      refereeEmail: referrals.refereeEmail,
      refereeName: users.name,
      creditsEarned: referrals.referrerCredited,
      createdAt: referrals.createdAt,
    })
    .from(referrals)
    .leftJoin(users, eq(referrals.refereeId, users.id))
    .where(and(eq(referrals.referrerId, userId), isNull(referrals.seenAt)))
    .orderBy(referrals.createdAt);
}

/**
 * Mark a referral notification as seen. Returns the row or null if not found.
 * The userId check prevents users from dismissing other users' notifications.
 */
export async function dismissReferralNotification(referralId: number, userId: number) {
  const [result] = await db
    .update(referrals)
    .set({ seenAt: sql`NOW()` })
    .where(and(eq(referrals.id, referralId), eq(referrals.referrerId, userId)))
    .returning({ id: referrals.id });

  return result ?? null;
}
