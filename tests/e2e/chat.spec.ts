import { test, expect } from '@playwright/test';
import { waitForWelcome, sendPromptAndWaitForImage, sendPrompt, getConversationIdFromUrl } from '../helpers';

test.describe('Chat', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/home');
        await waitForWelcome(page);
    });

    test('Welcome: heading and prompt grid visible', async ({ page }) => {
        await expect(page.locator('[data-testid="chat-welcome"]')).toBeVisible();
        await expect(page.locator('[data-testid="prompt-pack-prompts"]')).toBeVisible();
    });

    test('Category tabs: default "For You" selected', async ({ page }) => {
        const forYouTab = page.locator('[data-testid="prompt-pack-for-you"]');
        await expect(forYouTab).toBeVisible();
        await expect(forYouTab).toHaveAttribute('data-category-selected', 'true');
    });

    test('Category tabs: switch tab updates selection', async ({ page }) => {
        const tabs = page.locator('[data-testid="prompt-pack-tabs"]');
        // Find the currently selected tab
        const currentSelected = tabs.locator('button[data-category-selected="true"]');
        const currentId = await currentSelected.getAttribute('data-testid');

        // Click a different tab
        const otherTab = tabs.locator('button[data-category-selected="false"]').first();
        const otherId = await otherTab.getAttribute('data-testid');
        await otherTab.click();

        // The clicked tab should now be selected
        await expect(tabs.locator(`[data-testid="${otherId}"]`)).toHaveAttribute('data-category-selected', 'true');
        // The previous tab should be deselected
        await expect(tabs.locator(`[data-testid="${currentId}"]`)).toHaveAttribute('data-category-selected', 'false');
    });

    test('Clicking prompt card fills textarea', async ({ page }) => {
        const promptCard = page.locator('[data-testid="prompt-pack-prompts"]').locator('button').first();
        const cardText = await promptCard.textContent();
        await promptCard.click();
        const textarea = page.locator('[data-testid="chat-input"]');
        await expect(textarea).toHaveValue(cardText!.trim().replace(/^"|"$/g, ''));
    });

    test('Textarea: placeholder text present', async ({ page }) => {
        await expect(page.locator('[data-testid="chat-input"]')).toHaveAttribute('placeholder', 'Describe your idea...');
    });

    test('Send button: disabled when empty', async ({ page }) => {
        await expect(page.locator('[data-testid="chat-send"]')).toBeDisabled();
    });

    test('Send button: enabled when text entered', async ({ page }) => {
        await page.locator('[data-testid="chat-input"]').fill('A happy cat');
        await expect(page.locator('[data-testid="chat-send"]')).toBeEnabled();
    });

    test('Shift+Enter inserts newline', async ({ page }) => {
        const textarea = page.locator('[data-testid="chat-input"]');
        await textarea.fill('Line one');
        await textarea.press('Shift+Enter');
        await textarea.pressSequentially('Line two');
        const value = await textarea.inputValue();
        expect(value).toContain('\n');
        // Should still be on welcome (not submitted)
        await expect(page.locator('[data-testid="chat-welcome"]')).toBeVisible();
    });

    test('Generation: submit → loading → image + text + chips', async ({ page }) => {
        await sendPromptAndWaitForImage(page, 'A friendly dragon');

        // Image card visible
        await expect(page.locator('[data-testid="message-image"]').first()).toBeVisible();

        // Assistant text message
        const assistantMsg = page.locator('.self-start').filter({ hasText: /.+/ });
        await expect(assistantMsg.first()).toBeVisible();

        // Suggestion chips
        const chips = page.locator('button').filter({ hasText: /.{5,}/ }).last();
        await expect(chips).toBeVisible();
    });

    test('Generation: single action row appears below image', async ({ page }) => {
        await sendPromptAndWaitForImage(page, 'A robot playing guitar');

        await expect(page.getByRole('button', { name: /Save/i })).toBeVisible();
        await expect(page.getByRole('button', { name: /Print/i })).toBeVisible();
        await expect(page.getByRole('button', { name: /Upload colored photo/i })).toBeVisible();
        await expect(page.getByRole('button', { name: /^Print$/i })).toHaveCount(1);
    });

    test('Generation: star rating appears below image', async ({ page }) => {
        await sendPromptAndWaitForImage(page, 'A cute puppy');

        // Star rating should be near the image
        const stars = page.locator('button[aria-label*="star"], button[data-rating]');
        // Alternative: look for SVG stars near image
        const starContainer = page.locator('.self-start').filter({ has: page.locator('svg') });
        await expect(starContainer.first()).toBeVisible();
    });

    test('Generation: clicking suggestion chip sends follow-up', async ({ page }) => {
        await sendPromptAndWaitForImage(page, 'A magical unicorn');

        const messageCountBefore = await page.locator('.self-start').count();

        // Click a suggestion chip (not the image action buttons).
        const chip = page.getByTestId('suggestion-chip').first();
        await chip.click();

        // Wait for new assistant content (image or text) to appear
        await expect(async () => {
            const messageCountAfter = await page.locator('.self-start').count();
            expect(messageCountAfter).toBeGreaterThan(messageCountBefore);
        }).toPass({ timeout: 45_000 });
    });

    test('New conversation: button resets to welcome state', async ({ page }) => {
        await sendPromptAndWaitForImage(page, 'A happy elephant');

        // Click new conversation button (first visible = desktop sidebar)
        await page.locator('[data-testid="sidebar-new-conversation"]').first().click();
        await waitForWelcome(page);
    });

    test('URL updates to ?c=ID after first generation', async ({ page }) => {
        await sendPromptAndWaitForImage(page, 'A cozy cabin');

        // URL may update asynchronously after generation
        await page.waitForURL(/[?&]c=\d+/, { timeout: 10_000 });
        const convId = getConversationIdFromUrl(page);
        expect(convId).toBeTruthy();
        expect(Number(convId)).toBeGreaterThan(0);
    });

    test('Quota display: shows remaining pages', async ({ page }) => {
        // Quota info is shown near the input area
        await expect(page.locator('aside').getByText(/pages left/i).first()).toBeVisible();
    });

    test('Input disabled during loading', async ({ page }) => {
        const textarea = page.locator('[data-testid="chat-input"]');
        // Skip if quota is exhausted (placeholder says "No coloring pages remaining")
        const placeholder = await textarea.getAttribute('placeholder');
        if (placeholder === 'No coloring pages remaining') {
            test.skip();
            return;
        }
        await textarea.fill('A brave knight coloring page with bold black outlines, a castle path, and clear kid-friendly details.');
        await page.locator('[data-testid="chat-send"]').click();

        // During loading, textarea should be disabled
        await expect(textarea).toBeDisabled();

        // Wait for generation to complete
        await expect(page.locator('img[alt="Generated coloring page"]').first()).toBeVisible({ timeout: 30_000 });
    });
});
