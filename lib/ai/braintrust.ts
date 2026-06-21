import 'server-only';

import * as ai from 'ai';
import { Attachment, currentSpan, initLogger, wrapAISDK } from 'braintrust';

const braintrustProjectName = process.env.BRAINTRUST_PROJECT_NAME || 'My Project';
const braintrustApiKey = process.env.BRAINTRUST_API_KEY;
const braintrustLogger = braintrustApiKey
    ? initLogger({
        projectName: braintrustProjectName,
        apiKey: braintrustApiKey,
    })
    : null;

if (braintrustApiKey) {
    console.info('Braintrust tracing enabled', {
        projectName: braintrustProjectName,
    });
} else {
    console.info('Braintrust tracing disabled: missing BRAINTRUST_API_KEY');
}

const tracedAi = wrapAISDK(ai);

export const generateObject = tracedAi.generateObject;
export const generateText = tracedAi.generateText;

type BraintrustSpan = {
    log(event: Record<string, unknown>): void;
};

type BraintrustSpanType =
    | 'function'
    | 'eval'
    | 'task'
    | 'llm'
    | 'score'
    | 'tool'
    | 'automation'
    | 'facet'
    | 'preprocessor'
    | 'classifier'
    | 'review';

export function isBraintrustEnabled(): boolean {
    return braintrustLogger !== null;
}

export async function traceBraintrust<T>(
    name: string,
    fn: (span: BraintrustSpan | null) => Promise<T>,
    options?: {
        type?: BraintrustSpanType;
        event?: Record<string, unknown>;
    },
): Promise<T> {
    if (!braintrustLogger) {
        return fn(null);
    }

    return braintrustLogger.traced(
        async (span: BraintrustSpan) => fn(span),
        {
            name,
            type: options?.type ?? 'task',
            ...(options?.event ? { event: options.event } : {}),
        },
    );
}

export function logBraintrust(event: Record<string, unknown>): void {
    if (!braintrustLogger) return;

    try {
        currentSpan().log(event);
    } catch {
        // No active span. This helper is intentionally best-effort so product
        // execution never depends on Braintrust context being available.
    }
}

export function imageAttachment(input: {
    data: Buffer | string;
    filename: string;
    contentType?: string;
}): unknown {
    const data = Buffer.isBuffer(input.data)
        ? bufferToArrayBuffer(input.data)
        : input.data;

    return new Attachment({
        data,
        filename: input.filename,
        contentType: input.contentType ?? 'image/png',
    });
}

function bufferToArrayBuffer(buffer: Buffer): ArrayBuffer {
    const arrayBuffer = new ArrayBuffer(buffer.byteLength);
    new Uint8Array(arrayBuffer).set(buffer);
    return arrayBuffer;
}
