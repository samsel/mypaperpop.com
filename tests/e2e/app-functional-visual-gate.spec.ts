import { expect, test, type Locator, type Page, type TestInfo } from '@playwright/test';
import { waitForWelcome } from '../helpers';

const sketchDataUrl = `data:image/svg+xml;base64,${Buffer.from(`
<svg xmlns="http://www.w3.org/2000/svg" width="900" height="1200" viewBox="0 0 900 1200">
  <rect width="900" height="1200" fill="white"/>
  <g fill="none" stroke="#111" stroke-width="18" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="450" cy="300" r="135"/>
    <path d="M330 255c35-45 205-45 240 0"/>
    <path d="M385 315h5M510 315h5"/>
    <path d="M390 385c45 35 90 35 135 0"/>
    <path d="M290 530c80-85 240-105 340 0 95 100 75 280-15 360-95 85-255 85-350 0-90-80-110-260 25-360z"/>
    <path d="M285 600c-70 40-115 95-135 170M615 600c70 40 115 95 135 170"/>
    <path d="M345 930l-50 125M555 930l50 125"/>
    <path d="M330 1090h-85M570 1090h85"/>
    <circle cx="450" cy="690" r="72"/>
    <path d="M410 690h80M450 650v80"/>
  </g>
</svg>
`).toString('base64')}`;

const sketchBase64 =
    'iVBORw0KGgoAAAANSUhEUgAAASwAAAEsCAIAAAD2HxkiAAABpElEQVR4nO3VMQ0AMAzAsHj/0yOdhQVUQBp8s9XtAQAAfOtr9wAAwL8QWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWAQWDxA1ThB9cU1Y1KAAAAAElFTkSuQmCC';

async function attachViewportScreenshot(page: Page, testInfo: TestInfo, name: string) {
    const screenshot = await page.screenshot({ fullPage: false });
    await testInfo.attach(name, { body: screenshot, contentType: 'image/png' });
}

async function expectNoHorizontalOverflow(page: Page) {
    const metrics = await page.evaluate(() => ({
        clientWidth: document.documentElement.clientWidth,
        scrollWidth: document.documentElement.scrollWidth,
    }));
    expect(metrics.scrollWidth, 'app viewport should not horizontally overflow').toBeLessThanOrEqual(metrics.clientWidth + 2);
}

async function expectVisibleBox(locator: Locator, label: string) {
    await expect(locator, `${label} should be visible`).toBeVisible();
    const box = await locator.boundingBox();
    expect(box, `${label} should have a rendered box`).toBeTruthy();
    expect(box!.width, `${label} should not collapse horizontally`).toBeGreaterThan(24);
    expect(box!.height, `${label} should not collapse vertically`).toBeGreaterThan(24);
}

async function expectTapTarget(locator: Locator, label: string) {
    const box = await locator.boundingBox();
    expect(box, `${label} should have a rendered box`).toBeTruthy();
    expect(box!.height, `${label} should be touch-friendly`).toBeGreaterThanOrEqual(40);
}

async function expectSelectedAgePillContrast(page: Page, value: string, label: string) {
    const pill = page.locator(`[data-testid="age-group-pill"][data-value="${value}"]`);
    await expect(pill).toHaveAttribute('data-age-selected', 'true');
    const styles = await pill.evaluate((node) => {
        const computed = getComputedStyle(node);
        return {
            backgroundColor: computed.backgroundColor,
            color: computed.color,
            borderColor: computed.borderColor,
        };
    });
    expect(styles.color, `${label} selected text should be white`).toBe('rgb(255, 255, 255)');
    expect(styles.backgroundColor, `${label} selected background should not be the paper surface`).not.toBe('rgb(251, 246, 236)');
    expect(styles.backgroundColor, `${label} selected background should match the ink border`).toBe(styles.borderColor);
}

