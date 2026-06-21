import { GetObjectCommand } from '@aws-sdk/client-s3';
import { NextRequest, NextResponse } from 'next/server';
import { env } from '@/lib/env';
import { logger } from '@/lib/logger';

export const dynamic = 'force-dynamic';

function isLocalStorageEndpoint(): boolean {
    const endpoint = new URL(env.AWS_ENDPOINT_URL);
    return endpoint.hostname === 'localhost' || endpoint.hostname === '127.0.0.1';
}

function isSafeKey(key: string): boolean {
    return key.length > 0 && !key.startsWith('/') && !key.includes('../');
}

function getOriginalPathForVariant(key: string): string | null {
    if (key.endsWith('_display.webp')) {
        return key.replace(/_display\.webp$/, '.png');
    }
    if (key.endsWith('_thumb.webp')) {
        return key.replace(/_thumb\.webp$/, '.png');
    }
    return null;
}

async function getObject(key: string) {
    const { getLocalTestObject, shouldUseLocalTestStorage } = await import('@/lib/storage/local-test-storage');
    if (shouldUseLocalTestStorage()) {
        const object = await getLocalTestObject(key);
        return {
            Body: {
                transformToByteArray: async () => object.body,
            },
            ContentType: object.contentType,
        };
    }

    const { s3, AWS_S3_BUCKET_NAME } = await import('@/lib/storage/s3-client');
    return s3.send(new GetObjectCommand({ Bucket: AWS_S3_BUCKET_NAME, Key: key }));
}

export async function GET(
    _request: NextRequest,
    { params }: { params: Promise<{ key: string[] }> }
) {
    if (!isLocalStorageEndpoint()) {
        return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const { key: keyParts } = await params;
    const key = keyParts.map(decodeURIComponent).join('/');

    if (!isSafeKey(key)) {
        return NextResponse.json({ error: 'Invalid storage key' }, { status: 400 });
    }

    let objectKey = key;
    let object;

    try {
        object = await getObject(objectKey);
    } catch (error) {
        const fallbackKey = getOriginalPathForVariant(key);
        if (!fallbackKey) {
            logger.warn('api/storage', 'Storage object not found', { key });
            return NextResponse.json({ error: 'Not found' }, { status: 404 });
        }

        try {
            objectKey = fallbackKey;
            object = await getObject(objectKey);
        } catch {
            logger.warn('api/storage', 'Storage object and fallback not found', { key, fallbackKey });
            return NextResponse.json({ error: 'Not found' }, { status: 404 });
        }
    }

    const bytes = await object.Body!.transformToByteArray();
    return new NextResponse(Buffer.from(bytes), {
        headers: {
            'Content-Type': object.ContentType ?? (objectKey.endsWith('.webp') ? 'image/webp' : 'image/png'),
            'Cache-Control': 'private, max-age=3600',
        },
    });
}
