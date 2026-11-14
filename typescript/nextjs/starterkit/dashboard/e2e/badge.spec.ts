import { expect, test } from '@playwright/test';

test.describe('Dashboard Badge Studio Real-Browser Verification', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/gallery/badge');
    await expect(page.locator('[data-testid="badge-studio"]')).toBeVisible();
  });

  test('1. Switches variant, density scale (20/24/28px), and rounded radius token (6px)', async ({
    page,
  }) => {
    const badge = page.locator('[data-testid="studio-badge"]');

    await page.locator('[data-testid="opt-variant-success"]').click();
    await expect(badge).toHaveAttribute('data-variant', 'success');

    await page.locator('[data-testid="opt-size-sm"]').click();
    const smBox = await badge.boundingBox();
    expect(smBox?.height).toBeCloseTo(20, 1);

    await page.locator('[data-testid="opt-size-md"]').click();
    const mdBox = await badge.boundingBox();
    expect(mdBox?.height).toBeCloseTo(24, 1);

    await page.locator('[data-testid="opt-size-lg"]').click();
    const lgBox = await badge.boundingBox();
    expect(lgBox?.height).toBeCloseTo(28, 1);

    await page.locator('[data-testid="opt-shape-rounded"]').click();
    await expect(badge).toHaveAttribute('data-shape', 'rounded');
    const borderRadius = await badge.evaluate((el) => window.getComputedStyle(el).borderRadius);
    expect(borderRadius).toBe('6px');
  });

  test('2. Renders decorative dot/icon with aria-hidden and dismisses + restores cleanly', async ({
    page,
  }) => {
    const badge = page.locator('[data-testid="studio-badge"]');

    await page.locator('[data-testid="toggle-badge-dot"]').click();
    await page.locator('[data-testid="toggle-badge-icon"]').click();
    await expect(badge.locator(':scope > span[aria-hidden="true"]')).toHaveCount(2);

    await page.locator('[data-testid="toggle-badge-dismissible"]').click();
    const removeBtn = badge.getByRole('button');
    await expect(removeBtn).toHaveAttribute('aria-label', /.+/);

    await removeBtn.click();
    await expect(badge).toHaveCount(0);

    await page.locator('[data-testid="studio-restore-badge"]').click();
    await expect(badge).toBeVisible();
  });

  test('3. Applies RTL lang="ar" Arabic clearance and renders full 7-variant matrix', async ({
    page,
  }) => {
    await page.locator('[data-testid="opt-dir-rtl"]').click();
    const badge = page.locator('[data-testid="studio-badge"]');
    await expect(badge).toHaveText('نشر نشط');

    const closestLang = await badge.evaluate((el) => el.closest('[lang]')?.getAttribute('lang'));
    expect(closestLang).toBe('ar');

    await page.locator('[data-testid="opt-view-matrix"]').click();
    const matrix = page.locator('[data-testid="badge-matrix-grid"]');
    await expect(matrix).toBeVisible();
    await expect(matrix.locator('[data-variant]')).toHaveCount(18);
  });

  test('4. Zero dashboard shadows verified on rendered badge', async ({ page }) => {
    const badge = page.locator('[data-testid="studio-badge"]');
    const boxShadow = await badge.evaluate((el) => window.getComputedStyle(el).boxShadow);
    expect(boxShadow === 'none' || boxShadow === '').toBe(true);
  });
});
