import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';

// Load test credentials from .env.test.local
dotenv.config({ path: '.env.test.local' });

const testBaseURL = process.env.PLAYWRIGHT_BASE_URL ?? 'http://127.0.0.1:3100';
const testStorageEndpoint = process.env.TEST_AWS_ENDPOINT_URL ?? process.env.AWS_ENDPOINT_URL ?? 'http://127.0.0.1:9000';
const testStorageBucket = process.env.TEST_AWS_S3_BUCKET_NAME ?? process.env.AWS_S3_BUCKET_NAME ?? 'mypaperpop-test';
const testStorageRegion = process.env.TEST_AWS_DEFAULT_REGION ?? process.env.AWS_DEFAULT_REGION ?? 'us-east-1';
const testStorageAccessKey = process.env.TEST_AWS_ACCESS_KEY_ID ?? process.env.AWS_ACCESS_KEY_ID ?? 'minioadmin';
const testStorageSecretKey = process.env.TEST_AWS_SECRET_ACCESS_KEY ?? process.env.AWS_SECRET_ACCESS_KEY ?? 'minioadmin';

function assertLocalOrDevStorageEndpoint(endpoint: string) {
    let url: URL;
    try {
        url = new URL(endpoint);
    } catch {
        throw new Error(`Invalid test S3 endpoint: ${endpoint}`);
    }

    const host = url.hostname.toLowerCase();
    const isLocalHost =
        host === 'localhost' ||
        host === '127.0.0.1' ||
        host === '0.0.0.0' ||
        host === 'minio' ||
        host.endsWith('.local');
    const isMarkedDev = host.includes('dev') || host.includes('test') || host.includes('minio');

    if (!isLocalHost && !isMarkedDev) {
        throw new Error(
            `Refusing to run Playwright tests against non-dev S3 endpoint: ${endpoint}. ` +
            'Set TEST_AWS_ENDPOINT_URL/AWS_ENDPOINT_URL to local MinIO or a clearly marked dev/test bucket endpoint.',
        );
    }
}

assertLocalOrDevStorageEndpoint(testStorageEndpoint);

function shellEnv(name: string, value: string) {
    return `${name}='${value.replace(/'/g, "'\\''")}'`;
}

const webServerEnv = [
    shellEnv('NODE_ENV', 'development'),
    shellEnv('TEST_STUB_IMAGE_GENERATION', 'true'),
    shellEnv('BASE_URL', testBaseURL),
    shellEnv('AUTH_URL', testBaseURL),
    shellEnv('NEXTAUTH_URL', testBaseURL),
    shellEnv('AWS_ENDPOINT_URL', testStorageEndpoint),
    shellEnv('AWS_ACCESS_KEY_ID', testStorageAccessKey),
    shellEnv('AWS_SECRET_ACCESS_KEY', testStorageSecretKey),
    shellEnv('AWS_S3_BUCKET_NAME', testStorageBucket),
    shellEnv('AWS_DEFAULT_REGION', testStorageRegion),
].join(' ');

export default defineConfig({
    testDir: './tests',
    testMatch: /\.(spec|setup)\.ts$/,
    globalTeardown: './tests/global-teardown.ts',

    /* Run non-quota tests in parallel across multiple workers.
     * Quota-consuming test files are isolated to a serial project below. */
    fullyParallel: true,
    workers: '75%',

    /* Fail the build on CI if you accidentally left test.only in the source code. */
    forbidOnly: !!process.env.CI,

    /* Retry on CI only */
    retries: process.env.CI ? 2 : 0,

    /* Reporter to use */
    reporter: [
        ['html', { outputFolder: 'playwright-report' }],
        ['json', { outputFile: 'test-results/results.json' }],
        ['list']
    ],

    /* Test timeout covers AI calls and local stubbed image generation. */
    timeout: 60_000,

    /* Shared settings for all projects */
    use: {
        baseURL: testBaseURL,
        trace: 'on-first-retry',
        screenshot: 'only-on-failure',
        video: 'retain-on-failure',
    },

    projects: [
        // Setup project — runs first to authenticate via test-auth API
        {
            name: 'setup',
            testMatch: /.*\.setup\.ts/,
        },

        // Desktop tests — authenticated, parallel-safe (no quota consumption)
        {
            name: 'chromium',
            use: {
                ...devices['Desktop Chrome'],
                storageState: './tests/.auth/user.json',
            },
            testIgnore: [
                /.*auth\.setup\.ts/,
                /.*mobile\.spec\.ts/,
                /.*landing-desktop-gate\.spec\.ts/,
                /.*landing-mobile-gate\.spec\.ts/,
                /.*app-functional-visual-gate\.spec\.ts/,
            ],
            dependencies: ['setup'],
        },

        // Mobile tests — authenticated, iPhone 14 viewport on Chromium
        // (WebKit rejects secure cookies over HTTP, so we use Chromium engine)
        {
            name: 'mobile',
            use: {
                ...devices['iPhone 14'],
                browserName: 'chromium',
                storageState: './tests/.auth/user.json',
            },
            testMatch: /.*mobile\.spec\.ts/,
            dependencies: ['setup'],
        },

        // Production gate for mobile landing changes. This intentionally uses
        // real device emulation and no auth state so it exercises the public
        // mobile funnel users see before signup.
        {
            name: 'mobile-landing-gate',
            use: {
                browserName: 'chromium',
                viewport: { width: 393, height: 852 },
                deviceScaleFactor: 3,
                isMobile: true,
                hasTouch: true,
                userAgent:
                    'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.0 Mobile/15E148 Safari/604.1',
                storageState: undefined,
            },
            testMatch: /.*landing-mobile-gate\.spec\.ts/,
        },

        // Production gate for the desktop landing experience. This keeps the
        // current desktop layout protected while mobile-only changes evolve.
        {
            name: 'desktop-landing-gate',
            use: {
                ...devices['Desktop Chrome'],
                viewport: { width: 1440, height: 1000 },
                storageState: undefined,
            },
            testMatch: /.*landing-desktop-gate\.spec\.ts/,
        },

        // Production gate for authenticated functional UI. These tests attach
        // browser screenshots at every major app checkpoint and assert layout
        // integrity on desktop and iPhone-class mobile emulation.
        {
            name: 'app-functional-visual-gate-desktop',
            use: {
                ...devices['Desktop Chrome'],
                viewport: { width: 1440, height: 1000 },
                storageState: './tests/.auth/user.json',
            },
            testMatch: /.*app-functional-visual-gate\.spec\.ts/,
            grep: /desktop/,
            dependencies: ['setup'],
        },

        {
            name: 'app-functional-visual-gate-mobile',
            use: {
                ...devices['iPhone 14'],
                browserName: 'chromium',
                storageState: './tests/.auth/user.json',
            },
            testMatch: /.*app-functional-visual-gate\.spec\.ts/,
            grep: /mobile/,
            dependencies: ['setup'],
        },

    ],

    /* Start dev server before tests */
    webServer: {
        command: `${webServerEnv} pnpm dev --hostname 127.0.0.1 -p 3100`,
        url: testBaseURL,
        reuseExistingServer: false,
        timeout: 120_000,
    },
});
