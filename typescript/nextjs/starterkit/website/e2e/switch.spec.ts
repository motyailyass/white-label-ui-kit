import { test, expect } from '@playwright/test';

test.describe('Website Switch Primitive Real-Browser Verification', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/gallery/switch');
    await expect(page.locator('[data-testid="switch-gallery"]')).toBeVisible();
  });

  test('verifies native input real hitbox target dimensions and six-step scale', async ({
    page,
  }) => {
    const isCoarse = await page.evaluate(
      () => window.matchMedia('(pointer: coarse)').matches,
    );

    // 1. Website product default (omitted size): xl (48px target, 40×20px track)
    const defaultSpecimen = page.locator('[data-testid="specimen-default"]');
    await expect(defaultSpecimen).toBeVisible();

    const defaultRoot = defaultSpecimen.locator('..');
    const defaultRootBox = await defaultRoot.boundingBox();
    expect(defaultRootBox).not.toBeNull();

    if (isCoarse) {
      expect(defaultRootBox!.height).toBeGreaterThanOrEqual(48);
      expect(defaultRootBox!.width).toBeGreaterThanOrEqual(48);
    } else {
      expect(defaultRootBox!.height).toBeCloseTo(48, 1);
      expect(defaultRootBox!.width).toBeCloseTo(48, 1);
    }

    // 2. Explicit scale targets (strictly square targets at rest)
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
        expect(box!.width).toBeCloseTo(expectedTarget, 1);
      }
    }

    // 3. Real input hitbox occupies 100% of the target container
    const defaultInputBox = await defaultSpecimen.boundingBox();
    expect(defaultInputBox).not.toBeNull();
    expect(defaultInputBox!.width).toBeCloseTo(defaultRootBox!.width, 0.5);
    expect(defaultInputBox!.height).toBeCloseTo(defaultRootBox!.height, 0.5);
  });

  test('verifies track and thumb geometry, end insets, and omitted-versus-explicit default parity', async ({
    page,
  }) => {
    const defaultInput = page.locator('[data-testid="specimen-default"]');
    const xlInput = page.locator('[data-testid="specimen-size-xl"]');
    const twoXlInput = page.locator('[data-testid="specimen-size-2xl"]');

    const defaultTrack = defaultInput.locator('+ span');
    const xlTrack = xlInput.locator('+ span');
    const twoXlTrack = twoXlInput.locator('+ span');

    const defaultThumb = defaultTrack.locator('span');
    const xlThumb = xlTrack.locator('span');
    const twoXlThumb = twoXlTrack.locator('span');

    // 1. Omitted size on website matches explicit xl (40×20px track, 16px thumb)
    const defaultTrackBox = await defaultTrack.boundingBox();
    const xlTrackBox = await xlTrack.boundingBox();
    expect(defaultTrackBox).not.toBeNull();
    expect(xlTrackBox).not.toBeNull();
    expect(defaultTrackBox!.width).toBeCloseTo(40, 1);
    expect(defaultTrackBox!.height).toBeCloseTo(20, 1);
    expect(defaultTrackBox!.width).toBeCloseTo(xlTrackBox!.width, 0.5);
    expect(defaultTrackBox!.height).toBeCloseTo(xlTrackBox!.height, 0.5);

    const defaultThumbBox = await defaultThumb.boundingBox();
    const xlThumbBox = await xlThumb.boundingBox();
    expect(defaultThumbBox).not.toBeNull();
    expect(xlThumbBox).not.toBeNull();
    expect(defaultThumbBox!.width).toBeCloseTo(16, 1);
    expect(defaultThumbBox!.height).toBeCloseTo(16, 1);
    expect(defaultThumbBox!.width).toBeCloseTo(xlThumbBox!.width, 0.5);
    expect(defaultThumbBox!.height).toBeCloseTo(xlThumbBox!.height, 0.5);

    // 2. Explicit 2xl: 48×24px track, 20px thumb
    const twoXlTrackBox = await twoXlTrack.boundingBox();
    const twoXlThumbBox = await twoXlThumb.boundingBox();
    expect(twoXlTrackBox).not.toBeNull();
    expect(twoXlThumbBox).not.toBeNull();
    expect(twoXlTrackBox!.width).toBeCloseTo(48, 1);
    expect(twoXlTrackBox!.height).toBeCloseTo(24, 1);
    expect(twoXlThumbBox!.width).toBeCloseTo(20, 1);
    expect(twoXlThumbBox!.height).toBeCloseTo(20, 1);

    // 3. Equal 2px end insets (1px border + 1px padding from track outer edge)
    const rightInset =
      defaultTrackBox!.x + defaultTrackBox!.width - (defaultThumbBox!.x + defaultThumbBox!.width);
    expect(rightInset).toBeCloseTo(2, 0.75);

    const altInput = page.locator('[data-testid="specimen-default-alt"]');
    const altTrack = altInput.locator('+ span');
    const altThumb = altTrack.locator('span');
    const altTrackBox = await altTrack.boundingBox();
    const altThumbBox = await altThumb.boundingBox();
    const leftInset = altThumbBox!.x - altTrackBox!.x;
    expect(leftInset).toBeCloseTo(2, 0.75);
  });

  test('verifies real hitbox edge clicks toggle switch state on and off', async ({
    page,
  }) => {
    const defaultAlt = page.locator('[data-testid="specimen-default-alt"]');
    expect(await defaultAlt.isChecked()).toBe(false);

    const altBox = await defaultAlt.boundingBox();
    expect(altBox).not.toBeNull();

    // 1. Click top-left edge (1px, 1px) toggles the switch on
    await page.mouse.click(altBox!.x + 1, altBox!.y + 1);
    expect(await defaultAlt.isChecked()).toBe(true);

    // 2. Click bottom-right edge toggles the switch back off
    await page.mouse.click(
      altBox!.x + altBox!.width - 1,
      altBox!.y + altBox!.height - 1,
    );
    expect(await defaultAlt.isChecked()).toBe(false);
  });

  test('verifies comfortable mode and coarse pointer (hasTouch) touch-target policy and 2xl preservation', async ({
    page,
    browser,
  }) => {
    // 1. Comfortable explicitly enforces min 48px on standard page
    const comfortableSwitch = page.locator(
      '[data-testid="specimen-touch-comfortable"]',
    );
    const comfortableRoot = comfortableSwitch.locator('..');
    const comfortableBox = await comfortableRoot.boundingBox();
    expect(comfortableBox).not.toBeNull();
    expect(comfortableBox!.width).toBeGreaterThanOrEqual(48);
    expect(comfortableBox!.height).toBeGreaterThanOrEqual(48);

    // 2. 2xl size preserves larger 56px target
    const twoXlRoot = page.locator('[data-testid="specimen-size-2xl"]').locator('..');
    const twoXlBox = await twoXlRoot.boundingBox();
    expect(twoXlBox).not.toBeNull();
    expect(twoXlBox!.height).toBeCloseTo(56, 1);
    expect(twoXlBox!.width).toBeCloseTo(56, 1);

    // 3. Native coarse pointer emulation via hasTouch: true (matches any-pointer: coarse)
    const touchContext = await browser.newContext({ hasTouch: true });
    const touchPage = await touchContext.newPage();
    await touchPage.goto('/gallery/switch');
    await expect(touchPage.locator('[data-testid="switch-gallery"]')).toBeVisible();

    // Assert (any-pointer: coarse) media query matches
    const isAnyCoarse = await touchPage.evaluate(
      () => window.matchMedia('(any-pointer: coarse)').matches,
    );
    expect(isAnyCoarse).toBe(true);

    // On coarse pointer, explicit xs target expands from 28px to >= 48px
    const coarseXsRoot = touchPage.locator('[data-testid="specimen-size-xs"]').locator('..');
    const coarseXsBox = await coarseXsRoot.boundingBox();
    expect(coarseXsBox).not.toBeNull();
    expect(coarseXsBox!.width).toBeGreaterThanOrEqual(48);
    expect(coarseXsBox!.height).toBeGreaterThanOrEqual(48);

    const coarseDefaultRoot = touchPage.locator('[data-testid="specimen-default"]').locator('..');
    const coarseBox = await coarseDefaultRoot.boundingBox();
    expect(coarseBox).not.toBeNull();
    expect(coarseBox!.width).toBeGreaterThanOrEqual(48);
    expect(coarseBox!.height).toBeGreaterThanOrEqual(48);

    const coarseTwoXlRoot = touchPage.locator('[data-testid="specimen-size-2xl"]').locator('..');
    const coarseTwoXlBox = await coarseTwoXlRoot.boundingBox();
    expect(coarseTwoXlBox).not.toBeNull();
    expect(coarseTwoXlBox!.width).toBeCloseTo(56, 1);
    expect(coarseTwoXlBox!.height).toBeCloseTo(56, 1);

    // 4. Contrast against fine pointer (hasTouch: false) where xs is unexpanded 28x28px
    const fineContext = await browser.newContext({ hasTouch: false });
    const finePage = await fineContext.newPage();
    await finePage.goto('/gallery/switch');
    await expect(finePage.locator('[data-testid="switch-gallery"]')).toBeVisible();

    const fineXsRoot = finePage.locator('[data-testid="specimen-size-xs"]').locator('..');
    const fineXsBox = await fineXsRoot.boundingBox();
    expect(fineXsBox).not.toBeNull();
    expect(fineXsBox!.width).toBeCloseTo(28, 1);
    expect(fineXsBox!.height).toBeCloseTo(28, 1);

    await fineContext.close();
    await touchContext.close();
  });

  test('verifies hover border stability and visible keyboard focus outline', async ({
    page,
  }) => {
    const uncheckedInput = page.locator('[data-testid="specimen-unchecked"]');
    const uncheckedTrack = uncheckedInput.locator('+ span');

    await uncheckedInput.hover();
    await expect(uncheckedTrack).toHaveCSS('border-width', '1px');
    await expect(uncheckedTrack).toHaveCSS('border-style', 'solid');

    await page.mouse.move(0, 0);
    await uncheckedInput.focus();
    await expect(uncheckedTrack).toHaveCSS('outline-style', 'solid');
    await expect(uncheckedTrack).toHaveCSS('outline-width', '2px');
  });

  test('verifies keyboard Space toggles switch and Enter does not toggle', async ({
    page,
  }) => {
    const controlled = page.locator('[data-testid="specimen-controlled"]');
    expect(await controlled.isChecked()).toBe(true);

    await controlled.focus();

    await page.keyboard.press('Enter');
    expect(await controlled.isChecked()).toBe(true);

    await page.keyboard.press('Space');
    expect(await controlled.isChecked()).toBe(false);

    await page.keyboard.press('Space');
    expect(await controlled.isChecked()).toBe(true);
  });

  test('verifies forced-colors system highlight, state precedence across all 8 states, visible focus outlines, and pointer recovery', async ({
    page,
  }) => {
    await page.emulateMedia({ forcedColors: 'active' });

    const systemColors = await page.evaluate(() => {
      const getSysColor = (colorName: string) => {
        const el = document.createElement('div');
        el.style.backgroundColor = colorName;
        document.body.appendChild(el);
        const resolved = window.getComputedStyle(el).backgroundColor;
        el.remove();
        return resolved;
      };
      return {
        highlight: getSysColor('Highlight'),
        highlightText: getSysColor('HighlightText'),
        canvas: getSysColor('Canvas'),
        canvasText: getSysColor('CanvasText'),
        grayText: getSysColor('GrayText'),
      };
    });

    const states = [
      {
        id: 'specimen-unchecked',
        bg: systemColors.canvas,
        border: systemColors.canvasText,
        thumb: systemColors.canvasText,
      },
      {
        id: 'specimen-checked',
        bg: systemColors.highlight,
        border: systemColors.highlight,
        thumb: systemColors.highlightText,
      },
      {
        id: 'specimen-invalid-unchecked',
        bg: systemColors.canvas,
        border: systemColors.highlight,
        thumb: systemColors.canvasText,
      },
      {
        id: 'specimen-invalid-checked',
        bg: systemColors.highlight,
        border: systemColors.highlight,
        thumb: systemColors.highlightText,
      },
      {
        id: 'specimen-disabled-unchecked',
        bg: systemColors.canvas,
        border: systemColors.grayText,
        thumb: systemColors.grayText,
      },
      {
        id: 'specimen-disabled-checked',
        bg: systemColors.canvas,
        border: systemColors.grayText,
        thumb: systemColors.grayText,
      },
      {
        id: 'specimen-invalid-disabled-unchecked',
        bg: systemColors.canvas,
        border: systemColors.grayText,
        thumb: systemColors.grayText,
      },
      {
        id: 'specimen-invalid-disabled-checked',
        bg: systemColors.canvas,
        border: systemColors.grayText,
        thumb: systemColors.grayText,
      },
    ];

    // 1. Verify all 8 states at rest
    for (const s of states) {
      const input = page.locator(`[data-testid="${s.id}"]`);
      const track = input.locator('+ span');
      const thumb = track.locator('span');

      await expect(track).toHaveCSS('background-color', s.bg);
      await expect(track).toHaveCSS('border-color', s.border);
      await expect(thumb).toHaveCSS('background-color', s.thumb);
    }

    // 2. Visible focus outlines across operational and invalid states in forced colors
    const focusStates = [
      'specimen-unchecked',
      'specimen-checked',
      'specimen-invalid-unchecked',
      'specimen-invalid-checked',
    ];

    for (const testId of focusStates) {
      const input = page.locator(`[data-testid="${testId}"]`);
      const track = input.locator('+ span');

      await input.focus();
      await expect(track).toHaveCSS('outline-style', 'solid');
      await expect(track).toHaveCSS('outline-color', systemColors.highlight);

      const outlineWidth = await track.evaluate((el) => {
        return parseFloat(window.getComputedStyle(el).outlineWidth);
      });
      expect(outlineWidth, `Visible focus outline expected for ${testId}`).toBeGreaterThanOrEqual(1);
    }

    // 3. Hover and pointer exit recovery across all 8 operational, invalid, and disabled states
    for (const s of states) {
      const input = page.locator(`[data-testid="${s.id}"]`);
      const track = input.locator('+ span');
      const thumb = track.locator('span');

      // Hover preserves forced colors without leaking author colors
      await input.hover();
      await expect(track).toHaveCSS('background-color', s.bg);
      await expect(track).toHaveCSS('border-color', s.border);
      await expect(thumb).toHaveCSS('background-color', s.thumb);

      // Pointer exit restores rest forced colors cleanly
      await page.mouse.move(0, 0);
      await expect(track).toHaveCSS('background-color', s.bg);
      await expect(track).toHaveCSS('border-color', s.border);
      await expect(thumb).toHaveCSS('background-color', s.thumb);
    }
  });

  test('verifies LTR, RTL, and nested direction override placement', async ({
    page,
  }) => {
    const arabicInput = page.locator('[data-testid="specimen-arabic"]');
    const arabicTrack = arabicInput.locator('+ span');
    const arabicThumb = arabicTrack.locator('span');

    const arabicTrackBox = await arabicTrack.boundingBox();
    const arabicThumbBox = await arabicThumb.boundingBox();
    expect(arabicTrackBox).not.toBeNull();
    expect(arabicThumbBox).not.toBeNull();

    const arabicLeftInset = arabicThumbBox!.x - arabicTrackBox!.x;
    expect(arabicLeftInset).toBeCloseTo(2, 0.75);

    const nestedInput = page.locator('[data-testid="specimen-nested-ltr"]');
    const nestedTrack = nestedInput.locator('+ span');
    const nestedThumb = nestedTrack.locator('span');

    const nestedTrackBox = await nestedTrack.boundingBox();
    const nestedThumbBox = await nestedThumb.boundingBox();
    expect(nestedTrackBox).not.toBeNull();
    expect(nestedThumbBox).not.toBeNull();

    expect(nestedThumbBox!.x + nestedThumbBox!.width).toBeLessThanOrEqual(
      nestedTrackBox!.x + nestedTrackBox!.width + 0.5,
    );
    const nestedRightInset =
      nestedTrackBox!.x + nestedTrackBox!.width - (nestedThumbBox!.x + nestedThumbBox!.width);
    expect(nestedRightInset).toBeCloseTo(2, 0.75);
  });

  test('verifies state-driven required validation transition and direct aria-describedby association', async ({
    page,
  }) => {
    const reqSwitch = page.locator('[data-testid="specimen-required"]');
    const validateBtn = page.locator(
      '[data-testid="specimen-required-validate-btn"]',
    );
    const container = reqSwitch.locator('xpath=ancestor::div[contains(@class, "fieldset")]');
    const alert = container.locator('[role="alert"]');

    // 1. Initial state before interaction: clean without error
    await expect(alert).toHaveCount(0);
    expect(await reqSwitch.getAttribute('aria-invalid')).toBe('false');

    // Input's description before validation: points to help text only
    const descInitial = await reqSwitch.getAttribute('aria-describedby');
    expect(descInitial).not.toBeNull();
    expect(descInitial).toContain('help');
    expect(descInitial).not.toContain('error');

    // 2. Trigger validation without checking -> error alert appears
    await validateBtn.click();
    await expect(alert).toBeVisible();
    expect(await reqSwitch.getAttribute('aria-invalid')).toBe('true');

    // Input's description during error: associates both help and error IDs directly on the switch
    const descError = await reqSwitch.getAttribute('aria-describedby');
    expect(descError).toContain('help');
    expect(descError).toContain('error');

    // 3. Toggle switch on -> error clears immediately
    await reqSwitch.click();
    expect(await reqSwitch.isChecked()).toBe(true);
    await expect(alert).toHaveCount(0);
    expect(await reqSwitch.getAttribute('aria-invalid')).toBe('false');

    // Input's description after correction: error removed, help remains
    const descAfter = await reqSwitch.getAttribute('aria-describedby');
    expect(descAfter).not.toContain('error');
    expect(descAfter).toContain('help');
  });

  test('verifies form submit with optional settings off, pending reset cancellation, and lifecycle', async ({
    page,
  }) => {
    const telemetrySwitch = page.locator('[data-testid="specimen-form-telemetry"]');
    const diagnosticsSwitch = page.locator(
      '[data-testid="specimen-form-diagnostics"]',
    );
    const submitBtn = page.locator('[data-testid="specimen-form-submit-btn"]');
    const resetBtn = page.locator('[data-testid="specimen-form-reset-btn"]');
    const statusDisplay = page.locator('[data-testid="form-status-display"]');

    // 1. Initial state: both optional settings are unchecked
    expect(await telemetrySwitch.isChecked()).toBe(false);
    expect(await diagnosticsSwitch.isChecked()).toBe(false);

    // 2. Submit while both settings are off: completely valid choice, saves successfully
    await submitBtn.click();
    await expect(statusDisplay).toContainText(/saving|enregistrement|حفظ/i);
    await expect(statusDisplay).toContainText(/success|succès|بنجاح/i);

    // Both remain off
    expect(await telemetrySwitch.isChecked()).toBe(false);
    expect(await diagnosticsSwitch.isChecked()).toBe(false);

    // 3. Enable telemetry and diagnostics, and submit
    await telemetrySwitch.click();
    await diagnosticsSwitch.click();
    expect(await telemetrySwitch.isChecked()).toBe(true);
    expect(await diagnosticsSwitch.isChecked()).toBe(true);

    await submitBtn.click();
    await expect(statusDisplay).toContainText(/saving|enregistrement|حفظ/i);
    await expect(statusDisplay).toContainText(/success|succès|بنجاح/i);

    // 4. Test reset during pending submission, waiting beyond the timer to confirm cancellation
    await submitBtn.click();
    // Enters pending submission
    await expect(statusDisplay).toContainText(/saving|enregistrement|حفظ/i);

    // Immediately click reset button during pending state
    await resetBtn.click();
    await expect(statusDisplay).toContainText(/reset|réinitialisé|إعادة/i);
    expect(await telemetrySwitch.isChecked()).toBe(false);
    expect(await diagnosticsSwitch.isChecked()).toBe(false);

    // Wait beyond the 800ms submission timer (1000ms) to ensure pending timer was cancelled and does NOT fire success
    await page.waitForTimeout(1000);
    await expect(statusDisplay).toContainText(/reset|réinitialisé|إعادة/i);
    expect(await statusDisplay.textContent()).not.toMatch(/success|succès|بنجاح/i);
  });

  test('verifies switch state preservation across locale changes', async ({ page }) => {
    const controlledSwitch = page.locator('[data-testid="specimen-controlled"]');
    expect(await controlledSwitch.isChecked()).toBe(true);

    // Toggle controlled switch off
    await controlledSwitch.click();
    expect(await controlledSwitch.isChecked()).toBe(false);

    // Switch locale to French
    const langSelect = page.locator('header select');
    await langSelect.selectOption('fr');

    // Section title updates to French
    const secTitle = controlledSwitch.locator('xpath=ancestor::section//h2');
    await expect(secTitle).toContainText(/contrôlé/i);

    // Switch state remains preserved (still unchecked)
    expect(await controlledSwitch.isChecked()).toBe(false);

    // Toggle back on
    await controlledSwitch.click();
    expect(await controlledSwitch.isChecked()).toBe(true);

    // Switch to Arabic
    await langSelect.selectOption('ar');
    expect(await controlledSwitch.isChecked()).toBe(true);
    expect(await page.locator('html').getAttribute('dir')).toBe('rtl');

    // Switch back to English for cleanup
    await langSelect.selectOption('en');
    expect(await controlledSwitch.isChecked()).toBe(true);
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
});
