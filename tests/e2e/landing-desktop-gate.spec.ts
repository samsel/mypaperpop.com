import { expect, test, type Page, type TestInfo } from '@playwright/test';

async function attachViewportScreenshot(page: Page, testInfo: TestInfo, name: string) {
  const screenshot = await page.screenshot({ fullPage: false });
  await testInfo.attach(name, { body: screenshot, contentType: 'image/png' });
}

async function expectNoHorizontalOverflow(page: Page) {
  const size = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }));
  expect(size.scrollWidth, 'desktop page should not horizontally overflow').toBeLessThanOrEqual(size.clientWidth + 2);
}

test.describe('Desktop landing production gate', () => {
  test('desktop landing page preserves the full marketing experience', async ({ page }, testInfo) => {
    await page.goto('/');

    const viewport = page.viewportSize();
    expect(viewport?.width).toBeGreaterThanOrEqual(1200);
    const device = await page.evaluate(() => ({
      touch: navigator.maxTouchPoints,
      userAgent: navigator.userAgent,
      clientWidth: document.documentElement.clientWidth,
    }));
    expect(device.touch).toBe(0);
    expect(device.userAgent).toMatch(/Chrome/);
    expect(device.clientWidth).toBeGreaterThanOrEqual(1200);

    const cookieBanner = page.getByTestId('cookie-consent-banner');
    await expect(cookieBanner).toBeVisible();
    await expect(cookieBanner.getByRole('button', { name: /accept all/i })).toBeVisible();
    await expect(cookieBanner.getByRole('button', { name: /essential only/i })).toBeVisible();
    await attachViewportScreenshot(page, testInfo, '01-desktop-cookie-banner');
    await cookieBanner.getByRole('button', { name: /essential only/i }).click();
    await expect(cookieBanner).toBeHidden();

    const header = page.getByTestId('public-header');
    await expect(header.getByLabel(/mypaperpop home/i)).toBeVisible();
    await expect(header.getByRole('link', { name: /pricing/i })).toBeVisible();
    await expect(header.getByRole('link', { name: /faq/i })).toBeVisible();
    await expect(header.getByRole('button', { name: /get started free/i })).toBeVisible();

    const hero = page.getByTestId('landing-hero');
    await expect(hero.getByRole('heading', { level: 1, name: /coloring pages for any wish/i })).toBeVisible();
    await expect(hero.getByText(/Start with any idea/i)).toBeVisible();
    await expect(page.getByLabel(/coloring page idea/i)).toBeVisible();
    await expect(hero.getByText(/4.9 from 2,100 parents/i)).toBeVisible();
    await expect(hero.getByTestId('landing-sample-preview').locator('img').first()).toBeVisible();
    await expectNoHorizontalOverflow(page);
    await attachViewportScreenshot(page, testInfo, '02-desktop-hero');

    const howItWorks = page.getByTestId('landing-how-it-works');
    await howItWorks.scrollIntoViewIfNeeded();
    await expect(howItWorks.getByRole('heading', { name: /three steps/i })).toBeVisible();
    await expect(howItWorks.getByText('01')).toBeVisible();
    await expect(howItWorks.getByText('02')).toBeVisible();
    await expect(howItWorks.getByText('03')).toBeVisible();
    await expectNoHorizontalOverflow(page);
    await attachViewportScreenshot(page, testInfo, '03-desktop-how-it-works');

    const gallery = page.getByTestId('landing-gallery');
    await gallery.scrollIntoViewIfNeeded();
    await expect(gallery.getByRole('heading', { name: /real prompts, real kids/i })).toBeVisible();
    await expect(gallery.getByTestId('mobile-gallery-featured')).toBeHidden();
    await expect(gallery.getByTestId('mobile-gallery-scroll-cue')).toBeHidden();
    await expect(gallery.getByTestId('mobile-gallery-carousel')).toBeHidden();
    await expect(gallery.getByTestId('mobile-gallery-indicators')).toBeHidden();
    const cards = gallery.getByTestId('desktop-gallery-grid').locator('figure');
    await expect(cards).toHaveCount(8);
    const firstCard = await cards.first().boundingBox();
    const secondCard = await cards.nth(1).boundingBox();
    expect(firstCard?.width ?? 0, 'desktop gallery cards should stay grid-sized').toBeGreaterThan(200);
    expect(secondCard?.x ?? 0, 'desktop gallery should remain multi-column').toBeGreaterThan(firstCard?.x ?? 0);
    await expectNoHorizontalOverflow(page);
    await attachViewportScreenshot(page, testInfo, '04-desktop-gallery');

    const pricing = page.getByTestId('landing-pricing');
    await pricing.scrollIntoViewIfNeeded();
    await expect(pricing.getByRole('heading', { name: /pay once/i })).toBeVisible();
    await expect(pricing.getByRole('heading', { name: 'Free' })).toBeVisible();
    await expect(pricing.getByText(/Most popular/i)).toBeVisible();
    await expect(pricing.getByText(/Save 33%/i)).toBeVisible();
    await expectNoHorizontalOverflow(page);
    await attachViewportScreenshot(page, testInfo, '05-desktop-pricing');

    await page.getByRole('heading', { name: /make something nobody/i }).scrollIntoViewIfNeeded();
    await expect(page.getByRole('link', { name: /start drawing free/i })).toBeVisible();
    await expectNoHorizontalOverflow(page);
    await attachViewportScreenshot(page, testInfo, '06-desktop-final-cta');
  });
});
