import { db, type DbClient } from '@/lib/db/drizzle';
import { conversations, messages, users } from '@/lib/db/schema';
import { FREE_DAILY_LIMIT } from '@/lib/payments/config';
import { deductCredit, refundCredit } from '@/lib/db/queries';
import { and, eq, gte, isNotNull, sql } from 'drizzle-orm';

/**
 * Sentinel value for image_path on reservation messages.
 * Inserted inside the quota lock to prevent TOCTOU races on free daily images.
 * Updated with the real S3 path after image generation succeeds.
 */
export const PENDING_IMAGE_PATH = '__pending__';

export interface UsageInfo {
    freeUsedToday: number;
    freeDailyLimit: number;
    freeRemaining: number;
    creditBalance: number;
    totalRemaining: number;
}

export async function getUsageInfo(userId: number, client: DbClient = db): Promise<UsageInfo> {
    // Combined single query: user creditBalance + today's image count
    const todayStart = new Date();
    todayStart.setUTCHours(0, 0, 0, 0);
    const todayStartISO = todayStart.toISOString();

    const [result] = await client.execute<{
        credit_balance: number;
        free_used_today: number;
    }>(sql`
        SELECT u.credit_balance, COALESCE(img.count, 0)::int AS free_used_today
        FROM users u
        LEFT JOIN LATERAL (
            SELECT count(*) AS count FROM messages m
            JOIN conversations c ON m.conversation_id = c.id
            WHERE c.user_id = ${userId} AND m.image_path IS NOT NULL AND m.created_at >= ${todayStartISO}::timestamptz
        ) img ON true
        WHERE u.id = ${userId}
    `);

    if (!result) {
        throw new Error('User not found');
    }

    const freeUsedToday = Number(result.free_used_today);
    const creditBalance = Number(result.credit_balance);
    const freeRemaining = Math.max(0, FREE_DAILY_LIMIT - freeUsedToday);
    const totalRemaining = freeRemaining + creditBalance;

    return {
        freeUsedToday,
        freeDailyLimit: FREE_DAILY_LIMIT,
        freeRemaining,
        creditBalance,
        totalRemaining,
    };
}

export interface QuotaResult {
    allowed: boolean;
    deductedCredit: boolean;
    remaining: UsageInfo;
    resetTime?: Date;
}

/**
 * Check quota and deduct a credit if needed.
 * Free daily images are used first, then purchased credits.
 * Must be called inside withQuotaLock().
 */
export async function checkAndDeductQuota(userId: number, client: DbClient = db): Promise<QuotaResult> {
    const usage = await getUsageInfo(userId, client);

    // Still have free images today
    if (usage.freeUsedToday < FREE_DAILY_LIMIT) {
        return {
            allowed: true,
            deductedCredit: false,
            remaining: {
                ...usage,
                // After this image: one fewer free remaining
                freeUsedToday: usage.freeUsedToday + 1,
                freeRemaining: Math.max(0, usage.freeRemaining - 1),
                totalRemaining: Math.max(0, usage.totalRemaining - 1),
            },
        };
    }

    // Free exhausted — try purchased credits
    if (usage.creditBalance > 0) {
        const newBalance = await deductCredit(userId, client);
        if (newBalance !== null) {
            return {
                allowed: true,
                deductedCredit: true,
                remaining: {
                    ...usage,
                    creditBalance: newBalance,
                    totalRemaining: usage.freeRemaining + newBalance,
                },
            };
        }
    }

    // No credits at all
    const resetTime = new Date();
    resetTime.setUTCDate(resetTime.getUTCDate() + 1);
    resetTime.setUTCHours(0, 0, 0, 0);

    return {
        allowed: false,
        deductedCredit: false,
        remaining: usage,
        resetTime,
    };
}

export { refundCredit };

/** Stale reservation threshold in minutes. */
const STALE_RESERVATION_MINUTES = 5;

/**
 * Nullify image_path on any __pending__ reservation messages older than
 * STALE_RESERVATION_MINUTES for this user. This reclaims free-tier daily
 * slots lost to server crashes or deployment restarts.
 */
export async function cleanupStaleReservations(userId: number): Promise<void> {
    await db.execute(sql`
        UPDATE messages m
        SET image_path = NULL
        FROM conversations c
        WHERE m.conversation_id = c.id
          AND c.user_id = ${userId}
          AND m.image_path = ${PENDING_IMAGE_PATH}
          AND m.created_at < NOW() - make_interval(mins => ${STALE_RESERVATION_MINUTES})
    `);
}

/**
 * Execute a callback while holding a per-user advisory lock.
 * Uses pg_advisory_xact_lock inside a transaction so lock, queries,
 * and unlock all happen on the same connection.
 */
export async function withQuotaLock<T>(
    userId: number,
    fn: (tx: DbClient) => Promise<T>
): Promise<T> {
    const lockNamespace = 0x4D435021;
    return db.transaction(async (tx) => {
        await tx.execute(sql`SELECT pg_advisory_xact_lock(${lockNamespace}, ${userId})`);
        return fn(tx);
    });
}
