import { expect, test } from '@playwright/test';

test.describe('Dashboard Sheet Studio Real-Browser Verification', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/gallery/sheet');
    await expect(page.locator('[data-testid="sheet-studio"]')).toBeVisible();
  });

  test('1. Opens modal sheet, locks body scroll, traps Tab loop, and restores trigger focus', async ({
    page,
  }) => {
    const trigger = page.locator('[data-testid="open-sheet-btn"]');
    const sheet = page.locator('[data-testid="specimen-sheet"]');
    const status = page.locator('[data-testid="sheet-status"]');

    await expect(sheet).toHaveCount(0);
    await expect(status).toContainText('Closed');

    await trigger.focus();
    await trigger.click();

    await expect(sheet).toBeVisible();
    await expect(status).toContainText('Open');
    await expect(sheet.locator('[data-testid="sheet-body-details"]')).toBeVisible();

    const bodyOverflowLocked = await page.evaluate(() => document.body.style.overflow);
    expect(bodyOverflowLocked).toBe('hidden');

    // Verify Tab / Shift+Tab loop stays confined inside the open modal dialog
    const closeBtn = sheet.locator('button[aria-label="Close sheet"]');
    const doneBtn = sheet.locator('[data-testid="sheet-primary-action-btn"]');

    await closeBtn.focus();
    await expect(closeBtn).toBeFocused();

    await page.keyboard.press('Shift+Tab');
    await expect(doneBtn).toBeFocused();

    await page.keyboard.press('Tab');
    await expect(closeBtn).toBeFocused();

    // Dismiss via close button and verify scroll lock & focus restoration
    await closeBtn.click();
    await expect(sheet).toHaveCount(0);
    await expect(status).toContainText('Closed');
    await expect(page.locator('[data-testid="sheet-close-reason"]')).toContainText('Close button');
    await expect(trigger).toBeFocused();

    const bodyOverflowUnlocked = await page.evaluate(() => document.body.style.overflow);
    expect(bodyOverflowUnlocked).toBe('');
  });

  test('2. Enforces Escape guard, backdrop click guard, and shadow-free dashboard policy', async ({
    page,
  }) => {
    const trigger = page.locator('[data-testid="open-sheet-btn"]');
    const sheet = page.locator('[data-testid="specimen-sheet"]');

    // Lock both Escape and backdrop click
    await page.locator('[data-testid="sheet-toggle-prevent-escape"]').click();
    await page.locator('[data-testid="sheet-toggle-backdrop"]').click();

    await trigger.click();
    await expect(sheet).toBeVisible();

    // Confirm Dashboard sheet renders strictly shadow-free
    const boxShadow = await sheet.evaluate((el) => getComputedStyle(el).boxShadow);
    expect(boxShadow).toBe('none');

    // Escape should not dismiss while preventEscapeClose is active
    await page.keyboard.press('Escape');
    await expect(sheet).toBeVisible();

    // Clicking outside panel should not dismiss while closeOnBackdropClick is false
    await page.mouse.click(24, 140);
    await expect(sheet).toBeVisible();

    // Close programmatically via cancel button, then re-enable Escape & backdrop
    await sheet.locator('[data-testid="sheet-cancel-btn"]').click();
    await expect(sheet).toHaveCount(0);

    await page.locator('[data-testid="sheet-toggle-prevent-escape"]').click();
    await page.locator('[data-testid="sheet-toggle-backdrop"]').click();

    await trigger.click();
    await expect(sheet).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(sheet).toHaveCount(0);
    await expect(page.locator('[data-testid="sheet-close-reason"]')).toContainText('Escape key');

    await trigger.click();
    await expect(sheet).toBeVisible();
    await page.mouse.click(24, 140);
    await expect(sheet).toHaveCount(0);
    await expect(page.locator('[data-testid="sheet-close-reason"]')).toContainText(
      'Backdrop click',
    );
  });

  test('3. Verifies RTL lang="ar" logical docking, form initialFocusRef, navigation archetype, and mobile responsiveness', async ({
    page,
  }) => {
    await page.locator('[data-testid="sheet-dir-rtl"]').click();

    const canvas = page.locator('[data-testid="sheet-canvas"]');
    await expect(canvas).toHaveAttribute('dir', 'rtl');
    await expect(canvas).toHaveAttribute('lang', 'ar');

    // Form scenario moves initial focus directly to name input
    await page.locator('[data-testid="sheet-scenario-form"]').click();
    await page.locator('[data-testid="open-sheet-btn"]').click();

    const sheet = page.locator('[data-testid="specimen-sheet"]');
    await expect(sheet).toBeVisible();
    await expect(sheet).toHaveAttribute('dir', 'rtl');
    await expect(sheet).toHaveAttribute('lang', 'ar');
    await expect(sheet.locator('[data-testid="sheet-form-name"]')).toBeFocused();

    // In RTL, inline-end docks to physical left edge (box.x === 0)
    const boxRtlEnd = await sheet.boundingBox();
    expect(boxRtlEnd).not.toBeNull();
    expect(Math.round(boxRtlEnd!.x)).toBe(0);

    await sheet.locator('[data-testid="sheet-cancel-btn"]').click();
    await expect(sheet).toHaveCount(0);

    // Inline-start in RTL docks to physical right edge
    await page.locator('[data-testid="sheet-side-inline-start"]').click();
    await page.locator('[data-testid="sheet-scenario-navigation"]').click();
    await page.locator('[data-testid="open-sheet-btn"]').click();

    await expect(sheet.locator('[data-testid="sheet-body-navigation"]')).toBeVisible();
    const viewport = page.viewportSize()!;
    const boxRtlStart = await sheet.boundingBox();
    expect(boxRtlStart).not.toBeNull();
    expect(Math.round(boxRtlStart!.x + boxRtlStart!.width)).toBe(viewport.width);

    await sheet.locator('[data-testid="sheet-primary-action-btn"]').click();
    await expect(sheet).toHaveCount(0);

    // Zero horizontal overflow at mobile 375x812
    await page.setViewportSize({ width: 375, height: 812 });
    const hasHorizontalOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
    );
    expect(hasHorizontalOverflow).toBe(false);
  });
});
