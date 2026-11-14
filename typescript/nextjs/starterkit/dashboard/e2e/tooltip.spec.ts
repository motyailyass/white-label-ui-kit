import { expect, test } from '@playwright/test';

test.describe('Dashboard Tooltip Studio Real-Browser Verification', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/gallery/tooltip');
    await expect(page.locator('[data-testid="tooltip-studio"]')).toBeVisible();
  });

  test('1. Opens immediately on keyboard focus, pairs aria-describedby, and dismisses on Escape', async ({
    page,
  }) => {
    const trigger = page.locator('[data-testid="studio-tooltip-trigger"]');
    const tooltip = page.locator('[role="tooltip"]');

    await expect(tooltip).toHaveCount(0);

    await trigger.focus();
    await expect(tooltip).toBeVisible();
    const tooltipId = await tooltip.getAttribute('id');
    expect(tooltipId).toBeTruthy();
    await expect(trigger).toHaveAttribute('aria-describedby', tooltipId as string);

    await page.keyboard.press('Escape');
    await expect(tooltip).toHaveCount(0);
    await expect(trigger).toBeFocused();
  });

  test('2. Switches variants and isolates shortcut glyph order under RTL', async ({ page }) => {
    const trigger = page.locator('[data-testid="studio-tooltip-trigger"]');
    const tooltip = page.locator('[role="tooltip"]');

    await page.locator('[data-testid="opt-variant-subtle"]').click();
    await page.locator('[data-testid="opt-dir-rtl"]').click();

    await trigger.focus();
    await expect(tooltip).toBeVisible();
    await expect(tooltip).toHaveAttribute('data-variant', 'subtle');

    const shortcutSpan = tooltip.locator('kbd > span');
    await expect(shortcutSpan).toHaveAttribute('dir', 'ltr');
    await expect(shortcutSpan).toHaveText('⌘K');
  });

  test('3. Resolves logical placement="start" to opposite physical sides in LTR vs RTL', async ({
    page,
  }) => {
    const trigger = page.locator('[data-testid="studio-tooltip-trigger"]');
    const tooltip = page.locator('[role="tooltip"]');

    await page.locator('[data-testid="opt-placement-start"]').click();
    await trigger.focus();
    await expect(tooltip).toHaveAttribute('data-placement', 'left');
    await page.keyboard.press('Escape');

    await page.locator('[data-testid="opt-dir-rtl"]').click();
    await trigger.focus();
    await expect(tooltip).toHaveAttribute('data-placement', 'right');
  });

  test('4. Zero dashboard shadows verified on tooltip bubble', async ({ page }) => {
    const trigger = page.locator('[data-testid="studio-tooltip-trigger"]');
    const tooltip = page.locator('[role="tooltip"]');

    await trigger.focus();
    await expect(tooltip).toBeVisible();

    const boxShadow = await tooltip.evaluate((el) => window.getComputedStyle(el).boxShadow);
    expect(boxShadow === 'none' || boxShadow === '').toBe(true);
  });
});
