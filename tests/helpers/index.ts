import { type Page, type Browser, expect } from '@playwright/test';

/** Wait for the chat welcome state to be fully rendered. */
export async function waitForWelcome(page: Page) {
    await expect(page.locator('[data-testid="chat-welcome"]')).toBeVisible({ timeout: 15_000 });
}

/** Submit a chat prompt and wait for the generated image to appear. */
export async function sendPromptAndWaitForImage(page: Page, text: string) {
    await sendPrompt(page, `${text} coloring page with bold black outlines, a simple background, and clear kid-friendly details.`);
    await expect(page.locator('img[alt="Generated coloring page"]').first()).toBeVisible({ timeout: 30_000 });
}

/** Submit a chat prompt without waiting for the image (e.g. CLARIFY path). */
export async function sendPrompt(page: Page, text: string) {
    const textarea = page.getByPlaceholder('Describe your idea...');
    await textarea.fill(text);
    await textarea.press('Enter');
}

/** Open the mobile sidebar by clicking the hamburger menu. */
export async function openMobileSidebar(page: Page) {
    const trigger = page.locator('button[data-sidebar="trigger"]');
    await trigger.click();
    await expect(page.locator('[data-sidebar="sidebar"]')).toBeVisible();
}

/** Create a fresh browser context without authentication (for unauth tests). */
export async function createUnauthContext(browser: Browser) {
    return browser.newContext();
}

/** Extract conversation ID from the current URL's ?c= query param. */
export function getConversationIdFromUrl(page: Page): string | null {
    const url = new URL(page.url());
    return url.searchParams.get('c');
}
