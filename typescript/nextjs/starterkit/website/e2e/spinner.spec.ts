import { expect, test } from '@playwright/test';

test.describe('Website Spinner Studio Real-Browser Verification', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/gallery/spinner');
    await expect(page.locator('[data-testid="spinner-studio"]')).toBeVisible();
  });

  test('1. Verifies size dimensions, Visible Label toggle, and reduced-motion spin dampening', async ({
    page,
  }) => {
    const spinner = page.locator('[data-testid="specimen-spinner"]');
    const svg = spinner.locator('svg');

    await expect(spinner).toHaveAttribute('data-size', 'md');
    await expect(spinner).toHaveAttribute('aria-hidden', 'true');
    await expect(svg).toHaveCSS('inline-size', '20px');

    await page.locator('[data-testid="opt-size-xl"]').click();
    await expect(svg).toHaveCSS('inline-size', '32px');

    await page.locator('[data-testid="toggle-spinner-label"]').click();
    await expect(spinner).toHaveAttribute('role', 'status');
    await expect(spinner).toContainText('Loading content...');

    await page.emulateMedia({ reducedMotion: 'reduce' });
    const animDuration = await svg.evaluate((el) => window.getComputedStyle(el).animationDuration);
    expect(animDuration).toBe('2s');
  });

  test('2. Verifies RTL lang="ar" visible label and Full Matrix sizes and variants', async ({
    page,
  }) => {
    await page.locator('[data-testid="toggle-spinner-label"]').click();
    await page.locator('[data-testid="opt-dir-rtl"]').click();

    const canvas = page.locator('[data-testid="spinner-canvas"]');
    const spinner = page.locator('[data-testid="specimen-spinner"]');

    await expect(canvas).toHaveAttribute('dir', 'rtl');
    await expect(canvas).toHaveAttribute('lang', 'ar');
    await expect(spinner).toContainText('جارٍ تحميل المحتوى...');

    await page.locator('[data-testid="opt-view-matrix"]').click();
    const matrix = page.locator('[data-testid="spinner-matrix-grid"]');
    await expect(matrix).toBeVisible();
    await expect(matrix.locator('[data-testid="matrix-spinner-size-xs"]')).toBeVisible();
    await expect(matrix.locator('[data-testid="matrix-spinner-variant-inverse"]')).toBeVisible();
  });
});
