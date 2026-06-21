import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { logger } from '@/lib/logger';
import { RATE_LIMIT_MAX_REQUESTS, RATE_LIMIT_WINDOW_MS } from '@/lib/payments/config';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyHandler = (...args: any[]) => Promise<Response | NextResponse>;

/**
 * In-memory sliding window rate limiter.
 * Keyed by userId, stores request timestamps within the window.
 */
export class RateLimiter {
  private windows = new Map<number, number[]>();

  constructor(
    private maxRequests: number,
    private windowMs: number,
  ) {
    // Periodically prune stale entries to prevent memory leak
    setInterval(() => this.cleanup(), 60_000).unref();
  }

  check(userId: number): { allowed: boolean; remaining: number; resetMs: number } {
    const now = Date.now();
    const cutoff = now - this.windowMs;

    let timestamps = this.windows.get(userId);
    if (timestamps) {
      // Prune expired entries
      timestamps = timestamps.filter((t) => t > cutoff);
    } else {
      timestamps = [];
    }

    if (timestamps.length >= this.maxRequests) {
      // Denied — compute when the oldest entry expires
      const oldestInWindow = timestamps[0]!;
      const resetMs = oldestInWindow + this.windowMs - now;
      this.windows.set(userId, timestamps);
      return { allowed: false, remaining: 0, resetMs };
    }

    timestamps.push(now);
    this.windows.set(userId, timestamps);
    return {
      allowed: true,
      remaining: this.maxRequests - timestamps.length,
      resetMs: timestamps[0]! + this.windowMs - now,
    };
  }

  private cleanup(): void {
    const now = Date.now();
    const cutoff = now - this.windowMs;
    for (const [userId, timestamps] of this.windows) {
      const valid = timestamps.filter((t) => t > cutoff);
      if (valid.length === 0) {
        this.windows.delete(userId);
      } else {
        this.windows.set(userId, valid);
      }
    }
  }
}

// ---------------------------------------------------------------------------
// Pre-configured limiter instances
// ---------------------------------------------------------------------------

/** Shared limiter for both generation endpoints */
export const generationLimiter = new RateLimiter(RATE_LIMIT_MAX_REQUESTS, RATE_LIMIT_WINDOW_MS);

// ---------------------------------------------------------------------------
// withRateLimit middleware
// ---------------------------------------------------------------------------

/**
 * Rate-limiting middleware HOF.
 * Wraps an inner handler (typically withValidation or withAuth output).
 * Calls getSession() to identify the user — if no session, passes through
 * to the inner handler (which will return 401 via withAuth).
 *
 * Composition: withLogging(withRateLimit(limiter, withValidation(schema, handler)))
 */
export function withRateLimit<T extends AnyHandler>(limiter: RateLimiter, handler: T): T {
  const wrapped = async (...args: Parameters<T>): Promise<Response | NextResponse> => {
    const session = await getSession();

    // No session → let the inner handler reject with 401
    if (!session) {
      return handler(...args);
    }

    const { allowed, remaining, resetMs } = limiter.check(session.user.id);

    if (!allowed) {
      const retryAfter = Math.ceil(resetMs / 1000);
      logger.warn('api/rate-limit', 'Rate limit exceeded', {
        userId: session.user.id,
        retryAfter,
      });

      return NextResponse.json(
        {
          error: 'Too many requests. Please slow down.',
          retryAfter,
          remaining: 0,
        },
        {
          status: 429,
          headers: { 'Retry-After': String(retryAfter) },
        },
      );
    }

    const response = await handler(...args);

    // Attach rate limit info headers to successful responses
    if (response instanceof NextResponse) {
      response.headers.set('X-RateLimit-Remaining', String(remaining));
    }

    return response;
  };

  return wrapped as unknown as T;
}
