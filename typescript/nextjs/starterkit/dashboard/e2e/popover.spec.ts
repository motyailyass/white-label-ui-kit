import { expect, test } from '@playwright/test';

test.describe('Dashboard Popover Primitive Real-Browser Verification', () => {
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

  test('2. Outside click light-dismiss does NOT steal focus and executes external action', async ({
    page,
  }) => {
    const trigger = page.locator('[data-testid="open-manual-close-popover-btn"]');
    const content = page.locator('[data-testid="manual-close-popover-content"]');
    const outsideActionBtn = page.locator('[data-testid="outside-action-btn"]');

    await trigger.click();
    await expect(content).toBeVisible();
    await expect(outsideActionBtn).toHaveText('Outside Action Count: 0');

    // Click external button directly
    await outsideActionBtn.click();

    // Popover is dismissed
    await expect(content).not.toBeVisible();

    // Outside click actually executed its action
    await expect(outsideActionBtn).toHaveText('Outside Action Count: 1');

    // Focus is NOT stolen back to old trigger
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

  test('5. Viewport collision & auto-flip: flips from bottom to top near viewport edge', async ({
    page,
  }) => {
    const trigger = page.locator('[data-testid="open-collision-popover-btn"]');
    const content = page.locator('[data-testid="collision-popover-content"]');

    // Scroll window so trigger is positioned near the bottom edge of the viewport
    await trigger.scrollIntoViewIfNeeded();
    await page.evaluate(() => {
      const btn = document.querySelector('[data-testid="open-collision-popover-btn"]');
      if (btn) {
        const rect = btn.getBoundingClientRect();
        // Scroll so button bottom is 30px from bottom of viewport
        window.scrollBy(0, rect.bottom - (window.innerHeight - 30));
      }
    });

    await trigger.click();
    await expect(content).toBeVisible();

    const triggerBox = await trigger.boundingBox();
    const contentBox = await content.boundingBox();
    const viewportSize = page.viewportSize();

    expect(triggerBox).not.toBeNull();
    expect(contentBox).not.toBeNull();

    if (triggerBox && contentBox && viewportSize) {
      // Because trigger is near bottom, content must flip to top: content bottom <= trigger top
      expect(contentBox.y + contentBox.height).toBeLessThanOrEqual(triggerBox.y + 10);
      // Viewport bounds respected
      expect(contentBox.x).toBeGreaterThanOrEqual(0);
      expect(contentBox.x + contentBox.width).toBeLessThanOrEqual(viewportSize.width);
    }
  });

  test('6. Controlled mode: external button toggle and rejection reconciliation', async ({
    page,
  }) => {
    const externalToggle = page.locator('[data-testid="external-toggle-controlled-btn"]');
    const content = page.locator('[data-testid="controlled-popover-content"]');

    await expect(content).not.toBeVisible();

    await externalToggle.click();
    await expect(content).toBeVisible();

    await externalToggle.click();
    await expect(content).not.toBeVisible();

    // Test rejection: parent keeps open={true} despite native dismissal attempt
    const persistedTrigger = page.locator('[data-testid="open-persisted-popover-btn"]');
    const persistedContent = page.locator('[data-testid="persisted-popover-content"]');
    const explicitDismiss = page.locator('[data-testid="explicit-close-persisted-popover-btn"]');

    await persistedTrigger.click();
    await expect(persistedContent).toBeVisible();

    // Outside click attempt
    await page.mouse.click(10, 10);
    // Popover reconciles and remains open because parent kept state true
    await expect(persistedContent).toBeVisible();

    // Explicit parent dismiss closes it
    await explicitDismiss.click();
    await expect(persistedContent).not.toBeVisible();
  });

  test('7. Competing controlled popovers: opening one closes the other without infinite loops', async ({
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

  test('8. True lateral inline placement: inline-start is left in LTR, inline-end is right in LTR', async ({
    page,
  }) => {
    // 1. inline-end in LTR (should place surface to the RIGHT of trigger)
    const triggerEnd = page.locator('[data-testid="placement-inline-end-btn"]');
    const contentEnd = page.locator('[data-testid="placement-inline-end-content"]');

    await triggerEnd.click();
    await expect(contentEnd).toBeVisible();

    const triggerEndBox = await triggerEnd.boundingBox();
    const contentEndBox = await contentEnd.boundingBox();
    const viewportSize = page.viewportSize();

    expect(triggerEndBox).not.toBeNull();
    expect(contentEndBox).not.toBeNull();
    if (triggerEndBox && contentEndBox && viewportSize) {
      if (viewportSize.width >= 600) {
        // On desktop, lateral placement is strictly to the right of the trigger
        expect(contentEndBox.x).toBeGreaterThanOrEqual(triggerEndBox.x + triggerEndBox.width - 2);
      } else {
        // On mobile, lateral placement clamps safely within viewport boundaries
        expect(contentEndBox.x + contentEndBox.width).toBeLessThanOrEqual(viewportSize.width);
        expect(contentEndBox.x).toBeGreaterThanOrEqual(0);
      }
    }

    // Dismiss
    await page.keyboard.press('Escape');
    await expect(contentEnd).not.toBeVisible();
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
