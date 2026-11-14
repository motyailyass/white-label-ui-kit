import { expect, test } from '@playwright/test';

test.describe('Website EmptyState Studio Real-Browser Verification', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/gallery/empty-state');
    await expect(page.locator('[data-testid="gallery-empty-state"]')).toBeVisible();
  });

  test('1. Verifies variants, density sizes, interactive CTAs, and dark mode contrast', async ({
    page,
  }) => {
    const emptyState = page.locator('[data-testid="live-empty-state"]');
    await expect(emptyState).toBeVisible();

    await page.locator('[data-testid="empty-state-variant-borderless"]').click();
    await expect(emptyState).toHaveAttribute('data-variant', 'borderless');

    await page.locator('[data-testid="empty-state-size-lg"]').click();
    await expect(emptyState).toHaveAttribute('data-size', 'lg');

    await page.locator('[data-testid="empty-state-primary-cta"]').click();
    await expect(page.locator('[data-testid="empty-state-action-notice"]')).toContainText(
      'Create Project',
    );

    await page.locator('[data-testid="empty-state-variant-subtle"]').click();
    await page.evaluate(() => document.documentElement.setAttribute('data-theme', 'dark'));
    await expect
      .poll(async () =>
        emptyState.evaluate((el) => getComputedStyle(el).backgroundColor !== 'rgba(0, 0, 0, 0)'),
      )
      .toBe(true);
  });

  test('2. Verifies RTL lang="ar" localization, Arabic tracking, and mobile containment', async ({
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
