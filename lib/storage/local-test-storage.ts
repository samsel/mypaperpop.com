import fs from 'node:fs/promises';
import path from 'node:path';
import { env } from '@/lib/env';

const ROOT = path.join(process.cwd(), '.test-storage');

export interface LocalTestObject {
    body: Buffer;
    contentType: string;
}

export function shouldUseLocalTestStorage(): boolean {
    if (process.env.TEST_STUB_IMAGE_GENERATION !== 'true') return false;

    const endpoint = new URL(env.AWS_ENDPOINT_URL);
    return endpoint.hostname === 'localhost' || endpoint.hostname === '127.0.0.1';
}

function assertSafeKey(key: string) {
    if (!key || key.startsWith('/') || key.includes('../')) {
        throw new Error('Invalid local test storage key');
    }
}

function filePathForKey(key: string): string {
    assertSafeKey(key);
    return path.join(ROOT, env.AWS_S3_BUCKET_NAME ?? 'mypaperpop-test', key);
}

export async function putLocalTestObject(input: {
    key: string;
    body: Buffer;
    contentType: string;
}): Promise<void> {
    const filePath = filePathForKey(input.key);
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, input.body);
    await fs.writeFile(`${filePath}.content-type`, input.contentType);
}

export async function getLocalTestObject(key: string): Promise<LocalTestObject> {
    const filePath = filePathForKey(key);
    const [body, contentType] = await Promise.all([
        fs.readFile(filePath),
        fs.readFile(`${filePath}.content-type`, 'utf8').catch(() => key.endsWith('.webp') ? 'image/webp' : 'image/png'),
    ]);

    return {
        body,
        contentType,
    };
}

export async function deleteLocalTestObjects(keys: string[]): Promise<void> {
    await Promise.all(keys.map(async (key) => {
        const filePath = filePathForKey(key);
        await Promise.all([
            fs.rm(filePath, { force: true }),
            fs.rm(`${filePath}.content-type`, { force: true }),
        ]);
    }));
}
