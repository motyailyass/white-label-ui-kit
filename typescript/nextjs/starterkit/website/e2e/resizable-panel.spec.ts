import { expect, test } from '@playwright/test';

test.describe('Website ResizablePanel Primitive Real-Browser Verification', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/gallery/resizable-panel');
    await expect(page.locator('[data-testid="gallery-resizable-panel"]')).toBeVisible();
  });

  test('1. Verifies initial stage render and separator ARIA attributes', async ({ page }) => {
    const group = page.locator('[data-testid="interactive-resizable-group"]');
    await expect(group).toBeVisible();
    await expect(group).toHaveAttribute('data-orientation', 'horizontal');

    const handle = page.locator('[data-testid="interactive-handle-0"]');
    await expect(handle).toBeVisible();
    await expect(handle).toHaveAttribute('role', 'separator');
    await expect(handle).toHaveAttribute('aria-orientation', 'horizontal');
    await expect(handle).toHaveAttribute('tabindex', '0');
    await expect(handle).toHaveAttribute('aria-valuenow', '35');

    // Check panels rendered
    const panels = group.locator('[data-panel-order]');
    await expect(panels).toHaveCount(2);
    await expect(panels.nth(0)).toContainText('Navigation Explorer');
    await expect(panels.nth(1)).toContainText('Editor & Canvas');
  });

  test('2. Verifies keyboard stepping and Home/End clamping', async ({ page }) => {
    const handle = page.locator('[data-testid="interactive-handle-0"]');
    await handle.focus();
    await expect(handle).toBeFocused();

    // Step right (+2%)
    await page.keyboard.press('ArrowRight');
    await expect(handle).toHaveAttribute('aria-valuenow', '37');

    // Step left (-2%)
    await page.keyboard.press('ArrowLeft');
    await expect(handle).toHaveAttribute('aria-valuenow', '35');

    // Jump to End (maxSize: 60)
    await page.keyboard.press('End');
    await expect(handle).toHaveAttribute('aria-valuenow', '60');

    // Jump to Home (minSize: 20)
    await page.keyboard.press('Home');
    await expect(handle).toHaveAttribute('aria-valuenow', '20');
  });

  test('3. Verifies vertical orientation switching', async ({ page }) => {
    const verticalButton = page.getByRole('button', { name: 'Vertical Split' });
    await verticalButton.click();

    const group = page.locator('[data-testid="interactive-resizable-group"]');
    await expect(group).toHaveAttribute('data-orientation', 'vertical');

    const handle = page.locator('[data-testid="interactive-handle-0"]');
    await expect(handle).toHaveAttribute('aria-orientation', 'vertical');

    // Step vertically with ArrowDown (+2%)
    await handle.focus();
    await page.keyboard.press('ArrowDown');
    await expect(handle).toHaveAttribute('aria-valuenow', '37');
  });

  test('4. Verifies 3-Panel workspace layout with two handles', async ({ page }) => {
    const threePanelButton = page.getByRole('button', { name: '3 Panels (Workspace)' });
    await threePanelButton.click();

    const group = page.locator('[data-testid="interactive-resizable-group"]');
    const panels = group.locator('[data-panel-order]');
    await expect(panels).toHaveCount(3);

    const handle0 = page.locator('[data-testid="interactive-handle-0"]');
    const handle1 = page.locator('[data-testid="interactive-handle-1"]');
    await expect(handle0).toBeVisible();
    await expect(handle1).toBeVisible();
    await expect(panels.nth(2)).toContainText('Inspector & Properties');
  });

  test('5. Verifies pointer drag resizing', async ({ page }) => {
    const handle = page.locator('[data-testid="interactive-handle-0"]');
    const handleBox = await handle.boundingBox();
    expect(handleBox).not.toBeNull();

    if (handleBox) {
      const startX = handleBox.x + handleBox.width / 2;
      const startY = handleBox.y + handleBox.height / 2;

      // Dispatch pointerdown to begin drag
      await handle.dispatchEvent('pointerdown', { clientX: startX, clientY: startY, pointerId: 1 });

      // Dispatch pointermove on window to move +80px
      await page.evaluate(
        ({ sx, sy }) => {
          window.dispatchEvent(
            new PointerEvent('pointermove', { clientX: sx + 80, clientY: sy, bubbles: true }),
          );
          window.dispatchEvent(
            new PointerEvent('pointerup', { clientX: sx + 80, clientY: sy, bubbles: true }),
          );
        },
        { sx: startX, sy: startY },
      );

      const newSize = await handle.getAttribute('aria-valuenow');
      expect(Number(newSize)).toBeGreaterThan(35);
    }
  });

  test('6. Verifies RTL (Arabic) mode updates lang, dir, and localized strings', async ({
    page,
  }) => {
    const rtlButton = page.getByRole('button', { name: 'RTL (Arabic)' });
    await rtlButton.click();

    const canvas = page.locator('[class*="specimenCanvas"]');
    await expect(canvas).toHaveAttribute('dir', 'rtl');
    await expect(canvas).toHaveAttribute('lang', 'ar');

    const group = page.locator('[data-testid="interactive-resizable-group"]');
    await expect(group).toContainText('مستكشف التنقل');
    await expect(group).toContainText('محرر مساحة العمل');

    // In RTL, ArrowLeft should expand towards physical left (+2%)
    const handle = page.locator('[data-testid="interactive-handle-0"]');
    await handle.focus();
    await page.keyboard.press('ArrowLeft');
    await expect(handle).toHaveAttribute('aria-valuenow', '37');
  });
});
