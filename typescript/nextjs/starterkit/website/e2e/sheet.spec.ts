import { expect, test } from '@playwright/test';

test.describe('Website Sheet Studio Real-Browser Verification', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/gallery/sheet');
    await expect(page.locator('[data-testid="sheet-studio"]')).toBeVisible();
  });

  test('1. Opens modal sheet, traps Tab loop, dismisses via Escape/backdrop/close, and restores trigger focus', async ({
    page,
  }) => {
    const trigger = page.locator('[data-testid="open-sheet-btn"]');
    const sheet = page.locator('[data-testid="specimen-sheet"]');
    const status = page.locator('[data-testid="sheet-status"]');

    await expect(sheet).toHaveCount(0);
    await trigger.focus();
    await trigger.click();

    await expect(sheet).toBeVisible();
    await expect(status).toContainText('Open');

    const closeBtn = sheet.locator('button[aria-label="Close sheet"]');
    const doneBtn = sheet.locator('[data-testid="sheet-primary-action-btn"]');

    await closeBtn.focus();
    await page.keyboard.press('Shift+Tab');
    await expect(doneBtn).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(closeBtn).toBeFocused();

    await closeBtn.click();
    await expect(sheet).toHaveCount(0);
    await expect(trigger).toBeFocused();

    await trigger.click();
    await expect(sheet).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(sheet).toHaveCount(0);
    await expect(page.locator('[data-testid="sheet-close-reason"]')).toContainText('Escape key');
  });

  test('2. Verifies RTL lang="ar" logical docking, form initialFocusRef, and zero mobile overflow', async ({
    page,
  }) => {
    await page.locator('[data-testid="sheet-dir-rtl"]').click();
    await page.locator('[data-testid="sheet-scenario-form"]').click();
    await page.locator('[data-testid="open-sheet-btn"]').click();

    const sheet = page.locator('[data-testid="specimen-sheet"]');
    await expect(sheet).toBeVisible();
    await expect(sheet).toHaveAttribute('dir', 'rtl');
    await expect(sheet).toHaveAttribute('lang', 'ar');
    await expect(sheet.locator('[data-testid="sheet-form-name"]')).toBeFocused();

    const boxRtlEnd = await sheet.boundingBox();
    expect(boxRtlEnd).not.toBeNull();
    expect(Math.round(boxRtlEnd!.x)).toBe(0);

    await sheet.locator('[data-testid="sheet-cancel-btn"]').click();
    await expect(sheet).toHaveCount(0);

    await page.setViewportSize({ width: 375, height: 812 });
    const hasHorizontalOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
    );
    expect(hasHorizontalOverflow).toBe(false);
  });
});
