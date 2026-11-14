import { expect, test } from '@playwright/test';

test.describe('Website Progress Studio Real-Browser Verification', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/gallery/progress');
    await expect(page.locator('[data-testid="progress-studio"]')).toBeVisible();
  });

  test('1. Verifies determinate sizes, sidebar presets, variable-driven status ramp, visible track contrast, and indeterminate mode', async ({
    page,
  }) => {
    const progress = page.locator('[data-testid="specimen-progress"]');
    const rampWarning = page.locator('[data-testid="progress-ramp-warning"]');

    await expect(progress).toHaveAttribute('role', 'progressbar');
    await expect(progress).toHaveAttribute('data-size', 'md');
    await expect(progress).toHaveAttribute('aria-valuenow', '75');
    await expect(rampWarning).toHaveAttribute('aria-valuenow', '75');

    // Preset controls live in sidebar, not inside canvas
    const canvasPresetCount = await page
      .locator('[data-testid="progress-canvas"] [data-testid="progress-preset-50"]')
      .count();
    expect(canvasPresetCount).toBe(0);

    // Track must be visually distinct from website surface (#fafafa)
    const [cardBg, trackBg] = await page.evaluate(() => {
      const root = document.querySelector('[data-testid="specimen-progress"]')!;
      const card = root.parentElement!;
      const track = root.querySelector('[class*="track"]')!;
      return [getComputedStyle(card).backgroundColor, getComputedStyle(track).backgroundColor];
    });
    expect(trackBg).not.toBe(cardBg);

    await page.locator('[data-testid="progress-preset-50"]').click();
    await expect(progress).toHaveAttribute('aria-valuenow', '50');
    await expect(rampWarning).toHaveAttribute('aria-valuenow', '50');

    await page.locator('[data-testid="progress-size-lg"]').click();
    await expect(rampWarning).toHaveAttribute('data-size', 'lg');
    const lgHeight = await progress
      .locator('[class*="track"]')
      .evaluate((el) => el.getBoundingClientRect().height);
    expect(Math.round(lgHeight)).toBe(12);

    await page.locator('[data-testid="toggle-progress-indeterminate"]').click();
    await expect(progress).toHaveAttribute('data-state', 'indeterminate');
    await expect(progress).toHaveAttribute('aria-busy', 'true');
    await expect(rampWarning).toHaveAttribute('data-state', 'indeterminate');
  });

  test('2. Verifies RTL lang="ar" localization, Arabic tracking, and mobile containment', async ({
    page,
  }) => {
    await page.locator('[data-testid="progress-dir-rtl"]').click();

    const canvas = page.locator('[data-testid="progress-canvas"]');
    const progress = page.locator('[data-testid="specimen-progress"]');

    await expect(canvas).toHaveAttribute('dir', 'rtl');
    await expect(canvas).toHaveAttribute('lang', 'ar');
    await expect(progress).toContainText('حصة التخزين السحابي');

    const matrixTracking = await canvas
      .locator('[class*="matrixLabel"]')
      .first()
      .evaluate((el) => getComputedStyle(el).letterSpacing);
    expect(matrixTracking).toBe('normal');

    await page.setViewportSize({ width: 375, height: 812 });
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
    );
    expect(overflow).toBe(false);
  });
});
