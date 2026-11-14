import { expect, test } from '@playwright/test';

test.describe('Website Dropdown Studio Real-Browser Verification', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/gallery/dropdown');
    await expect(page.locator('[data-testid="dropdown-gallery"]')).toBeVisible();
  });

  test('1. Opens on trigger click, navigates via roving arrow keys, activates item, and dispatches command', async ({
    page,
  }) => {
    const trigger = page.locator('[data-testid="studio-dropdown-trigger"]');
    const content = page.locator('[data-testid="studio-active-dropdown-content"]');
    const editItem = page.locator('[data-testid="studio-dropdown-item-edit"]');
    const duplicateItem = page.locator('[data-testid="studio-dropdown-item-duplicate"]');
    const statusValue = page.locator('[data-testid="studio-dropdown-status-value"]');

    await expect(content).not.toBeVisible();
    await expect(statusValue).toHaveText('None yet');

    await trigger.click();
    await expect(content).toBeVisible();
    await expect(editItem).toBeFocused();

    await page.keyboard.press('ArrowDown');
    await expect(duplicateItem).toBeFocused();

    await page.keyboard.press('Enter');
    await expect(content).not.toBeVisible();
    await expect(statusValue).toHaveText('Duplicate resource');
  });

  test('2. Escape dismissal restores focus to trigger; Tab exits menu cleanly', async ({
    page,
  }) => {
    const trigger = page.locator('[data-testid="studio-dropdown-trigger"]');
    const content = page.locator('[data-testid="studio-active-dropdown-content"]');

    await trigger.click();
    await expect(content).toBeVisible();

    await page.keyboard.press('Escape');
    await expect(content).not.toBeVisible();
    await expect(trigger).toBeFocused();

    await trigger.click();
    await expect(content).toBeVisible();

    await page.keyboard.press('Tab');
    await expect(content).not.toBeVisible();
  });

  test('3. Disabled item remains focusable for discovery but blocks activation', async ({
    page,
  }) => {
    const trigger = page.locator('[data-testid="studio-dropdown-trigger"]');
    const content = page.locator('[data-testid="studio-active-dropdown-content"]');
    const disabledItem = page.locator('[data-testid="studio-dropdown-item-disabled"]');
    const statusValue = page.locator('[data-testid="studio-dropdown-status-value"]');

    await trigger.click();
    await expect(content).toBeVisible();

    await page.keyboard.press('Home');
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('ArrowDown');
    await expect(disabledItem).toBeFocused();
    await expect(disabledItem).toHaveAttribute('aria-disabled', 'true');

    await page.keyboard.press('Enter');
    await expect(statusValue).toHaveText('None yet');

    await page.keyboard.press('Escape');
  });

  test('4. Safe external link item enforces rel="noopener noreferrer"', async ({ page }) => {
    const trigger = page.locator('[data-testid="studio-dropdown-trigger"]');
    const content = page.locator('[data-testid="studio-active-dropdown-content"]');
    const linkItem = page.locator('[data-testid="studio-dropdown-item-link"]');

    await trigger.click();
    await expect(content).toBeVisible();
    await expect(linkItem).toHaveAttribute('target', '_blank');
    await expect(linkItem).toHaveAttribute('rel', 'noopener noreferrer');

    await page.keyboard.press('Escape');
  });

  test('5. Outside click light-dismiss closes dropdown', async ({ page }) => {
    const trigger = page.locator('[data-testid="studio-dropdown-trigger"]');
    const content = page.locator('[data-testid="studio-active-dropdown-content"]');

    await trigger.click();
    await expect(content).toBeVisible();

    await page.mouse.click(20, 20);
    await expect(content).not.toBeVisible();
  });

  test('6. Placements Grid and RTL specimen alignment', async ({ page }) => {
    await page.locator('[data-testid="opt-view-all-placements"]').click();

    const bsTrigger = page.locator('[data-testid="studio-placement-trigger-bottom-start"]');
    const bsContent = page.locator('[data-testid="studio-placement-content-bottom-start"]');

    await bsTrigger.click();
    await expect(bsContent).toBeVisible();
    const ltrTriggerBox = await bsTrigger.boundingBox();
    const ltrContentBox = await bsContent.boundingBox();
    if (ltrTriggerBox && ltrContentBox) {
      expect(Math.abs(ltrContentBox.x - ltrTriggerBox.x)).toBeLessThanOrEqual(2);
    }
    await page.keyboard.press('Escape');

    await page.locator('[data-testid="opt-dir-rtl"]').click();
    await bsTrigger.click();
    await expect(bsContent).toBeVisible();
    const rtlTriggerBox = await bsTrigger.boundingBox();
    const rtlContentBox = await bsContent.boundingBox();
    if (rtlTriggerBox && rtlContentBox) {
      const triggerRight = rtlTriggerBox.x + rtlTriggerBox.width;
      const contentRight = rtlContentBox.x + rtlContentBox.width;
      expect(Math.abs(contentRight - triggerRight)).toBeLessThanOrEqual(2);
    }
    await page.keyboard.press('Escape');
  });
});
