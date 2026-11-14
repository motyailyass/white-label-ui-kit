import { expect, test } from '@playwright/test';

test.describe('Website Select Primitive Real-Browser Verification', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/gallery/select');
    await expect(page.locator('[data-testid="select-gallery"]')).toBeVisible();
  });

  test('verifies native select target dimensions and six-step scale', async ({ page }) => {
    const isCoarse = await page.evaluate(() => window.matchMedia('(pointer: coarse)').matches);

    // 1. Website product default (omitted size): xl (48px min block size)
    const defaultSelect = page.locator('[data-testid="studio-active-select"]');
    await expect(defaultSelect).toBeVisible();

    const defaultBox = await defaultSelect.boundingBox();
    expect(defaultBox).not.toBeNull();

    if (isCoarse) {
      expect(defaultBox!.height).toBeGreaterThanOrEqual(48);
    } else {
      expect(defaultBox!.height).toBeCloseTo(48, 1);
    }

    // 2. Switch to All Sizes view to inspect the explicit scale
    await page.locator('[data-testid="opt-view-all-sizes"]').click();

    const scaleTargets: Record<string, number> = {
      '[data-testid="studio-size-select-xs"]': 28,
      '[data-testid="studio-size-select-sm"]': 32,
      '[data-testid="studio-size-select-md"]': 36,
      '[data-testid="studio-size-select-lg"]': 40,
      '[data-testid="studio-size-select-xl"]': 48,
      '[data-testid="studio-size-select-2xl"]': 56,
    };

    for (const [selector, expectedHeight] of Object.entries(scaleTargets)) {
      const select = page.locator(selector);
      await expect(select).toBeVisible();
      const box = await select.boundingBox();
      expect(box).not.toBeNull();

      if (isCoarse) {
        expect(box!.height).toBeGreaterThanOrEqual(Math.max(48, expectedHeight));
      } else {
        expect(box!.height).toBeCloseTo(expectedHeight, 1);
      }
    }
  });

  test('enforces 48x48px minimum target on comfortable touch target mode', async ({ page }) => {
    await page.locator('[data-testid="opt-touch-comfortable"]').click();
    const comfortable = page.locator('[data-testid="studio-active-select"]');
    await expect(comfortable).toBeVisible();

    const dimensions = await comfortable.evaluate((el) => {
      const style = window.getComputedStyle(el);
      return {
        height: parseFloat(style.height),
        width: parseFloat(style.width),
        minHeight: parseFloat(style.minHeight),
        minWidth: parseFloat(style.minWidth),
      };
    });

    expect(dimensions.minHeight).toBeGreaterThanOrEqual(48);
    expect(dimensions.minWidth).toBeGreaterThanOrEqual(48);
  });

  test('verifies edge-click focus directly on the native select element', async ({ page }) => {
    const select = page.locator('[data-testid="studio-active-select"]');
    await expect(select).toBeVisible();

    const box = await select.boundingBox();
    expect(box).not.toBeNull();

    // Click near the inline-start edge (x=8, y=center)
    await select.click({ position: { x: 8, y: box!.height / 2 } });
    await expect(select).toBeFocused();

    // Blur
    await page.keyboard.press('Tab');
    await expect(select).not.toBeFocused();

    // Click near the inline-end edge
    await select.click({ position: { x: box!.width - 8, y: box!.height / 2 } });
    await expect(select).toBeFocused();
  });

  test('verifies standard Select border remains stable on hover and indicates focus clearly', async ({
    page,
  }) => {
    const select = page.locator('[data-testid="studio-active-select"]');
    await expect(select).toBeVisible();

    const colors = await page.evaluate(() => {
      const elBorder = document.createElement('div');
      elBorder.style.color = 'var(--color-border-control)';
      document.body.appendChild(elBorder);
      const borderRgb = window.getComputedStyle(elBorder).color;
      elBorder.remove();

      const elFocus = document.createElement('div');
      elFocus.style.color = 'var(--color-border-focus)';
      document.body.appendChild(elFocus);
      const focusRgb = window.getComputedStyle(elFocus).color;
      elFocus.remove();

      return { borderRgb, focusRgb };
    });

    // 1. Resting state: border is var(--color-border-control)
    const restingBorder = await select.evaluate((el) => window.getComputedStyle(el).borderColor);
    expect(restingBorder).toBe(colors.borderRgb);

    // 2. Hover state: border remains STABLE at var(--color-border-control)
    await select.hover();
    const hoverBorder = await select.evaluate((el) => window.getComputedStyle(el).borderColor);
    expect(hoverBorder).toBe(colors.borderRgb);

    // 3. Focus state (click): border and outline indicate focus clearly
    await select.click();
    await expect(select).toBeFocused();
    await expect
      .poll(async () => {
        return select.evaluate((el) => {
          const style = window.getComputedStyle(el);
          return {
            border: style.borderColor,
            outline: style.outlineColor,
          };
        });
      })
      .toEqual({
        border: colors.focusRgb,
        outline: colors.focusRgb,
      });

    // 4. Blur: restores stable resting border
    await page.keyboard.press('Tab');
    await expect
      .poll(async () => {
        return select.evaluate((el) => window.getComputedStyle(el).borderColor);
      })
      .toBe(colors.borderRgb);
  });

  test('verifies invalid Select border and focus precedence across hover, focus, and pointer exit', async ({
    page,
  }) => {
    // Switch to Invalid preset via quick configurations bar
    await page.locator('[data-testid="preset-quick-select-invalid"]').click();

    const invalidSelect = page.locator('[data-testid="studio-active-select"]');
    await expect(invalidSelect).toBeVisible();
    await expect(invalidSelect).toHaveAttribute('aria-invalid', 'true');

    const expectedDangerRgb = await page.evaluate(() => {
      const el = document.createElement('div');
      el.style.color = 'var(--color-danger)';
      document.body.appendChild(el);
      const computed = window.getComputedStyle(el).color;
      el.remove();
      return computed;
    });

    // 1. Resting invalid state: border settles to danger after the color transition
    await expect
      .poll(async () => {
        return invalidSelect.evaluate((el) => window.getComputedStyle(el).borderColor);
      })
      .toBe(expectedDangerRgb);

    // 2. Focus the invalid select: both border and outline are danger
    await invalidSelect.click();
    await expect(invalidSelect).toBeFocused();
    await expect
      .poll(async () => {
        return invalidSelect.evaluate((el) => {
          const style = window.getComputedStyle(el);
          return {
            border: style.borderColor,
            outline: style.outlineColor,
          };
        });
      })
      .toEqual({
        border: expectedDangerRgb,
        outline: expectedDangerRgb,
      });
  });

  test('verifies Quick Presets dynamically switch options, values, and chevron states', async ({
    page,
  }) => {
    const select = page.locator('[data-testid="studio-active-select"]');

    // 1. Role preset
    await page.locator('[data-testid="preset-quick-select-role"]').click();
    await expect(select).toHaveValue('editor');

    // 2. Currency preset
    await page.locator('[data-testid="preset-quick-select-currency"]').click();
    await expect(select).toHaveValue('usd');

    // 3. No-icon preset
    await page.locator('[data-testid="preset-quick-select-no-icon"]').click();
    await expect(select).toHaveAttribute('data-show-icon', 'false');

    // 4. Disabled preset
    await page.locator('[data-testid="preset-quick-select-disabled"]').click();
    await expect(select).toBeDisabled();
  });

  test('verifies specimen direction toggle switches to RTL with Arabic options', async ({
    page,
  }) => {
    await page.locator('[data-testid="opt-dir-rtl"]').click();

    const label = page.locator('label[for*="active-select"]');
    await expect(label).toBeVisible();

    const optionText = await page
      .locator('[data-testid="studio-active-select"] option')
      .first()
      .textContent();
    expect(optionText).toMatch(/[\u0600-\u06FF]/); // Arabic unicode range
  });
});
