import { expect, test } from '@playwright/test';

test.describe('Website AlertDialog Studio Real-Browser Verification', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/gallery/alert-dialog');
    await expect(page.locator('[data-testid="alert-dialog-studio"]')).toBeVisible();
  });

  test('1. Activates top-layer modal, focuses Cancel safely, ignores backdrop clicks, and enforces >=48px website control height', async ({
    page,
  }) => {
    const trigger = page.locator('[data-testid="open-alert-dialog-btn"]');
    const dialog = page.locator('[data-testid="specimen-alert-dialog"]');
    const cancelBtn = dialog.locator('[data-testid="specimen-cancel-btn"]');
    const actionBtn = dialog.locator('[data-testid="specimen-action-btn"]');

    await trigger.click();
    await expect(dialog).toBeVisible();
    await expect(dialog).toHaveAttribute('role', 'alertdialog');
    await expect(dialog).toHaveAttribute('aria-modal', 'true');
    await expect(cancelBtn).toBeFocused();

    // Website defaults to xl (48px) controls
    expect((await cancelBtn.boundingBox())?.height ?? 0).toBeGreaterThanOrEqual(48);

    await page.keyboard.press('Tab');
    await expect(actionBtn).toBeFocused();

    await page.mouse.click(8, 8);
    await expect(dialog).toBeVisible();

    await page.keyboard.press('Escape');
    await expect(dialog).not.toBeVisible();
    await expect(trigger).toBeFocused();
  });

  test('2. Applies RTL lang="ar" in modal top layer and renders Full Matrix view cleanly', async ({
    page,
  }) => {
    await page.locator('[data-testid="opt-dir-rtl"]').click();

    await page.locator('[data-testid="open-alert-dialog-btn"]').click();
    const dialog = page.locator('[data-testid="specimen-alert-dialog"]');
    await expect(dialog).toBeVisible();
    await expect(dialog).toContainText('هل أنت متأكد تماماً');
    await expect(dialog).toHaveAttribute('dir', 'rtl');
    await expect(dialog).toHaveAttribute('lang', 'ar');

    await page.keyboard.press('Escape');
    await expect(dialog).not.toBeVisible();

    await page.locator('[data-testid="opt-view-matrix"]').click();
    const matrix = page.locator('[data-testid="alert-dialog-matrix-grid"]');
    await expect(matrix).toBeVisible();
    await expect(matrix.locator('[data-testid="matrix-scenario-delete"]')).toBeVisible();
    await expect(matrix.locator('[data-testid="matrix-layout-split"]')).toBeVisible();

    const splitButtons = matrix.locator('[data-testid="matrix-layout-split"] button');
    expect(await splitButtons.count()).toBe(2);
    const splitBox0 = await splitButtons.nth(0).boundingBox();
    const splitBox1 = await splitButtons.nth(1).boundingBox();
    expect(Math.abs((splitBox0?.height ?? 0) - (splitBox1?.height ?? 0))).toBeLessThanOrEqual(1);
    expect(Math.abs((splitBox0?.width ?? 0) - (splitBox1?.width ?? 0))).toBeLessThanOrEqual(2);
  });
});
