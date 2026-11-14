import { expect, test } from '@playwright/test';

test.describe('Dashboard DatePicker Studio Real-Browser Verification', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/gallery/date-picker');
    await expect(page.locator('[data-testid="gallery-date-picker"]')).toBeVisible();
  });

  test('1. Verifies dashboard product default (md 36px), clear/chevron trailing alignment, 6-step scale, and comfortable touch targets', async ({
    page,
  }) => {
    const isCoarse = await page.evaluate(() => window.matchMedia('(pointer: coarse)').matches);
    const root = page.locator('[data-testid="live-date-picker"]');
    const trigger = root.locator('button[aria-haspopup="dialog"]');
    const chevron = trigger.locator('svg').last();
    const clearButton = root.locator('button[aria-label="Clear selection"]');
    await expect(trigger).toBeVisible();
    await expect(clearButton).toBeVisible();

    const defaultBox = await trigger.boundingBox();
    expect(defaultBox).not.toBeNull();
    if (isCoarse) {
      expect(defaultBox!.height).toBeGreaterThanOrEqual(48);
    } else {
      expect(defaultBox!.height).toBeCloseTo(36, 1);
    }

    // Clear button must sit strictly before chevron ([×] [▾]) and chevron stays pinned when toggled
    const clearBox = await clearButton.boundingBox();
    const chevronWithClearBox = await chevron.boundingBox();
    expect(clearBox).not.toBeNull();
    expect(chevronWithClearBox).not.toBeNull();
    expect(clearBox!.x + clearBox!.width).toBeLessThanOrEqual(chevronWithClearBox!.x + 1);

    await page.locator('[data-testid="toggle-date-picker-clearable"]').click();
    await expect(clearButton).not.toBeVisible();
    const chevronWithoutClearBox = await chevron.boundingBox();
    expect(chevronWithoutClearBox!.x).toBeCloseTo(chevronWithClearBox!.x, 1);
    await page.locator('[data-testid="toggle-date-picker-clearable"]').click();

    await page.locator('[data-testid="opt-touch-comfortable"]').click();
    const comfortableBox = await trigger.boundingBox();
    expect(comfortableBox!.height).toBeGreaterThanOrEqual(48);

    await page.locator('[data-testid="opt-view-all-sizes"]').click();
    const scaleTargets: Record<string, number> = {
      '[data-testid="date-picker-size-xs"] button': 28,
      '[data-testid="date-picker-size-sm"] button': 32,
      '[data-testid="date-picker-size-md"] button': 36,
      '[data-testid="date-picker-size-lg"] button': 40,
      '[data-testid="date-picker-size-xl"] button': 48,
      '[data-testid="date-picker-size-2xl"] button': 56,
    };

    for (const [selector, expectedHeight] of Object.entries(scaleTargets)) {
      const btn = page.locator(selector).first();
      await expect(btn).toBeVisible();
      const box = await btn.boundingBox();
      expect(box).not.toBeNull();
      expect(box!.height).toBeGreaterThanOrEqual(expectedHeight - 1);
    }
  });

  test('2. Verifies focus handoff, keyboard navigation, min/max constraints, invalid state, dark mode, and zero shadows', async ({
    page,
  }) => {
    const root = page.locator('[data-testid="live-date-picker"]');
    const trigger = root.locator('button[aria-haspopup="dialog"]');

    // Dashboard zero-shadow policy
    await trigger.click();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();

    const dialogShadow = await dialog.evaluate((el) => getComputedStyle(el).boxShadow);
    expect(dialogShadow).toBe('none');

    // Active cell receives focus on open; ArrowRight moves Nov 10 -> Nov 11, Enter commits
    const focusedIso = await page.evaluate(() => document.activeElement?.getAttribute('data-date'));
    expect(focusedIso).toBe('2026-11-10');

    await page.keyboard.press('ArrowRight');
    await expect
      .poll(() => page.evaluate(() => document.activeElement?.getAttribute('data-date')))
      .toBe('2026-11-11');

    await page.keyboard.press('Enter');
    await expect(dialog).not.toBeVisible();
    await expect(trigger).toBeFocused();
    await expect(page.locator('[data-testid="date-picker-value-card"]')).toContainText(
      '2026-11-11',
    );

    // Month & Year drill-down navigation (jump to 2024 -> March -> day 15)
    await trigger.click();
    await expect(dialog).toBeVisible();
    await dialog.locator('button[data-view-trigger="years"]').click();
    await expect(dialog.locator('button[data-year="2024"]')).toBeVisible();
    await dialog.locator('button[data-year="2024"]').click();
    await expect(dialog.locator('button[data-month="2"]')).toBeVisible();
    await dialog.locator('button[data-month="2"]').click();
    await dialog.locator('button[data-date="2024-03-15"]').click();
    await expect(page.locator('[data-testid="date-picker-value-card"]')).toContainText(
      '2024-03-15',
    );
    await page.locator('[data-testid="studio-reset-btn"]').click();

    // Constrained bounds disable out-of-range days and prev/next month buttons
    await page.locator('[data-testid="toggle-date-picker-constrained"]').click();
    await trigger.click();
    await expect(dialog.locator('button').first()).toBeDisabled();
    await expect(dialog.locator('button[data-date="2026-11-04"]')).toHaveAttribute(
      'aria-disabled',
      'true',
    );
    await page.keyboard.press('Escape');
    await expect(dialog).not.toBeVisible();
    await expect(trigger).toBeFocused();

    // Validation error toggle + dark mode surface contrast
    await page.locator('[data-testid="toggle-date-picker-invalid"]').click();
    await expect(trigger).toHaveAttribute('aria-invalid', 'true');

    await page.evaluate(() => document.documentElement.setAttribute('data-theme', 'dark'));
    await trigger.click();
    await expect
      .poll(() =>
        dialog.evaluate((el) => getComputedStyle(el).backgroundColor !== 'rgba(0, 0, 0, 0)'),
      )
      .toBe(true);
  });

  test('3. Verifies RTL lang="ar" localization, arrow reversal, reduced motion, and mobile overflow', async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.locator('[data-testid="date-picker-dir-rtl"]').click();

    const canvas = page.locator('[data-testid="date-picker-canvas"]');
    await expect(canvas).toHaveAttribute('dir', 'rtl');
    await expect(canvas).toHaveAttribute('lang', 'ar');

    const root = page.locator('[data-testid="live-date-picker"]');
    const trigger = root.locator('button[aria-haspopup="dialog"]');
    await trigger.click();

    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await expect(dialog).toContainText('نوفمبر');

    const tracking = await dialog.evaluate((el) => getComputedStyle(el).letterSpacing);
    expect(tracking).toBe('normal');

    const transitionDuration = await dialog
      .locator('button[data-date="2026-11-10"]')
      .evaluate((el) => getComputedStyle(el).transitionDuration);
    expect(transitionDuration).toBe('0s');

    // RTL: ArrowLeft advances from Nov 10 to Nov 11
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