async function mockGeneratedConversation(page: Page) {
    await page.route('**/api/conversations', async (route) => {
        if (route.request().method() !== 'POST') return route.fallback();
        await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
                conversation: { id: 9090, title: 'Visual Gate Test' },
                messages: [
                    {
                        id: 777,
                        role: 'assistant',
                        content: 'Here is your coloring page.',
                        imageUrl: sketchDataUrl,
                        downloadUrl: sketchDataUrl,
                        promptUsed: 'A turtle astronaut',
                        suggestions: ['Make lines bolder', 'Add moon rocks', 'Simpler background'],
                    },
                ],
                remaining: 99,
            }),
        });
    });
}

test.describe('App functional visual production gate - desktop', () => {
    test.skip(
        ({ isMobile }) => isMobile,
        'Desktop visual flow runs only in the desktop gate project.',
    );

    test('desktop app flow visually passes from welcome to generated image actions', async ({ page }, testInfo) => {
        await mockGeneratedConversation(page);
        await page.goto('/home');
        await waitForWelcome(page);
        await expectNoHorizontalOverflow(page);

        await expectVisibleBox(page.getByTestId('chat-welcome'), 'desktop welcome panel');
        await expect(page.getByTestId('prompt-pack-tabs').locator('button')).toHaveCount(9);
        await expect(page.getByTestId('prompt-pack-prompts').locator('button')).toHaveCount(6);
        await expect(page.getByTestId('prompt-pack-prompts').locator('img')).toHaveCount(0);
        await attachViewportScreenshot(page, testInfo, '01-desktop-welcome');

        const tabs = page.getByTestId('prompt-pack-tabs');
        const unselectedTab = tabs.locator('button[data-category-selected="false"]').first();
        const unselectedTabId = await unselectedTab.getAttribute('data-testid');
        await expectTapTarget(unselectedTab, 'desktop category tab');
        await unselectedTab.click();
        await expect(page.getByTestId(unselectedTabId!)).toHaveAttribute('data-category-selected', 'true');

        const firstPrompt = page.getByTestId('prompt-pack-prompts').locator('button').first();
        await expectTapTarget(firstPrompt, 'desktop prompt card');
        const promptText = (await firstPrompt.textContent())!.trim().replace(/^"|"$/g, '');
        await firstPrompt.click();
        await expect(page.getByTestId('chat-input')).toHaveValue(promptText);
        await expect(page.getByTestId('chat-send')).toBeEnabled();
        await attachViewportScreenshot(page, testInfo, '02-desktop-selected-prompt');

        await page.locator('[data-testid="age-group-pill"][data-value="under-4"]').click();
        await expectSelectedAgePillContrast(page, 'under-4', 'desktop Under 4 age pill');
        await attachViewportScreenshot(page, testInfo, '02b-desktop-under-4-contrast');

        await page.getByTestId('chat-input').fill('A turtle astronaut');
        await page.getByTestId('chat-send').click();
        await expect(page.getByTestId('message-image').first()).toBeVisible();
        await expect(page.getByRole('button', { name: /^Print$/i })).toBeVisible();
        await expect(page.getByRole('button', { name: /^Save$/i })).toBeVisible();
        await expect(page.getByRole('button', { name: /Upload colored photo/i })).toBeVisible();
        await expect(page.getByTestId('suggestion-chip')).toHaveCount(3);
        await expectNoHorizontalOverflow(page);
        await attachViewportScreenshot(page, testInfo, '03-desktop-generated-actions');
    });
});

