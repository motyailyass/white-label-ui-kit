import { expect, test } from '@playwright/test';

test.describe('Dashboard Skeleton Studio Real-Browser Verification', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/gallery/skeleton');
    await expect(page.locator('[data-testid="skeleton-studio"]')).toBeVisible();
  });

  test('1. Verifies visible fill contrast on surface card, shape variants, loaded toggle, reduced motion, and zero shadows', async ({
    page,
  }) => {
    const card = page.locator('[data-testid="skeleton-specimen-card"]');
    const skeleton = page.locator('[data-testid="specimen-skeleton"]');

    await expect(skeleton).toHaveAttribute('aria-hidden', 'true');
    await expect(skeleton).toHaveAttribute('data-variant', 'rounded');
    await expect(skeleton).toHaveAttribute('data-animation', 'pulse');

    // Fill background must visibly contrast with the surrounding specimenCard surface in Light Mode
    const cardBg = await card.evaluate((el) => window.getComputedStyle(el).backgroundColor);
    const skeletonBg = await skeleton.evaluate((el) => window.getComputedStyle(el).backgroundColor);
    expect(skeletonBg).not.toBe('rgba(0, 0, 0, 0)');
    expect(skeletonBg).not.toBe(cardBg);

    // Switch shape to circular (64px x 64px, border-radius: 50%)
    await page.locator('[data-testid="opt-var-circular"]').click();
    await expect(skeleton).toHaveAttribute('data-variant', 'circular');
    await expect(skeleton).toHaveCSS('inline-size', '64px');
    await expect(skeleton).toHaveCSS('block-size', '64px');

    // Switch animation to wave and verify reduced-motion suppression
    await page.locator('[data-testid="opt-anim-wave"]').click();
    await expect(skeleton).toHaveAttribute('data-animation', 'wave');

    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.locator('[data-testid="opt-anim-pulse"]').click();
    const animName = await skeleton.evaluate((el) => window.getComputedStyle(el).animationName);
    expect(animName).toBe('none');

    // Dashboard shadow ban check
    const shadow = await skeleton.evaluate((el) => window.getComputedStyle(el).boxShadow);
    expect(shadow === 'none' || shadow === '').toBe(true);

    // Simulate content loaded toggle
    await page.locator('[data-testid="toggle-skeleton-loaded"]').click();
    await expect(skeleton).not.toBeVisible();
    await expect(page.locator('[data-testid="specimen-loaded"]')).toBeVisible();
  });

  test('2. Verifies RTL lang="ar" loaded copy, Full Matrix view, and zero horizontal overflow', async ({
    page,
  }) => {
    await page.locator('[data-testid="toggle-skeleton-loaded"]').click();
    await page.locator('[data-testid="opt-dir-rtl"]').click();

    const canvas = page.locator('[data-testid="skeleton-canvas"]');
    const loaded = page.locator('[data-testid="specimen-loaded"]');
    await expect(canvas).toHaveAttribute('dir', 'rtl');
    await expect(canvas).toHaveAttribute('lang', 'ar');
    await expect(loaded).toContainText('تم عرض المحتوى');

    await page.locator('[data-testid="opt-view-matrix"]').click();
    const matrix = page.locator('[data-testid="skeleton-matrix-grid"]');
    await expect(matrix).toBeVisible();
    await expect(matrix.locator('[data-testid="matrix-skeleton-var-text"]')).toBeVisible();
    await expect(matrix.locator('[data-testid="matrix-skeleton-var-circular"]')).toBeVisible();
    await expect(matrix.locator('[data-testid="matrix-skeleton-anim-wave"]')).toBeVisible();

    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
    );
    expect(overflow).toBe(false);
  });
});
