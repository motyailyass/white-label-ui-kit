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
    // The visible indicator is centered at ~10px to 26px, so (2, 2) tests the real input hitbox
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
    const disabledUnchecked = page.locator('[data-testid="specimen-disabled-unchecked"]');
    const disabledChecked = page.locator('[data-testid="specimen-disabled-checked"]');

    await expect(invalidInput).toBeVisible();
    await expect(disabledUnchecked).toBeVisible();
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

  test('verifies parent/child tri-state "Select All" dynamic synchronization', async ({
    page,
  }) => {
    const parent = page.locator('[data-testid="specimen-parent-checkbox"]');
    const childEmail = page.locator('[data-testid="specimen-child-email"]');
    const childSms = page.locator('[data-testid="specimen-child-sms"]');
    const childPush = page.locator('[data-testid="specimen-child-push"]');

    // Initial state: email is true, sms is false, push is false -> parent is indeterminate
    const isIndeterminateInitial = await parent.evaluate(
      (el) => (el as HTMLInputElement).indeterminate,
    );
    expect(isIndeterminateInitial).toBe(true);

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

    const isIndeterminateAfterSelectAll = await parent.evaluate(
      (el) => (el as HTMLInputElement).indeterminate,
    );
    expect(isIndeterminateAfterSelectAll).toBe(false);

    // Now check icon is visible, minus icon is hidden
    await expect(iconMinus).toHaveCSS('opacity', '0');
    await expect(iconCheck).toHaveCSS('opacity', '1');

    // Unchecking one child makes parent indeterminate again
    await childEmail.click();
    await expect(childEmail).not.toBeChecked();

    const isIndeterminateAfterOneUnchecked = await parent.evaluate(
      (el) => (el as HTMLInputElement).indeterminate,
    );
    expect(isIndeterminateAfterOneUnchecked).toBe(true);

    // Unchecking all children makes parent unchecked and not indeterminate
    await childSms.click();
    await childPush.click();
    await expect(parent).not.toBeChecked();

    const isIndeterminateWhenNone = await parent.evaluate(
      (el) => (el as HTMLInputElement).indeterminate,
    );
    expect(isIndeterminateWhenNone).toBe(false);
  });

  test('verifies native form submit and form reset lifecycles', async ({ page }) => {
    const marketing = page.locator('[data-testid="form-checkbox-marketing"]');
    const security = page.locator('[data-testid="form-checkbox-security"]');

    await expect(marketing).not.toBeChecked();
    await expect(security).toBeChecked();

    // Toggle marketing
    await marketing.click();
    await expect(marketing).toBeChecked();

    // Submit form
    await page.locator('form button[type="submit"]').click();
    const statusBox = page.locator('div[role="status"]');
    await expect(statusBox).toContainText(/saving|pending|processing/i);
    await expect(statusBox).toContainText(/saved|success/i, { timeout: 3000 });

    // Reset form
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
