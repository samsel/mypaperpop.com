import { test, expect } from '@playwright/test';

// Cookie consent tests use a fresh context without saved storage state
// so the cookie_consent localStorage key is not set
test.describe('Cookie consent', () => {
    test.use({ storageState: { cookies: [], origins: [] } });

    test('Banner appears on first visit', async ({ page }) => {
        await page.goto('/', { waitUntil: 'domcontentloaded', timeout: 60_000 });
        await expect(page.locator('[data-testid="cookie-consent-banner"]')).toBeVisible();
        await expect(page.getByText('Privacy cookies')).toBeVisible();
    });

    test('"Accept all" dismisses banner', async ({ page }) => {
        await page.goto('/', { waitUntil: 'domcontentloaded', timeout: 60_000 });
        await expect(page.locator('[data-testid="cookie-consent-banner"]')).toBeVisible();
        await page.getByRole('button', { name: /Accept all/i }).click();
        await expect(page.locator('[data-testid="cookie-consent-banner"]')).toBeHidden();
    });

    test('"Essential only" dismisses banner', async ({ page }) => {
        await page.goto('/', { waitUntil: 'domcontentloaded', timeout: 60_000 });
        await expect(page.locator('[data-testid="cookie-consent-banner"]')).toBeVisible();
        await page.getByRole('button', { name: /Essential only/i }).click();
        await expect(page.locator('[data-testid="cookie-consent-banner"]')).toBeHidden();
    });

    test('"Customize" shows settings panel', async ({ page }) => {
        await page.goto('/', { waitUntil: 'domcontentloaded', timeout: 60_000 });
        await expect(page.locator('[data-testid="cookie-consent-banner"]')).toBeVisible();
        await page.getByRole('button', { name: /Customize/i }).click();
        await expect(page.getByText('Cookie preferences')).toBeVisible();
        await expect(page.getByText(/Essential/i)).toBeVisible();
        await expect(page.getByText(/Analytics/i)).toBeVisible();
    });

    test('Settings panel: save preferences dismisses', async ({ page }) => {
        await page.goto('/', { waitUntil: 'domcontentloaded', timeout: 60_000 });
        await page.getByRole('button', { name: /Customize/i }).click();
        await expect(page.getByText('Cookie preferences')).toBeVisible();
        await page.getByRole('button', { name: /Save preferences/i }).click();
        await expect(page.locator('[data-testid="cookie-consent-banner"]')).toBeHidden();
    });

    test('Banner does not reappear after choice', async ({ page }) => {
        await page.goto('/', { waitUntil: 'domcontentloaded', timeout: 60_000 });
        await expect(page.locator('[data-testid="cookie-consent-banner"]')).toBeVisible();
        await page.getByRole('button', { name: /Accept all/i }).click();
        await expect(page.locator('[data-testid="cookie-consent-banner"]')).toBeHidden();

        // Reload and verify banner stays hidden
        await page.reload({ waitUntil: 'domcontentloaded', timeout: 60_000 });
        await expect(page.locator('[data-testid="cookie-consent-banner"]')).toBeHidden();
    });
});
