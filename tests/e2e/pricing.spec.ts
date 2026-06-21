import { test, expect } from '@playwright/test';

test.describe('Pricing page', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/pricing');
    });

    test('Page: 3 pricing cards visible', async ({ page }) => {
        await expect(page.getByText('Free').first()).toBeVisible();
        await expect(page.getByText('Starter Pack')).toBeVisible();
        await expect(page.getByText('Value Pack')).toBeVisible();
    });

    test('Free tier: shows "Free" with features', async ({ page }) => {
        await expect(page.getByText('3 coloring pages per day')).toBeVisible();
        await expect(page.getByText('No credit card needed')).toBeVisible();
    });

    test('Starter Pack: shows price and page count', async ({ page }) => {
        await expect(page.getByText(/\$2\.99/)).toBeVisible();
        await expect(page.getByText('25 coloring pages')).toBeVisible();
    });

    test('Value Pack: shows price, pages, and savings badge', async ({ page }) => {
        await expect(page.getByText(/\$6\.99/)).toBeVisible();
        await expect(page.getByText('75 coloring pages')).toBeVisible();
        await expect(page.getByText('Save 33%')).toBeVisible();
    });

    test('CTA: Free tier links to /home', async ({ page }) => {
        await expect(page.getByRole('link', { name: /Get started/i })).toHaveAttribute('href', '/home');
    });

    test('CTA: paid tiers have pack buttons', async ({ page }) => {
        await expect(page.getByRole('button', { name: /Get small pack/i })).toBeVisible();
        await expect(page.getByRole('button', { name: /Get large pack/i })).toBeVisible();
    });
});

test.describe('Landing pricing section', () => {
    test('Landing: same 3 cards visible', async ({ page }) => {
        await page.goto('/');
        const pricingSection = page.locator('#pricing');
        await expect(pricingSection.getByText('Free').first()).toBeVisible();
        await expect(pricingSection.getByText('Starter Pack')).toBeVisible();
        await expect(pricingSection.getByText('Value Pack')).toBeVisible();
    });
});

test.describe('INR pricing', () => {
    test('Indian users see ₹ prices', async ({ browser }) => {
        const context = await browser.newContext({
            storageState: './tests/.auth/user.json',
            extraHTTPHeaders: { 'cf-ipcountry': 'IN' },
        });
        const page = await context.newPage();
        await page.goto('/pricing');
        await expect(page.getByText(/₹299/)).toBeVisible();
        await context.close();
    });

    test('INR: all 3 tiers show INR amounts', async ({ browser }) => {
        const context = await browser.newContext({
            storageState: './tests/.auth/user.json',
            extraHTTPHeaders: { 'cf-ipcountry': 'IN' },
        });
        const page = await context.newPage();
        await page.goto('/pricing');
        await expect(page.getByText(/₹299/)).toBeVisible();
        await expect(page.getByText(/₹699/)).toBeVisible();
        await context.close();
    });

    test('INR: savings badge still shown', async ({ browser }) => {
        const context = await browser.newContext({
            storageState: './tests/.auth/user.json',
            extraHTTPHeaders: { 'cf-ipcountry': 'IN' },
        });
        const page = await context.newPage();
        await page.goto('/pricing');
        await expect(page.getByText('Save 33%')).toBeVisible();
        await context.close();
    });

    test('Non-India: UK user sees USD', async ({ browser }) => {
        const context = await browser.newContext({
            storageState: './tests/.auth/user.json',
            extraHTTPHeaders: { 'cf-ipcountry': 'GB' },
        });
        const page = await context.newPage();
        await page.goto('/pricing');
        await expect(page.getByText(/\$2\.99/)).toBeVisible();
        await context.close();
    });
});
