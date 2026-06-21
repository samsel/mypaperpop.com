import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export function evalDir(importMetaUrl: string): string {
    return path.dirname(fileURLToPath(importMetaUrl));
}

export function loadJsonl<T>(importMetaUrl: string, fileName: string): T[] {
    const raw = fs.readFileSync(path.join(evalDir(importMetaUrl), fileName), 'utf8');

    return raw
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean)
        .map((line) => JSON.parse(line) as T);
}

export function includesText(source: string | undefined, expected: string): boolean {
    return (source ?? '').toLowerCase().includes(expected.toLowerCase());
}

export function includesUnnegatedText(source: string | undefined, forbidden: string): boolean {
    const haystack = (source ?? '').toLowerCase();
    const needle = forbidden.toLowerCase();
    let index = haystack.indexOf(needle);

    while (index !== -1) {
        const prefix = haystack.slice(Math.max(0, index - 80), index).trim();
        if (!/(^|[\s,.;:!?])(no|not|without|avoid|avoids|avoiding|remove|removed)\b[^.;:!?]*$/.test(prefix)) {
            return true;
        }
        index = haystack.indexOf(needle, index + needle.length);
    }

    return false;
}

export function failedRows<T extends { scores: Record<string, number | null> }>(rows: T[]): T[] {
    return rows.filter((row) => Object.values(row.scores).some((score) => score !== null && score < 1));
}

export function configureEvalEnv(): void {
    process.env.SKIP_ENV_VALIDATION = 'true';
    (process.env as Record<string, string | undefined>).NODE_ENV ??= 'test';
}

export function parseEvalArgs(): {
    noSendLogs: boolean;
    projectName: string;
    projectId?: string;
    localOnly: boolean;
    trialCount: number;
    maxConcurrency: number;
} {
    const args = new Set(process.argv.slice(2));
    const localOnly = args.has('--local');
    const trialCount = Number.parseInt(process.env.AI_EVAL_TRIAL_COUNT ?? '1', 10);
    const maxConcurrency = Number.parseInt(process.env.AI_EVAL_MAX_CONCURRENCY ?? '1', 10);
    return {
        localOnly,
        noSendLogs: localOnly || !process.env.BRAINTRUST_API_KEY,
        projectName: process.env.BRAINTRUST_PROJECT_NAME || 'MyPaperPop AI Evals',
        projectId: process.env.BRAINTRUST_PROJECT_ID,
        trialCount: Number.isFinite(trialCount) && trialCount > 0 ? trialCount : 1,
        maxConcurrency: Number.isFinite(maxConcurrency) && maxConcurrency > 0 ? maxConcurrency : 1,
    };
}

export function requireProviderEnv(requiredEnv: string[] = ['GEMINI_API_KEY']): boolean {
    for (const envName of requiredEnv) {
        if (!process.env[envName]) {
            console.error(`${envName} is required for AI evals.`);
            process.exitCode = 1;
            return false;
        }
    }

    return true;
}

export function requireRealXaiImageEvalEnv(): boolean {
    return requireProviderEnv(['XAI_API_KEY', 'GEMINI_API_KEY']);
}
