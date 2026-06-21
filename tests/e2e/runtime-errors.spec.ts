import { expect, test, type Page } from '@playwright/test';

const routes = ['/home', '/account', '/pricing'];

async function collectRuntimeErrors(page: Page, route: string) {
    const errors: string[] = [];

    page.on('console', (message) => {
        if (message.type() !== 'error') return;
        const text = message.text();
        if (text.includes('Failed to load resource') && text.includes('favicon')) return;
        errors.push(`[console.error] ${text}`);
    });

    page.on('pageerror', (error) => {
        errors.push(`[pageerror] ${error.message}`);
    });

    await page.goto(route);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1_000);

    return errors;
}

test.describe('Runtime error gate', () => {
    for (const route of routes) {
        test(`${route} renders without hydration or console errors`, async ({ page }) => {
            const errors = await collectRuntimeErrors(page, route);
            expect(errors).toEqual([]);
        });
    }
});
