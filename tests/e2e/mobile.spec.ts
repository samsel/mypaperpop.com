import { test, expect } from '@playwright/test';
import { waitForWelcome, sendPromptAndWaitForImage } from '../helpers';

/**
 * Open the mobile sidebar and wait for it to be visible.
 * Uses dispatchEvent to bypass @use-gesture/react touch interception.
 */
async function openMobileSidebar(page: import('@playwright/test').Page) {
    const trigger = page.locator('[data-testid="mobile-menu-trigger"]');
    await expect(trigger).toBeVisible();
    await trigger.dispatchEvent('click');
    await expect(page.locator('[data-testid="mobile-sidebar-overlay"]')).toBeVisible({ timeout: 5_000 });
}

/**
 * Close the mobile sidebar via X button and wait for it to hide.
 * Uses dispatchEvent to bypass @use-gesture/react touch interception on sidebar panel.
 */
async function closeMobileSidebar(page: import('@playwright/test').Page) {
    await page.locator('[data-testid="mobile-sidebar-close"]').dispatchEvent('click');
    await expect(page.locator('[data-testid="mobile-sidebar-overlay"]')).toBeHidden({ timeout: 5_000 });
}

test.describe('Mobile', () => {
    test('Landing: hero visible on mobile', async ({ page }) => {
        await page.goto('/');
        await expect(page.getByRole('heading', { level: 1, name: /Coloring pages for any wish/i })).toBeVisible();
        const cta = page.getByRole('button', { name: /Get started free/i });
        await expect(cta).toBeVisible();
        const ctaStyles = await cta.evaluate((node) => {
            const styles = window.getComputedStyle(node);
            const box = node.getBoundingClientRect();
            return {
                alignItems: styles.alignItems,
                display: styles.display,
                height: box.height,
                justifyContent: styles.justifyContent,
                lineHeight: styles.lineHeight,
                whiteSpace: styles.whiteSpace,
            };
        });
        expect(['block', 'inline-flex', 'flex']).toContain(ctaStyles.display);
        expect(ctaStyles.whiteSpace).toBe('nowrap');
        expect(ctaStyles.height).toBeGreaterThanOrEqual(44);
        expect(Number.parseFloat(ctaStyles.lineHeight)).toBeGreaterThanOrEqual(14);
    });

    test('Mobile header: hamburger menu visible', async ({ page }) => {
        await page.goto('/home');
        await waitForWelcome(page);
        await expect(page.locator('[data-testid="mobile-menu-trigger"]')).toBeVisible();
    });

    test('Sidebar: opens on menu click', async ({ page }) => {
        await page.goto('/home');
        await waitForWelcome(page);
        await openMobileSidebar(page);
        await expect(page.locator('[data-testid="sidebar-new-conversation"]').last()).toBeVisible();
    });

    test('Sidebar: closes on X button', async ({ page }) => {
        await page.goto('/home');
        await waitForWelcome(page);
        await openMobileSidebar(page);
        await closeMobileSidebar(page);
    });

    test('Sidebar: closes on backdrop click', async ({ page }) => {
        await page.goto('/home');
        await waitForWelcome(page);
        await openMobileSidebar(page);

        // Click the backdrop (dispatchEvent to bypass potential touch interception)
        await page.locator('[data-testid="mobile-sidebar-backdrop"]').dispatchEvent('click');

        await expect(page.locator('[data-testid="mobile-sidebar-overlay"]')).toBeHidden({ timeout: 5_000 });
    });

    test('Chat: renders properly on mobile', async ({ page }) => {
        await page.goto('/home');
        await waitForWelcome(page);
        await expect(page.locator('[data-testid="chat-input"]')).toBeVisible();
    });

    test('Home empty state fits mobile viewport with text-only starter prompts', async ({ page }) => {
        await page.goto('/home');
        await waitForWelcome(page);

        await expect(page.locator('[data-testid="prompt-pack-prompts"] img')).toHaveCount(0);
        await expect(page.locator('[data-testid="prompt-pack-prompts"] button')).toHaveCount(6);

        const layout = await page.evaluate(() => ({
            documentWidth: document.documentElement.scrollWidth,
            viewportWidth: document.documentElement.clientWidth,
            firstPromptRight: document
                .querySelector('[data-testid="prompt-pack-prompts"] button')
                ?.getBoundingClientRect().right ?? 0,
            tabsFitViewport: Array.from(document.querySelectorAll('[data-testid="prompt-pack-tabs"] button')).every((button) => {
                const rect = button.getBoundingClientRect();
                return rect.left >= 0 && rect.right <= document.documentElement.clientWidth;
            }),
        }));

        expect(layout.documentWidth).toBeLessThanOrEqual(layout.viewportWidth);
        expect(layout.firstPromptRight).toBeLessThanOrEqual(layout.viewportWidth);
        expect(layout.tabsFitViewport).toBe(true);
    });

    test('Chat: image generation works', async ({ page }) => {
        await page.goto('/home');
        await waitForWelcome(page);
        await sendPromptAndWaitForImage(page, 'A happy sun');
        await expect(page.locator('[data-testid="message-image"]').first()).toBeVisible();
    });

    test('Chat: selecting conversation from sidebar', async ({ page }) => {
        await page.goto('/home');
        await waitForWelcome(page);
        await sendPromptAndWaitForImage(page, 'A cool car');

        // Open sidebar
        await openMobileSidebar(page);

        // Wait for history item to appear
        await expect(async () => {
            const count = await page.locator('[data-testid="sidebar-history-item"]').count();
            expect(count).toBeGreaterThanOrEqual(1);
        }).toPass({ timeout: 10_000 });

        // Click a conversation (dispatchEvent to bypass touch interception)
        await page.locator('[data-testid="sidebar-history-item"]').last().locator('button').first().dispatchEvent('click');

        // Conversation should load
        await expect(page.locator('[data-testid="message-image"]').first()).toBeVisible({ timeout: 30_000 });
    });

    test('Account: renders on mobile', async ({ page }) => {
        await page.goto('/account');
        await expect(page.getByRole('heading', { level: 1, name: /My Account/i })).toBeVisible();
    });

    test('Account: navigate from mobile sidebar', async ({ page }) => {
        await page.goto('/home');
        await waitForWelcome(page);
        await openMobileSidebar(page);
        // dispatchEvent on the link to bypass touch interception inside sidebar panel
        await page.getByRole('link', { name: /My Account/i }).last().dispatchEvent('click');
        await page.waitForURL(/\/account/, { timeout: 15_000 });
    });

    test('Pricing: cards display on mobile', async ({ page }) => {
        await page.goto('/pricing');
        await expect(page.getByText('Free').first()).toBeVisible();
        await expect(page.getByText('Starter Pack')).toBeVisible();
        await expect(page.getByText('Value Pack')).toBeVisible();
    });
});
