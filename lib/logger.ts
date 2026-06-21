/**
 * Structured logging with Pino + Axiom transport.
 *
 * - Production: JSON → Axiom ingest via @axiomhq/pino (worker thread transport)
 * - Development: pino-pretty → readable colored console output (direct stream, no worker threads)
 *
 * Dev uses pino-pretty as a stream destination (not a transport) because
 * Turbopack's dev server cannot resolve worker thread modules.
 *
 * Request-scoped context (requestId, userId, method, path) is injected
 * via AsyncLocalStorage so that lib modules importing `logger` at module
 * level automatically include correlation fields.
 *
 * Arbitrary per-call context is nested under the single `context` field, and
 * error details are nested under `err`. In Axiom, configure both as map fields
 * so high-dimensional provider payloads do not count against the dataset field
 * limit.
 *
 * Axiom setup:
 *   1. Create free account at https://app.axiom.co
 *   2. Create dataset: Settings → Datasets → "mypaperpop-logs"
 *   3. Create API token: Settings → API Tokens → Ingest permission
 *   4. Set env vars: AXIOM_DATASET, AXIOM_TOKEN
 */

import pino from 'pino';
import { AsyncLocalStorage } from 'node:async_hooks';
import { env } from '@/lib/env';

// ---------------------------------------------------------------------------
// Request-scoped context via AsyncLocalStorage
// ---------------------------------------------------------------------------

export interface RequestContext {
    requestId: string;
    method?: string;
    path?: string;
    userId?: number;
}

export const requestContext = new AsyncLocalStorage<RequestContext>();

export function getRequestContext(): RequestContext | undefined {
    return requestContext.getStore();
}

// ---------------------------------------------------------------------------
// Build Pino instance
// ---------------------------------------------------------------------------

const isDev = process.env.NODE_ENV !== 'production';
const axiomDataset = env.AXIOM_DATASET;
const axiomToken = env.AXIOM_TOKEN;
const isEdge = typeof (globalThis as Record<string, unknown>).EdgeRuntime !== 'undefined';

const pinoOptions: pino.LoggerOptions = {
    level: isDev ? 'debug' : 'info',
    redact: {
        paths: [
            'authorization',
            'cookie',
            'sessionToken',
            'req.headers.authorization',
            'req.headers.cookie',
        ],
        censor: '[REDACTED]',
    },
    mixin() {
        const ctx = requestContext.getStore();
        if (ctx) {
            return { ...ctx };
        }
        return {};
    },
};

function createLogger(): pino.Logger {
    // Edge runtime: no worker threads, no transports — plain JSON to stdout
    if (isEdge) {
        return pino(pinoOptions);
    }

    // Development: use pino-pretty as a direct stream (no worker threads)
    // This avoids the Turbopack thread-stream module resolution error
    if (isDev) {
        try {
            // eslint-disable-next-line @typescript-eslint/no-require-imports
            const pretty = require('pino-pretty');
            const stream = pretty({
                colorize: true,
                translateTime: 'SYS:HH:MM:ss.l',
                ignore: 'pid,hostname',
            });
            return pino(pinoOptions, stream);
        } catch {
            // Fallback to plain JSON if pino-pretty not available
            return pino(pinoOptions);
        }
    }

    // Production: use Axiom transport (worker threads work fine in plain Node.js)
    if (axiomDataset && axiomToken) {
        try {
            return pino({
                ...pinoOptions,
                transport: {
                    target: '@axiomhq/pino',
                    options: {
                        dataset: axiomDataset,
                        token: axiomToken,
                    },
                },
            });
        } catch {
            console.warn('Failed to initialize Axiom transport, falling back to stdout');
        }
    }

    // Production without Axiom: plain JSON to stdout
    return pino(pinoOptions);
}

const pinoLogger = createLogger();

// ---------------------------------------------------------------------------
// Backward-compatible wrapper
//
// The old API:  logger.error(module, message, context?, error?)
//               logger.warn(module, message, context?)
//               logger.info(module, message, context?)
//
// Maps to Pino: logger.error({ module, context, err }, message)
// ---------------------------------------------------------------------------

type LogContext = Record<string, unknown>;

const SENSITIVE_KEY_PARTS = ['password', 'token', 'secret', 'authorization', 'cookie', 'client_secret'];
const ERROR_SUMMARY_KEYS = [
    'name',
    'message',
    'code',
    'type',
    'status',
    'statusCode',
    'finishReason',
    'reason',
    'url',
];

function sanitizeLogValue(key: string, value: unknown): unknown {
    if (SENSITIVE_KEY_PARTS.some((part) => key.toLowerCase().includes(part))) {
        return '[REDACTED]';
    }

    if (Array.isArray(value)) {
        return value.map((item) => sanitizeLogContext(item));
    }

    if (value && typeof value === 'object') {
        if (value instanceof Error) return value;
        return sanitizeLogContext(value);
    }

    return value;
}

function sanitizeLogContext(value: unknown): unknown {
    if (!value || typeof value !== 'object' || value instanceof Error) return value;

    const safeContext: Record<string, unknown> = {};
    for (const [key, nestedValue] of Object.entries(value as Record<string, unknown>)) {
        safeContext[key] = sanitizeLogValue(key, nestedValue);
    }
    return safeContext;
}

function summarizeError(err: unknown): unknown {
    if (!err) return undefined;

    if (err instanceof Error) {
        const summary: Record<string, unknown> = {
            name: err.name,
            message: err.message,
        };
        const code = (err as Error & { code?: unknown }).code;
        const status = (err as Error & { status?: unknown }).status;
        const statusCode = (err as Error & { statusCode?: unknown }).statusCode;
        if (code) summary.code = code;
        if (status) summary.status = status;
        if (statusCode) summary.statusCode = statusCode;
        if (err.stack) summary.stack = err.stack.split('\n').slice(0, 6).join('\n');
        return summary;
    }

    if (typeof err !== 'object') {
        return { message: String(err) };
    }

    const source = err as Record<string, unknown>;
    const summary: Record<string, unknown> = {};
    for (const key of ERROR_SUMMARY_KEYS) {
        if (source[key] !== undefined) {
            summary[key] = sanitizeLogValue(key, source[key]);
        }
    }

    const nestedError = source.error;
    if (nestedError && typeof nestedError === 'object') {
        const nested = nestedError as Record<string, unknown>;
        summary.error = {};
        for (const key of ERROR_SUMMARY_KEYS) {
            if (nested[key] !== undefined) {
                (summary.error as Record<string, unknown>)[key] = sanitizeLogValue(key, nested[key]);
            }
        }
    }

    return Object.keys(summary).length ? summary : { message: '[non-error object]' };
}

export function buildLogPayload(module: string, context?: LogContext, err?: unknown): Record<string, unknown> {
    return {
        module,
        ...(context ? { context: sanitizeLogContext(context) } : {}),
        ...(err ? { err: summarizeError(err) } : {}),
    };
}

export const logger = {
    error(module: string, message: string, context?: LogContext, err?: unknown): void {
        pinoLogger.error(buildLogPayload(module, context, err), message);
    },

    warn(module: string, message: string, context?: LogContext): void {
        pinoLogger.warn(buildLogPayload(module, context), message);
    },

    info(module: string, message: string, context?: LogContext): void {
        pinoLogger.info(buildLogPayload(module, context), message);
    },

    debug(module: string, message: string, context?: LogContext): void {
        pinoLogger.debug(buildLogPayload(module, context), message);
    },

    /** Direct access to the underlying Pino instance for advanced usage. */
    pino: pinoLogger,
};
