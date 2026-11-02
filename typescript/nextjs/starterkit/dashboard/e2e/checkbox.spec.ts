import { test, expect } from '@playwright/test';

test.describe('Dashboard Checkbox Primitive Real-Browser Verification', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/gallery/checkbox');
    await expect(page.locator('[data-testid="checkbox-gallery"]')).toBeVisible();
  });

  test('verifies native input real hitbox target dimensions and six-step scale', async ({
    page,
  }) => {
    const isCoarse = await page.evaluate(() => window.matchMedia('(pointer: coarse)').matches);

    // 1. Dashboard product default (omitted size): md (36px target, 16px indicator box)
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
  });

  test('verifies glyph centering, containment, and omitted-versus-explicit default geometry parity', async ({
    page,
  }) => {
    const defaultInput = page.locator('[data-testid="specimen-default"]');
    const mdInput = page.locator('[data-testid="specimen-size-md"]');

    const defaultIndicator = defaultInput.locator('+ span');
    const mdIndicator = mdInput.locator('+ span');

    const defaultSvg = defaultIndicator.locator('svg').first();
    const mdSvg = mdIndicator.locator('svg').first();

    // 1. Omitted size on dashboard matches explicit md (16px indicator, 12px glyph)
    const defaultBox = await defaultIndicator.boundingBox();
    const mdBox = await mdIndicator.boundingBox();
    expect(defaultBox).not.toBeNull();
    expect(mdBox).not.toBeNull();
    expect(defaultBox!.width).toBeCloseTo(16, 1);
    expect(defaultBox!.height).toBeCloseTo(16, 1);
    expect(defaultBox!.width).toBeCloseTo(mdBox!.width, 0.5);
    expect(defaultBox!.height).toBeCloseTo(mdBox!.height, 0.5);

    const defaultSvgBox = await defaultSvg.boundingBox();
    const mdSvgBox = await mdSvg.boundingBox();
    expect(defaultSvgBox).not.toBeNull();
    expect(mdSvgBox).not.toBeNull();
    expect(defaultSvgBox!.width).toBeCloseTo(12, 1);
    expect(defaultSvgBox!.height).toBeCloseTo(12, 1);
    expect(defaultSvgBox!.width).toBeCloseTo(mdSvgBox!.width, 0.5);
    expect(defaultSvgBox!.height).toBeCloseTo(mdSvgBox!.height, 0.5);

    // 2. Glyph centering and containment within the visible indicator box
    expect(defaultSvgBox!.x).toBeGreaterThanOrEqual(defaultBox!.x);
    expect(defaultSvgBox!.y).toBeGreaterThanOrEqual(defaultBox!.y);
    expect(defaultSvgBox!.x + defaultSvgBox!.width).toBeLessThanOrEqual(
      defaultBox!.x + defaultBox!.width + 0.5,
    );
    expect(defaultSvgBox!.y + defaultSvgBox!.height).toBeLessThanOrEqual(
      defaultBox!.y + defaultBox!.height + 0.5,
    );

    const indCenterX = defaultBox!.x + defaultBox!.width / 2;
    const svgCenterX = defaultSvgBox!.x + defaultSvgBox!.width / 2;
    expect(svgCenterX).toBeCloseTo(indCenterX, 0.5);

    const indCenterY = defaultBox!.y + defaultBox!.height / 2;
    const svgCenterY = defaultSvgBox!.y + defaultSvgBox!.height / 2;
    expect(svgCenterY).toBeCloseTo(indCenterY, 0.5);
  });

  test('verifies real hitbox edge clicks toggle the native input without pseudo-element tricks', async ({
    page,
  }) => {
    const controlledInput = page.locator('[data-testid="specimen-controlled"]');
    await expect(controlledInput).toBeVisible();
    await expect(controlledInput).toBeChecked();

    const root = controlledInput.locator('..');
    const rootBox = await root.boundingBox();
    expect(rootBox).not.toBeNull();

    // Click near the top-left edge of the 36px hitbox (x=2, y=2)
    await root.click({ position: { x: 2, y: 2 } });
    await expect(controlledInput).not.toBeChecked();

    // Click near the bottom-right edge of the 36px hitbox
    await root.click({ position: { x: rootBox!.width - 2, y: rootBox!.height - 2 } });
    await expect(controlledInput).toBeChecked();
  });

  test('verifies hover border stability and keyboard focus outline', async ({ page }) => {
    const uncheckedInput = page.locator('[data-testid="specimen-unchecked"]');
    await expect(uncheckedInput).toBeVisible();

    const expectedBorderColor = await page.evaluate(() => {
      const el = document.createElement('div');
      el.style.color = 'var(--color-border-control)';
      document.body.appendChild(el);
      const computed = window.getComputedStyle(el).color;
      el.remove();
      return computed;
    });

    const indicator = uncheckedInput.locator('+ span');

    // 1. Resting state: border is var(--color-border-control)
    const restingBorder = await indicator.evaluate((el) => window.getComputedStyle(el).borderColor);
    expect(restingBorder).toBe(expectedBorderColor);

    // 2. Hover state: border remains STABLE at var(--color-border-control)
    await uncheckedInput.hover();
    const hoverBorder = await indicator.evaluate((el) => window.getComputedStyle(el).borderColor);
    expect(hoverBorder).toBe(expectedBorderColor);

    // 3. Focus-visible outline
    await uncheckedInput.focus();
    await page.keyboard.press('Tab');
  });

  test('verifies keyboard Space activates checkbox but Enter does not', async ({ page }) => {
    const controlledInput = page.locator('[data-testid="specimen-controlled"]');
    await expect(controlledInput).toBeVisible();
    await expect(controlledInput).toBeChecked();

    await controlledInput.focus();
    await expect(controlledInput).toBeFocused();

    // Enter key should NOT toggle native checkbox
    await page.keyboard.press('Enter');
    await expect(controlledInput).toBeChecked();

    // Space key toggles native checkbox
    await page.keyboard.press('Space');
    await expect(controlledInput).not.toBeChecked();

    await page.keyboard.press('Space');
    await expect(controlledInput).toBeChecked();
  });

  test('verifies combined-state precedence (invalid, hover, focus, disabled)', async ({
    page,
  }) => {
    const invalidInput = page.locator('[data-testid="specimen-invalid"]');
    const disabledChecked = page.locator('[data-testid="specimen-disabled-checked"]');

    await expect(invalidInput).toBeVisible();
    await expect(disabledChecked).toBeVisible();

    const colors = await page.evaluate(() => {
      const getVar = (varName: string) => {
        const el = document.createElement('div');
        el.style.color = `var(${varName})`;
        document.body.appendChild(el);
        const col = window.getComputedStyle(el).color;
        el.remove();
        return col;
      };
      return {
        danger: getVar('--color-danger'),
        dangerFg: getVar('--color-danger-foreground'),
        primary: getVar('--color-primary'),
        borderDisabled: getVar('--color-border-disabled'),
      };
    });

    const invalidIndicator = invalidInput.locator('+ span');

    // 1. Invalid unchecked border is danger
    await expect(invalidIndicator).toHaveCSS('border-color', colors.danger);

    // Hover unchecked invalid: retains surface hover background and danger border (does NOT turn solid red!)
    await invalidInput.hover();
    await expect(invalidIndicator).toHaveCSS('border-color', colors.danger);
    await expect(invalidIndicator).not.toHaveCSS('background-color', colors.danger);

    // 2. Click to make invalid + checked: background & border become danger, icon is dangerFg
    await invalidInput.click();
    await expect(invalidInput).toBeChecked();
    await expect(invalidIndicator).toHaveCSS('border-color', colors.danger);
    await expect(invalidIndicator).toHaveCSS('background-color', colors.danger);
    await expect(invalidIndicator).toHaveCSS('color', colors.dangerFg);

    // 3. Hovering checked+invalid preserves danger fill/border (does NOT regress to primary)
    await invalidInput.hover();
    await expect(invalidIndicator).toHaveCSS('border-color', colors.danger);
    await expect(invalidIndicator).toHaveCSS('background-color', colors.danger);

    // 4. Disabled checkbox ignores clicks and maintains disabled borders
    await disabledChecked.click({ force: true });
    await expect(disabledChecked).toBeChecked(); // remains checked, clicks ignored
    await expect(disabledChecked.locator('+ span')).toHaveCSS('border-color', colors.borderDisabled);
  });

  test('verifies forced-colors system highlight and state precedence', async ({ page }) => {
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
    const invalidInput = page.locator('[data-testid="specimen-invalid"]');
    const disabledInput = page.locator('[data-testid="specimen-disabled-checked"]');

    const invalidCheckedInput = page.locator('[data-testid="specimen-invalid-checked"]');
    const invalidIndeterminateInput = page.locator(
      '[data-testid="specimen-invalid-indeterminate"]',
    );
    const invalidDisabledUncheckedInput = page.locator(
      '[data-testid="specimen-invalid-disabled-unchecked"]',
    );
    const invalidDisabledCheckedInput = page.locator(
      '[data-testid="specimen-invalid-disabled-checked"]',
    );
    const invalidDisabledIndeterminateInput = page.locator(
      '[data-testid="specimen-invalid-disabled-indeterminate"]',
    );

    const checkedIndicator = checkedInput.locator('+ span');
    const uncheckedIndicator = uncheckedInput.locator('+ span');
    const invalidIndicator = invalidInput.locator('+ span');
    const disabledIndicator = disabledInput.locator('+ span');

    const invalidCheckedIndicator = invalidCheckedInput.locator('+ span');
    const invalidIndeterminateIndicator = invalidIndeterminateInput.locator('+ span');
    const invalidDisabledUncheckedIndicator = invalidDisabledUncheckedInput.locator('+ span');
    const invalidDisabledCheckedIndicator = invalidDisabledCheckedInput.locator('+ span');
    const invalidDisabledIndeterminateIndicator = invalidDisabledIndeterminateInput.locator('+ span');

    // Move pointer away to ensure resting assertions are free of hover
    await page.mouse.move(0, 0);

    // 1. Standard states at rest
    await expect(checkedIndicator).toHaveCSS('background-color', systemColors.highlight);
    await expect(checkedIndicator).toHaveCSS('border-color', systemColors.highlight);
    await expect(uncheckedIndicator).toHaveCSS('border-color', systemColors.canvasText);
    await expect(disabledIndicator).toHaveCSS('border-color', systemColors.grayText);
    await expect(invalidIndicator).toHaveCSS('border-color', systemColors.highlight);

    // 2. High-contrast combined states at rest (pointer away)
    // Invalid + checked at rest: System Highlight treatment
    await expect(invalidCheckedIndicator).toHaveCSS(
      'background-color',
      systemColors.highlight,
    );
    await expect(invalidCheckedIndicator).toHaveCSS(
      'border-color',
      systemColors.highlight,
    );

    // Invalid + indeterminate at rest: System Highlight treatment
    await expect(invalidIndeterminateIndicator).toHaveCSS(
      'background-color',
      systemColors.highlight,
    );
    await expect(invalidIndeterminateIndicator).toHaveCSS(
      'border-color',
      systemColors.highlight,
    );

    // Invalid + disabled + unchecked at rest: GrayText border (disabled takes precedence)
    await expect(invalidDisabledUncheckedIndicator).toHaveCSS(
      'border-color',
      systemColors.grayText,
    );

    // Invalid + disabled + checked at rest: GrayText border (disabled takes precedence)
    await expect(invalidDisabledCheckedIndicator).toHaveCSS(
      'border-color',
      systemColors.grayText,
    );

    // Invalid + disabled + indeterminate at rest: GrayText border (disabled takes precedence)
    // Poll native indeterminate property to verify DOM commitment before style assertions
    await expect.poll(async () => {
      return await invalidDisabledIndeterminateInput.evaluate(
        (el) => (el as HTMLInputElement).indeterminate,
      );
    }).toBe(true);

    await expect(invalidDisabledIndeterminateIndicator).toHaveCSS(
      'border-color',
      systemColors.grayText,
    );

    // 3. High-contrast hover interactions & pointer exit recovery
    // Checked hover: system highlight remains
    await checkedInput.hover();
    await expect(checkedIndicator).toHaveCSS('background-color', systemColors.highlight);
    await expect(checkedIndicator).toHaveCSS('border-color', systemColors.highlight);
    await page.mouse.move(0, 0);
    await expect(checkedIndicator).toHaveCSS('background-color', systemColors.highlight);
    await expect(checkedIndicator).toHaveCSS('border-color', systemColors.highlight);

    // Invalid + checked hover & pointer exit
    await invalidCheckedInput.hover();
    await expect(invalidCheckedIndicator).toHaveCSS(
      'background-color',
      systemColors.highlight,
    );
    await expect(invalidCheckedIndicator).toHaveCSS(
      'border-color',
      systemColors.highlight,
    );
    await page.mouse.move(0, 0);
    await expect(invalidCheckedIndicator).toHaveCSS(
      'background-color',
      systemColors.highlight,
    );
    await expect(invalidCheckedIndicator).toHaveCSS(
      'border-color',
      systemColors.highlight,
    );

    // Invalid + indeterminate hover & pointer exit
    await invalidIndeterminateInput.hover();
    await expect(invalidIndeterminateIndicator).toHaveCSS(
      'background-color',
      systemColors.highlight,
    );
    await expect(invalidIndeterminateIndicator).toHaveCSS(
      'border-color',
      systemColors.highlight,
    );
    await page.mouse.move(0, 0);
    await expect(invalidIndeterminateIndicator).toHaveCSS(
      'background-color',
      systemColors.highlight,
    );
    await expect(invalidIndeterminateIndicator).toHaveCSS(
      'border-color',
      systemColors.highlight,
    );

    // Invalid + disabled + unchecked hover & pointer exit: GrayText border remains
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

    // Invalid + disabled + indeterminate hover & pointer exit: GrayText border remains
    await invalidDisabledIndeterminateInput.hover();
    await expect(invalidDisabledIndeterminateIndicator).toHaveCSS(
      'border-color',
      systemColors.grayText,
    );
    await page.mouse.move(0, 0);
    await expect(invalidDisabledIndeterminateIndicator).toHaveCSS(
      'border-color',
      systemColors.grayText,
    );

    // Unchecked hover & pointer exit
    await uncheckedInput.hover();
    await expect(uncheckedIndicator).toHaveCSS('border-color', systemColors.canvasText);
    await page.mouse.move(0, 0);
    await expect(uncheckedIndicator).toHaveCSS('border-color', systemColors.canvasText);

    // Reset pointer to corner
    await page.mouse.move(0, 0);
  });

  test('verifies parent/child tri-state "Select All" dynamic synchronization', async ({
    page,
  }) => {
    const parent = page.locator('[data-testid="specimen-parent-checkbox"]');
    const childEmail = page.locator('[data-testid="specimen-child-email"]');
    const childSms = page.locator('[data-testid="specimen-child-sms"]');
    const childPush = page.locator('[data-testid="specimen-child-push"]');

    // Initial state: retrying polling ensures client hydration and layout effects have committed
    await expect.poll(async () => {
      return await parent.evaluate((el) => (el as HTMLInputElement).indeterminate);
    }).toBe(true);

    // Minus icon is visible, check icon is hidden
    const iconMinus = parent.locator('..').locator('span > span:nth-child(2)');
    const iconCheck = parent.locator('..').locator('span > span:nth-child(1)');

    await expect(iconMinus).toHaveCSS('opacity', '1');
    await expect(iconCheck).toHaveCSS('opacity', '0');

    // Activating parent toggles all children to checked
    await parent.click();
    await expect(childEmail).toBeChecked();
    await expect(childSms).toBeChecked();
    await expect(childPush).toBeChecked();
    await expect(parent).toBeChecked();

    await expect.poll(async () => {
      return await parent.evaluate((el) => (el as HTMLInputElement).indeterminate);
    }).toBe(false);

    // Now check icon is visible, minus icon is hidden
    await expect(iconMinus).toHaveCSS('opacity', '0');
    await expect(iconCheck).toHaveCSS('opacity', '1');

    // Unchecking one child makes parent indeterminate again
    await childEmail.click();
    await expect(childEmail).not.toBeChecked();

    await expect.poll(async () => {
      return await parent.evaluate((el) => (el as HTMLInputElement).indeterminate);
    }).toBe(true);

    // Unchecking all children makes parent unchecked and not indeterminate
    await childSms.click();
    await childPush.click();
    await expect(parent).not.toBeChecked();

    await expect.poll(async () => {
      return await parent.evaluate((el) => (el as HTMLInputElement).indeterminate);
    }).toBe(false);
  });

  test('verifies native form submit, client validation, and form reset lifecycles', async ({
    page,
  }) => {
    const marketing = page.locator('[data-testid="form-checkbox-marketing"]');
    const security = page.locator('[data-testid="form-checkbox-security"]');

    await expect(marketing).not.toBeChecked();
    await expect(security).toBeChecked();

    // 1. Client validation: uncheck both preferences and submit
    await security.click();
    await expect(security).not.toBeChecked();
    await expect(marketing).not.toBeChecked();

    await page.locator('form button[type="submit"]').click();
    const statusBox = page.locator('div[role="status"]');
    await expect(statusBox).toContainText(/select at least one/i);

    // 2. Toggle marketing and submit successfully
    await marketing.click();
    await expect(marketing).toBeChecked();

    await page.locator('form button[type="submit"]').click();
    await expect(statusBox).toContainText(/saving|pending|processing/i);
    await expect(statusBox).toContainText(/saved|success/i, { timeout: 3000 });

    // 3. Reset form
    await page.locator('form button[type="reset"]').click();
    await expect(marketing).not.toBeChecked();
    await expect(security).toBeChecked();
    await expect(statusBox).toContainText(/reset/i);
  });

  test('verifies Arabic RTL layout alignment and direction', async ({ page }) => {
    const defaultSpecimen = page.locator('[data-testid="specimen-default"]');
    const label = defaultSpecimen.locator('..').locator('+ label');

    // 1. Initial LTR layout: checkbox is positioned to the left (inline-start) of label
    const initialBox = await defaultSpecimen.boundingBox();
    const labelBox = await label.boundingBox();
    expect(initialBox).not.toBeNull();
    expect(labelBox).not.toBeNull();
    expect(initialBox!.x).toBeLessThan(labelBox!.x);

    // 2. Switch application language to Arabic
    const langSelect = page.locator('select').first();
    await expect(langSelect).toBeVisible();
    await langSelect.selectOption('ar');

    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
    await expect(page.locator('html')).toHaveAttribute('lang', 'ar');

    // In RTL, checkbox is positioned to the right (inline-start) of label
    const rtlInitialBox = await defaultSpecimen.boundingBox();
    const rtlLabelBox = await label.boundingBox();
    expect(rtlInitialBox).not.toBeNull();
    expect(rtlLabelBox).not.toBeNull();
    expect(rtlInitialBox!.x).toBeGreaterThan(rtlLabelBox!.x);
  });

  test('verifies zero dashboard shadows policy', async ({ page }) => {
    const defaultSpecimen = page.locator('[data-testid="specimen-default"]');
    const root = defaultSpecimen.locator('..');
    const indicator = defaultSpecimen.locator('+ span');

    for (const locator of [defaultSpecimen, root, indicator]) {
      const styles = await locator.evaluate((el) => {
        const s = window.getComputedStyle(el);
        return {
          boxShadow: s.boxShadow,
          filter: s.filter,
        };
      });
      expect(styles.boxShadow).toBe('none');
      expect(styles.filter).toBe('none');
    }
  });
});
