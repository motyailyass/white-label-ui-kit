import { expect, test } from '@playwright/test';

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
    const defaultInput = page.locator('[data-testid="studio-active-input"]');
    const defaultHeight = await defaultInput.evaluate((el) => {
      return parseFloat(window.getComputedStyle(el).height);
    });

    if (isCoarse) {
      expect(defaultHeight).toBeGreaterThanOrEqual(48);
    } else {
      expect(defaultHeight).toBeCloseTo(36, 1);
    }

    // 2. Switch to All Sizes view to inspect the explicit scale
    await page.locator('[data-testid="opt-view-all-sizes"]').click();

    const scaleMap: Record<string, number> = {
      '[data-testid="studio-size-input-xs"]': 28,
      '[data-testid="studio-size-input-sm"]': 32,
      '[data-testid="studio-size-input-md"]': 36,
      '[data-testid="studio-size-input-lg"]': 40,
      '[data-testid="studio-size-input-xl"]': 48,
      '[data-testid="studio-size-input-2xl"]': 56,
    };

    for (const [selector, expected] of Object.entries(scaleMap)) {
      const inputEl = page.locator(selector);
      await expect(inputEl).toBeVisible();
      const height = await inputEl.evaluate((el) => {
        return parseFloat(window.getComputedStyle(el).height);
      });

      if (isCoarse) {
        expect(height).toBeGreaterThanOrEqual(Math.max(48, expected));
      } else {
        expect(height).toBeCloseTo(expected, 1);
      }
    }
  });

  test('enforces 48x48px minimum target on comfortable touch target mode', async ({ page }) => {
    await page.locator('[data-testid="opt-touch-comfortable"]').click();
    const comfortableInput = page.locator('[data-testid="studio-active-input"]');
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
    const input = page.locator('[data-testid="studio-active-input"]');
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

  test('verifies standard Input border remains stable on hover and indicates focus cleanly without double outline', async ({
    page,
  }) => {
    const input = page.locator('[data-testid="studio-active-input"]');
    await expect(input).toBeVisible();

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
    const restingBorder = await input.evaluate((el) => window.getComputedStyle(el).borderColor);
    expect(restingBorder).toBe(colors.borderRgb);

    // 2. Hover state: border remains STABLE at var(--color-border-control)
    await input.hover();
    const hoverBorder = await input.evaluate((el) => window.getComputedStyle(el).borderColor);
    expect(hoverBorder).toBe(colors.borderRgb);

    // 3. Mouse Click Focus: border indicates focus cleanly (no artificial floating double outline)
    await input.click();
    await expect(input).toBeFocused();
    await expect
      .poll(async () => {
        return input.evaluate((el) => window.getComputedStyle(el).borderColor);
      })
      .toBe(colors.focusRgb);

    // 4. Pointer exit while remaining focused: focus indicator persists
    await page.mouse.move(0, 0);
    const exitFocusedBorder = await input.evaluate((el) => window.getComputedStyle(el).borderColor);
    expect(exitFocusedBorder).toBe(colors.focusRgb);

    // 5. Blur: restores stable resting border
    await page.keyboard.press('Tab');
    await expect
      .poll(async () => {
        return input.evaluate((el) => window.getComputedStyle(el).borderColor);
      })
      .toBe(colors.borderRgb);
  });

  test('verifies invalid Input border across hover, focus, and pointer exit', async ({ page }) => {
    // Switch to Invalid state via studio control
    await page.locator('[data-testid="opt-state-invalid"]').click();

    const invalidInput = page.locator('[data-testid="studio-active-input"]');
    await expect(invalidInput).toBeVisible();
    await expect(invalidInput).toHaveAttribute('aria-invalid', 'true');

    // Resolve computed RGB color of var(--color-danger)
    const expectedDangerRgb = await page.evaluate(() => {
      const el = document.createElement('div');
      el.style.color = 'var(--color-danger)';
      document.body.appendChild(el);
      const computed = window.getComputedStyle(el).color;
      el.remove();
      return computed;
    });

    // 1. Resting invalid state: border settles on danger (poll past the color transition)
    await expect
      .poll(async () => invalidInput.evaluate((el) => window.getComputedStyle(el).borderColor))
      .toBe(expectedDangerRgb);

    // 2. Hover over invalid input: border MUST remain danger
    await invalidInput.hover();
    const hoverBorder = await invalidInput.evaluate(
      (el) => window.getComputedStyle(el).borderColor,
    );
    expect(hoverBorder).toBe(expectedDangerRgb);

    // 3. Focus the invalid input: border is danger
    await invalidInput.click();
    await expect(invalidInput).toBeFocused();
    const focusedBorder = await invalidInput.evaluate(
      (el) => window.getComputedStyle(el).borderColor,
    );
    expect(focusedBorder).toBe(expectedDangerRgb);

    // 4. Pointer exit while remaining focused: border remains danger
    await page.mouse.move(0, 0);
    const exitFocusedBorder = await invalidInput.evaluate(
      (el) => window.getComputedStyle(el).borderColor,
    );
    expect(exitFocusedBorder).toBe(expectedDangerRgb);

    // 5. Blur input: border remains danger
    await page.keyboard.press('Tab');
    const blurredBorder = await invalidInput.evaluate(
      (el) => window.getComputedStyle(el).borderColor,
    );
    expect(blurredBorder).toBe(expectedDangerRgb);
  });

  test('verifies all quick configuration presets update stage meaningfully', async ({ page }) => {
    const input = page.locator('[data-testid="studio-active-input"]');

    // 1. Password preset: switches to type="password"
    await page.locator('[data-testid="preset-quick-select-password"]').click();
    await expect(input).toHaveAttribute('type', 'password');

    // 2. Email preset: switches to type="email"
    await page.locator('[data-testid="preset-quick-select-email"]').click();
    await expect(input).toHaveAttribute('type', 'email');

    // 3. Search preset: switches to type="search"
    await page.locator('[data-testid="preset-quick-select-search"]').click();
    await expect(input).toHaveAttribute('type', 'search');

    // 4. Invalid preset: switches to aria-invalid="true"
    await page.locator('[data-testid="preset-quick-select-invalid"]').click();
    await expect(input).toHaveAttribute('aria-invalid', 'true');

    // 5. Disabled preset: disables input
    await page.locator('[data-testid="preset-quick-select-disabled"]').click();
    await expect(input).toBeDisabled();

    // 6. Read-Only preset: enables readOnly
    await page.locator('[data-testid="preset-quick-select-readonly"]').click();
    await expect(input).toHaveAttribute('readonly', '');
  });

  test('verifies specimen direction switches to RTL on demand', async ({ page }) => {
    await page.locator('[data-testid="opt-dir-rtl"]').click();
    const studioPreviewDirection = await page
      .locator('[data-testid="studio-active-input"]')
      .evaluate((el) => window.getComputedStyle(el).direction);
    expect(studioPreviewDirection).toBe('rtl');
  });

  test('verifies visible label is associated with input and clicking focuses it', async ({
    page,
  }) => {
    const input = page.locator('[data-testid="studio-active-input"]');
    await expect(input).toBeVisible();

    const inputId = await input.getAttribute('id');
    expect(inputId).toBeTruthy();

    const label = page.locator(`label[for="${inputId}"]`);
    await expect(label).toBeVisible();

    await label.click();
    await expect(input).toBeFocused();
  });

  test('verifies narrow viewport and 200% text zoom do not produce horizontal overflow', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 320, height: 640 });
    await page.waitForTimeout(100);

    const overflow320 = await page.evaluate(() => {
      return document.documentElement.scrollWidth <= window.innerWidth;
    });
    expect(overflow320).toBe(true);

    await page.setViewportSize({ width: 390, height: 844 });
    await page.evaluate(() => {
      document.documentElement.style.fontSize = '32px';
    });
    await page.waitForTimeout(100);

    const overflow390Zoom = await page.evaluate(() => {
      return document.documentElement.scrollWidth <= window.innerWidth;
    });
    expect(overflow390Zoom).toBe(true);

    await page.evaluate(() => {
      document.documentElement.style.fontSize = '';
    });
  });
});
