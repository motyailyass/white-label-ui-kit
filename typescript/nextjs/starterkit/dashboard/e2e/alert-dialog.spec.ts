import { expect, test } from '@playwright/test';

test.describe('Dashboard AlertDialog Studio Real-Browser Verification', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/gallery/alert-dialog');
    await expect(page.locator('[data-testid="alert-dialog-studio"]')).toBeVisible();
  });

  test('1. Activates top-layer modal, traps Tab focus on Cancel, ignores backdrop clicks, and restores trigger focus on Escape', async ({
    page,
  }) => {
    const trigger = page.locator('[data-testid="open-alert-dialog-btn"]');
    const dialog = page.locator('[data-testid="specimen-alert-dialog"]');
    const cancelBtn = dialog.locator('[data-testid="specimen-cancel-btn"]');
    const actionBtn = dialog.locator('[data-testid="specimen-action-btn"]');

    await expect(dialog).not.toBeVisible();
    await trigger.click();

    await expect(dialog).toBeVisible();
    await expect(dialog).toHaveAttribute('role', 'alertdialog');
    await expect(dialog).toHaveAttribute('aria-modal', 'true');
    await expect(dialog).toHaveAttribute('open', '');

    // Initial focus must land on non-destructive Cancel button
    await expect(cancelBtn).toBeFocused();

    // Tab wraps smoothly between Cancel and Action
    await page.keyboard.press('Tab');
    await expect(actionBtn).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(cancelBtn).toBeFocused();

    // Clicking backdrop scrim outside dialog rect must NOT dismiss AlertDialog
    await page.mouse.click(8, 8);
    await expect(dialog).toBeVisible();

    // Escape closes safely and returns focus to trigger
    await page.keyboard.press('Escape');
    await expect(dialog).not.toBeVisible();
    await expect(trigger).toBeFocused();
  });

  test('2. Verifies sm/md/lg widths, responsive coarse-pointer button height, and zero dashboard shadows', async ({
    page,
  }) => {
    const inlineCard = page.locator('[data-testid="inline-alert-dialog-card"]');
    const dialog = page.locator('[data-testid="specimen-alert-dialog"]');
    const cancelBtn = dialog.locator('[data-testid="specimen-cancel-btn"]');
    const viewportWidth = page.viewportSize()?.width ?? 1280;
    const isCoarse = await page.evaluate(
      () => window.matchMedia('(any-pointer: coarse), (pointer: coarse)').matches,
    );

    await page.locator('[data-testid="opt-size-sm"]').click();
    expect(Math.round((await inlineCard.boundingBox())?.width ?? 0)).toBeLessThanOrEqual(384);

    if (viewportWidth >= 768) {
      await page.locator('[data-testid="opt-size-lg"]').click();
      expect(Math.round((await inlineCard.boundingBox())?.width ?? 0)).toBeCloseTo(576, 1);
    }

    await page.locator('[data-testid="open-alert-dialog-btn"]').click();
    await expect(dialog).toBeVisible();

    const cancelHeight = (await cancelBtn.boundingBox())?.height ?? 0;
    if (isCoarse) {
      expect(cancelHeight).toBeGreaterThanOrEqual(48);
    } else {
      expect(cancelHeight).toBeCloseTo(36, 1);
    }

    const dialogShadow = await dialog.evaluate((el) => window.getComputedStyle(el).boxShadow);
    const cardShadow = await inlineCard.evaluate((el) => window.getComputedStyle(el).boxShadow);
    expect(dialogShadow === 'none' || dialogShadow === '').toBe(true);
    expect(cardShadow === 'none' || cardShadow === '').toBe(true);
  });

  test('3. Applies RTL lang="ar" on both inline and top-layer modal and renders Full Matrix view cleanly', async ({
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
    await expect(matrix.locator('[data-testid="matrix-scenario-revoke"]')).toBeVisible();
    await expect(matrix.locator('[data-testid="matrix-scenario-discard"]')).toBeVisible();
    await expect(matrix.locator('[data-testid="matrix-layout-split"]')).toBeVisible();
    await expect(matrix.locator('[data-testid="matrix-layout-between"]')).toBeVisible();

    // Ensure 50/50 split footer buttons maintain equal height even if labels wrap
    const splitButtons = matrix.locator('[data-testid="matrix-layout-split"] button');
    expect(await splitButtons.count()).toBe(2);
    const splitBox0 = await splitButtons.nth(0).boundingBox();
    const splitBox1 = await splitButtons.nth(1).boundingBox();
    expect(Math.abs((splitBox0?.height ?? 0) - (splitBox1?.height ?? 0))).toBeLessThanOrEqual(1);
    expect(Math.abs((splitBox0?.width ?? 0) - (splitBox1?.width ?? 0))).toBeLessThanOrEqual(2);
  });
});
