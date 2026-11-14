import { expect, test } from '@playwright/test';

test.describe('Dashboard Spinner Studio Real-Browser Verification', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/gallery/spinner');
    await expect(page.locator('[data-testid="spinner-studio"]')).toBeVisible();
  });

  test('1. Verifies size scale dimensions, variants, Visible Label toggle, reduced motion, and zero dashboard shadows', async ({
    page,
  }) => {
    const spinner = page.locator('[data-testid="specimen-spinner"]');
    const svg = spinner.locator('svg');

    // Default state: md (20px), primary, icon-only decorative
    await expect(spinner).toHaveAttribute('data-size', 'md');
    await expect(spinner).toHaveAttribute('data-variant', 'primary');
    await expect(spinner).toHaveAttribute('aria-hidden', 'true');
    await expect(svg).toHaveCSS('inline-size', '20px');
    await expect(svg).toHaveCSS('block-size', '20px');

    // Switch sizes: xs (12px) and xl (32px)
    await page.locator('[data-testid="opt-size-xs"]').click();
    await expect(spinner).toHaveAttribute('data-size', 'xs');
    await expect(svg).toHaveCSS('inline-size', '12px');

    await page.locator('[data-testid="opt-size-xl"]').click();
    await expect(spinner).toHaveAttribute('data-size', 'xl');
    await expect(svg).toHaveCSS('inline-size', '32px');

    // Switch variant to inverse
    await page.locator('[data-testid="opt-var-inverse"]').click();
    await expect(spinner).toHaveAttribute('data-variant', 'inverse');

    // Toggle Visible Label ON -> displays visible label and exposes role="status"
    await page.locator('[data-testid="toggle-spinner-label"]').click();
    await expect(spinner).toHaveAttribute('role', 'status');
    await expect(spinner).toHaveAttribute('aria-live', 'polite');
    await expect(spinner).toContainText('Loading content...');

    // Dashboard shadow ban check
    const shadow = await spinner.evaluate((el) => window.getComputedStyle(el).boxShadow);
    expect(shadow === 'none' || shadow === '').toBe(true);

    // Reduced motion slows spin duration from 750ms to 2000ms
    await page.emulateMedia({ reducedMotion: 'reduce' });
    const animDuration = await svg.evaluate((el) => window.getComputedStyle(el).animationDuration);
    expect(animDuration).toBe('2s');
  });

  test('2. Verifies RTL lang="ar" visible label, Full Matrix view, and zero horizontal overflow', async ({
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
    await expect(matrix.locator('[data-testid="matrix-spinner-size-xl"]')).toBeVisible();
    await expect(matrix.locator('[data-testid="matrix-spinner-variant-inverse"]')).toBeVisible();

    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
    );
    expect(overflow).toBe(false);
  });
});
