import { expect, test } from '@playwright/test';

test.describe('Dashboard Label Studio Real-Browser Verification', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/gallery/label');
    await expect(page.locator('[data-testid="label-studio"]')).toBeVisible();
  });

  test('1. Links Label to Input via htmlFor click-to-focus, cursor pointer, and disabled/custom states', async ({
    page,
  }) => {
    const label = page.locator('[data-testid="specimen-label"]');
    const input = page.locator('[data-testid="specimen-label-input"]');

    await expect(label).toHaveCSS('cursor', 'pointer');
    await label.click();
    await expect(input).toBeFocused();

    // Custom required indicator toggles cleanly
    await page.locator('[data-testid="toggle-label-custom-indicator"]').click();
    await expect(label).toContainText('(required)');

    // Disabled state updates cursor and prevents input focus on label click
    await page.locator('[data-testid="toggle-label-disabled"]').click();
    await expect(label).toHaveAttribute('data-disabled', 'true');
    await expect(label).toHaveCSS('cursor', 'not-allowed');
    await expect(input).toBeDisabled();
  });

  test('2. Verifies Dashboard product-default typography (14px/20px), explicit sm/lg sizes, and zero dashboard shadows', async ({
    page,
  }) => {
    const label = page.locator('[data-testid="specimen-label"]');

    // Product default (size omitted) inherits compact Dashboard tokens: 14px / 20px
    expect(await label.getAttribute('data-size')).toBeNull();
    await expect(label).toHaveCSS('font-size', '14px');
    await expect(label).toHaveCSS('line-height', '20px');

    // Explicit SM (12px / 16px)
    await page.locator('[data-testid="opt-size-sm"]').click();
    await expect(label).toHaveAttribute('data-size', 'sm');
    await expect(label).toHaveCSS('font-size', '12px');
    await expect(label).toHaveCSS('line-height', '16px');

    // Explicit LG (16px / 24px)
    await page.locator('[data-testid="opt-size-lg"]').click();
    await expect(label).toHaveAttribute('data-size', 'lg');
    await expect(label).toHaveCSS('font-size', '16px');
    await expect(label).toHaveCSS('line-height', '24px');

    // Dashboard shadow ban check
    const shadow = await label.evaluate((el) => window.getComputedStyle(el).boxShadow);
    expect(shadow === 'none' || shadow === '').toBe(true);
  });

  test('3. Verifies RTL lang="ar" Arabic Tashkeel line-height clearance and Full Matrix view', async ({
    page,
  }) => {
    const canvas = page.locator('[data-testid="label-canvas"]');
    const label = page.locator('[data-testid="specimen-label"]');

    await page.locator('[data-testid="opt-dir-rtl"]').click();
    await expect(canvas).toHaveAttribute('dir', 'rtl');
    await expect(canvas).toHaveAttribute('lang', 'ar');
    await expect(label).toContainText('البريد الإلكتروني');

    // Arabic Script Clearance: Dashboard label line-height expands from 20px to 24px
    await expect(label).toHaveCSS('line-height', '24px');

    await page.locator('[data-testid="opt-view-matrix"]').click();
    const matrix = page.locator('[data-testid="label-matrix-grid"]');
    await expect(matrix).toBeVisible();
    await expect(matrix.locator('[data-testid="matrix-label-auto"]')).toBeVisible();
    await expect(matrix.locator('[data-testid="matrix-label-sm"]')).toBeVisible();
    await expect(matrix.locator('[data-testid="matrix-label-lg"]')).toBeVisible();
  });
});
