import { expect, test } from '@playwright/test';

test.describe('Textarea Primitive Real-Browser Verification', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/gallery/textarea');
    await expect(page.locator('[data-testid="textarea-gallery"]')).toBeVisible();
  });

  test('verifies initial height derives natively from rows and density scale', async ({ page }) => {
    // 1. Default omitted size textarea uses 4 rows
    const defaultTextarea = page.locator('[data-testid="studio-active-textarea"]');
    await expect(defaultTextarea).toBeVisible();
    const defaultRows = await defaultTextarea.evaluate((el) => el.getAttribute('rows'));
    expect(defaultRows).toBe('4');

    // 2. Switch rows to 2 via segmented control
    await page.locator('[data-testid="opt-rows-2"]').click();
    const h2 = await defaultTextarea.evaluate((el) =>
      parseFloat(window.getComputedStyle(el).height),
    );

    // 3. Switch rows to 6
    await page.locator('[data-testid="opt-rows-6"]').click();
    const h6 = await defaultTextarea.evaluate((el) =>
      parseFloat(window.getComputedStyle(el).height),
    );

    expect(h2).toBeLessThan(h6);

    // 4. Density scale steps (xs to 2xl) in All Sizes view
    await page.locator('[data-testid="opt-view-all-sizes"]').click();

    const xsTextarea = page.locator('[data-testid="studio-size-textarea-xs"]');
    const xlTextarea = page.locator('[data-testid="studio-size-textarea-xl"]');

    const xsFontSize = await xsTextarea.evaluate((el) =>
      parseFloat(window.getComputedStyle(el).fontSize),
    );
    const xlFontSize = await xlTextarea.evaluate((el) =>
      parseFloat(window.getComputedStyle(el).fontSize),
    );
    // xs = 14px (0.875rem), xl = 16px (1rem)
    expect(xsFontSize).toBeCloseTo(14, 0.5);
    expect(xlFontSize).toBeCloseTo(16, 0.5);
  });

  test('enforces 48x48px minimum target on comfortable touch target mode', async ({ page }) => {
    await page.locator('[data-testid="opt-touch-comfortable"]').click();
    const comfortable = page.locator('[data-testid="studio-active-textarea"]');
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
    const textarea = page.locator('[data-testid="studio-active-textarea"]');
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
    const textarea = page.locator('[data-testid="studio-active-textarea"]');
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
    // Switch to Invalid preset via quick configurations bar
    await page.locator('[data-testid="preset-quick-select-invalid"]').click();

    const invalidTextarea = page.locator('[data-testid="studio-active-textarea"]');
    await expect(invalidTextarea).toBeVisible();
    await expect(invalidTextarea).toHaveAttribute('aria-invalid', 'true');

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
      .poll(async () => invalidTextarea.evaluate((el) => window.getComputedStyle(el).borderColor))
      .toBe(expectedDangerRgb);

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

    // 4. Blur: border remains danger
    await page.keyboard.press('Tab');
    const blurredBorder = await invalidTextarea.evaluate(
      (el) => window.getComputedStyle(el).borderColor,
    );
    expect(blurredBorder).toBe(expectedDangerRgb);
  });

  test('verifies vertical resize is preserved on read-only and suppressed on disabled', async ({
    page,
  }) => {
    const textarea = page.locator('[data-testid="studio-active-textarea"]');

    // 1. Read-Only preset
    await page.locator('[data-testid="preset-quick-select-readonly"]').click();
    await expect(textarea).toHaveAttribute('readonly');
    const readOnlyResize = await textarea.evaluate((el) => window.getComputedStyle(el).resize);
    expect(readOnlyResize).toBe('vertical');

    // 2. Disabled preset
    await page.locator('[data-testid="preset-quick-select-disabled"]').click();
    await expect(textarea).toBeDisabled();
    const disabledResize = await textarea.evaluate((el) => window.getComputedStyle(el).resize);
    expect(disabledResize).toBe('none');
  });

  test('verifies Quick Presets dynamically populate content, rows, and operational states', async ({
    page,
  }) => {
    const textarea = page.locator('[data-testid="studio-active-textarea"]');

    // 1. Scope preset
    await page.locator('[data-testid="preset-quick-select-scope"]').click();
    await expect(textarea).toHaveAttribute('rows', '6');
    const scopeVal = await textarea.inputValue();
    expect(scopeVal).toContain('Feature Scope:');

    // 2. Code preset
    await page.locator('[data-testid="preset-quick-select-code"]').click();
    await expect(textarea).toHaveAttribute('rows', '5');
    const codeVal = await textarea.inputValue();
    expect(codeVal).toContain('telemetry-worker');

    // 3. Compact preset
    await page.locator('[data-testid="preset-quick-select-compact"]').click();
    await expect(textarea).toHaveAttribute('rows', '2');
  });

  test('verifies specimen direction toggle switches to RTL with Arabic content', async ({
    page,
  }) => {
    await page.locator('[data-testid="opt-dir-rtl"]').click();

    const label = page.locator('label[for*="active-textarea"]');
    await expect(label).toBeVisible();

    const textarea = page.locator('[data-testid="studio-active-textarea"]');
    const placeholder = await textarea.getAttribute('placeholder');
    expect(placeholder).toMatch(/[\u0600-\u06FF]/); // Arabic unicode range
  });

  test('localizes specimen prose on direction switch without overwriting user edits', async ({
    page,
  }) => {
    const textarea = page.locator('[data-testid="studio-active-textarea"]');
    await page.locator('[data-testid="preset-quick-select-scope"]').click();
    expect(await textarea.inputValue()).toContain('Feature Scope:');

    await page.locator('[data-testid="opt-dir-rtl"]').click();
    await expect(textarea).toHaveValue(/[\u0600-\u06FF]/);

    // A user edit must survive subsequent direction toggles.
    await textarea.fill('نص مخصص');
    await page.locator('[data-testid="opt-dir-ltr"]').click();
    await expect(textarea).toHaveValue('نص مخصص');
  });

  test('verifies all visible density labels are associated with textareas and clicking focuses them', async ({
    page,
  }) => {
    await page.locator('[data-testid="opt-view-all-sizes"]').click();
    const densities = ['xs', 'sm', 'md', 'lg', 'xl', '2xl'];

    for (const d of densities) {
      const textarea = page.locator(`[data-testid="studio-size-textarea-${d}"]`);
      await expect(textarea).toBeVisible();

      const textareaId = await textarea.getAttribute('id');
      expect(textareaId).toBeTruthy();

      const label = page.locator(`label[for="${textareaId}"]`);
      await expect(label).toBeVisible();
      await expect(label).toContainText(`size="${d}"`);

      await label.click();
      await expect(textarea).toBeFocused();
    }
  });
});
