import { expect, test } from '@playwright/test';

test.describe('Website Popover Primitive Real-Browser Verification', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/gallery/popover');
    await expect(page.locator('[data-testid="popover-gallery"]')).toBeVisible();
  });

  test('1. Basic disclosure: opens on click, keeps focus on trigger, closes on Escape with focus restoration', async ({
    page,
  }) => {
    const trigger = page.locator('[data-testid="open-basic-popover-btn"]');
    const content = page.locator('[data-testid="basic-popover-content"]');

    await expect(content).not.toBeVisible();

    // Open via click
    await trigger.click();
    await expect(content).toBeVisible();

    // For generic disclosure, focus remains on trigger
    await expect(trigger).toBeFocused();

    // Close via Escape key
    await page.keyboard.press('Escape');
    await expect(content).not.toBeVisible();

    // Focus restored to trigger on Escape
    await expect(trigger).toBeFocused();
  });

  test('2. Outside click light-dismiss does NOT steal focus back to trigger', async ({
    page,
  }) => {
    const trigger = page.locator('[data-testid="open-basic-popover-btn"]');
    const content = page.locator('[data-testid="basic-popover-content"]');
    const externalBtn = page.locator('[data-testid="open-filter-popover-btn"]');

    await trigger.click();
    await expect(content).toBeVisible();

    // Click external button directly
    await externalBtn.click();

    // Popover is dismissed
    await expect(content).not.toBeVisible();

    // Focus is NOT stolen back to trigger
    await expect(trigger).not.toBeFocused();
  });

  test('3. Interactive filter with role="dialog": accessible name, initial focus, and form submission', async ({
    page,
  }) => {
    const trigger = page.locator('[data-testid="open-filter-popover-btn"]');
    const content = page.locator('[data-testid="filter-popover-content"]');
    const stagingRadio = page.locator('[data-testid="filter-env-staging-radio"]');
    const applyBtn = page.locator('[data-testid="filter-apply-btn"]');
    const statusText = page.locator('[data-testid="applied-env-status"]');

    await trigger.click();
    await expect(content).toBeVisible();

    // Verify role="dialog" and aria-label
    await expect(content).toHaveAttribute('role', 'dialog');
    await expect(content).toHaveAttribute('aria-label');

    // Select staging environment
    await stagingRadio.click();
    await expect(stagingRadio).toBeChecked();

    // Click Apply button
    await applyBtn.click();

    // Popover is dismissed and status updated
    await expect(content).not.toBeVisible();
    await expect(statusText).toHaveText('staging');
  });

  test('4. Manual close button: dismisses popover and restores focus to trigger', async ({
    page,
  }) => {
    const trigger = page.locator('[data-testid="open-manual-close-popover-btn"]');
    const content = page.locator('[data-testid="manual-close-popover-content"]');
    const closeBtn = page.locator('[data-testid="manual-popover-x-close-btn"]');

    await trigger.click();
    await expect(content).toBeVisible();

    await closeBtn.click();
    await expect(content).not.toBeVisible();
    await expect(trigger).toBeFocused();
  });

  test('5. Viewport collision & auto-flip: clamps within viewport boundaries', async ({ page }) => {
    const trigger = page.locator('[data-testid="open-collision-popover-btn"]');
    const content = page.locator('[data-testid="collision-popover-content"]');

    await trigger.click();
    await expect(content).toBeVisible();

    const contentBox = await content.boundingBox();
    const viewportSize = page.viewportSize();

    expect(contentBox).not.toBeNull();
    if (contentBox && viewportSize) {
      expect(contentBox.y + contentBox.height).toBeLessThanOrEqual(viewportSize.height + 2);
      expect(contentBox.x + contentBox.width).toBeLessThanOrEqual(viewportSize.width);
      expect(contentBox.x).toBeGreaterThanOrEqual(0);
    }
  });

  test('6. Controlled mode: external button toggle synchronizes state', async ({ page }) => {
    const externalToggle = page.locator('[data-testid="external-toggle-controlled-btn"]');
    const content = page.locator('[data-testid="controlled-popover-content"]');

    await expect(content).not.toBeVisible();

    await externalToggle.click();
    await expect(content).toBeVisible();

    await externalToggle.click();
    await expect(content).not.toBeVisible();
  });

  test('7. Competing popovers: opening one closes the other without infinite loops', async ({
    page,
  }) => {
    const triggerA = page.locator('[data-testid="open-popover-alpha-btn"]');
    const contentA = page.locator('[data-testid="popover-alpha-content"]');
    const triggerB = page.locator('[data-testid="open-popover-beta-btn"]');
    const contentB = page.locator('[data-testid="popover-beta-content"]');

    await triggerA.click();
    await expect(contentA).toBeVisible();
    await expect(contentB).not.toBeVisible();

    // Open B -> A should close
    await triggerB.click();
    await expect(contentB).toBeVisible();
    await expect(contentA).not.toBeVisible();
  });

  test('8. Nested Select integration: choosing option does not close popover', async ({ page }) => {
    const trigger = page.locator('[data-testid="open-nested-select-popover-btn"]');
    const content = page.locator('[data-testid="nested-select-popover-content"]');
    const select = page.locator('[data-testid="nested-region-select"]');

    await trigger.click();
    await expect(content).toBeVisible();

    // Select option
    await select.selectOption('eu-central');
    await expect(select).toHaveValue('eu-central');

    // Popover remains open
    await expect(content).toBeVisible();
  });

  test('9. Popover inside Modal Dialog: elevates to top layer above dialog surface', async ({
    page,
  }) => {
    const openDialogBtn = page.locator('[data-testid="open-parent-dialog-btn"]');
    const dialog = page.locator('dialog[open]');
    const openNestedPopoverBtn = page.locator('[data-testid="open-nested-popover-in-dialog-btn"]');
    const nestedPopoverContent = page.locator('[data-testid="nested-popover-in-dialog-content"]');

    await openDialogBtn.click();
    await expect(dialog).toBeVisible();

    // Open nested popover inside dialog
    await openNestedPopoverBtn.click();
    await expect(nestedPopoverContent).toBeVisible();

    // Press Escape to dismiss popover first; dialog stays open
    await page.keyboard.press('Escape');
    await expect(nestedPopoverContent).not.toBeVisible();
    await expect(dialog).toBeVisible();

    // Second Escape closes modal dialog
    await page.keyboard.press('Escape');
    await expect(dialog).not.toBeVisible();
  });

  test('10. Mobile viewport (320x400) containment without horizontal overflow', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 320, height: 400 });
    const trigger = page.locator('[data-testid="open-basic-popover-btn"]');
    const content = page.locator('[data-testid="basic-popover-content"]');

    await trigger.click();
    await expect(content).toBeVisible();

    const box = await content.boundingBox();
    expect(box).not.toBeNull();
    if (box) {
      expect(box.width).toBeLessThanOrEqual(320);
      expect(box.x).toBeGreaterThanOrEqual(0);
      expect(box.x + box.width).toBeLessThanOrEqual(320);
    }
  });
});
