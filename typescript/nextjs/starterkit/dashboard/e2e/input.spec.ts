import { test, expect } from '@playwright/test';

test.describe('Input Primitive Real-Browser Verification', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/gallery/input');
    await expect(page.locator('[data-testid="input-gallery"]')).toBeVisible();
  });

  test('verifies actual native-input target dimensions and explicit sizing scale', async ({
    page,
  }) => {
    const isCoarse = await page.evaluate(() => window.matchMedia('(pointer: coarse)').matches);

    // 1. Product default (omitted size) on dashboard
    const defaultInput = page.locator('#specimen-controlled');
    const defaultHeight = await defaultInput.evaluate((el) => {
      return parseFloat(window.getComputedStyle(el).height);
    });

    if (isCoarse) {
      expect(defaultHeight).toBeGreaterThanOrEqual(48);
    } else {
      expect(defaultHeight).toBeCloseTo(36, 1);
    }

    // 2. Explicit scale heights
    const scaleMap: Record<string, number> = {
      'input[aria-label="XS input"]': 28,
      'input[aria-label="SM input"]': 32,
      'input[aria-label="MD input"]': 36,
      'input[aria-label="LG input"]': 40,
      'input[aria-label="XL input"]': 48,
      'input[aria-label="2XL input"]': 56,
    };

    for (const [selector, expected] of Object.entries(scaleMap)) {
      const height = await page.locator(selector).evaluate((el) => {
        return parseFloat(window.getComputedStyle(el).height);
      });

      if (isCoarse) {
        expect(height).toBeGreaterThanOrEqual(Math.max(48, expected));
      } else {
        expect(height).toBeCloseTo(expected, 1);
      }
    }
  });

  test('enforces 48x48px minimum target on coarse pointers and comfortable mode', async ({
    page,
  }) => {
    const comfortableInput = page.locator('#specimen-touch-comfortable');
    await expect(comfortableInput).toBeVisible();

    const dimensions = await comfortableInput.evaluate((el) => {
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

  test('verifies edge-click focus directly on the native input element', async ({ page }) => {
    const input = page.locator('#specimen-controlled');
    await expect(input).toBeVisible();

    const box = await input.boundingBox();
    expect(box).not.toBeNull();

    // Click near the inline-start edge (x=8, y=center)
    await input.click({ position: { x: 8, y: box!.height / 2 } });
    await expect(input).toBeFocused();

    // Blur
    await page.keyboard.press('Tab');
    await expect(input).not.toBeFocused();

    // Click near the inline-end edge
    await input.click({ position: { x: box!.width - 8, y: box!.height / 2 } });
    await expect(input).toBeFocused();
  });

  test('verifies invalid Input border and focus precedence across hover, focus, and pointer exit', async ({
    page,
  }) => {
    const invalidInput = page.locator('#specimen-invalid');
    await expect(invalidInput).toBeVisible();

    // Resolve computed RGB color of var(--color-danger)
    const expectedDangerRgb = await page.evaluate(() => {
      const el = document.createElement('div');
      el.style.color = 'var(--color-danger)';
      document.body.appendChild(el);
      const computed = window.getComputedStyle(el).color;
      el.remove();
      return computed;
    });

    // 1. Resting invalid state: border is danger
    const restingBorder = await invalidInput.evaluate((el) => window.getComputedStyle(el).borderColor);
    expect(restingBorder).toBe(expectedDangerRgb);

    // 2. Hover over invalid input: border MUST remain danger (hover precedence fix)
    await invalidInput.hover();
    const hoverBorder = await invalidInput.evaluate((el) => window.getComputedStyle(el).borderColor);
    expect(hoverBorder).toBe(expectedDangerRgb);

    // 3. Focus the invalid input: both border and outline are danger
    await invalidInput.click();
    await expect(invalidInput).toBeFocused();
    const focusedStyle = await invalidInput.evaluate((el) => {
      const style = window.getComputedStyle(el);
      return {
        border: style.borderColor,
        outline: style.outlineColor,
      };
    });
    expect(focusedStyle.border).toBe(expectedDangerRgb);
    expect(focusedStyle.outline).toBe(expectedDangerRgb);

    // 4. Pointer exit while remaining focused: outline and border remain danger
    await page.mouse.move(0, 0);
    const exitFocusedStyle = await invalidInput.evaluate((el) => {
      const style = window.getComputedStyle(el);
      return {
        border: style.borderColor,
        outline: style.outlineColor,
      };
    });
    expect(exitFocusedStyle.border).toBe(expectedDangerRgb);
    expect(exitFocusedStyle.outline).toBe(expectedDangerRgb);

    // 5. Blur input: border remains danger
    await page.keyboard.press('Tab');
    const blurredBorder = await invalidInput.evaluate((el) => window.getComputedStyle(el).borderColor);
    expect(blurredBorder).toBe(expectedDangerRgb);
  });

  test('distinguishes required-only input from validation-error input', async ({ page }) => {
    const requiredInput = page.locator('#specimen-required');
    const invalidInput = page.locator('#specimen-invalid');

    await expect(requiredInput).toBeVisible();
    await expect(invalidInput).toBeVisible();

    const expectedDangerRgb = await page.evaluate(() => {
      const el = document.createElement('div');
      el.style.color = 'var(--color-danger)';
      document.body.appendChild(el);
      const computed = window.getComputedStyle(el).color;
      el.remove();
      return computed;
    });

    const requiredBorder = await requiredInput.evaluate((el) => window.getComputedStyle(el).borderColor);
    const invalidBorder = await invalidInput.evaluate((el) => window.getComputedStyle(el).borderColor);

    // Invalid input displays danger border
    expect(invalidBorder).toBe(expectedDangerRgb);

    // Required-only input is NOT rendered red as an error
    expect(requiredBorder).not.toBe(expectedDangerRgb);
  });

  test('verifies Arabic specimen language/direction and Arabic application-locale behavior', async ({
    page,
  }) => {
    const arabicInput = page.locator('#specimen-arabic');
    const mixedInput = page.locator('#specimen-mixed-ltr');

    await expect(arabicInput).toBeVisible();
    await expect(mixedInput).toBeVisible();

    // 1. Initial English view: Arabic specimen has dir="rtl" and lang="ar"
    const arabicDir = await arabicInput.evaluate((el) => el.getAttribute('dir'));
    expect(arabicDir).toBe('rtl');

    const arabicLang = await arabicInput.evaluate((el) => el.closest('[lang]')?.getAttribute('lang'));
    expect(arabicLang).toBe('ar');

    // Mixed specimen has dir="ltr"
    const mixedDir = await mixedInput.evaluate((el) => el.getAttribute('dir'));
    expect(mixedDir).toBe('ltr');

    // 2. Switch application to Arabic locale
    const langSelect = page.locator('select').first();
    await expect(langSelect).toBeVisible();
    await langSelect.selectOption('ar');

    // Verify document-level direction and language
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
    await expect(page.locator('html')).toHaveAttribute('lang', 'ar');

    // Inputs now inherit RTL document direction
    const defaultInput = page.locator('#specimen-controlled');
    const defaultComputedDir = await defaultInput.evaluate((el) => window.getComputedStyle(el).direction);
    expect(defaultComputedDir).toBe('rtl');

    // Explicit LTR token retains LTR direction even in Arabic layout
    const mixedComputedDir = await mixedInput.evaluate((el) => window.getComputedStyle(el).direction);
    expect(mixedComputedDir).toBe('ltr');
  });
});
