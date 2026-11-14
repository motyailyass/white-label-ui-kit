import { expect, test } from '@playwright/test';

test.describe('Dashboard Dialog Primitive Real-Browser Verification', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/gallery/dialog');
    await expect(page.locator('[data-testid="dialog-gallery"]')).toBeVisible();
  });

  test('verifies native <dialog> top-layer modal activation and background inertness', async ({
    page,
  }) => {
    const trigger = page.locator('[data-testid="studio-open-live-modal-btn"]');
    const dialog = page.locator('[data-testid="studio-live-modal"]');

    // 1. Initial state: closed and hidden
    await expect(dialog).not.toBeVisible();

    // 2. Click trigger: opens modal
    await trigger.click();
    await expect(dialog).toBeVisible();
    await expect(dialog).toHaveAttribute('open', '');

    // 3. Background content is inert: clicking a background button is blocked
    const bgButton = page.locator('[data-testid="opt-arch-standard"]');
    let wasClicked = false;
    try {
      await bgButton.click({ timeout: 500, force: false });
      wasClicked = true;
    } catch {
      wasClicked = false;
    }
    expect(wasClicked).toBe(false);

    // 4. Close via cancel button
    const cancelBtn = dialog.locator('[data-testid="dialog-cancel-btn"]');
    await cancelBtn.click();
    await expect(dialog).not.toBeVisible();
  });

  test('verifies focus trap containment and initialFocusRef targeting non-destructive action', async ({
    page,
  }) => {
    const trigger = page.locator('[data-testid="studio-open-live-modal-btn"]');
    const dialog = page.locator('[data-testid="studio-live-modal"]');
    const cancelBtn = dialog.locator('[data-testid="dialog-cancel-btn"]');
    const confirmBtn = dialog.locator('[data-testid="dialog-confirm-btn"]');
    const closeBtn = dialog.locator('[data-testid="dialog-close-button"]');

    await trigger.click();
    await expect(dialog).toBeVisible();

    // Initial focus must be on the non-destructive Cancel button via initialFocusRef
    await expect(cancelBtn).toBeFocused();

    // Tab moves forward to Delete button
    await page.keyboard.press('Tab');
    await expect(confirmBtn).toBeFocused();

    // Tab wraps to the close button, which is first in DOM order
    await page.keyboard.press('Tab');
    await expect(closeBtn).toBeFocused();

    // Tab continues to the Cancel button
    await page.keyboard.press('Tab');
    await expect(cancelBtn).toBeFocused();

    // Shift+Tab loops backward to the close button
    await page.keyboard.press('Shift+Tab');
    await expect(closeBtn).toBeFocused();

    // Escape dismisses dialog
    await page.keyboard.press('Escape');
    await expect(dialog).not.toBeVisible();
  });

  test('verifies focus restoration to invoking trigger upon closure', async ({ page }) => {
    const trigger = page.locator('[data-testid="studio-open-live-modal-btn"]');
    const dialog = page.locator('[data-testid="studio-live-modal"]');

    await trigger.focus();
    await expect(trigger).toBeFocused();

    // Open via Enter key
    await page.keyboard.press('Enter');
    await expect(dialog).toBeVisible();

    // Dismiss via Escape
    await page.keyboard.press('Escape');
    await expect(dialog).not.toBeVisible();

    // Focus must be restored to trigger
    await expect(trigger).toBeFocused();
  });

  test('verifies form submission, input validation, and cancel guard', async ({ page }) => {
    // Switch to Form archetype
    await page.locator('[data-testid="opt-arch-form"]').click();

    const trigger = page.locator('[data-testid="studio-open-live-modal-btn"]');
    const dialog = page.locator('[data-testid="studio-live-modal"]');
    const nameInput = dialog.locator('[data-testid="dialog-form-name-input"]');
    const roleSelect = dialog.locator('[data-testid="dialog-form-role-select"]');
    const submitBtn = dialog.locator('[data-testid="dialog-submit-btn"]');
    const cancelBtn = dialog.locator('[data-testid="dialog-cancel-btn"]');

    await trigger.click();
    await expect(dialog).toBeVisible();

    // 1. Submit empty required form: blocked by native validation
    await submitBtn.click();
    const isNameMissing = await nameInput.evaluate(
      (el: HTMLInputElement) => el.validity.valueMissing,
    );
    expect(isNameMissing).toBe(true);

    // 2. Click Cancel button: does NOT trigger form submit error; closes dialog
    await cancelBtn.click();
    await expect(dialog).not.toBeVisible();

    // 3. Reopen and complete form
    await trigger.click();
    await expect(dialog).toBeVisible();
    await nameInput.fill('Alex Morgan');
    await roleSelect.click();
    await page.locator('li[role="option"]').filter({ hasText: 'Editor' }).click();
    await submitBtn.click();

    // Form successfully submitted
    await expect(dialog).not.toBeVisible();
  });

  test('verifies sizing scale data-size attributes and max-width application', async ({ page }) => {
    const sizes = ['sm', 'md', 'lg', 'xl'] as const;
    const sizeLimits = { sm: 401, md: 541, lg: 721, xl: 961 };

    for (const size of sizes) {
      await page.locator(`[data-testid="opt-dlg-size-${size}"]`).click();

      const preview = page.locator('[data-testid="studio-inline-dialog-preview"]');
      await expect(preview).toBeVisible();
      await expect(preview).toHaveAttribute('data-size', size);

      const box = await preview.boundingBox();
      expect(box).not.toBeNull();
      expect(box!.width).toBeLessThanOrEqual(sizeLimits[size]);
    }
  });

  test('verifies backdrop dismissal policy: off by default, opt-in via closeOnBackdropClick', async ({
    page,
  }) => {
    const trigger = page.locator('[data-testid="studio-open-live-modal-btn"]');
    const dialog = page.locator('[data-testid="studio-live-modal"]');

    // 1. Default: closeOnBackdropClick = false
    await trigger.click();
    await expect(dialog).toBeVisible();

    // Click outside dialog surface at top-left corner
    await page.mouse.click(10, 10);
    // Dialog must remain open
    await expect(dialog).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(dialog).not.toBeVisible();

    // 2. Enable closeOnBackdropClick
    await page.locator('[data-testid="toggle-dialog-backdrop-dismiss"]').click();
    await trigger.click();
    await expect(dialog).toBeVisible();

    // Click outside dialog surface on the backdrop scrim
    await page.mouse.click(10, 10);
    // Dialog closes
    await expect(dialog).not.toBeVisible();
  });

  test('verifies optional top-corner close button with accessible label', async ({ page }) => {
    const trigger = page.locator('[data-testid="studio-open-live-modal-btn"]');
    const dialog = page.locator('[data-testid="studio-live-modal"]');
    const closeBtn = dialog.locator('[data-testid="dialog-close-button"]');

    await trigger.click();
    await expect(dialog).toBeVisible();

    // Close button must exist, have type="button", and accessible label
    await expect(closeBtn).toBeVisible();
    await expect(closeBtn).toHaveAttribute('type', 'button');
    expect(await closeBtn.getAttribute('aria-label')).toBeTruthy();

    await closeBtn.click();
    await expect(dialog).not.toBeVisible();
  });

  test('verifies preventEscapeClose prevents premature dismissal', async ({ page }) => {
    const trigger = page.locator('[data-testid="studio-open-live-modal-btn"]');
    const dialog = page.locator('[data-testid="studio-live-modal"]');

    // Turn on preventEscapeClose
    await page.locator('[data-testid="toggle-dialog-prevent-escape"]').click();
    await trigger.click();
    await expect(dialog).toBeVisible();

    // Press Escape: dialog must NOT close
    await page.keyboard.press('Escape');
    await expect(dialog).toBeVisible();

    // Close via button
    await dialog.locator('[data-testid="dialog-cancel-btn"]').click();
    await expect(dialog).not.toBeVisible();
  });

  test('verifies zero dashboard shadows on dialog surface', async ({ page }) => {
    const preview = page.locator('[data-testid="studio-inline-dialog-preview"]');
    await expect(preview).toBeVisible();

    const boxShadow = await preview.evaluate((el) => window.getComputedStyle(el).boxShadow);
    expect(boxShadow === 'none' || boxShadow === '').toBe(true);
  });

  test('verifies RTL direction and Arabic layout', async ({ page }) => {
    await page.locator('[data-testid="opt-dir-rtl"]').click();
    const preview = page.locator('[data-testid="studio-inline-dialog-preview"]');
    await expect(preview).toBeVisible();
    await expect(page.locator('[data-testid="studio-preview-canvas"]')).toHaveAttribute(
      'dir',
      'rtl',
    );

    // Preview reflects Arabic text without crashing
    const title = preview.locator('h2, h3').first();
    await expect(title).toBeVisible();
  });

  test('verifies responsive reflow without horizontal overflow at narrow viewport (320px)', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 320, height: 600 });
    const preview = page.locator('[data-testid="studio-inline-dialog-preview"]');
    await expect(preview).toBeVisible();

    const box = await preview.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.width).toBeLessThanOrEqual(320);
  });
});
