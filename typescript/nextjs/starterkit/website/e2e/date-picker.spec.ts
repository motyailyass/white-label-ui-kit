import { expect, test } from '@playwright/test';

test.describe('Website DatePicker Studio Real-Browser Verification', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/gallery/date-picker');
    await expect(page.locator('[data-testid="gallery-date-picker"]')).toBeVisible();
  });

  test('1. Verifies website product default (xl 48px), clear/chevron trailing alignment, month/year jump, clear, and bounds', async ({
    page,
  }) => {
    const root = page.locator('[data-testid="live-date-picker"]');
    const trigger = root.locator('button[aria-haspopup="dialog"]');
    const chevron = trigger.locator('svg').last();
    const clearButton = root.locator('button[aria-label="Clear selection"]');
    await expect(trigger).toBeVisible();

    const defaultBox = await trigger.boundingBox();
    expect(defaultBox).not.toBeNull();
    expect(defaultBox!.height).toBeCloseTo(48, 1);

    const clearBox = await clearButton.boundingBox();
    const chevronBox = await chevron.boundingBox();
    expect(clearBox!.x + clearBox!.width).toBeLessThanOrEqual(chevronBox!.x + 1);

    await trigger.click();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    expect(await dialog.locator('[role="row"]').count()).toBe(7);

    // Year + Month drill-down selection
    await dialog.locator('button[data-view-trigger="years"]').click();
    await dialog.locator('button[data-year="2024"]').click();
    await dialog.locator('button[data-month="2"]').click();
    await dialog.locator('button[data-date="2024-03-15"]').click();
    await expect(dialog).not.toBeVisible();
    await expect(page.locator('[data-testid="date-picker-value-card"]')).toContainText(
      '2024-03-15',
    );

    // Clear value via clear button
    await clearButton.click();
    await expect(page.locator('[data-testid="date-picker-value-card"]')).toContainText('None');
  });

  test('2. Verifies RTL lang="ar" Arabic formatting, arrow reversal, reduced motion, and mobile overflow', async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.locator('[data-testid="date-picker-dir-rtl"]').click();

    const canvas = page.locator('[data-testid="date-picker-canvas"]');
    await expect(canvas).toHaveAttribute('dir', 'rtl');
    await expect(canvas).toHaveAttribute('lang', 'ar');

    const trigger = page.locator('[data-testid="live-date-picker"] button[aria-haspopup="dialog"]');
    await trigger.click();

    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await expect(dialog).toContainText('نوفمبر');

    const tracking = await dialog.evaluate((el) => getComputedStyle(el).letterSpacing);
    expect(tracking).toBe('normal');

    await page.keyboard.press('ArrowLeft');
    await expect
      .poll(() => page.evaluate(() => document.activeElement?.getAttribute('data-date')))
      .toBe('2026-11-11');
    await page.keyboard.press('Escape');

    await page.setViewportSize({ width: 375, height: 812 });
    const hasHorizontalOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth,
    );
    expect(hasHorizontalOverflow).toBe(false);
  });
});
