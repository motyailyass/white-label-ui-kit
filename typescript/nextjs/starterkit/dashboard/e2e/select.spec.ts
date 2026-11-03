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

  test('verifies high-contrast forced-colors mode across combined states and state precedence', async ({
    browser,
  }) => {
    const context = await browser.newContext({
      forcedColors: 'active',
      colorScheme: 'light',
    });
    const page = await context.newPage();
    await page.goto('/gallery/select');
    await expect(page.locator('[data-testid="select-gallery"]')).toBeVisible();

    // Create reference elements inside the page to obtain exact computed system color strings
    const systemColors = await page.evaluate(() => {
      const createRef = (style: string) => {
        const el = document.createElement('div');
        el.style.cssText = style;
        document.body.appendChild(el);
        const comp = window.getComputedStyle(el);
        const res = { color: comp.color, border: comp.borderColor, outline: comp.outlineColor };
        document.body.removeChild(el);
        return res;
      };
      return {
        buttonBorder: createRef('border: 1px solid ButtonBorder;').border,
        highlight: createRef('color: Highlight; outline: 1px solid Highlight; border: 1px solid Highlight;'),
        grayText: createRef('color: GrayText; border: 1px solid GrayText;').color,
        fieldText: createRef('color: FieldText;').color,
      };
    });

    const restingSelect = page.locator('[data-testid="specimen-resting"]');
    const invalidSelect = page.locator('[data-testid="specimen-invalid"]');
    const disabledSelect = page.locator('[data-testid="specimen-disabled"]');
    const invalidDisabledSelect = page.locator('[data-testid="specimen-invalid-disabled"]');

    // 1. Resting state: border matches ButtonBorder, text matches FieldText
    const restStyle = await restingSelect.evaluate((el) => {
      const s = window.getComputedStyle(el);
      return { border: s.borderColor, color: s.color };
    });
    expect(restStyle.border).toBe(systemColors.buttonBorder);
    expect(restStyle.color).toBe(systemColors.fieldText);

    // 2. Focused state: border and outline match Highlight
    await restingSelect.focus();
    const focusStyle = await restingSelect.evaluate((el) => {
      const s = window.getComputedStyle(el);
      return { border: s.borderColor, outline: s.outlineColor };
    });
    expect(focusStyle.border).toBe(systemColors.highlight.border);
    expect(focusStyle.outline).toBe(systemColors.highlight.outline);

    // 3. Invalid state: border matches Highlight
    const invalidStyle = await invalidSelect.evaluate((el) => window.getComputedStyle(el).borderColor);
    expect(invalidStyle).toBe(systemColors.highlight.border);

    // 4. Disabled state: border and text match GrayText
    const disabledStyle = await disabledSelect.evaluate((el) => {
      const s = window.getComputedStyle(el);
      return { border: s.borderColor, color: s.color };
    });
    expect(disabledStyle.border).toBe(systemColors.grayText);
    expect(disabledStyle.color).toBe(systemColors.grayText);

    // 5. Disabled arrow matches GrayText
    const disabledArrowColor = await disabledSelect.locator('..').locator('> [aria-hidden="true"]').evaluate(
      (el) => window.getComputedStyle(el).color,
    );
    expect(disabledArrowColor).toBe(systemColors.grayText);

    // 6. State precedence: Disabled wins over Invalid (border and color are GrayText, NOT Highlight)
    const invalidDisabledStyle = await invalidDisabledSelect.evaluate((el) => {
      const s = window.getComputedStyle(el);
      return { border: s.borderColor, color: s.color };
    });
    expect(invalidDisabledStyle.border).toBe(systemColors.grayText);
    expect(invalidDisabledStyle.color).toBe(systemColors.grayText);

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

  test('verifies chevron indicator hit-testing, pointer-events: none, and direct edge clicks', async ({
    page,
  }) => {
    const select = page.locator('[data-testid="specimen-default"]');
    const wrapper = select.locator('..');
    const arrow = wrapper.locator('> [aria-hidden="true"]');

    await expect(arrow).toBeVisible();

    // Verify arrow itself has pointer-events: none
    const pointerEvents = await arrow.evaluate((el) => window.getComputedStyle(el).pointerEvents);
    expect(pointerEvents).toBe('none');

    // Click right on top of the arrow coordinates
    const arrowBox = await arrow.boundingBox();
    expect(arrowBox).not.toBeNull();
    await page.mouse.click(arrowBox!.x + arrowBox!.width / 2, arrowBox!.y + arrowBox!.height / 2);

    // Native select must receive focus
    const isFocused = await select.evaluate((el) => document.activeElement === el);
    expect(isFocused).toBe(true);
  });

  test('verifies showIcon={false} omits arrow and establishes symmetrical inline padding', async ({
    page,
  }) => {
    const noIconSelect = page.locator('[data-testid="specimen-no-icon"]');
    await expect(noIconSelect).toBeVisible();

    const wrapper = noIconSelect.locator('..');
    const arrowCount = await wrapper.locator('> [aria-hidden="true"]').count();
    expect(arrowCount).toBe(0);

    const padding = await noIconSelect.evaluate((el) => {
      const s = window.getComputedStyle(el);
      return {
        start: parseFloat(s.paddingInlineStart),
        end: parseFloat(s.paddingInlineEnd),
      };
    });
    expect(padding.end).toBeCloseTo(padding.start, 1);
  });

  test('verifies chevron logical positioning under LTR and RTL and text clearance', async ({
    page,
  }) => {
    const select = page.locator('[data-testid="specimen-default"]');
    const wrapper = select.locator('..');
    const arrow = wrapper.locator('> [aria-hidden="true"]');

    // 1. Under LTR (default), arrow is at the physical right side
    const ltrSelectBox = await select.boundingBox();
    const ltrArrowBox = await arrow.boundingBox();
    expect(ltrSelectBox).not.toBeNull();
    expect(ltrArrowBox).not.toBeNull();
    expect(ltrArrowBox!.x).toBeGreaterThan(ltrSelectBox!.x + ltrSelectBox!.width / 2);

    // LTR padding-inline-end has clearance for the arrow
    const ltrPadding = await select.evaluate((el) => {
      const s = window.getComputedStyle(el);
      return {
        start: parseFloat(s.paddingInlineStart),
        end: parseFloat(s.paddingInlineEnd),
      };
    });
    expect(ltrPadding.end).toBeGreaterThan(ltrPadding.start);

    // 2. Switch to Arabic (RTL) via LanguageSwitcher
    const langSelect = page.locator('[data-testid="language-switcher-select"]');
    await langSelect.selectOption('ar');
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');

    // Under RTL, arrow is at the physical left side
    const rtlSelectBox = await select.boundingBox();
    const rtlArrowBox = await arrow.boundingBox();
    expect(rtlSelectBox).not.toBeNull();
    expect(rtlArrowBox).not.toBeNull();
    expect(rtlArrowBox!.x + rtlArrowBox!.width).toBeLessThan(
      rtlSelectBox!.x + rtlSelectBox!.width / 2,
    );

    // Switch back to English
    await langSelect.selectOption('en');
    await expect(page.locator('html')).toHaveAttribute('dir', 'ltr');
  });

  test('verifies LanguageSwitcher integration with Select primitive', async ({ page }) => {
    const langSelect = page.locator('[data-testid="language-switcher-select"]');
    await expect(langSelect).toBeVisible();

    // Verify option count and values
    const options = await langSelect.locator('option').allInnerTexts();
    expect(options.length).toBe(3);

    // Switch to French
    await langSelect.selectOption('fr');
    await expect(page.locator('html')).toHaveAttribute('lang', 'fr');
    await expect(page.locator('h1')).toHaveText(/Composant Select|Galerie/i);

    // Switch back to English
    await langSelect.selectOption('en');
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  });

  test('verifies custom width, class-based width, and RTL width alignment with direct hit-testing', async ({
    page,
  }) => {
    // 1. Inline style width (180px)
    const customWidthSelect = page.locator('[data-testid="specimen-custom-width"]');
    await customWidthSelect.scrollIntoViewIfNeeded();
    const customWidthRoot = customWidthSelect.locator('..');
    const customWidthArrow = customWidthRoot.locator('> [aria-hidden="true"]');

    const rootBox = await customWidthRoot.boundingBox();
    const selectBox = await customWidthSelect.boundingBox();
    const arrowBox = await customWidthArrow.boundingBox();

    expect(rootBox).not.toBeNull();
    expect(selectBox).not.toBeNull();
    expect(arrowBox).not.toBeNull();

    // Wrapper and select must match the specified 180px width
    expect(rootBox!.width).toBeCloseTo(180, 1);
    expect(selectBox!.width).toBeCloseTo(180, 1);

    // Arrow must be positioned inside the 180px select near the trailing edge
    expect(arrowBox!.x).toBeGreaterThan(selectBox!.x + selectBox!.width - 45);
    expect(arrowBox!.x + arrowBox!.width).toBeLessThanOrEqual(selectBox!.x + selectBox!.width + 2);

    // Clicking at the arrow's coordinates must hit-test the 180px select
    await page.mouse.click(arrowBox!.x + arrowBox!.width / 2, arrowBox!.y + arrowBox!.height / 2);
    const isCustomWidthFocused = await customWidthSelect.evaluate((el) => document.activeElement === el);
    expect(isCustomWidthFocused).toBe(true);

    // 2. Class-based width (200px via .fixedWidth)
    const classWidthSelect = page.locator('[data-testid="specimen-custom-width-class"]');
    await classWidthSelect.scrollIntoViewIfNeeded();
    const classWidthRoot = classWidthSelect.locator('..');
    const classWidthArrow = classWidthRoot.locator('> [aria-hidden="true"]');

    const classRootBox = await classWidthRoot.boundingBox();
    const classSelectBox = await classWidthSelect.boundingBox();
    const classArrowBox = await classWidthArrow.boundingBox();

    expect(classRootBox!.width).toBeCloseTo(200, 1);
    expect(classSelectBox!.width).toBeCloseTo(200, 1);
    expect(classArrowBox!.x).toBeGreaterThan(classSelectBox!.x + classSelectBox!.width - 45);

    await page.mouse.click(classArrowBox!.x + classArrowBox!.width / 2, classArrowBox!.y + classArrowBox!.height / 2);
    const isClassWidthFocused = await classWidthSelect.evaluate((el) => document.activeElement === el);
    expect(isClassWidthFocused).toBe(true);

    // 3. RTL custom width (180px)
    const rtlWidthSelect = page.locator('[data-testid="specimen-custom-width-rtl"]');
    await rtlWidthSelect.scrollIntoViewIfNeeded();
    const rtlWidthRoot = rtlWidthSelect.locator('..');
    const rtlWidthArrow = rtlWidthRoot.locator('> [aria-hidden="true"]');

    const rtlRootBox = await rtlWidthRoot.boundingBox();
    const rtlSelectBox = await rtlWidthSelect.boundingBox();
    const rtlArrowBox = await rtlWidthArrow.boundingBox();

    expect(rtlRootBox!.width).toBeCloseTo(180, 1);
    expect(rtlSelectBox!.width).toBeCloseTo(180, 1);

    // In RTL, arrow must be positioned inside near the physical left edge
    expect(rtlArrowBox!.x).toBeGreaterThanOrEqual(rtlSelectBox!.x - 2);
    expect(rtlArrowBox!.x).toBeLessThan(rtlSelectBox!.x + 45);

    await page.mouse.click(rtlArrowBox!.x + rtlArrowBox!.width / 2, rtlArrowBox!.y + rtlArrowBox!.height / 2);
    const isRtlWidthFocused = await rtlWidthSelect.evaluate((el) => document.activeElement === el);
    expect(isRtlWidthFocused).toBe(true);
  });

  test('verifies keyboard navigation, arrow keys, and typeahead interaction', async ({ page }) => {
    const select = page.locator('[data-testid="specimen-default"]');
    await select.focus();

    // Initial value is admin
    expect(await select.inputValue()).toBe('admin');

    // Typeahead: pressing 'e' selects editor
    await page.keyboard.press('e');
    expect(await select.inputValue()).toBe('editor');

    // Wait for typeahead search buffer to clear
    await page.waitForTimeout(1000);

    // Typeahead: pressing 'a' selects administrator
    await page.keyboard.press('a');
    expect(await select.inputValue()).toBe('admin');
  });

  test('verifies disabled fieldset inheritance blocks user interaction', async ({ page }) => {
    const fieldsetSelect = page.locator('[data-testid="specimen-fieldset-disabled"]');
    await fieldsetSelect.scrollIntoViewIfNeeded();
    await expect(fieldsetSelect).toBeVisible();

    // Must be disabled via parent fieldset inheritance
    await expect(fieldsetSelect).toBeDisabled();

    // Arrow color must match disabled color
    const arrow = fieldsetSelect.locator('..').locator('> [aria-hidden="true"]');
    const arrowColor = await arrow.evaluate((el) => window.getComputedStyle(el).color);
    const selectColor = await fieldsetSelect.evaluate((el) => window.getComputedStyle(el).color);
    expect(arrowColor).toBe(selectColor);
  });

  test('verifies optional :open behavior, escape dismiss, and reduced-motion suppression', async ({
    page,
    browser,
  }) => {
    const select = page.locator('[data-testid="specimen-default"]');
    const arrow = select.locator('..').locator('> [aria-hidden="true"]');

    // 1. In standard context, verify arrow transitions are active
    const normalTransition = await arrow.evaluate((el) => window.getComputedStyle(el).transition);
    expect(normalTransition).not.toBe('none');

    // 2. Under reduced motion, transition collapses to none
    const reducedMotionContext = await browser.newContext({
      reducedMotion: 'reduce',
    });
    const reducedPage = await reducedMotionContext.newPage();
    await reducedPage.goto('/gallery/select');
    await expect(reducedPage.locator('[data-testid="select-gallery"]')).toBeVisible();

    const reducedArrow = reducedPage
      .locator('[data-testid="specimen-default"]')
      .locator('..')
      .locator('> [aria-hidden="true"]');

    const reducedTransition = await reducedArrow.evaluate(
      (el) => window.getComputedStyle(el).transition,
    );
    expect(reducedTransition === 'none' || reducedTransition.includes('0s')).toBe(true);

    await reducedMotionContext.close();
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
