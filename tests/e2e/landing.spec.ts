import { test, expect } from '@playwright/test';

test.describe('Landing page', () => {
    test.use({ storageState: { cookies: [], origins: [] } });

    test.beforeEach(async ({ page }) => {
        await page.goto('/');
    });

    test('Nav: logo and brand mark visible', async ({ page }) => {
        await expect(page.getByLabel('MyPaperPop home')).toBeVisible();
    });

    test('Nav: unauthenticated user sees sign-up CTA', async ({ page }) => {
        await expect(page.locator('nav').getByRole('button', { name: /Get started free/i })).toBeVisible();
    });

    test('Hero: headline renders', async ({ page }) => {
        await expect(page.getByRole('heading', { level: 1, name: /Coloring pages for any wish/i })).toBeVisible();
    });

    test('Demo: textarea and suggestion chips', async ({ page }) => {
        await expect(page.getByPlaceholder(/corgi knight/i)).toBeVisible();
        const chips = page.locator('section').first().locator('button').filter({ hasText: /.{5,}/ });
        await expect(chips.first()).toBeVisible();
        expect(await chips.count()).toBeGreaterThanOrEqual(3);
    });

    test('Demo: clicking chip opens sign-in flow for unauthenticated user', async ({ page }) => {
        const chip = page.locator('section').first().locator('button').filter({ hasText: /.{5,}/ }).first();
        await chip.click();
        await expect(page).toHaveURL(/#sign-in/);
    });

    test('Demo: typing and Enter opens sign-in flow for unauthenticated user', async ({ page }) => {
        const textarea = page.getByPlaceholder(/corgi knight/i);
        await textarea.fill('A friendly dinosaur');
        await textarea.press('Enter');
        await expect(page).toHaveURL(/#sign-in/);
    });

    test('How It Works: 3 steps rendered', async ({ page }) => {
        await expect(page.getByText(/How it works/i)).toBeVisible();
        await expect(page.getByRole('heading', { name: /Three steps/i })).toBeVisible();
        await expect(page.getByText('Describe it')).toBeVisible();
        await expect(page.getByText('Chat to change it')).toBeVisible();
        await expect(page.getByText('Print the keeper')).toBeVisible();
    });

    test('Audience proof: parents and teachers section visible', async ({ page }) => {
        await expect(page.getByRole('heading', { name: /Boredom buster/i })).toBeVisible();
        await expect(page.getByRole('heading', { name: /worksheet for every lesson plan/i })).toBeVisible();
    });

    test('Gallery: images rendered', async ({ page }) => {
        await expect(page.getByRole('heading', { name: /Real prompts, real kids/i })).toBeVisible();
        await page.locator('#gallery').scrollIntoViewIfNeeded();
        const galleryImages = page.getByTestId('desktop-gallery-grid').locator('img');
        await expect(galleryImages.first()).toBeVisible();
        expect(await galleryImages.count()).toBeGreaterThanOrEqual(3);
    });

    test('Pricing section: 3 tier cards', async ({ page }) => {
        const pricingSection = page.locator('#pricing');
        await pricingSection.scrollIntoViewIfNeeded();
        await expect(page.getByRole('heading', { name: /Pay once/i })).toBeVisible();
        await expect(pricingSection.getByRole('heading', { name: 'Free' })).toBeVisible();
        await expect(pricingSection.getByText('Starter Pack')).toBeVisible();
        await expect(pricingSection.getByText('Value Pack')).toBeVisible();
    });

    test('Pricing: prices displayed', async ({ page }) => {
        const pricingSection = page.locator('#pricing');
        await expect(pricingSection.getByText(/\$2\.99/)).toBeVisible();
        await expect(pricingSection.getByText(/\$6\.99/)).toBeVisible();
    });

    test('Pricing: savings badge', async ({ page }) => {
        await expect(page.locator('#pricing').getByText('Save 33%')).toBeVisible();
    });

    test('Bottom CTA: auth user sees final CTA', async ({ page }) => {
        await expect(page.getByRole('link', { name: /Start drawing free/i })).toBeVisible();
    });

    test('Footer: links present', async ({ page }) => {
        const footer = page.locator('footer');
        await expect(footer.getByRole('link', { name: /Privacy/i })).toBeVisible();
        await expect(footer.getByRole('link', { name: /Terms/i })).toBeVisible();
    });
});
