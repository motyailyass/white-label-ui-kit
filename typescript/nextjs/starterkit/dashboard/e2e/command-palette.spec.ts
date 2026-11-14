import { expect, test } from '@playwright/test';

test.describe('Dashboard CommandPalette Studio Real-Browser Verification', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/gallery/command-palette');
    await expect(page.locator('[data-testid="command-palette-studio"]')).toBeVisible();
  });

  test('1. Verifies top-layer modal open, focus capture/restoration, filtering, keyboard navigation, dark mode item contrast, and zero shadows', async ({
    page,
  }) => {
    const trigger = page.locator('[data-testid="command-palette-open-btn"]');
    const dialog = page.locator('[data-testid="command-palette-dialog"]');
    const input = page.locator('[data-testid="command-palette-input"]');

    await expect(dialog).not.toBeVisible();

    // Open via trigger button and verify initial focus in search combobox
    await trigger.click();
    await expect(dialog).toBeVisible();
    await expect(dialog).toHaveAttribute('open', '');
    await expect(input).toBeFocused();

    // Header height must remain static (0px jump) when typing the first letter mounts clear button
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

    // Dashboard zero-shadow policy on modal panel
    const panelShadow = await dialog
      .locator('[class*="panel"]')
      .evaluate((el) => getComputedStyle(el).boxShadow);
    expect(panelShadow).toBe('none');

    // Background is inert while modal dialog is open
    const dirRtlBtn = page.locator('[data-testid="command-palette-dir-rtl"]');
    let bgClickable = false;
    try {
      await dirRtlBtn.click({ timeout: 400, force: false });
      bgClickable = true;
    } catch {
      bgClickable = false;
    }
    expect(bgClickable).toBe(false);

    // Filter to zero results then clear and select via ArrowDown + Enter
    await input.fill('nonexistent-xyz');
    await expect(page.locator('[data-testid="command-palette-empty"]')).toBeVisible();

    await input.fill('');
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('ArrowDown');

    // Verify active item settles with visible contrast in Dark Theme against raised panel
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
      'Analytics & Reports',
    );

    // Trigger receives restored focus after command execution closes the dialog
    await expect(trigger).toBeFocused();

    // Reopen with keyboard and dismiss with Escape -> restores focus cleanly
    await page.keyboard.press('Enter');
    await expect(dialog).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(dialog).not.toBeVisible();
    await expect(trigger).toBeFocused();
  });

  test('2. Verifies RTL lang="ar" localization, Arabic letter-spacing, and mobile viewport containment', async ({
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

    // Group headings restore normal letter-spacing for Arabic glyphs
    const groupTracking = await dialog
      .locator('[class*="groupHeading"]')
      .first()
      .evaluate((el) => getComputedStyle(el).letterSpacing);
    expect(groupTracking).toBe('normal');

    await page.keyboard.press('Escape');

    // Mobile 375px zero horizontal overflow
    await page.setViewportSize({ width: 375, height: 812 });
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
    );
    expect(overflow).toBe(false);
  });
});
