import { expect, test } from '@playwright/test';

test.describe('Website Pagination Studio Real-Browser Verification', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/gallery/pagination');
    await expect(page.locator('[data-testid="pagination-studio"]')).toBeVisible();
  });

  test('1. Navigates pages, enforces edge boundary disabled states, and switches density sizing', async ({
    page,
  }) => {
    const nav = page.locator('[data-testid="specimen-pagination"]');
    const status = page.locator('[data-testid="pagination-status"]');
    const prevBtn = page.locator('[data-testid="pagination-prev-btn"]');
    const nextBtn = page.locator('[data-testid="pagination-next-btn"]');

    await expect(nav).toHaveAttribute('data-size', 'md');
    await expect(nav).toHaveAttribute('data-shape', 'rounded');
    await expect(status).toContainText('Page 3 of 10');

    await page.locator('[data-testid="pagination-page-1"]').click();
    await expect(prevBtn).toBeDisabled();

    const page10 = page.locator('[data-testid="pagination-page-10"]');
    await page10.click();
    await expect(nextBtn).toBeDisabled();

    await page.locator('[data-testid="pagination-size-sm"]').click();
    await expect(nav).toHaveAttribute('data-size', 'sm');

    await page.locator('[data-testid="pagination-shape-pill"]').click();
    await expect(nav).toHaveAttribute('data-shape', 'pill');
    await expect(page10).toHaveAttribute('data-shape', 'pill');
    const pillBorderRadius = await page10.evaluate((el) => getComputedStyle(el).borderRadius);
    expect(pillBorderRadius).toBe('9999px');
    const page10Box = await page10.boundingBox();
    expect(page10Box).not.toBeNull();
    expect(Math.abs(page10Box!.width - page10Box!.height)).toBeLessThanOrEqual(1);
  });

  test('2. Verifies RTL lang="ar" physical ordering, icon mirroring, and mobile overflow', async ({
    page,
  }) => {
    await page.locator('[data-testid="pagination-dir-rtl"]').click();

    const canvas = page.locator('[data-testid="pagination-canvas"]');
    const prevBtn = page.locator('[data-testid="pagination-prev-btn"]');
    const nextBtn = page.locator('[data-testid="pagination-next-btn"]');

    await expect(canvas).toHaveAttribute('dir', 'rtl');
    await expect(canvas).toHaveAttribute('lang', 'ar');
    await expect(prevBtn).toContainText('السابق');
    await expect(nextBtn).toContainText('التالي');
    await expect(prevBtn.locator('[data-mirror-rtl="true"]')).toHaveCount(1);

    const prevBox = await prevBtn.boundingBox();
    const page1Box = await page.locator('[data-testid="pagination-page-1"]').boundingBox();
    const nextBox = await nextBtn.boundingBox();
    expect(prevBox).not.toBeNull();
    expect(page1Box).not.toBeNull();
    expect(nextBox).not.toBeNull();
    expect(prevBox!.x).toBeGreaterThan(page1Box!.x);
    if (Math.abs(prevBox!.y - nextBox!.y) < 4) {
      expect(prevBox!.x).toBeGreaterThan(nextBox!.x);
    } else {
      expect(nextBox!.y).toBeGreaterThan(prevBox!.y);
    }

    await page.setViewportSize({ width: 375, height: 812 });
    const hasHorizontalOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
    );
    expect(hasHorizontalOverflow).toBe(false);
  });
});
