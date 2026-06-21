import { expect, test, type Locator, type Page, type TestInfo } from '@playwright/test';

async function attachViewportScreenshot(page: Page, testInfo: TestInfo, name: string) {
  const screenshot = await page.screenshot({ fullPage: false });
  await testInfo.attach(name, { body: screenshot, contentType: 'image/png' });
}

async function expectNoHorizontalOverflow(page: Page) {
  const size = await page.evaluate(() => ({
    innerWidth: window.innerWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }));
  expect(size.scrollWidth, 'mobile page should not horizontally overflow').toBeLessThanOrEqual(size.innerWidth + 2);
}

async function expectComfortableTapTarget(locator: Locator, label: string) {
  const box = await locator.boundingBox();
  expect(box, `${label} should have a visible bounding box`).toBeTruthy();
  expect(box!.height, `${label} should be comfortable to tap`).toBeGreaterThanOrEqual(40);
}

test.describe('Mobile landing production gate', () => {
  test('iPhone landing page remains usable across the full funnel', async ({ page }, testInfo) => {
    await page.goto('/');

    const device = await page.evaluate(() => ({
      innerWidth: window.innerWidth,
      dpr: window.devicePixelRatio,
      touch: navigator.maxTouchPoints,
      userAgent: navigator.userAgent,
    }));
    expect(device.innerWidth).toBeLessThanOrEqual(430);
    expect(device.dpr).toBeGreaterThanOrEqual(2);
    expect(device.touch).toBeGreaterThan(0);
    expect(device.userAgent).toMatch(/Mobile|iPhone|Android/);

    const cookieBanner = page.getByTestId('cookie-consent-banner');
    await expect(cookieBanner).toBeVisible();
    const cookieBox = await cookieBanner.boundingBox();
    const viewport = page.viewportSize();
    expect(cookieBox?.height ?? 0, 'mobile cookie banner should not dominate the viewport').toBeLessThan((viewport?.height ?? 660) * 0.45);
    await expect(cookieBanner.getByRole('button', { name: /accept all/i })).toBeVisible();
    await expect(cookieBanner.getByRole('button', { name: /essential only/i })).toBeVisible();
    await attachViewportScreenshot(page, testInfo, '01-cookie-banner');

    await cookieBanner.getByRole('button', { name: /essential only/i }).click();
    await expect(cookieBanner).toBeHidden();

    const header = page.getByTestId('public-header');
    await expect(header).toBeVisible();
    const headerBox = await header.boundingBox();
    expect(headerBox?.height ?? 0, 'mobile sticky header should stay compact').toBeLessThanOrEqual(64);
    await expectComfortableTapTarget(header.getByRole('button', { name: /get started free/i }), 'header CTA');

    const hero = page.getByTestId('landing-hero');
    await expect(hero.getByRole('heading', { level: 1, name: /coloring pages for any wish/i })).toBeVisible();
    await expect(hero.getByText(/Start with any idea, then keep chatting/i)).toBeVisible();
    await expect(hero.getByText(/bigger shapes, simpler lines/i)).toBeVisible();
    const prompt = page.getByLabel(/coloring page idea/i);
    await expect(prompt).toBeVisible();
    await expect(prompt).toHaveAttribute('placeholder', /corgi knight/i);
    await expectComfortableTapTarget(page.getByRole('button', { name: /enter an idea to create/i }), 'disabled create button');

    const promptBox = await prompt.boundingBox();
    expect(promptBox?.y ?? 9999, 'prompt input should appear in the first mobile viewport').toBeLessThan((viewport?.height ?? 660) + 12);

    await prompt.fill('a rocket-powered turtle at recess');
    await expectComfortableTapTarget(page.getByRole('button', { name: /create coloring page/i }), 'enabled create button');
    await expectNoHorizontalOverflow(page);
    await attachViewportScreenshot(page, testInfo, '02-hero-input');

    const samplePreview = page.getByTestId('landing-sample-preview');
    await samplePreview.scrollIntoViewIfNeeded();
    await expect(samplePreview.getByText(/baby dragon/i)).toBeVisible();
    await expectNoHorizontalOverflow(page);
    await attachViewportScreenshot(page, testInfo, '03-sample-preview');

    const howItWorks = page.getByTestId('landing-how-it-works');
    await howItWorks.scrollIntoViewIfNeeded();
    await expect(howItWorks.getByRole('heading', { name: /three steps/i })).toBeVisible();
    await expect(howItWorks.getByText('01')).toBeVisible();
    await expect(howItWorks.getByText(/Describe it/i)).toBeVisible();
    await expect(howItWorks.getByText(/Chat to change it/i)).toBeVisible();
    await expect(howItWorks.getByText(/Print the keeper/i)).toBeVisible();
    await expectNoHorizontalOverflow(page);
    await attachViewportScreenshot(page, testInfo, '04-how-it-works');

    const gallery = page.getByTestId('landing-gallery');
    await gallery.scrollIntoViewIfNeeded();
    await expect(gallery.getByRole('heading', { name: /real prompts, real kids/i })).toBeVisible();
    const featuredGalleryCard = gallery.getByTestId('mobile-gallery-featured').locator('figure');
    await expect(featuredGalleryCard).toBeVisible();
    await expect(featuredGalleryCard.getByText(/baby dragon/i)).toBeVisible();
    await expect(gallery.getByTestId('mobile-gallery-scroll-cue')).toBeVisible();
    await expect(gallery.getByText(/swipe sideways to browse prompts/i)).toBeVisible();
    const carousel = gallery.getByTestId('mobile-gallery-carousel');
    await expect(carousel).toBeVisible();
    await expect(carousel.locator('figure')).toHaveCount(7);
    await expect(carousel.getByText(/astronaut on the moon/i)).toBeVisible();
    const firstGalleryCard = await featuredGalleryCard.boundingBox();
    expect(firstGalleryCard?.width ?? 0, 'mobile featured gallery card should be inspectable').toBeGreaterThan(300);
    const carouselMetrics = await carousel.evaluate((node) => {
      const first = node.querySelector('figure')?.getBoundingClientRect();
      const second = node.querySelectorAll('figure')[1]?.getBoundingClientRect();
      return {
        clientWidth: node.clientWidth,
        scrollWidth: node.scrollWidth,
        firstWidth: first?.width ?? 0,
        secondLeft: second?.left ?? 0,
      };
    });
    expect(carouselMetrics.scrollWidth, 'mobile gallery should have horizontal content to swipe').toBeGreaterThan(carouselMetrics.clientWidth + 40);
    expect(carouselMetrics.firstWidth, 'mobile rail card should leave a visible next-card peek').toBeLessThan(carouselMetrics.clientWidth * 0.82);
    expect(carouselMetrics.secondLeft, 'second mobile rail card should peek inside the viewport').toBeLessThan(carouselMetrics.clientWidth);
    const indicators = gallery.getByTestId('mobile-gallery-indicator');
    await expect(indicators).toHaveCount(7);
    await expect(indicators.first()).toHaveAttribute('aria-current', 'true');
    await carousel.evaluate((node) => {
      const target = node.querySelectorAll<HTMLElement>('[data-gallery-card]')[3];
      node.scrollTo({ left: target.offsetLeft, behavior: 'instant' });
    });
    await expect(indicators.nth(3)).toHaveAttribute('aria-current', 'true');
    await indicators.nth(5).click();
    await expect(indicators.nth(5)).toHaveAttribute('aria-current', 'true');
    await expectNoHorizontalOverflow(page);
    await attachViewportScreenshot(page, testInfo, '05-gallery');

    const pricing = page.getByTestId('landing-pricing');
    await pricing.scrollIntoViewIfNeeded();
    await expect(pricing.getByRole('heading', { name: /pay once/i })).toBeVisible();
    await expect(pricing.getByRole('heading', { name: 'Free' })).toBeVisible();
    await expect(pricing.getByText(/purchased pages never expire/i)).toBeVisible();
    await expectNoHorizontalOverflow(page);
    await attachViewportScreenshot(page, testInfo, '06-pricing');

    await page.getByRole('heading', { name: /make something nobody/i }).scrollIntoViewIfNeeded();
    await expect(page.getByRole('link', { name: /start drawing free/i })).toBeVisible();
    await expectNoHorizontalOverflow(page);
    await attachViewportScreenshot(page, testInfo, '07-final-cta');
  });
});
