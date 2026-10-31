import { test, expect } from '@playwright/test';

test.describe('Dashboard Spacing & Layout Rhythm Verification', () => {
  test('applies compact and responsive page padding across desktop and mobile', async ({ page }) => {
    await page.goto('/classic');

    const contentBody = page.locator('div[data-layout]');
    await expect(contentBody).toBeVisible();

    const isMobileProject = (page.viewportSize()?.width ?? 1280) < 768;

    const computedPaddingInline = await contentBody.evaluate((el) => {
      const style = window.getComputedStyle(el);
      return parseFloat(style.paddingInlineStart || style.paddingLeft);
    });

    if (isMobileProject) {
      // Mobile: 16px (--space-4 / 1rem)
      expect(computedPaddingInline).toBeCloseTo(16, 1);
    } else {
      // Desktop (>= 48rem): 24px (--space-6 / 1.5rem)
      expect(computedPaddingInline).toBeCloseTo(24, 1);
    }
  });

  test('applies responsive card padding in overview metrics', async ({ page }) => {
    await page.goto('/classic');

    const metricCard = page.locator('div[class*="metricCard"]').first();
    await expect(metricCard).toBeVisible();

    const isMobileProject = (page.viewportSize()?.width ?? 1280) < 768;

    const computedPadding = await metricCard.evaluate((el) => {
      const style = window.getComputedStyle(el);
      return parseFloat(style.paddingTop);
    });

    if (isMobileProject) {
      // Mobile: 16px (--space-4 / 1rem)
      expect(computedPadding).toBeCloseTo(16, 1);
    } else {
      // Desktop: 24px (--space-6 / 1.5rem)
      expect(computedPadding).toBeCloseTo(24, 1);
    }
  });

  test('maintains identical spacing across light and dark themes (theme parity)', async ({ page }) => {
    await page.goto('/classic');
    const contentBody = page.locator('div[data-layout]');

    // Light theme padding
    await page.evaluate(() => document.documentElement.setAttribute('data-theme', 'light'));
    const lightPadding = await contentBody.evaluate((el) => parseFloat(window.getComputedStyle(el).paddingLeft));

    // Dark theme padding
    await page.evaluate(() => document.documentElement.setAttribute('data-theme', 'dark'));
    const darkPadding = await contentBody.evaluate((el) => parseFloat(window.getComputedStyle(el).paddingLeft));

    expect(lightPadding).toBeCloseTo(darkPadding, 1);
  });

  test('renders zero horizontal overflow on mobile viewports with logical spacing', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/classic');

    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    expect(scrollWidth).toBeLessThanOrEqual(390);
  });
});
