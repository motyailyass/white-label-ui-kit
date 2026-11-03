import { expect, test } from '@playwright/test';

test.describe('Dashboard Dialog Primitive Real-Browser Verification', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/gallery/dialog');
    await expect(page.locator('[data-testid="dialog-gallery"]')).toBeVisible();
  });

  test('verifies native <dialog> top-layer modal activation and background inertness', async ({ page }) => {
    const trigger = page.locator('[data-testid="basic-dialog-trigger"]');
    const dialog = page.locator('[data-testid="basic-dialog"]');

    // 1. Initial state: closed and hidden
    await expect(dialog).not.toBeVisible();

    // 2. Click trigger: opens modal
    await trigger.click();
    await expect(dialog).toBeVisible();
    await expect(dialog).toHaveAttribute('open', '');

    // 3. Background content is inert: clicking a background button is blocked
    const bgButton = page.locator('[data-testid="confirmation-dialog-trigger"]');
    await expect(bgButton).toBeDisabled({ timeout: 1000 }).catch(async () => {
      // In Chromium top-layer modals, background elements are inert and non-clickable
      let wasClicked = false;
      try {
        await bgButton.click({ timeout: 500, force: false });
        wasClicked = true;
      } catch {
        wasClicked = false;
      }
      expect(wasClicked).toBe(false);
    });

    // 4. Close via cancel button
    const cancelBtn = page.locator('[data-testid="basic-dialog-cancel-btn"]');
    await cancelBtn.click();
    await expect(dialog).not.toBeVisible();
  });

  test('verifies focus trap containment and initialFocusRef targeting non-destructive action', async ({
    page,
  }) => {
    const trigger = page.locator('[data-testid="confirmation-dialog-trigger"]');
    const dialog = page.locator('[data-testid="confirmation-dialog"]');
    const cancelBtn = page.locator('[data-testid="confirm-cancel-btn"]');
    const deleteBtn = page.locator('[data-testid="confirm-delete-btn"]');

    await trigger.click();
    await expect(dialog).toBeVisible();

    // Initial focus must be on the non-destructive Cancel button via initialFocusRef
    await expect(cancelBtn).toBeFocused();

    // Tab moves forward to Delete button
    await page.keyboard.press('Tab');
    await expect(deleteBtn).toBeFocused();

    // Tab from last element wraps around back to Cancel button
    await page.keyboard.press('Tab');
    await expect(cancelBtn).toBeFocused();

    // Shift+Tab loops backward to Delete button
    await page.keyboard.press('Shift+Tab');
    await expect(deleteBtn).toBeFocused();

    // Escape dismisses dialog
    await page.keyboard.press('Escape');
    await expect(dialog).not.toBeVisible();
  });

  test('verifies focus restoration to invoking trigger upon closure', async ({ page }) => {
    const trigger = page.locator('[data-testid="basic-dialog-trigger"]');
    const dialog = page.locator('[data-testid="basic-dialog"]');
    const cancelBtn = page.locator('[data-testid="basic-dialog-cancel-btn"]');

    await trigger.focus();
    await expect(trigger).toBeFocused();

    // Open via Enter key
    await page.keyboard.press('Enter');
    await expect(dialog).toBeVisible();

    // Dismiss via Cancel button
    await cancelBtn.click();
    await expect(dialog).not.toBeVisible();

    // Focus must be restored to trigger
    await expect(trigger).toBeFocused();
  });

  test('verifies form submission, input validation, and cancel guard', async ({ page }) => {
    const trigger = page.locator('[data-testid="form-dialog-trigger"]');
    const dialog = page.locator('[data-testid="form-dialog"]');
    const nameInput = page.locator('[data-testid="form-name-input"]');
    const roleSelect = page.locator('[data-testid="form-role-select"]');
    const submitBtn = page.locator('[data-testid="form-submit-btn"]');
    const cancelBtn = page.locator('[data-testid="form-cancel-btn"]');
    const statusText = page.locator('[data-testid="form-status-text"]');

    await trigger.click();
    await expect(dialog).toBeVisible();

    // 1. Submit empty required form: blocked by native validation
    await submitBtn.click();
    const isNameMissing = await nameInput.evaluate((el: HTMLInputElement) => el.validity.valueMissing);
    expect(isNameMissing).toBe(true);

    // 2. Click Cancel button: does NOT trigger form submit error; closes dialog
    await cancelBtn.click();
    await expect(dialog).not.toBeVisible();
    await expect(statusText).toContainText('canceled');

    // 3. Reopen and complete form
    await trigger.click();
    await expect(dialog).toBeVisible();
    await nameInput.fill('Alex Rivera');
    await roleSelect.selectOption('editor');
    await submitBtn.click();

    // Form successfully submitted
    await expect(dialog).not.toBeVisible();
    await expect(statusText).toContainText('successfully');
  });

  test('verifies form timer cancellation on dismiss and prevents closing reopened dialog', async ({
    page,
  }) => {
    const trigger = page.locator('[data-testid="form-dialog-trigger"]');
    const dialog = page.locator('[data-testid="form-dialog"]');
    const nameInput = page.locator('[data-testid="form-name-input"]');
    const roleSelect = page.locator('[data-testid="form-role-select"]');
    const submitBtn = page.locator('[data-testid="form-submit-btn"]');
    const cancelBtn = page.locator('[data-testid="form-cancel-btn"]');

    // 1. Open and submit form to start simulated pending timer
    await trigger.click();
    await expect(dialog).toBeVisible();
    await nameInput.fill('Timer Test');
    await roleSelect.selectOption('editor');
    await submitBtn.click();

    // 2. Immediately cancel before 500ms timer finishes
    await cancelBtn.click();
    await expect(dialog).not.toBeVisible();

    // 3. Reopen dialog immediately
    await trigger.click();
    await expect(dialog).toBeVisible();

    // 4. Wait past the old 500ms timer window
    await page.waitForTimeout(650);

    // Dialog must remain open; the stale cancelled timer must not close it
    await expect(dialog).toBeVisible();

    // Clean close
    await cancelBtn.click();
    await expect(dialog).not.toBeVisible();
  });

  test('verifies nested Select integration, selection change, and keyboard dismissal', async ({
    page,
  }) => {
    const trigger = page.locator('[data-testid="nested-select-dialog-trigger"]');
    const dialog = page.locator('[data-testid="nested-select-dialog"]');
    const select = page.locator('[data-testid="nested-select-element"]');
    const closeBtn = page.locator('[data-testid="nested-dialog-close-btn"]');

    await trigger.click();
    await expect(dialog).toBeVisible();

    // Select must be visible and interactive inside dialog
    await expect(select).toBeVisible();
    await select.selectOption('eu-central');
    expect(await select.inputValue()).toBe('eu-central');

    // Pressing Escape on focused select dismisses dialog
    await select.focus();
    await page.keyboard.press('Escape');
    await expect(dialog).not.toBeVisible();
  });

  test('verifies long content scroll containment without background scroll', async ({ page }) => {
    const trigger = page.locator('[data-testid="long-dialog-trigger"]');
    const dialog = page.locator('[data-testid="long-dialog"]');
    const dialogBody = page.locator('[data-testid="long-dialog-body"]');
    const acceptBtn = page.locator('[data-testid="long-dialog-accept-btn"]');

    await trigger.click();
    await expect(dialog).toBeVisible();

    // Verify dialog body has scrollable content
    const isScrollable = await dialogBody.evaluate((el) => el.scrollHeight > el.clientHeight);
    expect(isScrollable).toBe(true);

    // Header and footer actions remain fully visible and clickable
    await expect(acceptBtn).toBeVisible();
    await acceptBtn.click();
    await expect(dialog).not.toBeVisible();
  });

  test('verifies sizing scale data-size attributes and max-width application', async ({ page }) => {
    const sizes = ['sm', 'md', 'lg', 'xl'] as const;

    for (const size of sizes) {
      const sizeTrigger = page.locator(`[data-testid="size-trigger-${size}"]`);
      await sizeTrigger.scrollIntoViewIfNeeded();
      await sizeTrigger.click();

      const dialog = page.locator(`[data-testid="dialog-size-${size}"]`);
      await expect(dialog).toBeVisible();
      await expect(dialog).toHaveAttribute('data-size', size);

      // Verify max-width reflects size token
      const box = await dialog.boundingBox();
      expect(box).not.toBeNull();
      if (size === 'sm') expect(box!.width).toBeLessThanOrEqual(401);
      if (size === 'md') expect(box!.width).toBeLessThanOrEqual(541);
      if (size === 'lg') expect(box!.width).toBeLessThanOrEqual(721);
      if (size === 'xl') expect(box!.width).toBeLessThanOrEqual(961);

      await page.keyboard.press('Escape');
      await expect(dialog).not.toBeVisible();
    }
  });

  test('verifies backdrop dismissal policy: off by default, opt-in via closeOnBackdropClick', async ({
    page,
  }) => {
    // 1. Basic dialog (default: closeOnBackdropClick = false)
    const basicTrigger = page.locator('[data-testid="basic-dialog-trigger"]');
    const basicDialog = page.locator('[data-testid="basic-dialog"]');
    await basicTrigger.click();
    await expect(basicDialog).toBeVisible();

    // Click outside dialog surface at top-left corner
    await page.mouse.click(10, 10);
    // Dialog must remain open
    await expect(basicDialog).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(basicDialog).not.toBeVisible();

    // 2. Backdrop dialog (closeOnBackdropClick = true)
    const backdropTrigger = page.locator('[data-testid="backdrop-dialog-trigger"]');
    const backdropDialog = page.locator('[data-testid="backdrop-dialog"]');
    await backdropTrigger.scrollIntoViewIfNeeded();
    await backdropTrigger.click();
    await expect(backdropDialog).toBeVisible();

    // Click outside dialog surface on the backdrop scrim
    await page.mouse.click(10, 10);
    // Dialog closes
    await expect(backdropDialog).not.toBeVisible();
  });

  test('verifies optional top-corner close button with accessible label', async ({ page }) => {
    const trigger = page.locator('[data-testid="close-button-dialog-trigger"]');
    const dialog = page.locator('[data-testid="close-button-dialog"]');
    const closeBtn = page.locator('[data-testid="dialog-close-button"]');

    await trigger.scrollIntoViewIfNeeded();
    await trigger.click();
    await expect(dialog).toBeVisible();

    // Close button must exist, have type="button", and accessible label
    await expect(closeBtn).toBeVisible();
    await expect(closeBtn).toHaveAttribute('type', 'button');
    expect(await closeBtn.getAttribute('aria-label')).toBeTruthy();

    await closeBtn.click();
    await expect(dialog).not.toBeVisible();
  });

  test('verifies preventEscapeClose prevents premature dismissal during pending save', async ({
    page,
  }) => {
    const trigger = page.locator('[data-testid="pending-dialog-trigger"]');
    const dialog = page.locator('[data-testid="pending-dialog"]');
    const startBtn = page.locator('[data-testid="pending-start-btn"]');
    const cancelBtn = page.locator('[data-testid="pending-cancel-btn"]');

    await trigger.scrollIntoViewIfNeeded();
    await trigger.click();
    await expect(dialog).toBeVisible();

    // Start migration
    await startBtn.click();
    await expect(cancelBtn).toBeDisabled();

    // Attempt Escape while operation is pending: dialog must NOT close
    await page.keyboard.press('Escape');
    await expect(dialog).toBeVisible();

    // Wait for migration to finish
    await page.waitForTimeout(1600);
    await expect(cancelBtn).toBeEnabled();

    // Now Escape closes dialog
    await page.keyboard.press('Escape');
    await expect(dialog).not.toBeVisible();
  });

  test('verifies asymmetric focus restoration when invoking trigger element is removed', async ({
    page,
  }) => {
    const deleteTrigger = page.locator('[data-testid="delete-row-trigger-btn"]');
    const deleteDialog = page.locator('[data-testid="delete-row-dialog"]');
    const confirmDeleteBtn = page.locator('[data-testid="confirm-row-delete-btn"]');
    const fallbackHeading = page.locator('[data-testid="fallback-table-heading"]');
    const deletedMsg = page.locator('[data-testid="row-deleted-msg"]');

    await deleteTrigger.scrollIntoViewIfNeeded();
    await deleteTrigger.click();
    await expect(deleteDialog).toBeVisible();

    // Confirm deletion of row
    await confirmDeleteBtn.click();
    await expect(deleteDialog).not.toBeVisible();

    // Row is deleted from DOM
    await expect(deleteTrigger).toHaveCount(0);
    await expect(deletedMsg).toBeVisible();

    // Focus safely transferred to fallback heading
    await expect(fallbackHeading).toBeFocused();
  });

  test('verifies zero dashboard shadows on dialog surface', async ({ page }) => {
    const trigger = page.locator('[data-testid="basic-dialog-trigger"]');
    const dialog = page.locator('[data-testid="basic-dialog"]');

    await trigger.click();
    await expect(dialog).toBeVisible();

    const boxShadow = await dialog.evaluate((el) => window.getComputedStyle(el).boxShadow);
    expect(boxShadow).toBe('none');

    await page.keyboard.press('Escape');
  });

  test('verifies RTL direction and Arabic layout', async ({ page }) => {
    const langSelect = page.locator('[data-testid="language-switcher-select"]');
    await langSelect.selectOption('ar');
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');

    const trigger = page.locator('[data-testid="basic-dialog-trigger"]');
    const dialog = page.locator('[data-testid="basic-dialog"]');

    await trigger.click();
    await expect(dialog).toBeVisible();

    // Title should be right-aligned or start-aligned in RTL
    const title = dialog.locator('h2');
    await expect(title).toBeVisible();

    await page.keyboard.press('Escape');
    await langSelect.selectOption('en');
  });

  test('verifies responsive reflow without horizontal overflow at narrow viewport (320px)', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 320, height: 600 });
    const trigger = page.locator('[data-testid="basic-dialog-trigger"]');
    const dialog = page.locator('[data-testid="basic-dialog"]');

    await trigger.click();
    await expect(dialog).toBeVisible();

    const box = await dialog.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.width).toBeLessThanOrEqual(320);

    const isBodyOverflowing = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth,
    );
    expect(isBodyOverflowing).toBe(false);

    await page.keyboard.press('Escape');
  });

  test('verifies form fields and action buttons remain reachable at small viewport (320x400)', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 320, height: 400 });
    const trigger = page.locator('[data-testid="form-dialog-trigger"]');
    const dialog = page.locator('[data-testid="form-dialog"]');
    const submitBtn = page.locator('[data-testid="form-submit-btn"]');
    const cancelBtn = page.locator('[data-testid="form-cancel-btn"]');

    await trigger.click();
    await expect(dialog).toBeVisible();

    // Verify submit button is visible, in-bounds, and clickable without clipping
    await expect(submitBtn).toBeVisible();
    await expect(cancelBtn).toBeVisible();

    const submitBox = await submitBtn.boundingBox();
    expect(submitBox).not.toBeNull();
    if (submitBox) {
      expect(submitBox.y + submitBox.height).toBeLessThanOrEqual(400);
    }

    await cancelBtn.click();
    await expect(dialog).not.toBeVisible();
  });

  test('verifies basic dialog saves policy preferences and displays confirmation', async ({
    page,
  }) => {
    const trigger = page.locator('[data-testid="basic-dialog-trigger"]');
    const dialog = page.locator('[data-testid="basic-dialog"]');
    const input = page.locator('[data-testid="basic-workspace-input"]');
    const saveBtn = page.locator('[data-testid="basic-dialog-save-btn"]');
    const statusRow = page.locator('[data-testid="basic-status-row"]');

    await trigger.click();
    await expect(dialog).toBeVisible();
    await input.fill('Alpha Staging Workspace');
    await saveBtn.click();
    await expect(dialog).not.toBeVisible();

    await expect(statusRow).toBeVisible();
    await expect(statusRow).toContainText('saved successfully');
    await expect(statusRow).toContainText('Alpha Staging Workspace');
  });
});
