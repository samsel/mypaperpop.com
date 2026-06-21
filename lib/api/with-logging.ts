/**
 * API route wrapper that provides:
 *   - Request correlation ID (x-request-id header)
 *   - Incoming request logging (method, path, body summary)
 *   - Outgoing response logging (status, duration)
 *   - AsyncLocalStorage context for downstream logger calls
 */

import { NextRequest, NextResponse } from 'next/server';
import { logger, requestContext, type RequestContext } from '@/lib/logger';
import { getSession } from '@/lib/auth/session';

// ---------------------------------------------------------------------------
// Body redaction
// ---------------------------------------------------------------------------

function redactValue(key: string, value: unknown): unknown {
    const sensitiveKeys = ['password', 'token', 'secret', 'authorization', 'cookie'];
    if (sensitiveKeys.some(k => key.toLowerCase().includes(k))) {
        return '[REDACTED]';
    }
    if ((key === 'previousImageBase64' || key === 'photoBase64') && typeof value === 'string') {
        return `[base64 ${value.length} chars]`;
    }
    if (typeof value === 'string' && value.length > 500) {
        return value.slice(0, 500) + `... [${value.length} chars total]`;
    }
    return value;
}

function redactBody(body: unknown): unknown {
    if (body === null || body === undefined) return body;
    if (typeof body !== 'object') return body;
    if (Array.isArray(body)) return body.map((item) => redactBody(item));

    const redacted: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(body as Record<string, unknown>)) {
        if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
            redacted[key] = redactBody(value);
        } else {
            redacted[key] = redactValue(key, value);
        }
    }
    return redacted;
}

// ---------------------------------------------------------------------------
// Handler types — Next.js App Router supports two signatures
// ---------------------------------------------------------------------------

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyHandler = (...args: any[]) => Promise<Response | NextResponse>;

// ---------------------------------------------------------------------------
// withLogging HOF
// ---------------------------------------------------------------------------

export function withLogging<T extends AnyHandler>(handler: T): T {
    const wrapped = async (
        request: NextRequest,
        routeContext?: unknown
    ): Promise<Response | NextResponse> => {
        const requestId = crypto.randomUUID();
        const method = request.method;
        const url = new URL(request.url);
        const path = url.pathname;
        const start = Date.now();

        // Try to get userId from session (non-blocking — don't fail if session unavailable)
        let userId: number | undefined;
        try {
            const session = await getSession();
            userId = session?.user?.id;
        } catch {
            // Session read may fail for some routes (e.g., webhook) — that's fine
        }

        const ctx: RequestContext = { requestId, method, path, userId };

        return requestContext.run(ctx, async () => {
            // Log incoming request (skip parsing large bodies like base64 image payloads)
            let bodyForLog: unknown;
            if (method === 'POST' || method === 'PATCH' || method === 'PUT') {
                const contentLength = parseInt(request.headers.get('content-length') || '0', 10);
                if (contentLength >= 50_000) {
                    bodyForLog = `[large body: ${contentLength} bytes]`;
                } else {
                    try {
                        const cloned = request.clone();
                        const rawBody = await cloned.json();
                        bodyForLog = redactBody(rawBody);
                    } catch {
                        bodyForLog = '[unreadable]';
                    }
                }
            }

            logger.info('api', 'Incoming request', {
                requestId,
                method,
                path,
                query: url.search || undefined,
                body: bodyForLog,
                userId,
            });

            try {
                // Call the actual handler
                const response = routeContext
                    ? await handler(request, routeContext)
                    : await handler(request);

                const duration = Date.now() - start;
                const status = response.status;

                logger.info('api', 'Outgoing response', {
                    requestId,
                    method,
                    path,
                    status,
                    duration,
                    userId,
                });

                // Add x-request-id to response headers
                if (response instanceof NextResponse) {
                    response.headers.set('x-request-id', requestId);
                    return response;
                }

                // For plain Response objects, clone with the new header
                const headers = new Headers(response.headers);
                headers.set('x-request-id', requestId);
                return new Response(response.body, {
                    status: response.status,
                    statusText: response.statusText,
                    headers,
                });
            } catch (err) {
                const duration = Date.now() - start;
                logger.error('api', 'Unhandled error in route handler', {
                    requestId,
                    method,
                    path,
                    duration,
                    userId,
                }, err);

                const errorResponse = NextResponse.json(
                    { error: 'Internal server error' },
                    { status: 500 }
                );
                errorResponse.headers.set('x-request-id', requestId);
                return errorResponse;
            }
        });
    };

    return wrapped as T;
}
