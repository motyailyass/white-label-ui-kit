import { expect, test } from '@playwright/test';

test.describe('Website Separator Studio Real-Browser Verification', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/gallery/separator');
    await expect(page.locator('[data-testid="separator-studio"]')).toBeVisible();
  });

  test('1. Verifies semantic role="separator", vertical orientation, and flush start label alignment', async ({
    page,
  }) => {
    const sep = page.locator('[data-testid="specimen-separator"]');
    await expect(sep).toHaveAttribute('role', 'none');

    await page.locator('[data-testid="toggle-separator-decorative"]').click();
    await page.locator('[data-testid="toggle-separator-label"]').click();
    await expect(sep).toHaveAttribute('role', 'separator');
    await expect(sep).toHaveAttribute('aria-orientation', 'horizontal');

    await page.locator('[data-testid="opt-align-start"]').click();
    const sepBox = await sep.boundingBox();
    const labelBox = await sep.locator('span').boundingBox();
    expect(Math.abs((labelBox?.x ?? 0) - (sepBox?.x ?? 0))).toBeLessThanOrEqual(2);

    await page.locator('[data-testid="opt-orient-vertical"]').click();
    await expect(sep).toHaveAttribute('aria-orientation', 'vertical');
  });

  test('2. Verifies RTL lang="ar" cursive ligature preservation and Full Matrix layout', async ({
    page,
  }) => {
    await page.locator('[data-testid="opt-dir-rtl"]').click();
    await page.locator('[data-testid="opt-view-matrix"]').click();

    const canvas = page.locator('[data-testid="separator-canvas"]');
    const startSep = page.locator('[data-testid="matrix-sep-start"]');
    await expect(canvas).toHaveAttribute('dir', 'rtl');
    await expect(canvas).toHaveAttribute('lang', 'ar');
    await expect(startSep).toContainText('أو');

    const letterSpacing = await startSep
      .locator('span')
      .evaluate((el) => window.getComputedStyle(el).letterSpacing);
    expect(letterSpacing === 'normal' || letterSpacing === '0px').toBe(true);
  });
});
