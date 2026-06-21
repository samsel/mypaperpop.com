import { NextRequest, NextResponse } from 'next/server';
import type { z } from 'zod';
import { getSession } from '@/lib/auth/session';

export type Session = NonNullable<Awaited<ReturnType<typeof getSession>>>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyHandler = (...args: any[]) => Promise<Response | NextResponse>;

/**
 * Require a valid session. Returns 401 if unauthenticated.
 * Composes inside withLogging: `withLogging(withAuth(handler))`
 */
export function withAuth(
    handler: (request: NextRequest, session: Session, routeContext?: any) => Promise<Response | NextResponse> // eslint-disable-line @typescript-eslint/no-explicit-any
): AnyHandler {
    return async (request: NextRequest, routeContext?: unknown) => {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        return handler(request, session, routeContext);
    };
}

/**
 * Require a valid session AND validate the JSON request body.
 * Returns 401 for no session, 400 for invalid body.
 * Composes inside withLogging: `withLogging(withValidation(schema, handler))`
 */
export function withValidation<T extends z.ZodType>(
    schema: T,
    handler: (request: NextRequest, session: Session, data: z.infer<T>, routeContext?: any) => Promise<Response | NextResponse> // eslint-disable-line @typescript-eslint/no-explicit-any
): AnyHandler {
    return withAuth(async (request, session, routeContext) => {
        let body: unknown;
        try { body = await request.json(); }
        catch { return NextResponse.json({ error: 'Invalid request body' }, { status: 400 }); }
        const result = schema.safeParse(body);
        if (!result.success) {
            return NextResponse.json({ error: result.error.issues[0]?.message || 'Invalid request' }, { status: 400 });
        }
        return handler(request, session, result.data, routeContext);
    });
}
