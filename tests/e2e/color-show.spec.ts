import { test, expect } from '@playwright/test';
import { waitForWelcome } from '../helpers';

const sketchBase64 =
    'iVBORw0KGgoAAAANSUhEUgAAASwAAAEsCAIAAAD2HxkiAAABpElEQVR4nO3VMQ0AMAzAsHj/0yOdhQVUQBp8s9XtAQAAfOtr9wAAwL8QWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWDxA1ThB9cU1Y1KAAAAAElFTkSuQmCC';

const coloredDataUrl =
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAASwAAAEsCAIAAAD2HxkiAAABlUlEQVR4nO3TMQ0AMAzAsHj/0yOdhQVUQBp8s9XtAQAAfOtr9wAAwL8QWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWDxA+hgB9eIMExgAAAAAElFTkSuQmCC';

async function mockGeneratedConversation(page: import('@playwright/test').Page) {
    await page.route('**/api/conversations', async (route) => {
        if (route.request().method() !== 'POST') return route.fallback();
        await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
                conversation: { id: 4242, title: 'Color Show Test' },
                messages: [
                    {
                        id: 101,
                        role: 'assistant',
                        content: 'Here is your coloring page.',
                        imageUrl: `data:image/png;base64,${sketchBase64}`,
                        downloadUrl: `data:image/png;base64,${sketchBase64}`,
                        promptUsed: 'A rainbow picnic',
                        suggestions: ['Add flowers', 'Make it sillier'],
                    },
                ],
                remaining: 99,
            }),
        });
    });

    await page.route('**/api/conversations/4242/messages/101/colored-photo', async (route) => {
        if (route.request().method() !== 'POST') return route.fallback();
        await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
                coloredPhoto: {
                    id: 55,
                    photoUrl: coloredDataUrl,
                    compositeUrl: coloredDataUrl,
                    compositeDownloadUrl: coloredDataUrl,
                },
            }),
        });
    });
}

test.describe('Color & Show', () => {
    test('upload completes into side-by-side chat card on desktop', async ({ page }) => {
        await mockGeneratedConversation(page);
        await page.goto('/home');
        await waitForWelcome(page);

        await page.getByTestId('chat-input').fill('A rainbow picnic');
        await page.getByTestId('chat-send').click();
        await expect(page.getByRole('button', { name: /Upload colored photo/i })).toBeVisible();

        await page.getByRole('button', { name: /Upload colored photo/i }).click();
        await expect(page.getByRole('heading', { name: 'Color & Show' })).toBeVisible();
        await page.locator('input[type="file"]').first().setInputFiles({
            name: 'colored.png',
            mimeType: 'image/png',
            buffer: Buffer.from(sketchBase64, 'base64'),
        });

        await expect(page.getByTestId('message-image')).toHaveCount(1);
        const showcase = page.getByTestId('showcase-card');
        await expect(showcase).toBeVisible();
        await expect(page.getByAltText(/Made with MyPaperPop/i)).toBeVisible();
        await expect(page.getByText(/Made with MyPaperPop - mypaperpop\.com/i)).toBeVisible();
        await expect(showcase.getByRole('button', { name: /Save/i })).toBeVisible();
        await expect(showcase.getByRole('button', { name: /Share/i })).toBeVisible();
        await expect(showcase.getByRole('button', { name: /Instagram/i })).toBeVisible();
        await page.screenshot({ path: 'test-results/color-show-desktop.png', fullPage: true });
    });

    test('mobile dialog offers Camera and Library choices', async ({ page }) => {
        await page.setViewportSize({ width: 390, height: 844 });
        await mockGeneratedConversation(page);
        await page.goto('/home');
        await waitForWelcome(page);

        await page.getByTestId('chat-input').fill('A rainbow picnic');
        await page.getByTestId('chat-send').click();
        await page.getByRole('button', { name: /Upload colored photo/i }).click();

        await expect(page.getByText('Camera')).toBeVisible();
        await expect(page.getByText('Library')).toBeVisible();
        await page.waitForTimeout(300);
        await page.screenshot({ path: 'test-results/color-show-mobile-dialog.png', fullPage: true });
    });
});
