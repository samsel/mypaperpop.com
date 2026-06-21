import { test, expect } from '@playwright/test';
import { waitForWelcome, sendPromptAndWaitForImage } from '../helpers';

test.describe('Conversation sidebar', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/home');
        await waitForWelcome(page);
        // Wait for sidebar to load (requires user SWR data)
        await expect(page.locator('[data-testid="sidebar-new-conversation"]').first()).toBeVisible({ timeout: 15_000 });
    });

    test('Sidebar: "New page" button visible', async ({ page }) => {
        await expect(page.locator('[data-testid="sidebar-new-conversation"]').first()).toBeVisible();
    });

    test('Sidebar: "My Account" link navigates to /account', async ({ page }) => {
        await page.getByRole('link', { name: /My Account/i }).first().click();
        await page.waitForURL(/\/account/);
    });

    test('History: empty state or existing items present', async ({ page }) => {
        // Wait for the sidebar to finish loading (skeletons disappear)
        await expect(async () => {
            const sidebarState = await page.locator('aside').evaluate((node) => ({
                hasEmptyState: node.textContent?.includes('Your sketchpads will live here') ?? false,
                historyItems: node.querySelectorAll('[data-testid="sidebar-history-item"]').length,
            }));
            expect(sidebarState.hasEmptyState || sidebarState.historyItems > 0).toBeTruthy();
        }).toPass({ timeout: 10_000 });
    });

    test('History: items appear after generating an image', async ({ page }) => {
        await sendPromptAndWaitForImage(page, 'A playful kitten');

        await expect(async () => {
            const count = await page.locator('[data-testid="sidebar-history-item"]').count();
            expect(count).toBeGreaterThanOrEqual(1);
        }).toPass({ timeout: 10_000 });
    });

    test('History: click item loads conversation and shows image', async ({ page }) => {
        await sendPromptAndWaitForImage(page, 'A sleeping bear');

        // Start new conversation
        await page.locator('[data-testid="sidebar-new-conversation"]').first().click();
        await waitForWelcome(page);

        // Click the specific history item we just created
        const historyItem = page.locator('[data-testid="sidebar-history-item"]').filter({ hasText: 'A sleeping bear' }).first();
        await historyItem.locator('button').first().click();

        // Should load the conversation with the image (allow time for API under parallel load)
        await expect(page.locator('[data-testid="message-image"]').first()).toBeVisible({ timeout: 30_000 });
        await expect(page).toHaveURL(/\?c=\d+/);
    });

    test('Delete: context menu has delete option', async ({ page }) => {
        await sendPromptAndWaitForImage(page, 'A swimming fish');

        await expect(async () => {
            const count = await page.locator('[data-testid="sidebar-history-item"]').count();
            expect(count).toBeGreaterThanOrEqual(1);
        }).toPass({ timeout: 10_000 });

        const item = page.locator('[data-testid="sidebar-history-item"]').first();
        await item.hover();
        await item.locator('[data-testid="sidebar-delete-trigger"]').click({ force: true });

        await expect(page.getByRole('menuitem', { name: /Delete/i })).toBeVisible();
    });

    test('Delete: confirmation dialog appears', async ({ page }) => {
        await sendPromptAndWaitForImage(page, 'A tall giraffe');

        await expect(async () => {
            const count = await page.locator('[data-testid="sidebar-history-item"]').count();
            expect(count).toBeGreaterThanOrEqual(1);
        }).toPass({ timeout: 10_000 });

        const item = page.locator('[data-testid="sidebar-history-item"]').first();
        await item.hover();
        await item.locator('[data-testid="sidebar-delete-trigger"]').click({ force: true });
        await page.getByRole('menuitem', { name: /Delete/i }).click();

        await expect(page.getByText(/Delete coloring page\?/i)).toBeVisible();
        await expect(page.getByRole('button', { name: /Cancel/i })).toBeVisible();
    });

    test('Delete: conversation removed from sidebar', async ({ page }) => {
        await sendPromptAndWaitForImage(page, 'A flying eagle');

        // Wait for the conversation to appear in the sidebar
        const targetItem = page.locator('[data-testid="sidebar-history-item"]').filter({ hasText: 'A flying eagle' }).first();
        await expect(targetItem).toBeVisible({ timeout: 10_000 });

        await targetItem.hover();
        await targetItem.locator('[data-testid="sidebar-delete-trigger"]').click({ force: true });
        await page.getByRole('menuitem', { name: /Delete/i }).click();

        // Confirm delete in the dialog
        const dialog = page.locator('[role="dialog"]');
        await dialog.getByRole('button', { name: /^Delete$/ }).click();

        // Wait for the specific item to disappear (deletion API can be slow under parallel load)
        await expect(targetItem).toBeHidden({ timeout: 30_000 });
    });

    test('Sidebar groups by date', async ({ page }) => {
        await sendPromptAndWaitForImage(page, 'A colorful butterfly');

        await expect(async () => {
            const count = await page.locator('[data-testid="sidebar-history-item"]').count();
            expect(count).toBeGreaterThanOrEqual(1);
        }).toPass({ timeout: 10_000 });

        // "Today" group header should be visible for recently created conversations
        await expect(page.getByText('Today', { exact: true }).first()).toBeVisible();
    });
});
