import { expect, test } from '@playwright/test';

test.describe('Dashboard Breadcrumb Studio Real-Browser Verification', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/gallery/breadcrumb');
    await expect(page.locator('[data-testid="breadcrumb-studio"]')).toBeVisible();
  });

  test('1. Verifies semantic landmark, density sizes, separator switching, ellipsis toggle, focus ring, and zero shadows', async ({
    page,
  }) => {
    const nav = page.locator('[data-testid="specimen-breadcrumb"]');
    await expect(nav).toHaveAttribute('data-size', 'md');
    await expect(nav).toHaveAttribute('aria-label', 'Breadcrumb navigation');

    const current = nav.locator('[aria-current="page"]');
    await expect(current).toHaveText('Settings');

    // Switch size to lg -> 16px
    await page.locator('[data-testid="opt-size-lg"]').click();
    await expect(nav).toHaveAttribute('data-size', 'lg');
    await expect(nav.locator('li').first()).toHaveCSS('font-size', '16px');

    // Switch separator to slash (/)
    await page.locator('[data-testid="opt-sep-slash"]').click();
    await expect(nav.locator('li[role="presentation"]').first()).toHaveText('/');

    // Toggle intermediate ellipsis on
    await page.locator('[data-testid="toggle-breadcrumb-ellipsis"]').click();
    await expect(nav).toContainText('…');

    // Keyboard focus-visible check on first BreadcrumbLink via real Tab navigation
    const firstLink = nav.locator('a').first();
    await firstLink.focus();
    await page.keyboard.press('Tab');
    await page.keyboard.press('Shift+Tab');
    await expect(firstLink).toBeFocused();
    const outlineStyle = await firstLink.evaluate((el) => window.getComputedStyle(el).outlineStyle);
    expect(outlineStyle).not.toBe('none');

    // Dashboard shadow ban check
    const shadow = await nav.evaluate((el) => window.getComputedStyle(el).boxShadow);
    expect(shadow === 'none' || shadow === '').toBe(true);
  });

  test('2. Verifies RTL lang="ar" chevron mirroring, Full Matrix view, and zero mobile overflow', async ({
    page,
  }) => {
    await page.locator('[data-testid="opt-dir-rtl"]').click();

    const canvas = page.locator('[data-testid="breadcrumb-canvas"]');
    const nav = page.locator('[data-testid="specimen-breadcrumb"]');
    await expect(canvas).toHaveAttribute('dir', 'rtl');
    await expect(canvas).toHaveAttribute('lang', 'ar');
    await expect(nav).toContainText('الرئيسية');
    await expect(nav).toContainText('الإعدادات');

    // Directional chevron icon inside separator flips under RTL
    const chevronIcon = nav.locator('[data-mirror-rtl="true"]').first();
    const transform = await chevronIcon.evaluate((el) => window.getComputedStyle(el).transform);
    expect(transform).toContain('-1');

    // Full Matrix mode
    await page.locator('[data-testid="opt-view-matrix"]').click();
    const matrix = page.locator('[data-testid="breadcrumb-matrix-grid"]');
    await expect(matrix).toBeVisible();
    await expect(matrix.locator('[data-testid="matrix-breadcrumb-size-sm"]')).toBeVisible();
    await expect(matrix.locator('[data-testid="matrix-breadcrumb-size-md"]')).toBeVisible();
    await expect(matrix.locator('[data-testid="matrix-breadcrumb-size-lg"]')).toBeVisible();
    await expect(matrix.locator('[data-testid="matrix-breadcrumb-sep-slash"]')).toBeVisible();
    await expect(matrix.locator('[data-testid="matrix-breadcrumb-ellipsis"]')).toBeVisible();

    await page.setViewportSize({ width: 375, height: 812 });
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
    );
    expect(overflow).toBe(false);
  });
});
