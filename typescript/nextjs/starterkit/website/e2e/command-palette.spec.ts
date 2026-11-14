import { expect, test } from '@playwright/test';

test.describe('Website CommandPalette Studio Real-Browser Verification', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/gallery/command-palette');
    await expect(page.locator('[data-testid="command-palette-studio"]')).toBeVisible();
  });

  test('1. Verifies top-layer modal open, filtering, keyboard selection, dark mode active contrast, and focus restoration', async ({
    page,
  }) => {
    const trigger = page.locator('[data-testid="command-palette-open-btn"]');
    const dialog = page.locator('[data-testid="command-palette-dialog"]');
    const input = page.locator('[data-testid="command-palette-input"]');

    await expect(dialog).not.toBeVisible();

    await trigger.click();
    await expect(dialog).toBeVisible();
    await expect(input).toBeFocused();

    const headerBar = dialog.locator('[data-variant="flush"]');
    await dialog.locator('[class*="panel"]').evaluate(async (el) => {
      await Promise.all(el.getAnimations().map((anim) => anim.finished));
    });
    const rectEmpty = await headerBar.evaluate((el) => ({
      offsetHeight: (el as HTMLElement).offsetHeight,
      rectHeight: el.getBoundingClientRect().height,
    }));
    await input.pressSequentially('a');
    const rectWithText = await headerBar.evaluate((el) => ({
      offsetHeight: (el as HTMLElement).offsetHeight,
      rectHeight: el.getBoundingClientRect().height,
    }));
    expect(rectWithText.offsetHeight).toBe(rectEmpty.offsetHeight);
    expect(rectWithText.rectHeight).toBeCloseTo(rectEmpty.rectHeight, 1);
    await input.fill('');

    await input.fill('nonexistent-xyz');
    await expect(page.locator('[data-testid="command-palette-empty"]')).toBeVisible();

    await input.fill('');
    await page.keyboard.press('ArrowDown');

    await page.evaluate(() => document.documentElement.setAttribute('data-theme', 'dark'));
    await expect
      .poll(async () =>
        page.evaluate(() => {
          const dlg = document.querySelector('[data-testid="command-palette-dialog"]')!;
          const panel = dlg.querySelector('[class*="panel"]')!;
          const activeItem = dlg.querySelector('[aria-selected="true"]')!;
          const panelBg = getComputedStyle(panel).backgroundColor;
          const activeBg = getComputedStyle(activeItem).backgroundColor;
          return activeBg !== 'rgba(0, 0, 0, 0)' && activeBg !== panelBg;
        }),
      )
      .toBe(true);

    await page.keyboard.press('Enter');
    await expect(dialog).not.toBeVisible();
    await expect(page.locator('[data-testid="command-palette-executed"]')).toContainText(
      'Dashboard Overview',
    );
    await expect(trigger).toBeFocused();
  });

  test('2. Verifies RTL lang="ar" localization, Arabic tracking, and mobile containment', async ({
    page,
  }) => {
    await page.locator('[data-testid="command-palette-dir-rtl"]').click();

    const canvas = page.locator('[data-testid="command-palette-canvas"]');
    const trigger = page.locator('[data-testid="command-palette-open-btn"]');
    const dialog = page.locator('[data-testid="command-palette-dialog"]');

    await expect(canvas).toHaveAttribute('dir', 'rtl');
    await expect(canvas).toHaveAttribute('lang', 'ar');
    await expect(trigger).toContainText('فتح لوحة الأوامر');

    await trigger.click();
    await expect(dialog).toHaveAttribute('dir', 'rtl');
    await expect(dialog).toHaveAttribute('lang', 'ar');

    const groupTracking = await dialog
      .locator('[class*="groupHeading"]')
      .first()
      .evaluate((el) => getComputedStyle(el).letterSpacing);
    expect(groupTracking).toBe('normal');

    await page.keyboard.press('Escape');

    await page.setViewportSize({ width: 375, height: 812 });
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
    );
    expect(overflow).toBe(false);
  });
});
