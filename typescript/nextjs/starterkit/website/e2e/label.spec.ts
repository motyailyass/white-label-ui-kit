import { expect, test } from '@playwright/test';

test.describe('Website Label Studio Real-Browser Verification', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/gallery/label');
    await expect(page.locator('[data-testid="label-studio"]')).toBeVisible();
  });

  test('1. Verifies Website product-default typography (16px/24px), explicit sm/md overrides, and htmlFor focus delegation', async ({
    page,
  }) => {
    const label = page.locator('[data-testid="specimen-label"]');
    const input = page.locator('[data-testid="specimen-label-input"]');

    // Website defaults to comfortable 16px / 24px when size prop is omitted
    expect(await label.getAttribute('data-size')).toBeNull();
    await expect(label).toHaveCSS('font-size', '16px');
    await expect(label).toHaveCSS('line-height', '24px');

    // Click Label to focus associated Input
    await label.click();
    await expect(input).toBeFocused();

    // Explicit SM retains identical meaning (12px / 16px) across starters
    await page.locator('[data-testid="opt-size-sm"]').click();
    await expect(label).toHaveAttribute('data-size', 'sm');
    await expect(label).toHaveCSS('font-size', '12px');
    await expect(label).toHaveCSS('line-height', '16px');

    // Explicit MD (14px / 20px)
    await page.locator('[data-testid="opt-size-md"]').click();
    await expect(label).toHaveAttribute('data-size', 'md');
    await expect(label).toHaveCSS('font-size', '14px');
    await expect(label).toHaveCSS('line-height', '20px');
  });

  test('2. Verifies RTL lang="ar" Website line-height clearance (28px) and Full Matrix view', async ({
    page,
  }) => {
    const canvas = page.locator('[data-testid="label-canvas"]');
    const label = page.locator('[data-testid="specimen-label"]');

    await page.locator('[data-testid="opt-dir-rtl"]').click();
    await expect(canvas).toHaveAttribute('dir', 'rtl');
    await expect(canvas).toHaveAttribute('lang', 'ar');
    await expect(label).toContainText('البريد الإلكتروني');

    // Website Arabic clearance: label line-height expands to 28px (1.75rem)
    await expect(label).toHaveCSS('line-height', '28px');

    await page.locator('[data-testid="opt-view-matrix"]').click();
    const matrix = page.locator('[data-testid="label-matrix-grid"]');
    await expect(matrix).toBeVisible();
    await expect(matrix.locator('[data-testid="matrix-label-auto"]')).toBeVisible();
    await expect(matrix.locator('[data-testid="matrix-label-lg"]')).toBeVisible();
  });
});
