import { test, expect } from '@playwright/test';

test.describe('Dashboard Radio Primitive Real-Browser Verification', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/gallery/radio');
    await expect(page.locator('[data-testid="radio-gallery"]')).toBeVisible();
  });

  test('verifies native input real hitbox target dimensions and six-step scale', async ({
    page,
  }) => {
    const isCoarse = await page.evaluate(
      () => window.matchMedia('(pointer: coarse)').matches,
    );

    // 1. Dashboard product default (omitted size): md (36px target, 16px indicator circle)
    const defaultSpecimen = page.locator('[data-testid="specimen-default"]');
    await expect(defaultSpecimen).toBeVisible();

    const defaultRoot = defaultSpecimen.locator('..');
    const defaultRootBox = await defaultRoot.boundingBox();
    expect(defaultRootBox).not.toBeNull();

    if (isCoarse) {
      expect(defaultRootBox!.height).toBeGreaterThanOrEqual(48);
      expect(defaultRootBox!.width).toBeGreaterThanOrEqual(48);
    } else {
      expect(defaultRootBox!.height).toBeCloseTo(36, 1);
      expect(defaultRootBox!.width).toBeCloseTo(36, 1);
    }

    // 2. Explicit scale targets
    const scaleTargets: Record<string, number> = {
      'specimen-size-xs': 28,
      'specimen-size-sm': 32,
      'specimen-size-md': 36,
      'specimen-size-lg': 40,
      'specimen-size-xl': 48,
      'specimen-size-2xl': 56,
    };

    for (const [testId, expectedTarget] of Object.entries(scaleTargets)) {
      const specimen = page.locator(`[data-testid="${testId}"]`);
      const root = specimen.locator('..');
      const box = await root.boundingBox();
      expect(box).not.toBeNull();

      if (isCoarse) {
        expect(box!.height).toBeGreaterThanOrEqual(Math.max(48, expectedTarget));
      } else {
        expect(box!.height).toBeCloseTo(expectedTarget, 1);
      }
    }

    // 3. Real input hitbox occupies 100% of the target container
    const defaultInputBox = await defaultSpecimen.boundingBox();
    expect(defaultInputBox).not.toBeNull();
    expect(defaultInputBox!.width).toBeCloseTo(defaultRootBox!.width, 0.5);
    expect(defaultInputBox!.height).toBeCloseTo(defaultRootBox!.height, 0.5);
  });

  test('verifies dot centering, containment, and omitted-versus-explicit default geometry parity', async ({
    page,
  }) => {
    const defaultInput = page.locator('[data-testid="specimen-default"]');
    const mdInput = page.locator('[data-testid="specimen-size-md"]');
    const xlInput = page.locator('[data-testid="specimen-size-xl"]');
    const twoXlInput = page.locator('[data-testid="specimen-size-2xl"]');

    const defaultIndicator = defaultInput.locator('+ span');
    const mdIndicator = mdInput.locator('+ span');
    const xlIndicator = xlInput.locator('+ span');
    const twoXlIndicator = twoXlInput.locator('+ span');

    const defaultDot = defaultIndicator.locator('span');
    const mdDot = mdIndicator.locator('span');
    const xlDot = xlIndicator.locator('span');
    const twoXlDot = twoXlIndicator.locator('span');

    // 1. Omitted size on dashboard matches explicit md (16px circle, 8px dot)
    const defaultBox = await defaultIndicator.boundingBox();
    const mdBox = await mdIndicator.boundingBox();
    expect(defaultBox).not.toBeNull();
    expect(mdBox).not.toBeNull();
    expect(defaultBox!.width).toBeCloseTo(16, 1);
    expect(defaultBox!.height).toBeCloseTo(16, 1);
    expect(defaultBox!.width).toBeCloseTo(mdBox!.width, 0.5);
    expect(defaultBox!.height).toBeCloseTo(mdBox!.height, 0.5);

    const defaultDotBox = await defaultDot.boundingBox();
    const mdDotBox = await mdDot.boundingBox();
    expect(defaultDotBox).not.toBeNull();
    expect(mdDotBox).not.toBeNull();
    expect(defaultDotBox!.width).toBeCloseTo(8, 1);
    expect(defaultDotBox!.height).toBeCloseTo(8, 1);
    expect(defaultDotBox!.width).toBeCloseTo(mdDotBox!.width, 0.5);
    expect(defaultDotBox!.height).toBeCloseTo(mdDotBox!.height, 0.5);

    // 2. Explicit xl circle is 20px, dot is 10px (50% ratio)
    const xlBox = await xlIndicator.boundingBox();
    const xlDotBox = await xlDot.boundingBox();
    expect(xlBox).not.toBeNull();
    expect(xlDotBox).not.toBeNull();
    expect(xlBox!.width).toBeCloseTo(20, 1);
    expect(xlDotBox!.width).toBeCloseTo(10, 1);

    // 3. Explicit 2xl circle is 24px, dot is 12px (50% ratio)
    const twoXlBox = await twoXlIndicator.boundingBox();
    const twoXlDotBox = await twoXlDot.boundingBox();
    expect(twoXlBox).not.toBeNull();
    expect(twoXlDotBox).not.toBeNull();
    expect(twoXlBox!.width).toBeCloseTo(24, 1);
    expect(twoXlDotBox!.width).toBeCloseTo(12, 1);

    // 4. Dot centering and containment within the visible circle
    expect(defaultDotBox!.x).toBeGreaterThanOrEqual(defaultBox!.x);
    expect(defaultDotBox!.y).toBeGreaterThanOrEqual(defaultBox!.y);
    expect(defaultDotBox!.x + defaultDotBox!.width).toBeLessThanOrEqual(
      defaultBox!.x + defaultBox!.width + 0.5,
    );
    expect(defaultDotBox!.y + defaultDotBox!.height).toBeLessThanOrEqual(
      defaultBox!.y + defaultBox!.height + 0.5,
    );

    const indCenterX = defaultBox!.x + defaultBox!.width / 2;
    const dotCenterX = defaultDotBox!.x + defaultDotBox!.width / 2;
    expect(dotCenterX).toBeCloseTo(indCenterX, 0.5);

    const indCenterY = defaultBox!.y + defaultBox!.height / 2;
    const dotCenterY = defaultDotBox!.y + defaultDotBox!.height / 2;
    expect(dotCenterY).toBeCloseTo(indCenterY, 0.5);
  });

  test('verifies real hitbox edge clicks select and persistent selection', async ({
    page,
  }) => {
    const defaultAlt = page.locator('[data-testid="specimen-default-alt"]');
    const defaultFirst = page.locator('[data-testid="specimen-default"]');

    expect(await defaultAlt.isChecked()).toBe(false);
    expect(await defaultFirst.isChecked()).toBe(true);

    const altBox = await defaultAlt.boundingBox();
    expect(altBox).not.toBeNull();

    // 1. Click top-left edge (1px, 1px) selects the radio
    await page.mouse.click(altBox!.x + 1, altBox!.y + 1);
    expect(await defaultAlt.isChecked()).toBe(true);
    expect(await defaultFirst.isChecked()).toBe(false);

    // 2. Click bottom-right edge of first radio selects it back
    const firstBox = await defaultFirst.boundingBox();
    expect(firstBox).not.toBeNull();
    await page.mouse.click(
      firstBox!.x + firstBox!.width - 1,
      firstBox!.y + firstBox!.height - 1,
    );
    expect(await defaultFirst.isChecked()).toBe(true);
    expect(await defaultAlt.isChecked()).toBe(false);

    // 3. Clicking already selected radio does not toggle or clear it
    await page.mouse.click(firstBox!.x + 2, firstBox!.y + 2);
    expect(await defaultFirst.isChecked()).toBe(true);
  });

  test('verifies comfortable and coarse touch-target policy', async ({ page }) => {
    const comfortableRadio = page.locator(
      '[data-testid="specimen-touch-comfortable"]',
    );
    const comfortableRoot = comfortableRadio.locator('..');
    const comfortableBox = await comfortableRoot.boundingBox();
    expect(comfortableBox).not.toBeNull();

    // comfortable explicitly enforces min 48px
    expect(comfortableBox!.width).toBeGreaterThanOrEqual(48);
    expect(comfortableBox!.height).toBeGreaterThanOrEqual(48);

    // 2xl size preserves larger 56px target
    const twoXlRoot = page.locator('[data-testid="specimen-size-2xl"]').locator('..');
    const twoXlBox = await twoXlRoot.boundingBox();
    expect(twoXlBox).not.toBeNull();
    expect(twoXlBox!.width).toBeGreaterThanOrEqual(56);
    expect(twoXlBox!.height).toBeGreaterThanOrEqual(56);
  });

  test('verifies hover border stability and visible keyboard focus outline', async ({
    page,
  }) => {
    const uncheckedRadio = page.locator('[data-testid="specimen-unchecked"]');
    const uncheckedIndicator = uncheckedRadio.locator('+ span');

    // 1. Initial border color
    const initialBorder = await uncheckedIndicator.evaluate(
      (el) => window.getComputedStyle(el).borderColor,
    );

    // 2. Hover changes surface without changing border (stable border principle)
    await uncheckedRadio.hover();
    const hoveredBorder = await uncheckedIndicator.evaluate(
      (el) => window.getComputedStyle(el).borderColor,
    );
    expect(hoveredBorder).toBe(initialBorder);

    // 3. Keyboard focus-visible produces visible outline
    await uncheckedRadio.focus();
    const outlineWidth = await uncheckedIndicator.evaluate(
      (el) => window.getComputedStyle(el).outlineWidth,
    );
    expect(parseFloat(outlineWidth)).toBeGreaterThanOrEqual(2);
  });

  test('verifies native group exclusivity and independent groups isolation', async ({
    page,
  }) => {
    const grpA1 = page.locator('[data-testid="specimen-group-a-1"]');
    const grpA2 = page.locator('[data-testid="specimen-group-a-2"]');
    const grpB1 = page.locator('[data-testid="specimen-group-b-1"]');
    const grpB2 = page.locator('[data-testid="specimen-group-b-2"]');

    expect(await grpA1.isChecked()).toBe(true);
    expect(await grpA2.isChecked()).toBe(false);
    expect(await grpB1.isChecked()).toBe(true);
    expect(await grpB2.isChecked()).toBe(false);

    // Select A2 -> deselects A1, leaves Group B untouched
    await grpA2.click();
    expect(await grpA1.isChecked()).toBe(false);
    expect(await grpA2.isChecked()).toBe(true);
    expect(await grpB1.isChecked()).toBe(true);
    expect(await grpB2.isChecked()).toBe(false);

    // Select B2 -> deselects B1, leaves Group A untouched
    await grpB2.click();
    expect(await grpA1.isChecked()).toBe(false);
    expect(await grpA2.isChecked()).toBe(true);
    expect(await grpB1.isChecked()).toBe(false);
    expect(await grpB2.isChecked()).toBe(true);
  });

  test('verifies keyboard Space and native arrow navigation lifecycles', async ({
    page,
  }) => {
    const dev = page.locator('[data-testid="specimen-controlled-dev"]');
    const staging = page.locator('[data-testid="specimen-controlled-staging"]');
    const prod = page.locator('[data-testid="specimen-controlled-prod"]');

    expect(await dev.isChecked()).toBe(true);
    expect(await staging.isChecked()).toBe(false);

    // Space on focused element
    await dev.focus();
    await page.keyboard.press('Space');
    expect(await dev.isChecked()).toBe(true);

    // Arrow navigation moves focus and selection
    await page.keyboard.press('ArrowDown');
    expect(await staging.isChecked()).toBe(true);
    expect(await dev.isChecked()).toBe(false);

    await page.keyboard.press('ArrowDown');
    expect(await prod.isChecked()).toBe(true);
    expect(await staging.isChecked()).toBe(false);
  });

  test('verifies combined-state precedence (invalid, hover, focus, disabled)', async ({
    page,
  }) => {
    const colors = await page.evaluate(() => {
      const el = document.createElement('div');
      el.style.borderColor = 'var(--color-danger)';
      el.style.backgroundColor = 'var(--color-danger)';
      el.style.color = 'var(--color-border-disabled)';
      document.body.appendChild(el);
      const style = window.getComputedStyle(el);
      const res = {
        danger: style.borderColor,
        borderDisabled: style.color,
      };
      el.remove();
      return res;
    });

    const invalidUnchecked = page.locator(
      '[data-testid="specimen-invalid-unchecked"]',
    );
    const invalidChecked = page.locator('[data-testid="specimen-invalid-checked"]');
    const disabledChecked = page.locator(
      '[data-testid="specimen-invalid-disabled-checked"]',
    );

    // 1. Invalid unchecked has danger border
    await expect(invalidUnchecked.locator('+ span')).toHaveCSS(
      'border-color',
      colors.danger,
    );

    // 2. Invalid checked has danger background
    await expect(invalidChecked.locator('+ span')).toHaveCSS(
      'background-color',
      colors.danger,
    );

    // 3. Disabled takes precedence over invalid
    await expect(disabledChecked.locator('+ span')).toHaveCSS(
      'border-color',
      colors.borderDisabled,
    );

    // 4. Disabled ignores clicks
    await disabledChecked.click({ force: true });
    await expect(disabledChecked).toBeChecked();
  });

  test('verifies forced-colors system highlight and state precedence', async ({
    page,
  }) => {
    await page.emulateMedia({ forcedColors: 'active' });

    const systemColors = await page.evaluate(() => {
      const el = document.createElement('div');
      el.style.backgroundColor = 'Highlight';
      el.style.borderColor = 'CanvasText';
      el.style.color = 'GrayText';
      document.body.appendChild(el);
      const res = {
        highlight: window.getComputedStyle(el).backgroundColor,
        canvasText: window.getComputedStyle(el).borderColor,
        grayText: window.getComputedStyle(el).color,
      };
      el.remove();
      return res;
    });

    const checkedInput = page.locator('[data-testid="specimen-checked"]');
    const uncheckedInput = page.locator('[data-testid="specimen-unchecked"]');
    const invalidUncheckedInput = page.locator(
      '[data-testid="specimen-invalid-unchecked"]',
    );
    const invalidCheckedInput = page.locator(
      '[data-testid="specimen-invalid-checked"]',
    );
    const invalidDisabledUncheckedInput = page.locator(
      '[data-testid="specimen-invalid-disabled-unchecked"]',
    );
    const invalidDisabledCheckedInput = page.locator(
      '[data-testid="specimen-invalid-disabled-checked"]',
    );

    const checkedIndicator = checkedInput.locator('+ span');
    const uncheckedIndicator = uncheckedInput.locator('+ span');
    const invalidUncheckedIndicator = invalidUncheckedInput.locator('+ span');
    const invalidCheckedIndicator = invalidCheckedInput.locator('+ span');
    const invalidDisabledUncheckedIndicator =
      invalidDisabledUncheckedInput.locator('+ span');
    const invalidDisabledCheckedIndicator =
      invalidDisabledCheckedInput.locator('+ span');

    // Move pointer away
    await page.mouse.move(0, 0);

    // 1. Standard states at rest
    await expect(checkedIndicator).toHaveCSS(
      'background-color',
      systemColors.highlight,
    );
    await expect(checkedIndicator).toHaveCSS(
      'border-color',
      systemColors.highlight,
    );
    await expect(uncheckedIndicator).toHaveCSS(
      'border-color',
      systemColors.canvasText,
    );

    // 2. High-contrast combined states at rest
    await expect(invalidCheckedIndicator).toHaveCSS(
      'background-color',
      systemColors.highlight,
    );
    await expect(invalidCheckedIndicator).toHaveCSS(
      'border-color',
      systemColors.highlight,
    );
    await expect(invalidUncheckedIndicator).toHaveCSS(
      'border-color',
      systemColors.highlight,
    );

    // 3. Disabled takes precedence over invalid
    await expect(invalidDisabledUncheckedIndicator).toHaveCSS(
      'border-color',
      systemColors.grayText,
    );
    await expect(invalidDisabledCheckedIndicator).toHaveCSS(
      'border-color',
      systemColors.grayText,
    );

    // 4. Hover interactions and pointer exit recovery
    await checkedInput.hover();
    await expect(checkedIndicator).toHaveCSS(
      'background-color',
      systemColors.highlight,
    );
    await page.mouse.move(0, 0);
    await expect(checkedIndicator).toHaveCSS(
      'background-color',
      systemColors.highlight,
    );

    await invalidCheckedInput.hover();
    await expect(invalidCheckedIndicator).toHaveCSS(
      'background-color',
      systemColors.highlight,
    );
    await page.mouse.move(0, 0);
    await expect(invalidCheckedIndicator).toHaveCSS(
      'background-color',
      systemColors.highlight,
    );

    await invalidDisabledUncheckedInput.hover();
    await expect(invalidDisabledUncheckedIndicator).toHaveCSS(
      'border-color',
      systemColors.grayText,
    );
    await page.mouse.move(0, 0);
    await expect(invalidDisabledUncheckedIndicator).toHaveCSS(
      'border-color',
      systemColors.grayText,
    );
  });

  test('verifies responsive reflow without horizontal clipping at narrow and desktop viewports', async ({
    page,
  }) => {
    for (const width of [320, 375, 768, 1280]) {
      await page.setViewportSize({ width, height: 800 });
      const overflow = await page.evaluate(() => {
        return (
          document.documentElement.scrollWidth > document.documentElement.clientWidth
        );
      });
      expect(overflow, `Horizontal overflow detected at ${width}px`).toBe(false);
    }
  });

  test('verifies required group state-driven invalid-to-valid transition', async ({
    page,
  }) => {
    const cardRadio = page.locator('[data-testid="specimen-required-card"]');
    const bankRadio = page.locator('[data-testid="specimen-required-bank"]');
    const validateBtn = page.locator('[data-testid="specimen-required-validate-btn"]');
    const fieldset = cardRadio.locator('xpath=ancestor::fieldset');
    const alert = fieldset.locator('[role="alert"]');

    // 1. Initial state before interaction: starts clean without premature error
    await expect(alert).toHaveCount(0);
    expect(await cardRadio.getAttribute('aria-invalid')).toBe('false');
    expect(await bankRadio.getAttribute('aria-invalid')).toBe('false');

    const descInitial = await fieldset.getAttribute('aria-describedby');
    expect(descInitial).not.toContain('error');

    // 2. Trigger validation attempt without selection -> error is displayed
    await validateBtn.click();
    await expect(alert).toBeVisible();
    expect(await cardRadio.getAttribute('aria-invalid')).toBe('true');
    expect(await bankRadio.getAttribute('aria-invalid')).toBe('true');

    const descAfterError = await fieldset.getAttribute('aria-describedby');
    expect(descAfterError).toContain('error');

    // 3. Select card option -> invalid-to-valid transition clears error
    await cardRadio.click();
    expect(await cardRadio.isChecked()).toBe(true);

    // 4. Error cleared, role="alert" removed, aria-invalid updated to false
    await expect(alert).toHaveCount(0);
    expect(await cardRadio.getAttribute('aria-invalid')).toBe('false');
    expect(await bankRadio.getAttribute('aria-invalid')).toBe('false');

    const descAfterSelect = await fieldset.getAttribute('aria-describedby');
    expect(descAfterSelect).not.toContain('error');
  });

  test('verifies native form submit, validation, and form reset lifecycles', async ({
    page,
  }) => {
    const submitBtn = page.locator('[data-testid="specimen-form-submit-btn"]');
    const resetBtn = page.locator('[data-testid="specimen-form-reset-btn"]');
    const statusDisplay = page.locator('[data-testid="form-status-display"]');

    const dedicatedOpt = page.locator(
      '[data-testid="specimen-form-dedicated"]',
    );
    const sharedOpt = page.locator('[data-testid="specimen-form-shared"]');

    // 1. Initial state: unselected
    expect(await sharedOpt.isChecked()).toBe(false);
    expect(await dedicatedOpt.isChecked()).toBe(false);

    // 2. Submit while unselected triggers empty-selection error branch
    await submitBtn.click();
    await expect(statusDisplay).toContainText(/select|erreur|خطأ|error/i);

    // 3. Select dedicated
    await dedicatedOpt.click();
    expect(await dedicatedOpt.isChecked()).toBe(true);
    expect(await sharedOpt.isChecked()).toBe(false);

    // 4. Submit form -> enters pending
    await submitBtn.click();
    await expect(statusDisplay).toContainText(/simulated|جارٍ|simulé/i);

    // 5. Reset restores defaults and cancels submit
    await resetBtn.click();
    expect(await sharedOpt.isChecked()).toBe(false);
    expect(await dedicatedOpt.isChecked()).toBe(false);
    await expect(statusDisplay).toContainText(/reset|réinitialisé|إعادة/i);
  });

  test('verifies Arabic RTL layout alignment and direction', async ({ page }) => {
    const arabicInput = page.locator('[data-testid="specimen-arabic"]');
    const arabicContainer = arabicInput.locator('xpath=ancestor::div[@dir="rtl"]');
    await expect(arabicContainer).toBeVisible();

    const arabicBox = await arabicInput.boundingBox();
    const labelBox = await arabicContainer.locator('label').boundingBox();
    expect(arabicBox).not.toBeNull();
    expect(labelBox).not.toBeNull();

    // In RTL, the indicator sits at inline-start (right edge of container)
    expect(arabicBox!.x).toBeGreaterThan(labelBox!.x);
  });

  test('verifies native required-group form validation regression', async ({ page }) => {
    // Verifies that native HTML form validation detects valueMissing on untouched required radio group,
    // and transitions to valid once a radio in the required group is selected.
    const isValueMissingInitially = await page.evaluate(() => {
      const card = document.querySelector<HTMLInputElement>(
        '[data-testid="specimen-required-card"]',
      );
      return card ? card.validity.valueMissing && !card.checkValidity() : false;
    });
    expect(isValueMissingInitially).toBe(true);

    const cardRadio = page.locator('[data-testid="specimen-required-card"]');
    await cardRadio.click();

    const isValidAfterSelection = await page.evaluate(() => {
      const card = document.querySelector<HTMLInputElement>(
        '[data-testid="specimen-required-card"]',
      );
      return card ? !card.validity.valueMissing && card.checkValidity() : false;
    });
    expect(isValidAfterSelection).toBe(true);
  });

  test('verifies zero dashboard shadows policy', async ({ page }) => {
    const violations = await page.evaluate(() => {
      const elements = Array.from(
        document.querySelectorAll(
          '[data-testid^="specimen-"], [class*="indicator"], [class*="dot"]',
        ),
      );
      const bad: string[] = [];
      for (const el of elements) {
        const style = window.getComputedStyle(el);
        const bs = style.boxShadow;
        const ts = style.textShadow;
        const filter = style.filter;
        if (bs && bs !== 'none') bad.push(`${el.tagName}: box-shadow ${bs}`);
        if (ts && ts !== 'none') bad.push(`${el.tagName}: text-shadow ${ts}`);
        if (filter && filter.includes('drop-shadow'))
          bad.push(`${el.tagName}: filter ${filter}`);
      }
      return bad;
    });

    expect(violations).toEqual([]);
  });
});
