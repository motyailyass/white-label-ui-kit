import { expect, test } from '@playwright/test';

test.describe('Dashboard StatCard Studio Real-Browser Verification', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/gallery/stat-card');
    await expect(page.locator('[data-testid="stat-card-studio"]')).toBeVisible();
  });

  test('1. Verifies surface variants, density sizes, trend states, pill badge, toggles, and zero shadows', async ({
    page,
  }) => {
    const card = page.locator('[data-testid="specimen-stat-card"]');
    await expect(card).toHaveAttribute('data-variant', 'default');
    await expect(card).toHaveAttribute('data-size', 'md');
    await expect(card).toContainText('Total Active MRR');
    await expect(card).toContainText('$84,250');

    // Switch surface variant to raised & subtle
    await page.locator('[data-testid="opt-var-raised"]').click();
    await expect(card).toHaveAttribute('data-variant', 'raised');

    await page.locator('[data-testid="opt-var-subtle"]').click();
    await expect(card).toHaveAttribute('data-variant', 'subtle');
    const subtleBorder = await card.evaluate((el) => window.getComputedStyle(el).borderTopColor);
    expect(subtleBorder).not.toBe('rgba(0, 0, 0, 0)');

    // Density lg -> 32px value size
    await page.locator('[data-testid="opt-size-lg"]').click();
    await expect(card).toHaveAttribute('data-size', 'lg');

    // Trend direction down + pill badge toggle
    await page.locator('[data-testid="opt-trend-down"]').click();
    const trend = card.locator('[data-direction="down"]');
    await expect(trend).toBeVisible();
    await expect(trend).toContainText('-4.2%');

    await page.locator('[data-testid="toggle-stat-card-pill"]').click();
    await expect(trend).toHaveAttribute('data-pill', 'true');

    // Footer & Icon toggles
    await page.locator('[data-testid="toggle-stat-card-footer"]').click();
    await expect(trend).not.toBeVisible();

    // Dashboard shadow ban check
    const shadow = await card.evaluate((el) => window.getComputedStyle(el).boxShadow);
    expect(shadow === 'none' || shadow === '').toBe(true);
  });

  test('2. Verifies RTL lang="ar", BidiText numeric isolation, Full Matrix view, and zero mobile overflow', async ({
    page,
  }) => {
    await page.locator('[data-testid="opt-dir-rtl"]').click();

    const canvas = page.locator('[data-testid="stat-card-canvas"]');
    const card = page.locator('[data-testid="specimen-stat-card"]');
    await expect(canvas).toHaveAttribute('dir', 'rtl');
    await expect(canvas).toHaveAttribute('lang', 'ar');
    await expect(card).toContainText('إجمالي الإيراد الشهري المتكرر');
    await expect(card.locator('[dir="ltr"]').first()).toContainText('$84,250');

    await page.locator('[data-testid="opt-view-matrix"]').click();
    const matrix = page.locator('[data-testid="stat-card-matrix-grid"]');
    await expect(matrix).toBeVisible();
    await expect(matrix.locator('[data-testid="matrix-stat-card-default"]')).toBeVisible();
    await expect(matrix.locator('[data-testid="matrix-stat-card-raised"]')).toBeVisible();
    await expect(matrix.locator('[data-testid="matrix-stat-card-subtle"]')).toBeVisible();
    await expect(matrix.locator('[data-testid="matrix-stat-card-size-sm"]')).toBeVisible();
    await expect(matrix.locator('[data-testid="matrix-stat-card-size-lg"]')).toBeVisible();

    await page.setViewportSize({ width: 375, height: 812 });
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
    );
    expect(overflow).toBe(false);
  });
});
