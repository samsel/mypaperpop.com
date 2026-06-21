import { test, expect } from '@playwright/test';

test.describe('SEO & Infrastructure', () => {
    test('robots.txt: accessible and has rules', async ({ page }) => {
        const response = await page.request.get('/robots.txt');
        expect(response.status()).toBe(200);
        const body = await response.text();
        expect(body).toContain('User-Agent');
        expect(body.toLowerCase()).toContain('sitemap');
    });

    test('sitemap.xml: accessible and has URLs', async ({ page }) => {
        const response = await page.request.get('/sitemap.xml');
        expect(response.status()).toBe(200);
        const body = await response.text();
        expect(body).toContain('<urlset');
        expect(body).toContain('/privacy');
        expect(body).toContain('/terms');
    });

    test('Security headers: X-Content-Type-Options', async ({ page }) => {
        const response = await page.goto('/');
        expect(response?.headers()['x-content-type-options']).toBe('nosniff');
    });

    test('Security headers: X-Frame-Options', async ({ page }) => {
        const response = await page.goto('/');
        const xfo = response?.headers()['x-frame-options'];
        expect(xfo).toMatch(/DENY|SAMEORIGIN/i);
    });

    test('Security headers: Content-Security-Policy', async ({ page }) => {
        const response = await page.goto('/');
        expect(response?.headers()['content-security-policy']).toBeTruthy();
    });

    test('OpenGraph: landing page has og:title', async ({ page }) => {
        await page.goto('/');
        const ogTitle = page.locator('meta[property="og:title"]');
        await expect(ogTitle).toHaveCount(1);
    });

    test('Health endpoint: returns 200', async ({ page }) => {
        const response = await page.request.get('/api/health');
        expect(response.status()).toBe(200);
    });

    test('Privacy page renders', async ({ page }) => {
        await page.goto('/privacy');
        await expect(page.locator('main, article, [role="main"]').first()).toBeVisible();
    });

    test('Terms page renders', async ({ page }) => {
        await page.goto('/terms');
        await expect(page.locator('main, article, [role="main"]').first()).toBeVisible();
    });
});
