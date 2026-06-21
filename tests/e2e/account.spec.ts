import { test, expect } from '@playwright/test';

const expectedUserName = process.env.TEST_USER_NAME ?? 'Demo Test User';
const expectedUserEmail = process.env.TEST_USER_EMAIL ?? 'demo-test-user@example.com';

test.describe('Account page', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/account');
    });

    test('Page heading: "Account"', async ({ page }) => {
        await expect(page.getByRole('heading', { level: 1, name: /Account/i })).toBeVisible();
    });

    test('Account info: name and email displayed', async ({ page }) => {
        await expect(page.getByText('Account Information')).toHaveCount(0);
        await expect(page.getByRole('heading', { level: 2, name: expectedUserName })).toBeVisible();
        await expect(page.locator('#profile').getByText(expectedUserEmail)).toBeVisible();
    });

    test('Coloring Pages card visible', async ({ page }) => {
        await expect(page.getByText(/Coloring pages/i).first()).toBeVisible();
    });

    test('Daily usage or credit info shown', async ({ page }) => {
        await expect(page.getByText(/free pages today/i)).toBeVisible();
    });

    test('"Get More Coloring Pages" link to /pricing', async ({ page }) => {
        const link = page.getByRole('link', { name: /Get More Coloring Pages/i });
        await expect(link).toBeVisible();
        await expect(link).toHaveAttribute('href', '/pricing');
    });

    test('Purchase history card visible', async ({ page }) => {
        await expect(page.getByText('Purchase History')).toBeVisible();
    });

    test('Delete account section: shows input and warning', async ({ page }) => {
        await expect(page.getByRole('heading', { level: 2, name: /Delete account/i })).toBeVisible();
        await expect(page.getByText(/Account deletion is non-reversible/i)).toBeVisible();
        await expect(page.getByPlaceholder('DELETE')).toBeVisible();
    });

    test('Sign out section: button visible', async ({ page }) => {
        await expect(page.getByRole('button', { name: /Sign out/i })).toBeVisible();
    });

    test('Page renders all main cards', async ({ page }) => {
        await expect(page.locator('#profile')).toBeVisible();
        await expect(page.getByText(/Coloring pages/i).first()).toBeVisible();
        await expect(page.getByText(/Purchase history/i)).toBeVisible();
    });

    test('Uses app shell and removes inactive profile edit action', async ({ page }) => {
        await expect(page.getByRole('button', { name: /New page/i })).toBeVisible();
        await expect(page.getByRole('link', { name: /Make a page/i })).toHaveCount(0);
        await expect(page.getByRole('button', { name: /^Edit$/i })).toHaveCount(0);
    });

    test('Settings nav activates target sections', async ({ page }) => {
        const billing = page.getByRole('button', { name: /Coloring pages & billing/i });
        await billing.click();
        await expect(billing).toHaveAttribute('aria-current', 'page');
        await expect(page).toHaveURL(/#credits$/);

        const deleteAccount = page.getByRole('button', { name: /Delete account/i }).first();
        await deleteAccount.click();
        await expect(deleteAccount).toHaveAttribute('aria-current', 'page');
        await expect(page).toHaveURL(/#security$/);
    });
});
