import { expect, test } from '@playwright/test';

test.describe('Website Skeleton Studio Real-Browser Verification', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/gallery/skeleton');
    await expect(page.locator('[data-testid="skeleton-studio"]')).toBeVisible();
  });

  test('1. Verifies fill contrast on card surface, circular/rounded shapes, reduced motion, and loaded toggle', async ({
    page,
  }) => {
    const card = page.locator('[data-testid="skeleton-specimen-card"]');
    const skeleton = page.locator('[data-testid="specimen-skeleton"]');

    await expect(skeleton).toHaveAttribute('aria-hidden', 'true');
    const cardBg = await card.evaluate((el) => window.getComputedStyle(el).backgroundColor);
    const skeletonBg = await skeleton.evaluate((el) => window.getComputedStyle(el).backgroundColor);
    expect(skeletonBg).not.toBe('rgba(0, 0, 0, 0)');
    expect(skeletonBg).not.toBe(cardBg);

    await page.locator('[data-testid="opt-var-circular"]').click();
    await expect(skeleton).toHaveCSS('inline-size', '64px');

    await page.emulateMedia({ reducedMotion: 'reduce' });
    const animName = await skeleton.evaluate((el) => window.getComputedStyle(el).animationName);
    expect(animName).toBe('none');

    await page.locator('[data-testid="toggle-skeleton-loaded"]').click();
    await expect(page.locator('[data-testid="specimen-loaded"]')).toBeVisible();
  });

  test('2. Verifies RTL lang="ar" and Full Matrix shapes and animations', async ({ page }) => {
    await page.locator('[data-testid="toggle-skeleton-loaded"]').click();
    await page.locator('[data-testid="opt-dir-rtl"]').click();

    const canvas = page.locator('[data-testid="skeleton-canvas"]');
    await expect(canvas).toHaveAttribute('dir', 'rtl');
    await expect(canvas).toHaveAttribute('lang', 'ar');
    await expect(page.locator('[data-testid="specimen-loaded"]')).toContainText('تم عرض المحتوى');

    await page.locator('[data-testid="opt-view-matrix"]').click();
    const matrix = page.locator('[data-testid="skeleton-matrix-grid"]');
    await expect(matrix).toBeVisible();
    await expect(matrix.locator('[data-testid="matrix-skeleton-var-rounded"]')).toBeVisible();
    await expect(matrix.locator('[data-testid="matrix-skeleton-anim-wave"]')).toBeVisible();
  });
});
