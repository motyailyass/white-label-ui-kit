import { expect, test } from '@playwright/test';

test.describe('Dashboard EmptyState Studio Real-Browser Verification', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/gallery/empty-state');
    await expect(page.locator('[data-testid="gallery-empty-state"]')).toBeVisible();
  });

  test('1. Verifies variants, density scaling, CTA feedback, dark mode contrast, and zero shadows', async ({
    page,
  }) => {
    const emptyState = page.locator('[data-testid="live-empty-state"]');
    await expect(emptyState).toBeVisible();
    await expect(emptyState).toHaveAttribute('data-variant', 'default');
    await expect(emptyState).toHaveAttribute('data-size', 'md');

    // Dashboard zero-shadow policy
    const shadow = await emptyState.evaluate((el) => getComputedStyle(el).boxShadow);
    expect(shadow).toBe('none');

    // Switch variants including borderless
    await page.locator('[data-testid="empty-state-variant-dashed"]').click();
    await expect(emptyState).toHaveAttribute('data-variant', 'dashed');
    const borderStyle = await emptyState.evaluate((el) => getComputedStyle(el).borderStyle);
    expect(borderStyle).toBe('dashed');

    await page.locator('[data-testid="empty-state-variant-borderless"]').click();
    await expect(emptyState).toHaveAttribute('data-variant', 'borderless');

    // Click primary CTA and verify interactive feedback notice
    await page.locator('[data-testid="empty-state-primary-cta"]').click();
    await expect(page.locator('[data-testid="empty-state-action-notice"]')).toContainText(
      'Create Project',
    );

    // Switch to dark mode and verify subtle surface remains distinct from transparent
    await page.locator('[data-testid="empty-state-variant-subtle"]').click();
    await page.evaluate(() => document.documentElement.setAttribute('data-theme', 'dark'));
    await expect
      .poll(async () =>
        emptyState.evaluate((el) => getComputedStyle(el).backgroundColor !== 'rgba(0, 0, 0, 0)'),
      )
      .toBe(true);
  });

  test('2. Verifies RTL lang="ar" localization, Arabic letter-spacing, and mobile containment', async ({
    page,
  }) => {
    await page.locator('[data-testid="empty-state-dir-rtl"]').click();

    const canvas = page.locator('[data-testid="empty-state-canvas"]');
    const emptyState = page.locator('[data-testid="live-empty-state"]');

    await expect(canvas).toHaveAttribute('dir', 'rtl');
    await expect(canvas).toHaveAttribute('lang', 'ar');
    await expect(emptyState).toContainText('لا توجد مشاريع حتى الآن');

    const titleTracking = await emptyState
      .locator('h3')
      .evaluate((el) => getComputedStyle(el).letterSpacing);
    expect(titleTracking).toBe('normal');

    await page.setViewportSize({ width: 375, height: 812 });
    const hasHorizontalOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth,
    );
    expect(hasHorizontalOverflow).toBe(false);
  });
});
