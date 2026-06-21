import { S3Client } from '@aws-sdk/client-s3';
import { env } from '@/lib/env';

export const s3 = new S3Client({
    endpoint: env.AWS_ENDPOINT_URL,
    region: env.AWS_DEFAULT_REGION ?? 'us-east-1',
    credentials: {
        accessKeyId: env.AWS_ACCESS_KEY_ID,
        secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
    },
    forcePathStyle: true,
});

export const AWS_S3_BUCKET_NAME = env.AWS_S3_BUCKET_NAME ?? 'sketches';
