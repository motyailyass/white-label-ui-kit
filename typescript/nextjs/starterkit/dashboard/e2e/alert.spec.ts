import { expect, test } from '@playwright/test';

test.describe('Dashboard Alert Studio Real-Browser Verification', () => {
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

    await page.locator('[data-testid="opt-var-bordered"]').click();
    await expect(alert).toHaveAttribute('data-variant', 'bordered');

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

  test('2. Dismisses smoothly to inert/closed state and reopens cleanly', async ({ page }) => {
    const alert = page.locator('[data-testid="studio-alert"]');
    const wrapper = alert.locator('..');
    const closeBtn = alert.locator('button[aria-label]').first();

    await expect(wrapper).toHaveAttribute('data-state', 'open');
    await closeBtn.click();

    await expect(wrapper).toHaveAttribute('data-state', 'closed');
    await expect(wrapper).toHaveAttribute('aria-hidden', 'true');

    const reopenBtn = page.locator('[data-testid="alert-reopen-btn"]');
    await expect(reopenBtn).toBeVisible();
    await reopenBtn.click();

    await expect(wrapper).toHaveAttribute('data-state', 'open');
  });

  test('3. Applies RTL lang="ar" and renders full Status × Variant & Size matrices cleanly', async ({
    page,
  }) => {
    await page.locator('[data-testid="opt-dir-rtl"]').click();
    const alert = page.locator('[data-testid="studio-alert"]');

    await expect(alert).toContainText('الاقتراب من حد الحصة');
    const closestLang = await alert.evaluate((el) => el.closest('[lang]')?.getAttribute('lang'));
    expect(closestLang).toBe('ar');

    await page.locator('[data-testid="opt-view-matrix"]').click();
    const matrix = page.locator('[data-testid="alert-matrix-grid"]');
    await expect(matrix).toBeVisible();
    await expect(matrix.locator('[data-status][data-variant]')).toHaveCount(15);
    await expect(matrix.locator('[data-testid="matrix-alert-danger-solid"]')).toBeVisible();
    await expect(matrix.locator('[data-testid="matrix-size-lg"]')).toBeVisible();
  });

  test('4. Enforces zero dashboard shadows across all alert variants', async ({ page }) => {
    const variants = ['opt-var-subtle', 'opt-var-bordered', 'opt-var-solid'] as const;
    const alert = page.locator('[data-testid="studio-alert"]');

    for (const variantTestId of variants) {
      await page.locator(`[data-testid="${variantTestId}"]`).click();
      const boxShadow = await alert.evaluate((el) => window.getComputedStyle(el).boxShadow);
      expect(boxShadow === 'none' || boxShadow === '').toBe(true);
    }
  });
});
