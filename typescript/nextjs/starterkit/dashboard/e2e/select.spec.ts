import { test, expect } from '@playwright/test';

test.describe('Dashboard Select Primitive Real-Browser Verification', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/gallery/select');
    await expect(page.locator('[data-testid="select-gallery"]')).toBeVisible();
  });

  test('verifies native select target dimensions and six-step scale', async ({ page }) => {
    const isCoarse = await page.evaluate(() => window.matchMedia('(pointer: coarse)').matches);

    // 1. Dashboard product default (omitted size): md (36px min block size)
    const defaultSelect = page.locator('[data-testid="specimen-default"]');
    await expect(defaultSelect).toBeVisible();

    const defaultBox = await defaultSelect.boundingBox();
    expect(defaultBox).not.toBeNull();

    if (isCoarse) {
      expect(defaultBox!.height).toBeGreaterThanOrEqual(48);
    } else {
      expect(defaultBox!.height).toBeCloseTo(36, 1);
    }

    // 2. Explicit scale heights
    const scaleTargets: Record<string, number> = {
      'specimen-size-xs': 28,
      'specimen-size-sm': 32,
      'specimen-size-md': 36,
      'specimen-size-lg': 40,
      'specimen-size-xl': 48,
      'specimen-size-2xl': 56,
    };

    for (const [testId, expectedHeight] of Object.entries(scaleTargets)) {
      const select = page.locator(`[data-testid="${testId}"]`);
      const box = await select.boundingBox();
      expect(box).not.toBeNull();

      if (isCoarse) {
        expect(box!.height).toBeGreaterThanOrEqual(Math.max(48, expectedHeight));
      } else {
        expect(box!.height).toBeCloseTo(expectedHeight, 1);
      }
    }
  });

  test('verifies omitted-versus-explicit default parity on Dashboard', async ({ page }) => {
    const omitted = page.locator('[data-testid="specimen-default"]');
    const explicit = page.locator('[data-testid="specimen-size-md"]');

    const omittedStyle = await omitted.evaluate((el) => {
      const s = window.getComputedStyle(el);
      return {
        height: s.height,
        paddingInlineStart: s.paddingInlineStart,
        paddingInlineEnd: s.paddingInlineEnd,
        paddingBlockStart: s.paddingBlockStart,
        paddingBlockEnd: s.paddingBlockEnd,
        fontSize: s.fontSize,
        lineHeight: s.lineHeight,
        borderRadius: s.borderRadius,
        borderWidth: s.borderWidth,
      };
    });

    const explicitStyle = await explicit.evaluate((el) => {
      const s = window.getComputedStyle(el);
      return {
        height: s.height,
        paddingInlineStart: s.paddingInlineStart,
        paddingInlineEnd: s.paddingInlineEnd,
        paddingBlockStart: s.paddingBlockStart,
        paddingBlockEnd: s.paddingBlockEnd,
        fontSize: s.fontSize,
        lineHeight: s.lineHeight,
        borderRadius: s.borderRadius,
        borderWidth: s.borderWidth,
      };
    });

    expect(omittedStyle.height).toBe(explicitStyle.height);
    expect(omittedStyle.paddingInlineStart).toBe(explicitStyle.paddingInlineStart);
    expect(omittedStyle.paddingInlineEnd).toBe(explicitStyle.paddingInlineEnd);
    expect(omittedStyle.paddingBlockStart).toBe(explicitStyle.paddingBlockStart);
    expect(omittedStyle.paddingBlockEnd).toBe(explicitStyle.paddingBlockEnd);
    expect(omittedStyle.fontSize).toBe(explicitStyle.fontSize);
    expect(omittedStyle.lineHeight).toBe(explicitStyle.lineHeight);
    expect(omittedStyle.borderRadius).toBe(explicitStyle.borderRadius);
    expect(omittedStyle.borderWidth).toBe(explicitStyle.borderWidth);
  });

  test('verifies touch-target policy in both dimensions and coarse pointer expansion', async ({
    browser,
  }) => {
    const touchContext = await browser.newContext({ hasTouch: true });
    const touchPage = await touchContext.newPage();
    await touchPage.goto('/gallery/select');
    await expect(touchPage.locator('[data-testid="select-gallery"]')).toBeVisible();

    // Assert (any-pointer: coarse) matches
    const isAnyCoarse = await touchPage.evaluate(
      () => window.matchMedia('(any-pointer: coarse)').matches,
    );
    expect(isAnyCoarse).toBe(true);

    // On coarse pointer, explicit xs target expands from 28px to >= 48px in both dimensions
    const coarseXs = touchPage.locator('[data-testid="specimen-size-xs"]');
    const coarseXsBox = await coarseXs.boundingBox();
    expect(coarseXsBox).not.toBeNull();
    expect(coarseXsBox!.height).toBeGreaterThanOrEqual(48);
    expect(coarseXsBox!.width).toBeGreaterThanOrEqual(48);

    // Comfortable mode also enforces at least 48px
    const comfortable = touchPage.locator('[data-testid="specimen-touch-comfortable"]');
    const comfortableBox = await comfortable.boundingBox();
    expect(comfortableBox).not.toBeNull();
    expect(comfortableBox!.height).toBeGreaterThanOrEqual(48);
    expect(comfortableBox!.width).toBeGreaterThanOrEqual(48);

    // 2xl size preserves minimum 56px height
    const coarseTwoXl = touchPage.locator('[data-testid="specimen-size-2xl"]');
    const coarseTwoXlBox = await coarseTwoXl.boundingBox();
    expect(coarseTwoXlBox).not.toBeNull();
    expect(coarseTwoXlBox!.height).toBeGreaterThanOrEqual(56);

    // Contrast against fine pointer (hasTouch: false) where xs is unexpanded 28px
    const fineContext = await browser.newContext({ hasTouch: false });
    const finePage = await fineContext.newPage();
    await finePage.goto('/gallery/select');
    await expect(finePage.locator('[data-testid="select-gallery"]')).toBeVisible();

    const fineXs = finePage.locator('[data-testid="specimen-size-xs"]');
    const fineXsBox = await fineXs.boundingBox();
    expect(fineXsBox).not.toBeNull();
    expect(fineXsBox!.height).toBeCloseTo(28, 1);

    await fineContext.close();
    await touchContext.close();
  });

  test('verifies controlled selection and uncontrolled form reset', async ({ page }) => {
    // 1. Controlled mode
    const controlledSelect = page.locator('[data-testid="specimen-controlled"]');
    const statusValue = page.locator('[data-testid="controlled-status-value"]');

    expect(await controlledSelect.inputValue()).toBe('email');
    await expect(statusValue).toHaveText('email');

    await controlledSelect.selectOption('sms');
    expect(await controlledSelect.inputValue()).toBe('sms');
    await expect(statusValue).toHaveText('sms');

    // 2. Uncontrolled mode with native form reset
    const uncontrolledSelect = page.locator('[data-testid="specimen-uncontrolled"]');
    expect(await uncontrolledSelect.inputValue()).toBe('us-west');

    await uncontrolledSelect.selectOption('eu-central');
    expect(await uncontrolledSelect.inputValue()).toBe('eu-central');

    await page.locator('[data-testid="uncontrolled-reset-btn"]').click();
    expect(await uncontrolledSelect.inputValue()).toBe('us-west');
  });

  test('verifies state cascade: neutral hover border stability, focus outline, and invalid precedence', async ({
    page,
  }) => {
    const restingSelect = page.locator('[data-testid="specimen-resting"]');
    const invalidSelect = page.locator('[data-testid="specimen-invalid"]');
    const disabledSelect = page.locator('[data-testid="specimen-disabled"]');
    const invalidDisabledSelect = page.locator('[data-testid="specimen-invalid-disabled"]');

    // 1. Stable neutral hover border
    const restBorder = await restingSelect.evaluate((el) => window.getComputedStyle(el).borderColor);
    await restingSelect.hover();
    const hoverBorder = await restingSelect.evaluate((el) => window.getComputedStyle(el).borderColor);
    expect(hoverBorder).toBe(restBorder);

    // 2. Focus outline
    await restingSelect.focus();
    const isFocused = await restingSelect.evaluate((el) => document.activeElement === el);
    expect(isFocused).toBe(true);
    const focusOutlineWidth = await restingSelect.evaluate((el) =>
      parseFloat(window.getComputedStyle(el).outlineWidth),
    );
    expect(focusOutlineWidth).toBeGreaterThanOrEqual(1);

    // 3. Invalid border is danger color and retains it on hover
    const invalidBorder = await invalidSelect.evaluate((el) => window.getComputedStyle(el).borderColor);
    expect(invalidBorder).not.toBe(restBorder);
    await invalidSelect.hover();
    const invalidHoverBorder = await invalidSelect.evaluate((el) => window.getComputedStyle(el).borderColor);
    expect(invalidHoverBorder).toBe(invalidBorder);

    // 4. Disabled styling wins over invalid
    const disabledBg = await disabledSelect.evaluate((el) => window.getComputedStyle(el).backgroundColor);
    const invalidDisabledBg = await invalidDisabledSelect.evaluate(
      (el) => window.getComputedStyle(el).backgroundColor,
    );
    expect(invalidDisabledBg).toBe(disabledBg);
  });

  test('verifies high-contrast forced-colors mode across combined states', async ({
    browser,
  }) => {
    const context = await browser.newContext({
      forcedColors: 'active',
      colorScheme: 'light',
    });
    const page = await context.newPage();
    await page.goto('/gallery/select');
    await expect(page.locator('[data-testid="select-gallery"]')).toBeVisible();

    const states = [
      { id: 'specimen-resting', label: 'Resting' },
      { id: 'specimen-invalid', label: 'Invalid' },
      { id: 'specimen-disabled', label: 'Disabled' },
      { id: 'specimen-invalid-disabled', label: 'Invalid Disabled' },
    ];

    for (const s of states) {
      const select = page.locator(`[data-testid="${s.id}"]`);
      await expect(select).toBeVisible();

      // Check visible border
      const borderWidth = await select.evaluate((el) =>
        parseFloat(window.getComputedStyle(el).borderWidth),
      );
      expect(borderWidth, `Border width for ${s.label}`).toBeGreaterThanOrEqual(1);

      // Check focus outline on enabled selects
      if (!s.id.includes('disabled')) {
        await select.focus();
        const outlineWidth = await select.evaluate((el) =>
          parseFloat(window.getComputedStyle(el).outlineWidth),
        );
        expect(outlineWidth, `Focus outline for ${s.label}`).toBeGreaterThanOrEqual(1);
      }
    }

    await context.close();
  });

  test('verifies required validation transition and direct aria-describedby association', async ({
    page,
  }) => {
    const requiredSelect = page.locator('[data-testid="specimen-required"]');
    const validateBtn = page.locator('[data-testid="required-validate-btn"]');

    // 1. Starts with no premature error
    await expect(requiredSelect).not.toHaveAttribute('aria-invalid', 'true');
    await expect(page.locator('[data-testid="required-error-msg"]')).toHaveCount(0);

    const initialDescribedBy = await requiredSelect.getAttribute('aria-describedby');
    expect(initialDescribedBy).not.toBeNull();
    expect(initialDescribedBy).not.toContain('error');

    // 2. Click validate while empty: triggers validation error
    await validateBtn.click();
    await expect(requiredSelect).toHaveAttribute('aria-invalid', 'true');
    await expect(page.locator('[data-testid="required-error-msg"]')).toBeVisible();

    const errorDescribedBy = await requiredSelect.getAttribute('aria-describedby');
    expect(errorDescribedBy).toContain('error');

    // 3. Select a valid option: clears error immediately
    await requiredSelect.selectOption('usd');
    await expect(requiredSelect).not.toHaveAttribute('aria-invalid', 'true');
    await expect(page.locator('[data-testid="required-error-msg"]')).toHaveCount(0);
  });

  test('verifies local form submission, duplicate guard, and reset cancellation', async ({
    page,
  }) => {
    const planSelect = page.locator('[data-testid="specimen-form-plan"]');
    const submitBtn = page.locator('[data-testid="form-submit-btn"]');
    const resetBtn = page.locator('[data-testid="form-reset-btn"]');
    const statusValue = page.locator('[data-testid="form-status-value"]');

    // 1. Attempt submit while required plan is empty: native validation blocks submission
    await submitBtn.click();
    const isValueMissing = await planSelect.evaluate((el: HTMLSelectElement) => el.validity.valueMissing);
    expect(isValueMissing).toBe(true);
    await expect(statusValue).toContainText('No billing update');

    // 2. Select plan and submit
    await planSelect.selectOption('pro');
    await submitBtn.click();

    // 3. Pending state
    await expect(submitBtn).toBeDisabled();
    await expect(statusValue).toContainText('Saving billing');

    // 4. Click reset during pending state: cancels timer and resets form
    await resetBtn.click();
    await expect(submitBtn).toBeEnabled();
    await expect(statusValue).toContainText('Form reset');
    expect(await planSelect.inputValue()).toBe('');

    // Wait beyond the timer duration (1.5s) to guarantee pending timer did not fire late
    await page.waitForTimeout(1600);
    await expect(statusValue).toContainText('Form reset');
  });

  test('verifies LTR, RTL, and nested direction override placement', async ({ page }) => {
    const arabicSelect = page.locator('[data-testid="specimen-arabic"]');
    const nestedLtrSelect = page.locator('[data-testid="specimen-nested-ltr"]');

    // Arabic select has start alignment
    const arabicAlign = await arabicSelect.evaluate((el) => window.getComputedStyle(el).textAlign);
    expect(arabicAlign).toBe('start');

    // Nested LTR container has dir="ltr"
    const nestedDir = await nestedLtrSelect.evaluate((el) => el.getAttribute('dir') || el.closest('[dir]')?.getAttribute('dir'));
    expect(nestedDir).toBe('ltr');
  });

  test('verifies zero dashboard shadows policy', async ({ page }) => {
    const selects = page.locator('select');
    const count = await selects.count();
    expect(count).toBeGreaterThan(0);

    for (let i = 0; i < count; i++) {
      const shadow = await selects.nth(i).evaluate((el) => {
        const s = window.getComputedStyle(el);
        return s.boxShadow;
      });
      expect(shadow === 'none' || shadow === 'rgba(0, 0, 0, 0) 0px 0px 0px 0px').toBe(true);
    }
  });

  test('verifies responsive reflow without horizontal clipping at narrow viewport', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 320, height: 600 });
    await expect(page.locator('[data-testid="select-gallery"]')).toBeVisible();

    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 2);
  });
});
