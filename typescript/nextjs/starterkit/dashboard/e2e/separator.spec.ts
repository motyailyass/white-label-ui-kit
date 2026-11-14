import { expect, test } from '@playwright/test';

test.describe('Dashboard Separator Studio Real-Browser Verification', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/gallery/separator');
    await expect(page.locator('[data-testid="separator-studio"]')).toBeVisible();
  });

  test('1. Toggles decorative vs semantic role="separator", vertical orientation, and labeled aria-labelledby pairing', async ({
    page,
  }) => {
    const sep = page.locator('[data-testid="specimen-separator"]');

    await expect(sep).toHaveAttribute('role', 'none');
    await expect(sep).toHaveAttribute('data-orientation', 'horizontal');

    // Switch to semantic separator mode + enable divider label
    await page.locator('[data-testid="toggle-separator-decorative"]').click();
    await expect(sep).toHaveAttribute('role', 'separator');
    await expect(sep).toHaveAttribute('aria-orientation', 'horizontal');

    await page.locator('[data-testid="toggle-separator-label"]').click();
    await expect(sep).toContainText('OR');
    const labelledBy = await sep.getAttribute('aria-labelledby');
    expect(labelledBy).toBeTruthy();

    // Switch to vertical orientation
    await page.locator('[data-testid="opt-orient-vertical"]').click();
    await expect(sep).toHaveAttribute('role', 'separator');
    await expect(sep).toHaveAttribute('aria-orientation', 'vertical');
    await expect(sep).toHaveAttribute('data-orientation', 'vertical');

    // Dashboard shadow ban check
    const shadow = await sep.evaluate((el) => window.getComputedStyle(el).boxShadow);
    expect(shadow === 'none' || shadow === '').toBe(true);
  });

  test('2. Verifies flush start alignment (zero phantom flex gap) and RTL lang="ar" cursive integrity in Full Matrix', async ({
    page,
  }) => {
    await page.locator('[data-testid="opt-view-matrix"]').click();
    const matrix = page.locator('[data-testid="separator-matrix-grid"]');
    await expect(matrix).toBeVisible();

    const startSep = matrix.locator('[data-testid="matrix-sep-start"]');
    const startLabel = startSep.locator('span');
    const sepBox = await startSep.boundingBox();
    const labelBox = await startLabel.boundingBox();
    expect(Math.abs((labelBox?.x ?? 0) - (sepBox?.x ?? 0))).toBeLessThanOrEqual(2);

    // Switch to RTL Arabic
    await page.locator('[data-testid="opt-dir-rtl"]').click();
    const canvas = page.locator('[data-testid="separator-canvas"]');
    await expect(canvas).toHaveAttribute('dir', 'rtl');
    await expect(canvas).toHaveAttribute('lang', 'ar');
    await expect(startSep).toContainText('أو');

    // Arabic label preserves normal letter-spacing without breaking cursive ligatures
    const letterSpacing = await startLabel.evaluate(
      (el) => window.getComputedStyle(el).letterSpacing,
    );
    expect(letterSpacing === 'normal' || letterSpacing === '0px').toBe(true);

    // Zero horizontal overflow on narrow mobile viewports
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
    );
    expect(overflow).toBe(false);
  });
});
