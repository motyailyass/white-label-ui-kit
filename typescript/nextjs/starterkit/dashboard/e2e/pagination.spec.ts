import { expect, test } from '@playwright/test';

test.describe('Dashboard Pagination Studio Real-Browser Verification', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/gallery/pagination');
    await expect(page.locator('[data-testid="pagination-studio"]')).toBeVisible();
  });

  test('1. Navigates pages, enforces edge boundary disabled states, ellipsis, sizing, and shadow-free styling', async ({
    page,
  }) => {
    const nav = page.locator('[data-testid="specimen-pagination"]');
    const status = page.locator('[data-testid="pagination-status"]');
    const prevBtn = page.locator('[data-testid="pagination-prev-btn"]');
    const nextBtn = page.locator('[data-testid="pagination-next-btn"]');
    const page1 = page.locator('[data-testid="pagination-page-1"]');
    const page3 = page.locator('[data-testid="pagination-page-3"]');
    const page10 = page.locator('[data-testid="pagination-page-10"]');

    await expect(nav).toHaveAttribute('aria-label', 'Pagination');
    await expect(nav).toHaveAttribute('data-size', 'md');
    await expect(nav).toHaveAttribute('data-shape', 'rounded');
    await expect(status).toContainText('Page 3 of 10');
    await expect(page3).toHaveAttribute('aria-current', 'page');

    // Shadow-free active button policy check in Dashboard
    const boxShadow = await page3.evaluate((el) => getComputedStyle(el).boxShadow);
    expect(boxShadow).toBe('none');

    // Jump to Page 1 -> Previous disabled
    await page1.click();
    await expect(status).toContainText('Page 1 of 10');
    await expect(page1).toHaveAttribute('aria-current', 'page');
    await expect(prevBtn).toBeDisabled();
    await expect(prevBtn).toHaveAttribute('aria-disabled', 'true');

    // Navigate via Next -> Previous re-enabled
    await nextBtn.click();
    await expect(status).toContainText('Page 2 of 10');
    await expect(prevBtn).toBeEnabled();

    // Jump to last page -> Next disabled
    await page10.click();
    await expect(status).toContainText('Page 10 of 10');
    await expect(nextBtn).toBeDisabled();
    await expect(nextBtn).toHaveAttribute('aria-disabled', 'true');

    // Switch density size to lg, shape to pill, & toggle ellipsis off
    await page.locator('[data-testid="pagination-size-lg"]').click();
    await expect(nav).toHaveAttribute('data-size', 'lg');
    await expect(page10).toHaveAttribute('data-size', 'lg');

    await page.locator('[data-testid="pagination-shape-pill"]').click();
    await expect(nav).toHaveAttribute('data-shape', 'pill');
    await expect(page10).toHaveAttribute('data-shape', 'pill');
    const pillBorderRadius = await page10.evaluate((el) => getComputedStyle(el).borderRadius);
    expect(pillBorderRadius).toBe('9999px');
    const page10Box = await page10.boundingBox();
    expect(page10Box).not.toBeNull();
    expect(Math.abs(page10Box!.width - page10Box!.height)).toBeLessThanOrEqual(1);

    await page.locator('[data-testid="toggle-pagination-ellipsis"]').click();
    await expect(nav.getByText('More pages')).toHaveCount(0);
    await expect(page.locator('[data-testid="pagination-page-5"]')).toBeVisible();
  });

  test('2. Verifies RTL lang="ar" copy, physical RTL button ordering, icon mirroring, and mobile overflow', async ({
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
    await expect(nextBtn.locator('[data-mirror-rtl="true"]')).toHaveCount(1);

    // Under RTL, inline-start Previous sits physically to the RIGHT of Page 1 (and Next on single row, or above wrapped Next)
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

    // Zero horizontal overflow on 375x812 mobile viewport
    await page.setViewportSize({ width: 375, height: 812 });
    const hasHorizontalOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
    );
    expect(hasHorizontalOverflow).toBe(false);
  });
});
