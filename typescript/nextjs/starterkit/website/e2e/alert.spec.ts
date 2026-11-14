import { expect, test } from '@playwright/test';

test.describe('Website Alert Studio Real-Browser Verification', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/gallery/alert');
    await expect(page.locator('[data-testid="alert-studio"]')).toBeVisible();
  });

  test('1. Verifies semantic ARIA roles, variants, sizes, and close button sizing', async ({
    page,
  }) => {
    const alert = page.locator('[data-testid="studio-alert"]');
    await expect(alert).toHaveAttribute('role', 'status');
    await expect(alert).toHaveAttribute('aria-live', 'polite');

    await page.locator('[data-testid="opt-status-danger"]').click();
    await expect(alert).toHaveAttribute('role', 'alert');
    await expect(alert).toHaveAttribute('aria-live', 'assertive');

    await page.locator('[data-testid="opt-var-solid"]').click();
    await expect(alert).toHaveAttribute('data-variant', 'solid');

    const closeBtn = alert.locator('button[aria-label]').first();
    await page.locator('[data-testid="opt-size-sm"]').click();
    expect((await closeBtn.boundingBox())?.height ?? 0).toBeCloseTo(28, 1);

    await page.locator('[data-testid="opt-size-md"]').click();
    expect((await closeBtn.boundingBox())?.height ?? 0).toBeCloseTo(32, 1);

    await page.locator('[data-testid="opt-size-lg"]').click();
    expect((await closeBtn.boundingBox())?.height ?? 0).toBeCloseTo(36, 1);
  });

  test('2. Supports dismissal, reopen, RTL lang="ar", and full matrix view', async ({ page }) => {
    const alert = page.locator('[data-testid="studio-alert"]');
    const wrapper = alert.locator('..');
    const closeBtn = alert.locator('button[aria-label]').first();

    await closeBtn.click();
    await expect(wrapper).toHaveAttribute('data-state', 'closed');
    await expect(wrapper).toHaveAttribute('aria-hidden', 'true');

    await page.locator('[data-testid="alert-reopen-btn"]').click();
    await expect(wrapper).toHaveAttribute('data-state', 'open');

    await page.locator('[data-testid="opt-dir-rtl"]').click();
    await expect(alert).toContainText('الاقتراب من حد الحصة');
    const closestLang = await alert.evaluate((el) => el.closest('[lang]')?.getAttribute('lang'));
    expect(closestLang).toBe('ar');

    await page.locator('[data-testid="opt-view-matrix"]').click();
    const matrix = page.locator('[data-testid="alert-matrix-grid"]');
    await expect(matrix).toBeVisible();
    await expect(matrix.locator('[data-status][data-variant]')).toHaveCount(15);
  });
});
