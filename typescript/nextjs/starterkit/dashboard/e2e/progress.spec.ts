import { expect, test } from '@playwright/test';

test.describe('Dashboard Progress Studio Real-Browser Verification', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/gallery/progress');
    await expect(page.locator('[data-testid="progress-studio"]')).toBeVisible();
  });

  test('1. Verifies determinate sizes, sidebar presets, dynamic ramp reactivity, indeterminate state, reduced motion, and zero shadows', async ({
    page,
  }) => {
    const progress = page.locator('[data-testid="specimen-progress"]');
    const rampSuccess = page.locator('[data-testid="progress-ramp-success"]');

    await expect(progress).toHaveAttribute('role', 'progressbar');
    await expect(progress).toHaveAttribute('data-size', 'md');
    await expect(progress).toHaveAttribute('data-variant', 'default');
    await expect(progress).toHaveAttribute('data-state', 'determinate');
    await expect(progress).toHaveAttribute('aria-valuenow', '75');
    await expect(rampSuccess).toHaveAttribute('aria-valuenow', '75');

    // Preset controls live in the studio controls sidebar (outside specimen canvas)
    const canvasPresetCount = await page
      .locator('[data-testid="progress-canvas"] [data-testid="progress-preset-100"]')
      .count();
    expect(canvasPresetCount).toBe(0);

    // Track must be visually distinct from its parent card surface
    const [cardBg, trackBg] = await page.evaluate(() => {
      const root = document.querySelector('[data-testid="specimen-progress"]')!;
      const card = root.parentElement!;
      const track = root.querySelector('[class*="track"]')!;
      return [getComputedStyle(card).backgroundColor, getComputedStyle(track).backgroundColor];
    });
    expect(trackBg).not.toBe(cardBg);

    // Zero dashboard box-shadows policy
    const [rootShadow, trackShadow] = await page.evaluate(() => {
      const root = document.querySelector('[data-testid="specimen-progress"]')!;
      const track = root.querySelector('[class*="track"]')!;
      return [getComputedStyle(root).boxShadow, getComputedStyle(track).boxShadow];
    });
    expect(rootShadow).toBe('none');
    expect(trackShadow).toBe('none');

    // Sidebar preset updates both stage specimen and variable-driven status ramp
    await page.locator('[data-testid="progress-preset-100"]').click();
    await expect(progress).toHaveAttribute('aria-valuenow', '100');
    await expect(rampSuccess).toHaveAttribute('aria-valuenow', '100');

    // Track size updates stage and ramp consistently
    await page.locator('[data-testid="progress-size-sm"]').click();
    await expect(progress).toHaveAttribute('data-size', 'sm');
    await expect(rampSuccess).toHaveAttribute('data-size', 'sm');
    const smHeight = await progress
      .locator('[class*="track"]')
      .evaluate((el) => el.getBoundingClientRect().height);
    expect(Math.round(smHeight)).toBe(4);

    await page.locator('[data-testid="progress-size-lg"]').click();
    await expect(progress).toHaveAttribute('data-size', 'lg');
    await expect(rampSuccess).toHaveAttribute('data-size', 'lg');
    const lgHeight = await progress
      .locator('[class*="track"]')
      .evaluate((el) => el.getBoundingClientRect().height);
    expect(Math.round(lgHeight)).toBe(12);

    // Semantic variants update attributes
    await page.locator('[data-testid="progress-variant-success"]').click();
    await expect(progress).toHaveAttribute('data-variant', 'success');

    // Indeterminate mode removes aria-valuenow across stage & ramp and obeys prefers-reduced-motion
    await page.locator('[data-testid="toggle-progress-indeterminate"]').click();
    await expect(progress).toHaveAttribute('data-state', 'indeterminate');
    await expect(progress).toHaveAttribute('aria-busy', 'true');
    await expect(rampSuccess).toHaveAttribute('data-state', 'indeterminate');
    const hasNow = await progress.getAttribute('aria-valuenow');
    expect(hasNow).toBeNull();

    await page.emulateMedia({ reducedMotion: 'reduce' });
    const animName = await progress
      .locator('[class*="indicator"]')
      .evaluate((el) => getComputedStyle(el).animationName);
    expect(animName).toBe('none');
  });

  test('2. Verifies RTL lang="ar" copy, localized values, and zero Arabic letter-spacing distortion', async ({
    page,
  }) => {
    await page.locator('[data-testid="progress-dir-rtl"]').click();

    const canvas = page.locator('[data-testid="progress-canvas"]');
    const progress = page.locator('[data-testid="specimen-progress"]');

    await expect(canvas).toHaveAttribute('dir', 'rtl');
    await expect(canvas).toHaveAttribute('lang', 'ar');
    await expect(progress).toContainText('حصة التخزين السحابي');

    // Matrix labels restore normal letter-spacing in Arabic so cursive glyphs join cleanly
    const matrixTracking = await canvas
      .locator('[class*="matrixLabel"]')
      .first()
      .evaluate((el) => getComputedStyle(el).letterSpacing);
    expect(matrixTracking).toBe('normal');

    // Zero document overflow at 375px mobile width
    await page.setViewportSize({ width: 375, height: 812 });
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
    );
    expect(overflow).toBe(false);
  });
});
