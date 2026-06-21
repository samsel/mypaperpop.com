import { test, expect } from '@playwright/test';
import { waitForWelcome } from '../helpers';

test.describe('Age group selector', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/home');
        await waitForWelcome(page);
    });

    test('4 age group pills displayed', async ({ page }) => {
        const pills = page.locator('[data-testid="age-group-pill"]');
        await expect(pills).toHaveCount(4);
        await expect(page.locator('[data-testid="age-group-pill"][data-value="under-4"]')).toBeVisible();
        await expect(page.locator('[data-testid="age-group-pill"][data-value="4-7"]')).toBeVisible();
        await expect(page.locator('[data-testid="age-group-pill"][data-value="8-11"]')).toBeVisible();
        await expect(page.locator('[data-testid="age-group-pill"][data-value="12+"]')).toBeVisible();
    });

    test('Ages 8-11 selected by default', async ({ page }) => {
        await expect(
            page.locator('[data-testid="age-group-pill"][data-value="8-11"]')
        ).toHaveAttribute('data-age-selected', 'true');
    });

    test('Clicking pill changes selection', async ({ page }) => {
        const under4 = page.locator('[data-testid="age-group-pill"][data-value="under-4"]');
        await under4.click();
        await expect(under4).toHaveAttribute('data-age-selected', 'true');
        // Previous selection should be deselected
        await expect(
            page.locator('[data-testid="age-group-pill"][data-value="8-11"]')
        ).toHaveAttribute('data-age-selected', 'false');
    });

    test('Selected Under 4 pill keeps readable selected contrast', async ({ page }) => {
        const under4 = page.locator('[data-testid="age-group-pill"][data-value="under-4"]');
        await under4.click();

        const styles = await under4.evaluate((node) => {
            const computed = getComputedStyle(node);
            return {
                backgroundColor: computed.backgroundColor,
                borderColor: computed.borderColor,
                color: computed.color,
            };
        });

        await expect(under4).toHaveAttribute('data-age-selected', 'true');
        expect(styles.color).toBe('rgb(255, 255, 255)');
        expect(styles.backgroundColor).toBe(styles.borderColor);
        expect(styles.backgroundColor).not.toBe('rgb(251, 246, 236)');
    });

    test('Selection persists across page reload', async ({ page }) => {
        const pill47 = page.locator('[data-testid="age-group-pill"][data-value="4-7"]');
        await pill47.click();
        await expect(pill47).toHaveAttribute('data-age-selected', 'true');

        await page.reload();
        await waitForWelcome(page);

        await expect(
            page.locator('[data-testid="age-group-pill"][data-value="4-7"]')
        ).toHaveAttribute('data-age-selected', 'true');
    });

    test('Only one pill active at a time', async ({ page }) => {
        await page.locator('[data-testid="age-group-pill"][data-value="12+"]').click();

        const selectedPills = page.locator('[data-testid="age-group-pill"][data-age-selected="true"]');
        await expect(selectedPills).toHaveCount(1);
    });
});
