import { test as setup, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';

const authFile = path.join(__dirname, '.auth/user.json');

/**
 * Global setup: Authenticate via dev-only test-auth API and save session.
 *
 * Google blocks automated OAuth sign-in from Playwright, so instead
 * we use a dev-only API endpoint that creates a JWT session directly.
 *
 * Requires in .env.test.local:
 *   TEST_USER_EMAIL — email of an existing user in the database
 *   TEST_AUTH_SECRET — must match the server's TEST_AUTH_SECRET in .env
 *
 * Delete tests/.auth/user.json to force re-authentication.
 */
setup('authenticate', async ({ page }) => {
    // Skip if we already have a valid, recent auth file
    if (fs.existsSync(authFile)) {
        const stats = fs.statSync(authFile);
        const ageMs = Date.now() - stats.mtimeMs;
        const maxAgeMs = 23 * 60 * 60 * 1000; // 23 hours (JWT expires in 24h)

        if (ageMs < maxAgeMs) {
            // Verify the saved session still works
            await page.context().addCookies(
                JSON.parse(fs.readFileSync(authFile, 'utf-8')).cookies || []
            );
            await page.goto('/home');
            const isAuthenticated = await page
                .locator('[data-testid="chat-welcome"]')
                .isVisible({ timeout: 8_000 })
                .catch(() => false);

            if (isAuthenticated) {
                console.log('Reusing existing auth session.');
                return;
            }
            console.log('Saved session expired. Re-authenticating...');
        }
    }

    const email = process.env.TEST_USER_EMAIL;
    const authSecret = process.env.TEST_AUTH_SECRET;

    if (!email || !authSecret) {
        throw new Error(
            'Missing test credentials.\n' +
            'Set TEST_USER_EMAIL and TEST_AUTH_SECRET in .env.test.local\n' +
            'Set TEST_AUTH_SECRET in .env (dev server)\n' +
            'See .env.test.local.example for the template.'
        );
    }

    console.log('Authenticating via test-auth API...');

    // Navigate to the app first so cookies are set on the correct domain
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Call the dev-only test-auth endpoint to create a session
    // Grant 100 paid pages so parallel E2E tests don't exhaust the 3/day free quota
    const response = await page.request.post('/api/test-auth', {
        data: { email, authSecret, grantCredits: 100 },
    });

    if (!response.ok()) {
        const body = await response.text();
        throw new Error(
            `Test auth failed (${response.status()}): ${body}\n` +
            'Ensure the dev server is running and TEST_AUTH_SECRET matches in both .env and .env.test.local'
        );
    }

    // Dismiss cookie consent banner so it doesn't block interactions in tests
    await page.evaluate(() => {
        localStorage.setItem('cookie_consent', JSON.stringify({ essential: true, analytics: false }));
    });

    // Navigate to /home to verify authentication worked
    await page.goto('/home');
    await expect(page.locator('[data-testid="chat-welcome"]')).toBeVisible({ timeout: 15_000 });

    console.log('Authentication successful.');

    // Ensure the auth directory exists
    const authDir = path.dirname(authFile);
    if (!fs.existsSync(authDir)) {
        fs.mkdirSync(authDir, { recursive: true });
    }

    // Save storage state for reuse by other tests
    await page.context().storageState({ path: authFile });
    console.log(`Auth state saved to ${authFile}`);
});
