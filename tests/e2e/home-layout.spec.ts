import { test, expect } from '@playwright/test';
import { waitForWelcome } from '../helpers';

test.describe('Home empty-state layout', () => {
    test('desktop conversation loading stays in the single chat column', async ({ page }) => {
        await page.route('**/api/conversations/17', async (route) => {
            await new Promise((resolve) => setTimeout(resolve, 3_000));
            await route.continue();
        });

        await page.goto('/home?c=17');

        const readLoadingLayout = () => page.evaluate(() => {
            const main = document.querySelector('main');
            const composer = main?.querySelector('.safe-area-bottom');
            const section = main?.querySelector('section');
            const oldSplitGrid = main?.querySelector('[class*="lg:grid-cols-[minmax(320px"]');
            const nestedSidebar = main?.querySelector('aside');
            const sectionRect = section?.getBoundingClientRect();
            const composerInnerRect = composer?.firstElementChild?.getBoundingClientRect();

            return {
                hasMain: !!main,
                hasComposerSkeleton: !!composer,
                hasOldSplitGrid: !!oldSplitGrid,
                hasNestedLoadingSidebar: !!nestedSidebar,
                sectionWidth: sectionRect?.width ?? 0,
                composerWidth: composerInnerRect?.width ?? 0,
            };
        });
        await expect.poll(async () => (await readLoadingLayout()).hasComposerSkeleton, {
            timeout: 2_000,
        }).toBe(true);

        const loadingLayout = await readLoadingLayout();

        expect(loadingLayout.hasMain).toBe(true);
        expect(loadingLayout.hasComposerSkeleton).toBe(true);
        expect(loadingLayout.hasOldSplitGrid).toBe(false);
        expect(loadingLayout.hasNestedLoadingSidebar).toBe(false);
        expect(loadingLayout.sectionWidth).toBeGreaterThan(700);
        expect(loadingLayout.sectionWidth).toBeLessThanOrEqual(900);
        expect(loadingLayout.composerWidth).toBeGreaterThan(700);
        expect(loadingLayout.composerWidth).toBeLessThanOrEqual(900);
    });

    test('desktop uses a centered single conversation column and starter prompts are text-only', async ({ page }) => {
        await page.goto('/home');
        await waitForWelcome(page);

        await expect(page.locator('[data-testid="prompt-pack-prompts"] img')).toHaveCount(0);
        await expect(page.locator('[data-testid="prompt-pack-prompts"] button')).toHaveCount(6);

        const layout = await page.evaluate(() => {
            const composer = document.querySelector('[data-testid="chat-input"]')?.closest('.safe-area-bottom');
            const composerInner = composer?.firstElementChild;
            const appSurface = composer?.parentElement;
            const promptGrid = document.querySelector('[data-testid="prompt-pack-prompts"]');
            const promptButtons = Array.from(document.querySelectorAll('[data-testid="prompt-pack-prompts"] button'));
            const promptTabs = Array.from(document.querySelectorAll('[data-testid="prompt-pack-tabs"] button'));
            const composerRect = composer?.getBoundingClientRect();
            const composerInnerRect = composerInner?.getBoundingClientRect();
            const appRect = appSurface?.getBoundingClientRect();
            const gridRect = promptGrid?.getBoundingClientRect();
            const composerStyles = composer ? getComputedStyle(composer) : null;
            const composerBox = composerInnerRect
                ? { left: composerInnerRect.left, right: composerInnerRect.right, top: composerInnerRect.top, bottom: composerInnerRect.bottom }
                : { left: 0, right: 0, top: 0, bottom: 0 };
            const promptRects = promptButtons.map((button) => {
                const rect = button.getBoundingClientRect();
                return { left: rect.left, right: rect.right, top: rect.top, bottom: rect.bottom };
            });
            const tabRects = promptTabs.map((button) => {
                const rect = button.getBoundingClientRect();
                return { left: rect.left, right: rect.right, top: rect.top, bottom: rect.bottom };
            });

            return {
                documentWidth: document.documentElement.scrollWidth,
                viewportWidth: document.documentElement.clientWidth,
                viewportHeight: document.documentElement.clientHeight,
                composerPosition: composer ? getComputedStyle(composer).position : '',
                composerTransform: composerStyles?.transform ?? '',
                composerTop: composerRect?.top ?? 0,
                composerBottom: composerRect?.bottom ?? 0,
                appLeft: appRect?.left ?? 0,
                appWidth: appRect?.width ?? 0,
                composerWidth: composerInnerRect?.width ?? 0,
                composerLeft: composerInnerRect?.left ?? 0,
                composerRight: composerInnerRect?.right ?? 0,
                expectedComposerLeft: (appRect?.left ?? 0) + Math.max(((appRect?.width ?? 0) - 860) / 2, 0) + 16,
                expectedComposerRight: (appRect?.right ?? document.documentElement.clientWidth) - Math.max(((appRect?.width ?? 0) - 860) / 2, 0) - 16,
                promptGridRight: gridRect?.right ?? 0,
                promptGridLeft: gridRect?.left ?? 0,
                promptGridWidth: gridRect?.width ?? 0,
                promptBottomMax: Math.max(...promptRects.map((rect) => rect.bottom)),
                promptColumnCount: getComputedStyle(promptGrid!).gridTemplateColumns.split(' ').length,
                promptsOverlapComposer: promptRects.some((rect) =>
                    rect.left < composerBox.right &&
                    rect.right > composerBox.left &&
                    rect.top < composerBox.bottom &&
                    rect.bottom > composerBox.top
                ),
                tabsFitViewport: tabRects.every((rect) => rect.left >= 0 && rect.right <= document.documentElement.clientWidth),
            };
        });

        expect(layout.documentWidth).toBeLessThanOrEqual(layout.viewportWidth);
        expect(layout.composerPosition).toBe('relative');
        expect(layout.composerTransform).toBe('none');
        expect(layout.composerBottom).toBeLessThanOrEqual(layout.viewportHeight + 1);
        expect(layout.composerTop).toBeGreaterThan(layout.viewportHeight - 260);
        expect(Math.abs(layout.composerLeft - layout.expectedComposerLeft)).toBeLessThan(32);
        expect(Math.abs(layout.composerRight - layout.expectedComposerRight)).toBeLessThan(32);
        expect(layout.composerWidth).toBeGreaterThan(700);
        expect(layout.composerWidth).toBeLessThanOrEqual(900);
        expect(layout.promptColumnCount).toBe(3);
        expect(layout.promptGridWidth).toBeGreaterThan(600);
        expect(layout.promptGridLeft).toBeGreaterThanOrEqual(layout.appLeft);
        expect(layout.promptGridRight).toBeLessThanOrEqual(layout.viewportWidth);
        expect(layout.promptBottomMax).toBeLessThanOrEqual(layout.viewportHeight);
        expect(layout.promptsOverlapComposer).toBe(false);
        expect(layout.tabsFitViewport).toBe(true);
    });
});
