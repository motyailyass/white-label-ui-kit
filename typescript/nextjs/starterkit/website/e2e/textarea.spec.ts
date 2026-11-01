import { expect, test } from '@playwright/test';

test.describe('Website Textarea Primitive Real-Browser Verification', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/gallery/textarea');
    await expect(page.locator('[data-testid="textarea-gallery"]')).toBeVisible();
  });

  test('verifies website initial height derives natively from rows and xl density preset', async ({
    page,
  }) => {
    // 1. Row counts: 2 rows < 4 rows < 6 rows
    const rows2 = page.locator('[data-testid="specimen-rows-2"]');
    const rows4 = page.locator('[data-testid="specimen-rows-4"]');
    const rows6 = page.locator('[data-testid="specimen-rows-6"]');

    const h2 = await rows2.evaluate((el) => parseFloat(window.getComputedStyle(el).height));
    const h4 = await rows4.evaluate((el) => parseFloat(window.getComputedStyle(el).height));
    const h6 = await rows6.evaluate((el) => parseFloat(window.getComputedStyle(el).height));

    expect(h2).toBeLessThan(h4);
    expect(h4).toBeLessThan(h6);

    // 2. Default omitted size textarea uses 4 rows and Website xl density preset (16px font size)
    const defaultTextarea = page.locator('[data-testid="specimen-default"]');
    const defaultRows = await defaultTextarea.evaluate((el) => el.getAttribute('rows'));
    expect(defaultRows).toBe('4');

    const defaultFontSize = await defaultTextarea.evaluate((el) =>
      parseFloat(window.getComputedStyle(el).fontSize),
    );
    expect(defaultFontSize).toBeCloseTo(16, 0.5); // xl preset is 1rem (16px)

    // 3. Explicit density scale steps (xs to 2xl) with matching 4 rows
    const xsTextarea = page.locator('[data-testid="specimen-xs"]');
    const xlTextarea = page.locator('[data-testid="specimen-xl"]');

    const xsFontSize = await xsTextarea.evaluate((el) =>
      parseFloat(window.getComputedStyle(el).fontSize),
    );
    const xlFontSize = await xlTextarea.evaluate((el) =>
      parseFloat(window.getComputedStyle(el).fontSize),
    );
    expect(xsFontSize).toBeCloseTo(14, 0.5);
    expect(xlFontSize).toBeCloseTo(16, 0.5);
  });

  test('enforces 48x48px minimum target on coarse pointers and comfortable mode', async ({
    page,
  }) => {
    const comfortable = page.locator('[data-testid="specimen-touch-comfortable"]');
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

  test('verifies edge-click focus directly on the native textarea element', async ({ page }) => {
    const textarea = page.locator('[data-testid="specimen-default"]');
    await expect(textarea).toBeVisible();

    const box = await textarea.boundingBox();
    expect(box).not.toBeNull();

    // Click near the inline-start edge (x=8, y=16)
    await textarea.click({ position: { x: 8, y: 16 } });
    await expect(textarea).toBeFocused();

    // Blur
    await page.keyboard.press('Tab');
    await expect(textarea).not.toBeFocused();

    // Click near the inline-end edge
    await textarea.click({ position: { x: box!.width - 8, y: 16 } });
    await expect(textarea).toBeFocused();
  });

  test('verifies standard Textarea border remains stable on hover and indicates focus clearly', async ({
    page,
  }) => {
    const textarea = page.locator('[data-testid="specimen-resting"]');
    await expect(textarea).toBeVisible();

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
    const restingBorder = await textarea.evaluate((el) => window.getComputedStyle(el).borderColor);
    expect(restingBorder).toBe(colors.borderRgb);

    // 2. Hover state: border remains STABLE at var(--color-border-control)
    await textarea.hover();
    const hoverBorder = await textarea.evaluate((el) => window.getComputedStyle(el).borderColor);
    expect(hoverBorder).toBe(colors.borderRgb);

    // 3. Focus state (click): border and outline indicate focus clearly
    await textarea.click();
    await expect(textarea).toBeFocused();
    await expect
      .poll(async () => {
        return textarea.evaluate((el) => {
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

    // 4. Pointer exit while remaining focused: focus indicator persists
    await page.mouse.move(0, 0);
    const exitFocusedStyle = await textarea.evaluate((el) => {
      const style = window.getComputedStyle(el);
      return {
        border: style.borderColor,
        outline: style.outlineColor,
      };
    });
    expect(exitFocusedStyle.border).toBe(colors.focusRgb);
    expect(exitFocusedStyle.outline).toBe(colors.focusRgb);

    // 5. Blur: restores stable resting border
    await page.keyboard.press('Tab');
    await expect
      .poll(async () => {
        return textarea.evaluate((el) => window.getComputedStyle(el).borderColor);
      })
      .toBe(colors.borderRgb);
  });

  test('verifies invalid Textarea border and focus precedence across hover, focus, and pointer exit', async ({
    page,
  }) => {
    const invalidTextarea = page.locator('[data-testid="specimen-invalid"]');
    await expect(invalidTextarea).toBeVisible();

    const expectedDangerRgb = await page.evaluate(() => {
      const el = document.createElement('div');
      el.style.color = 'var(--color-danger)';
      document.body.appendChild(el);
      const computed = window.getComputedStyle(el).color;
      el.remove();
      return computed;
    });

    // 1. Resting invalid state: border is danger
    const restingBorder = await invalidTextarea.evaluate(
      (el) => window.getComputedStyle(el).borderColor,
    );
    expect(restingBorder).toBe(expectedDangerRgb);

    // 2. Hover over invalid textarea: border MUST remain danger
    await invalidTextarea.hover();
    const hoverBorder = await invalidTextarea.evaluate(
      (el) => window.getComputedStyle(el).borderColor,
    );
    expect(hoverBorder).toBe(expectedDangerRgb);

    // 3. Focus the invalid textarea: both border and outline are danger
    await invalidTextarea.click();
    await expect(invalidTextarea).toBeFocused();
    await expect
      .poll(async () => {
        return invalidTextarea.evaluate((el) => {
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

    // 4. Pointer exit while remaining focused: outline and border remain danger
    await page.mouse.move(0, 0);
    const exitFocusedStyle = await invalidTextarea.evaluate((el) => {
      const style = window.getComputedStyle(el);
      return {
        border: style.borderColor,
        outline: style.outlineColor,
      };
    });
    expect(exitFocusedStyle.border).toBe(expectedDangerRgb);
    expect(exitFocusedStyle.outline).toBe(expectedDangerRgb);

    // 5. Blur: border remains danger
    await page.keyboard.press('Tab');
    const blurredBorder = await invalidTextarea.evaluate(
      (el) => window.getComputedStyle(el).borderColor,
    );
    expect(blurredBorder).toBe(expectedDangerRgb);
  });

  test('distinguishes required-only textarea from validation-error textarea', async ({ page }) => {
    const requiredTextarea = page.locator('[data-testid="specimen-required"]');
    const invalidTextarea = page.locator('[data-testid="specimen-invalid"]');

    await expect(requiredTextarea).toBeVisible();
    await expect(invalidTextarea).toBeVisible();

    const expectedDangerRgb = await page.evaluate(() => {
      const el = document.createElement('div');
      el.style.color = 'var(--color-danger)';
      document.body.appendChild(el);
      const computed = window.getComputedStyle(el).color;
      el.remove();
      return computed;
    });

    const requiredBorder = await requiredTextarea.evaluate(
      (el) => window.getComputedStyle(el).borderColor,
    );
    const invalidBorder = await invalidTextarea.evaluate(
      (el) => window.getComputedStyle(el).borderColor,
    );

    expect(invalidBorder).toBe(expectedDangerRgb);
    expect(requiredBorder).not.toBe(expectedDangerRgb);
  });

  test('verifies vertical resize is preserved on read-only and suppressed on disabled', async ({
    page,
  }) => {
    const readOnlyTextarea = page.locator('[data-testid="specimen-readonly"]');
    const disabledTextarea = page.locator('[data-testid="specimen-disabled"]');

    const readOnlyResize = await readOnlyTextarea.evaluate(
      (el) => window.getComputedStyle(el).resize,
    );
    const disabledResize = await disabledTextarea.evaluate(
      (el) => window.getComputedStyle(el).resize,
    );

    // Read-only retains vertical resize for long log inspection
    expect(readOnlyResize).toBe('vertical');

    // Disabled explicitly disables resize
    expect(disabledResize).toBe('none');
  });

  test('verifies Arabic multiline clearance, language/direction, and application-locale behavior', async ({
    page,
  }) => {
    const arabicTextarea = page.locator('[data-testid="specimen-arabic"]');
    const mixedTextarea = page.locator('[data-testid="specimen-mixed-ltr"]');

    await expect(arabicTextarea).toBeVisible();
    await expect(mixedTextarea).toBeVisible();

    // 1. Direction and language
    const arabicDir = await arabicTextarea.evaluate((el) => el.getAttribute('dir'));
    expect(arabicDir).toBe('rtl');

    const arabicLang = await arabicTextarea.evaluate((el) =>
      el.closest('[lang]')?.getAttribute('lang'),
    );
    expect(arabicLang).toBe('ar');

    const mixedDir = await mixedTextarea.evaluate((el) => el.getAttribute('dir'));
    expect(mixedDir).toBe('ltr');

    // 2. Empirically verify Arabic multiline clearance in Chromium
    const clearance = await arabicTextarea.evaluate((el) => {
      const style = window.getComputedStyle(el);
      const lineHeight = parseFloat(style.lineHeight);
      const fontSize = parseFloat(style.fontSize);
      const height = parseFloat(style.height);
      const rows = parseInt(el.getAttribute('rows') || '4', 10);
      return { lineHeight, fontSize, height, rows, ratio: lineHeight / fontSize };
    });

    // Ensure line-height ratio accommodates text
    expect(clearance.ratio).toBeGreaterThanOrEqual(1.4);
    expect(clearance.height).toBeGreaterThanOrEqual(clearance.lineHeight * clearance.rows);

    // 3. Switch application to Arabic locale
    const langSelect = page.locator('select').first();
    await expect(langSelect).toBeVisible();
    await langSelect.selectOption('ar');

    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
    await expect(page.locator('html')).toHaveAttribute('lang', 'ar');

    // Default textarea inherits document RTL direction
    const defaultTextarea = page.locator('[data-testid="specimen-default"]');
    const defaultComputedDir = await defaultTextarea.evaluate(
      (el) => window.getComputedStyle(el).direction,
    );
    expect(defaultComputedDir).toBe('rtl');

    // Explicit LTR code block retains LTR direction even in Arabic layout
    const mixedComputedDir = await mixedTextarea.evaluate(
      (el) => window.getComputedStyle(el).direction,
    );
    expect(mixedComputedDir).toBe('ltr');
  });

  test('verifies all visible density labels are associated with textareas and clicking focuses them', async ({
    page,
  }) => {
    const densities = ['xs', 'sm', 'md', 'lg', 'xl', '2xl'];

    for (const d of densities) {
      const textarea = page.locator(`[data-testid="specimen-${d}"]`);
      await expect(textarea).toBeVisible();

      // Density specimens must NOT have overriding aria-label
      const ariaLabel = await textarea.getAttribute('aria-label');
      expect(ariaLabel).toBeNull();

      const textareaId = await textarea.getAttribute('id');
      expect(textareaId).toBeTruthy();

      const label = page.locator(`label[for="${textareaId}"]`);
      await expect(label).toBeVisible();
      await expect(label).toContainText(new RegExp(`${d} density`, 'i'));

      await label.click();
      await expect(textarea).toBeFocused();
    }
  });

  test('verifies read-only textarea with aria-invalid="true" renders danger border and outline', async ({
    page,
  }) => {
    const expectedDangerRgb = await page.evaluate(() => {
      const el = document.createElement('div');
      el.style.color = 'var(--color-danger)';
      document.body.appendChild(el);
      const computed = window.getComputedStyle(el).color;
      el.remove();
      return computed;
    });

    const readOnlyTextarea = page.locator('[data-testid="specimen-readonly"]');
    await expect(readOnlyTextarea).toBeVisible();

    await readOnlyTextarea.evaluate((el) => el.setAttribute('aria-invalid', 'true'));

    await expect
      .poll(async () => {
        return readOnlyTextarea.evaluate((el) => window.getComputedStyle(el).borderColor);
      })
      .toBe(expectedDangerRgb);

    await readOnlyTextarea.click();
    await expect(readOnlyTextarea).toBeFocused();

    await expect
      .poll(async () => {
        return readOnlyTextarea.evaluate((el) => {
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

  test('verifies textarea form reset immediately cancels pending submission timer and connects aria-describedby', async ({
    page,
  }) => {
    const textarea = page.locator('form textarea');
    const submitBtn = page.locator('form button[type="submit"]');
    const resetBtn = page.locator('form button[type="reset"]');
    const statusBox = page.locator('[role="status"]');

    const describedBy = await textarea.getAttribute('aria-describedby');
    expect(describedBy).toBeTruthy();
    const helperEl = page.locator(`#${describedBy}`);
    await expect(helperEl).toBeVisible();

    await textarea.fill('Testing feedback submission');
    await submitBtn.click();
    await expect(statusBox).toContainText(/Submitting feedback|simulated/i);

    await resetBtn.click();
    await expect(statusBox).toContainText(/Form reset to initial defaults/i);

    await page.waitForTimeout(800);
    await expect(statusBox).toContainText(/Form reset to initial defaults/i);
    await expect(statusBox).not.toContainText(/Feedback submitted successfully/i);
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