test.describe('App functional visual production gate - mobile', () => {
    test.skip(
        ({ isMobile }) => !isMobile,
        'Mobile visual flow runs only in the mobile gate project.',
    );

    test('mobile app flow visually passes controls, keyboard focus, sidebar, and generated actions', async ({ page }, testInfo) => {
        await mockGeneratedConversation(page);
        await page.goto('/home');
        await waitForWelcome(page);
        await expectNoHorizontalOverflow(page);

        await expectVisibleBox(page.getByTestId('mobile-menu-trigger'), 'mobile menu trigger');
        await expect(page.getByTestId('chat-welcome')).toBeVisible();
        await expect(page.getByTestId('prompt-pack-tabs').locator('button')).toHaveCount(9);
        await expect(page.getByTestId('prompt-pack-prompts').locator('button')).toHaveCount(6);
        await attachViewportScreenshot(page, testInfo, '01-mobile-welcome');

        const firstPrompt = page.getByTestId('prompt-pack-prompts').locator('button').first();
        await expectTapTarget(firstPrompt, 'mobile prompt card');
        await firstPrompt.dispatchEvent('click');
        await expect(page.getByTestId('chat-input')).not.toHaveValue('');
        await expect(page.getByTestId('chat-send')).toBeEnabled();
        await attachViewportScreenshot(page, testInfo, '02-mobile-selected-prompt');

        await page.locator('[data-testid="age-group-pill"][data-value="under-4"]').dispatchEvent('click');
        await expectSelectedAgePillContrast(page, 'under-4', 'mobile Under 4 age pill');
        await attachViewportScreenshot(page, testInfo, '02b-mobile-under-4-contrast');

        const textarea = page.getByTestId('chat-input');
        await textarea.focus();
        await expect(textarea).toBeFocused();
        const focusedLayout = await page.evaluate(() => {
            const input = document.querySelector('[data-testid="chat-input"]');
            const composer = input?.closest('.safe-area-bottom');
            const rect = composer?.getBoundingClientRect();
            return {
                composerBottom: rect?.bottom ?? 0,
                composerTop: rect?.top ?? 0,
                viewportHeight: window.innerHeight,
            };
        });
        expect(focusedLayout.composerBottom, 'mobile composer should remain inside the visible viewport').toBeLessThanOrEqual(focusedLayout.viewportHeight + 2);
        expect(focusedLayout.composerTop, 'mobile composer should remain tappable after focus').toBeGreaterThan(0);
        await attachViewportScreenshot(page, testInfo, '03-mobile-focused-composer');

        await page.getByTestId('mobile-menu-trigger').dispatchEvent('click');
        await expectVisibleBox(page.getByTestId('mobile-sidebar-overlay'), 'mobile sidebar overlay');
        await expectVisibleBox(page.getByTestId('sidebar-new-conversation').last(), 'mobile new conversation button');
        await expectNoHorizontalOverflow(page);
        await attachViewportScreenshot(page, testInfo, '04-mobile-sidebar');
        await page.getByTestId('mobile-sidebar-close').dispatchEvent('click');
        await expect(page.getByTestId('mobile-sidebar-overlay')).toBeHidden();

        await page.getByTestId('chat-input').fill('A turtle astronaut');
        await page.getByTestId('chat-input').press('Enter');
        await expect(page.getByTestId('message-image').first()).toBeVisible({ timeout: 15_000 });
        await expect(page.getByRole('button', { name: /^Print$/i })).toBeVisible();
        await expect(page.getByRole('button', { name: /^Save$/i })).toBeVisible();
        await expect(page.getByRole('button', { name: /Upload colored photo/i })).toBeVisible();
        await expectNoHorizontalOverflow(page);
        await attachViewportScreenshot(page, testInfo, '05-mobile-generated-actions');
    });

    test('mobile print action renders the image-only print surface in browser print media', async ({ page }, testInfo) => {
        await mockGeneratedConversation(page);
        await page.addInitScript(() => {
            Object.assign(window, { __mypaperpopDisableAutoPdfOpen: true });
            Object.defineProperty(window, 'print', {
                configurable: true,
                value: () => {
                    Object.assign(window, { __mypaperpopPrintCalled: true });
                },
            });
        });
        await page.goto('/home');
        await waitForWelcome(page);

        await page.getByTestId('chat-input').fill('A turtle astronaut');
        await page.getByTestId('chat-input').press('Enter');
        await expect(page.getByTestId('message-image').first()).toBeVisible();
        await page.getByTestId('message-image').first().getByRole('button', { name: /Print/i }).dispatchEvent('click');
        await expect(page).toHaveURL(/\/print$/);
        await expect(page.locator('.print-document')).toBeVisible();
        await expect(page.locator('.print-pdf-frame')).toHaveCount(0);
        await expect(page.getByTestId('print-pdf-link')).toHaveAttribute('href', /^blob:/);
        const printPreviewImage = page.getByTestId('print-preview-image');
        await expect(printPreviewImage).toBeVisible();
        await expect(printPreviewImage).toHaveJSProperty('complete', true);
        const previewSize = await printPreviewImage.evaluate((node) => {
            const image = node as HTMLImageElement;
            return {
                width: image.naturalWidth,
                height: image.naturalHeight,
                ratio: image.naturalWidth / image.naturalHeight,
            };
        });
        expect(previewSize.width, 'print artifact should be high-resolution US Letter width').toBe(2448);
        expect(previewSize.height, 'print artifact should be high-resolution US Letter height').toBe(3168);
        expect(previewSize.ratio, 'print artifact should stay portrait US Letter, even for wide art').toBeCloseTo(612 / 792, 2);
        const previewHasInk = await printPreviewImage.evaluate((node) => {
            const image = node as HTMLImageElement;
            const canvas = document.createElement('canvas');
            canvas.width = image.naturalWidth;
            canvas.height = image.naturalHeight;
            const context = canvas.getContext('2d', { willReadFrequently: true });
            if (!context || image.naturalWidth === 0 || image.naturalHeight === 0) return false;
            context.drawImage(image, 0, 0);
            const { data } = context.getImageData(0, 0, canvas.width, canvas.height);
            let darkPixels = 0;
            for (let offset = 0; offset < data.length; offset += 4) {
                if (data[offset + 3] > 16 && Math.min(data[offset], data[offset + 1], data[offset + 2]) < 180) {
                    darkPixels += 1;
                }
            }
            return darkPixels > 1000;
        });
        expect(previewHasInk, 'mobile print preview should show the coloring page, not a blank PDF surface').toBe(true);
        await expect.poll(
            () => page.evaluate(() => Boolean((window as typeof window & { __mypaperpopPrintCalled?: boolean }).__mypaperpopPrintCalled)),
            { message: 'mobile print regression should not call browser webpage print when PDF auto-open is disabled' },
        ).toBe(false);

        await page.emulateMedia({ media: 'print' });
        const printDocument = page.locator('.print-document');
        await expect(printDocument).toBeVisible();
        await expect(page.locator('.print-toolbar')).toBeHidden();
        await expect(printPreviewImage).toBeVisible();
        await expect(page.getByTestId('chat-input')).toHaveCount(0);
        const printLayout = await printDocument.evaluate((node) => {
            const rect = node.getBoundingClientRect();
            const previewNode = node.querySelector('[data-testid="print-preview-image"]');
            const preview = previewNode?.getBoundingClientRect();
            const hiddenAncestor = previewNode
                ? (() => {
                    let current: Element | null = previewNode;
                    while (current) {
                        const style = window.getComputedStyle(current);
                        if (style.display === 'none' || style.visibility === 'hidden' || Number(style.opacity) === 0) {
                            return current.className || current.tagName;
                        }
                        current = current.parentElement;
                    }
                    return null;
                })()
                : 'missing-preview';
            return {
                rootWidth: rect.width,
                rootHeight: rect.height,
                previewWidth: preview?.width ?? 0,
                previewHeight: preview?.height ?? 0,
                scrollHeight: document.documentElement.scrollHeight,
                viewportHeight: window.innerHeight,
                hiddenAncestor,
            };
        });
        expect(printLayout.hiddenAncestor, 'print image must not sit inside a hidden ancestor in print media').toBeNull();
        expect(printLayout.rootWidth, 'print root should fill the printable viewport').toBeGreaterThan(300);
        expect(printLayout.rootHeight, 'print root should fill the printable viewport').toBeGreaterThan(500);
        expect(printLayout.previewWidth, 'print preview image should render on the page').toBeGreaterThan(300);
        expect(printLayout.previewHeight, 'print preview image should render on the page').toBeGreaterThan(500);
        expect(printLayout.scrollHeight, 'print route should fit on one browser print viewport').toBeLessThanOrEqual(printLayout.viewportHeight + 2);
        await attachViewportScreenshot(page, testInfo, '06-mobile-print-preview-surface');
        await page.emulateMedia({ media: 'screen' });
    });
});
