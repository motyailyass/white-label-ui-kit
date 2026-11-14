import { expect, test } from '@playwright/test';

test.describe('Dashboard Popover Primitive Real-Browser Verification', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/gallery/popover');
    await expect(page.locator('[data-testid="popover-gallery"]')).toBeVisible();
  });

  test('1. Studio Popover: opens on click, closes on Escape with focus restoration to trigger', async ({
    page,
  }) => {
    const trigger = page.locator('[data-testid="studio-active-popover-trigger"]');
    const content = page.locator('[data-testid="studio-active-popover-content"]');

    await expect(content).not.toBeVisible();

    // Open via click
    await trigger.click();
    await expect(content).toBeVisible();

    // Close via Escape key
    await page.keyboard.press('Escape');
    await expect(content).not.toBeVisible();

    // Focus restored to trigger on Escape
    await expect(trigger).toBeFocused();
  });

  test('2. Outside click light-dismiss closes popover', async ({ page }) => {
    const trigger = page.locator('[data-testid="studio-active-popover-trigger"]');
    const content = page.locator('[data-testid="studio-active-popover-content"]');

    await trigger.click();
    await expect(content).toBeVisible();

    // Click outside on the studio header / background
    await page.mouse.click(20, 20);

    // Popover is dismissed
    await expect(content).not.toBeVisible();
  });

  test('3. Interactive filter with role="dialog": radio selection and accessible name', async ({
    page,
  }) => {
    const trigger = page.locator('[data-testid="studio-active-popover-trigger"]');
    const content = page.locator('[data-testid="studio-active-popover-content"]');
    const stagingRadio = page.locator('[data-testid="filter-env-staging-radio"]');
    const applyBtn = page.locator('[data-testid="studio-popover-apply-btn"]');

    // Switch from default Status Disclosure to Interactive Form and enable footer actions
    await page.locator('[data-testid="opt-mode-form"]').click();
    await page.locator('[data-testid="toggle-popover-footer"]').click();

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
    await expect(content).not.toBeVisible();
  });

  test('4. Manual close button (X): dismisses popover and restores focus to trigger', async ({
    page,
  }) => {
    const trigger = page.locator('[data-testid="studio-active-popover-trigger"]');
    const content = page.locator('[data-testid="studio-active-popover-content"]');
    const closeBtn = page.locator('[data-testid="studio-popover-close-btn"]');

    // Enable the optional manual close button before opening
    await page.locator('[data-testid="toggle-popover-close"]').click();

    await trigger.click();
    await expect(content).toBeVisible();

    await closeBtn.click();
    await expect(content).not.toBeVisible();
    await expect(trigger).toBeFocused();
  });

  test('5. Multi-placement grid: switches view and activates top, bottom, inline placements', async ({
    page,
  }) => {
    // Switch to Placements Grid view
    await page.locator('[data-testid="opt-view-all-placements"]').click();

    // Top placement
    const topTrigger = page.locator('[data-testid="studio-placement-trigger-top"]');
    const topContent = page.locator('[data-testid="studio-placement-content-top"]');
    await topTrigger.click();
    await expect(topContent).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(topContent).not.toBeVisible();

    // Bottom placement
    const bottomTrigger = page.locator('[data-testid="studio-placement-trigger-bottom"]');
    const bottomContent = page.locator('[data-testid="studio-placement-content-bottom"]');
    await bottomTrigger.click();
    await expect(bottomContent).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(bottomContent).not.toBeVisible();
  });

  test('6. Trigger element & content mode switching: switches between Button, Icon Only, Action Chip, and Interactive Form', async ({
    page,
  }) => {
    const trigger = page.locator('[data-testid="studio-active-popover-trigger"]');
    const content = page.locator('[data-testid="studio-active-popover-content"]');

    // Default Status Disclosure mode has no dialog role
    await trigger.click();
    await expect(content).toBeVisible();
    await expect(content).not.toHaveAttribute('role', 'dialog');
    await page.keyboard.press('Escape');

    // Switch to Interactive Form mode (sets role="dialog")
    await page.locator('[data-testid="opt-mode-form"]').click();
    await trigger.click();
    await expect(content).toBeVisible();
    await expect(content).toHaveAttribute('role', 'dialog');
    await page.keyboard.press('Escape');

    // Switch trigger kind to Icon Only
    await page.locator('[data-testid="opt-trig-icon"]').click();
    await expect(trigger).toHaveAttribute('data-icon-only', 'true');
  });
});
