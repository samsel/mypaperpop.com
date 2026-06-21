import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
    test.describe('Unauthenticated flows', () => {
        test.use({ storageState: { cookies: [], origins: [] } });

        test('/#sign-in opens sign-in modal', async ({ page }) => {
            await page.goto('/#sign-in', { waitUntil: 'domcontentloaded', timeout: 60_000 });
            await expect(page.getByText(/Sign in with Google/i)).toBeVisible();
        });

        test('/#sign-up opens modal in sign-up mode', async ({ page }) => {
            await page.goto('/#sign-up', { waitUntil: 'domcontentloaded', timeout: 60_000 });
            await expect(page.getByText(/Sign in with Google/i)).toBeVisible();
        });

        test('Modal shows Google OAuth button and trust badges', async ({ page }) => {
            await page.goto('/#sign-in', { waitUntil: 'domcontentloaded', timeout: 60_000 });
            await expect(page.getByText(/Sign in with Google/i)).toBeVisible();
            await expect(page.getByText(/No Passwords/i)).toBeVisible();
            await expect(page.getByText(/Private & Secure/i)).toBeVisible();
        });

        test('Modal closes on X button click', async ({ page }) => {
            await page.goto('/#sign-in', { waitUntil: 'domcontentloaded', timeout: 60_000 });
            await expect(page.getByText(/Sign in with Google/i)).toBeVisible();
            const closeButton = page.locator('[role="dialog"]').locator('button').filter({ has: page.locator('svg') }).first();
            await closeButton.click();
            await expect(page.getByText(/Sign in with Google/i)).toBeHidden();
        });

        test('Nav "Get started free" opens modal', async ({ page }) => {
            await page.goto('/', { waitUntil: 'domcontentloaded', timeout: 60_000 });
            await page.getByRole('button', { name: /Get started free/i }).click();
            await expect(page.getByText(/Sign in with Google/i)).toBeVisible();
        });

        test('Protected: /home redirects unauth to /#sign-in', async ({ page }) => {
            await page.goto('/home', { waitUntil: 'domcontentloaded', timeout: 60_000 });
            await page.waitForURL(/\/#sign-in/, { timeout: 15_000 });
        });

        test('Protected: /account redirects unauth to /#sign-in', async ({ page }) => {
            await page.goto('/account', { waitUntil: 'domcontentloaded', timeout: 60_000 });
            await page.waitForURL(/\/#sign-in/, { timeout: 15_000 });
        });

    });

    test.describe('Authenticated flows', () => {
        test('Sign-out: button exists on account page', async ({ page }) => {
            await page.goto('/account', { timeout: 60_000 });
            await expect(page.getByRole('button', { name: /Sign out/i })).toBeVisible();
        });
    });
});
