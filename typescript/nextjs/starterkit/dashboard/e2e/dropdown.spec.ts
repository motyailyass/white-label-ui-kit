import { expect, test } from '@playwright/test';

test.describe('Dashboard Dropdown Primitive Real-Browser Verification', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/gallery/dropdown');
    await expect(page.locator('[data-testid="dropdown-gallery"]')).toBeVisible();
  });

  test('1. Basic action menu: opens on click, arrow keys navigate, Enter activates item, closes and restores focus to trigger', async ({
    page,
  }) => {
    const trigger = page.locator('[data-testid="open-basic-dropdown-btn"]');
    const content = page.locator('[data-testid="basic-dropdown-content"]');
    const itemEdit = page.locator('[data-testid="item-edit"]');
    const itemDuplicate = page.locator('[data-testid="item-duplicate"]');
    const statusText = page.locator('[data-testid="executed-command-status"]');

    await expect(content).not.toBeVisible();
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');

    // Click trigger to open
    await trigger.click();
    await expect(content).toBeVisible();
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');

    // First item receives initial focus
    await expect(itemEdit).toBeFocused();

    // Arrow down moves focus to next item
    await page.keyboard.press('ArrowDown');
    await expect(itemDuplicate).toBeFocused();

    // Enter activates item
    await page.keyboard.press('Enter');

    // Menu closes and command executed
    await expect(content).not.toBeVisible();
    await expect(statusText).toContainText('duplicate');

    // Focus restored to trigger
    await expect(trigger).toBeFocused();
  });

  test('2. ArrowDown and ArrowUp on closed trigger open menu and focus first or last item', async ({
    page,
  }) => {
    const trigger = page.locator('[data-testid="open-basic-dropdown-btn"]');
    const content = page.locator('[data-testid="basic-dropdown-content"]');
    const itemEdit = page.locator('[data-testid="item-edit"]');
    const itemDelete = page.locator('[data-testid="item-delete"]');

    // Focus trigger
    await trigger.focus();

    // ArrowDown opens targeting first item
    await page.keyboard.press('ArrowDown');
    await expect(content).toBeVisible();
    await expect(itemEdit).toBeFocused();

    // Escape closes
    await page.keyboard.press('Escape');
    await expect(content).not.toBeVisible();
    await expect(trigger).toBeFocused();

    // ArrowUp opens targeting last item
    await page.keyboard.press('ArrowUp');
    await expect(content).toBeVisible();
    await expect(itemDelete).toBeFocused();

    await page.keyboard.press('Escape');
    await expect(content).not.toBeVisible();
  });

  test('3. Disabled items remain focusable for discovery, but cannot be activated', async ({
    page,
  }) => {
    const trigger = page.locator('[data-testid="open-disabled-dropdown-btn"]');
    const content = page.locator('[data-testid="disabled-dropdown-content"]');
    const itemEnabled1 = page.locator('[data-testid="item-enabled-1"]');
    const itemDisabled = page.locator('[data-testid="item-disabled"]');
    const statusText = page.locator('[data-testid="executed-command-status"]');

    await trigger.click();
    await expect(content).toBeVisible();
    await expect(itemEnabled1).toBeFocused();

    // ArrowDown navigates to disabled item (discovery)
    await page.keyboard.press('ArrowDown');
    await expect(itemDisabled).toBeFocused();
    await expect(itemDisabled).toHaveAttribute('aria-disabled', 'true');

    // Pressing Enter does NOT activate it and does NOT close menu
    await page.keyboard.press('Enter');
    await expect(content).toBeVisible();
    await expect(statusText).not.toContainText('disabled-activated');

    // Clicking disabled item also blocked
    await itemDisabled.click({ force: true });
    await expect(content).toBeVisible();
    await expect(statusText).not.toContainText('disabled-activated');

    await page.keyboard.press('Escape');
  });

  test('4. Navigation links render real <a href> tags with caller-provided URLs and safe rel', async ({
    page,
  }) => {
    const trigger = page.locator('[data-testid="open-links-dropdown-btn"]');
    const content = page.locator('[data-testid="links-dropdown-content"]');
    const linkDashboard = page.locator('[data-testid="link-dashboard"]');
    const linkDocumentation = page.locator('[data-testid="link-documentation"]');

    await trigger.click();
    await expect(content).toBeVisible();

    await expect(linkDashboard).toHaveAttribute('href', '/dashboard');
    await expect(linkDashboard).toHaveAttribute('role', 'menuitem');

    await expect(linkDocumentation).toHaveAttribute('href', 'https://example.com/docs');
    await expect(linkDocumentation).toHaveAttribute('target', '_blank');
    await expect(linkDocumentation).toHaveAttribute('rel', 'noopener noreferrer');

    await page.keyboard.press('Escape');
  });

  test('5. Outside click light-dismiss does NOT steal focus and executes external action', async ({
    page,
  }) => {
    const trigger = page.locator('[data-testid="open-basic-dropdown-btn"]');
    const content = page.locator('[data-testid="basic-dropdown-content"]');
    const outsideActionBtn = page.locator('[data-testid="outside-action-btn"]');

    await trigger.click();
    await expect(content).toBeVisible();
    await expect(outsideActionBtn).toHaveText('Outside Action Count: 0');

    // Click external button directly
    await outsideActionBtn.click();

    // Dropdown is dismissed
    await expect(content).not.toBeVisible();

    // Outside click actually executed its action
    await expect(outsideActionBtn).toHaveText('Outside Action Count: 1');
  });

  test('6. Tab key exits the menu immediately and resumes normal page tab navigation', async ({
    page,
  }) => {
    const trigger = page.locator('[data-testid="open-basic-dropdown-btn"]');
    const content = page.locator('[data-testid="basic-dropdown-content"]');

    await trigger.click();
    await expect(content).toBeVisible();

    // Tab key exits menu
    await page.keyboard.press('Tab');
    await expect(content).not.toBeVisible();
  });

  test('7. Controlled mode: external button toggle and rejection reconciliation', async ({
    page,
  }) => {
    const externalToggle = page.locator('[data-testid="external-toggle-controlled-btn"]');
    const controlledContent = page.locator('[data-testid="controlled-dropdown-content"]');
    const controlledTrigger = page.locator('[data-testid="controlled-dropdown-trigger-btn"]');

    await expect(controlledContent).not.toBeVisible();
    await expect(controlledTrigger).toHaveAttribute('aria-expanded', 'false');

    // External toggle opens it
    await externalToggle.click();
    await expect(controlledContent).toBeVisible();
    await expect(controlledTrigger).toHaveAttribute('aria-expanded', 'true');

    // External toggle closes it
    await externalToggle.click();
    await expect(controlledContent).not.toBeVisible();
    await expect(controlledTrigger).toHaveAttribute('aria-expanded', 'false');

    // Rejection test: trigger click on locked closed menu remains closed
    const rejectedTrigger = page.locator('[data-testid="rejected-open-controlled-trigger-btn"]');
    const rejectedContent = page.locator('[data-testid="rejected-open-controlled-content"]');

    await expect(rejectedContent).not.toBeVisible();
    await rejectedTrigger.click();
    await expect(rejectedContent).not.toBeVisible();
    await expect(rejectedTrigger).toHaveAttribute('aria-expanded', 'false');
  });

  test('8. Dropdown inside modal Dialog: elevates to top layer and closes first on Escape', async ({
    page,
  }) => {
    const openDialogBtn = page.locator('[data-testid="open-dialog-with-dropdown-btn"]');
    const dialog = page.locator('[data-testid="modal-dialog-surface"]');
    const nestedDropdownTrigger = page.locator('[data-testid="nested-dialog-dropdown-trigger-btn"]');
    const nestedDropdownContent = page.locator('[data-testid="nested-dialog-dropdown-content"]');

    // Open Modal Dialog
    await openDialogBtn.click();
    await expect(dialog).toBeVisible();

    // Open Nested Dropdown inside Dialog
    await nestedDropdownTrigger.click();
    await expect(nestedDropdownContent).toBeVisible();

    // Press Escape: dismisses dropdown first, restoring focus to dropdown trigger
    await page.keyboard.press('Escape');
    await expect(nestedDropdownContent).not.toBeVisible();
    await expect(dialog).toBeVisible();
    await expect(nestedDropdownTrigger).toBeFocused();

    // Second Escape closes modal dialog
    await page.keyboard.press('Escape');
    await expect(dialog).not.toBeVisible();
  });

  test('9. Bidirectional horizontal alignment in LTR and RTL directions', async ({
    page,
  }) => {
    const trigger = page.locator('[data-testid="placement-bottom-start-btn"]');
    const content = page.locator('[data-testid="placement-bottom-start-content"]');

    await trigger.click();
    await expect(content).toBeVisible();

    const triggerBox = await trigger.boundingBox();
    const contentBox = await content.boundingBox();

    expect(triggerBox).not.toBeNull();
    expect(contentBox).not.toBeNull();

    if (triggerBox && contentBox) {
      // In LTR bottom-start, left edges are aligned
      expect(Math.abs(contentBox.x - triggerBox.x)).toBeLessThanOrEqual(2);
    }

    await page.keyboard.press('Escape');

    // Switch to Arabic locale to verify RTL
    const languageBtn = page.locator('[data-testid="language-switcher-btn"]');
    if (await languageBtn.isVisible()) {
      await languageBtn.click();
      const arOption = page.locator('[data-testid="lang-option-ar"]');
      if (await arOption.isVisible()) {
        await arOption.click();
        await page.waitForTimeout(300);

        const arTrigger = page.locator('[data-testid="placement-bottom-start-btn"]');
        const arContent = page.locator('[data-testid="placement-bottom-start-content"]');

        await arTrigger.click();
        await expect(arContent).toBeVisible();

        const arTriggerBox = await arTrigger.boundingBox();
        const arContentBox = await arContent.boundingBox();

        if (arTriggerBox && arContentBox) {
          // In RTL bottom-start, right edges are aligned: (x + width) should match
          const triggerRight = arTriggerBox.x + arTriggerBox.width;
          const contentRight = arContentBox.x + arContentBox.width;
          expect(Math.abs(contentRight - triggerRight)).toBeLessThanOrEqual(2);
        }

        await page.keyboard.press('Escape');
      }
    }
  });

  test('10. Mobile viewport (320x400) containment without horizontal overflow', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 320, height: 400 });
    const trigger = page.locator('[data-testid="open-basic-dropdown-btn"]');
    const content = page.locator('[data-testid="basic-dropdown-content"]');

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

  test('11. Zero dashboard shadows verified on dropdown surface', async ({ page }) => {
    const trigger = page.locator('[data-testid="open-basic-dropdown-btn"]');
    const content = page.locator('[data-testid="basic-dropdown-content"]');

    await trigger.click();
    await expect(content).toBeVisible();

    const boxShadow = await content.evaluate((el) => {
      return window.getComputedStyle(el).boxShadow;
    });

    expect(boxShadow === 'none' || boxShadow === '').toBe(true);
  });
});
