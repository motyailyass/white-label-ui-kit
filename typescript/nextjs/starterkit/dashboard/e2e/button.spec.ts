import { test, expect } from '@playwright/test';

test.describe('Button Primitive Real-Browser Verification', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/gallery/button');
    await expect(page.locator('[data-testid="button-gallery"]')).toBeVisible();
  });

  test('verifies secondary button border remains stable on hover and indicates focus clearly', async ({
    page,
  }) => {
    const secondaryBtn = page.locator('button[data-variant="secondary"]').first();
    await expect(secondaryBtn).toBeVisible();

    const colors = await page.evaluate(() => {
      const elBorder = document.createElement('div');
      elBorder.style.color = 'var(--color-border-control)';
      document.body.appendChild(elBorder);
      const borderRgb = window.getComputedStyle(elBorder).color;
      elBorder.remove();

      const elHoverBg = document.createElement('div');
      elHoverBg.style.color = 'var(--color-surface-hover)';
      document.body.appendChild(elHoverBg);
      const hoverBgRgb = window.getComputedStyle(elHoverBg).color;
      elHoverBg.remove();

      const elFocus = document.createElement('div');
      elFocus.style.color = 'var(--color-border-focus)';
      document.body.appendChild(elFocus);
      const focusRgb = window.getComputedStyle(elFocus).color;
      elFocus.remove();

      return { borderRgb, hoverBgRgb, focusRgb };
    });

    // 1. Resting state: border is var(--color-border-control)
    const restingStyle = await secondaryBtn.evaluate((el) => {
      const s = window.getComputedStyle(el);
      return { border: s.borderColor, borderWidth: s.borderWidth };
    });
    expect(restingStyle.border).toBe(colors.borderRgb);
    expect(restingStyle.borderWidth).toBe('1px');

    // 2. Hover state: background changes to var(--color-surface-hover), but border remains STABLE at var(--color-border-control)
    await secondaryBtn.hover();
    await expect
      .poll(async () => {
        return secondaryBtn.evaluate((el) => window.getComputedStyle(el).backgroundColor);
      })
      .toBe(colors.hoverBgRgb);

    const hoverStyle = await secondaryBtn.evaluate((el) => {
      const s = window.getComputedStyle(el);
      return { border: s.borderColor, bg: s.backgroundColor, borderWidth: s.borderWidth };
    });
    expect(hoverStyle.border).toBe(colors.borderRgb);
    expect(hoverStyle.bg).toBe(colors.hoverBgRgb);
    expect(hoverStyle.borderWidth).toBe('1px');

    // 3. Focus state (via keyboard Tab navigation to trigger :focus-visible)
    await page.keyboard.press('Tab');
    // Tab until secondaryBtn is focused
    for (let i = 0; i < 15; i++) {
      const isFocused = await secondaryBtn.evaluate((el) => document.activeElement === el);
      if (isFocused) break;
      await page.keyboard.press('Tab');
    }
    await expect(secondaryBtn).toBeFocused();

    const focusedStyle = await secondaryBtn.evaluate((el) => {
      const s = window.getComputedStyle(el);
      return {
        outlineColor: s.outlineColor,
        border: s.borderColor,
        borderWidth: s.borderWidth,
      };
    });
    expect(focusedStyle.outlineColor).toBe(colors.focusRgb);
    expect(focusedStyle.border).toBe(colors.borderRgb);
    expect(focusedStyle.borderWidth).toBe('1px');

    // 4. Pointer exit while remaining focused: focus indicator persists
    await page.mouse.move(0, 0);
    const exitFocusedStyle = await secondaryBtn.evaluate((el) => {
      const s = window.getComputedStyle(el);
      return { outlineColor: s.outlineColor, border: s.borderColor };
    });
    expect(exitFocusedStyle.outlineColor).toBe(colors.focusRgb);
    expect(exitFocusedStyle.border).toBe(colors.borderRgb);
  });

  test('verifies ghost button border stays transparent on hover', async ({ page }) => {
    const ghostBtn = page.locator('button[data-variant="ghost"]').first();
    await expect(ghostBtn).toBeVisible();

    // Resting
    const restingBorder = await ghostBtn.evaluate((el) => window.getComputedStyle(el).borderColor);
    expect(restingBorder).toMatch(/rgba\(0,\s*0,\s*0,\s*0\)|transparent/);

    // Hover
    await ghostBtn.hover();
    const hoverBorder = await ghostBtn.evaluate((el) => window.getComputedStyle(el).borderColor);
    expect(hoverBorder).toMatch(/rgba\(0,\s*0,\s*0,\s*0\)|transparent/);
  });

  test('verifies primary button border matches changing background without contrasting edge', async ({
    page,
  }) => {
    const primaryBtn = page.locator('button[data-variant="primary"]').first();
    await expect(primaryBtn).toBeVisible();

    const colors = await page.evaluate(() => {
      const elHover = document.createElement('div');
      elHover.style.color = 'var(--color-primary-hover)';
      document.body.appendChild(elHover);
      const hoverRgb = window.getComputedStyle(elHover).color;
      elHover.remove();
      return { hoverRgb };
    });

    await primaryBtn.hover();
    await expect
      .poll(async () => {
        return primaryBtn.evaluate((el) => window.getComputedStyle(el).backgroundColor);
      })
      .toBe(colors.hoverRgb);

    const hoverStyle = await primaryBtn.evaluate((el) => {
      const s = window.getComputedStyle(el);
      return { bg: s.backgroundColor, border: s.borderColor, borderWidth: s.borderWidth };
    });
    expect(hoverStyle.bg).toBe(colors.hoverRgb);
    expect(hoverStyle.border).toBe(colors.hoverRgb);
    expect(hoverStyle.borderWidth).toBe('1px');
  });

  test('verifies button icon SVG dimensions match control icon size tokens and slot dimensions', async ({
    page,
  }) => {
    // 1. Product default icon button (Dashboard default md -> 16px icon)
    const defaultIconBtn = page.locator('button:has(span svg)').first();
    await expect(defaultIconBtn).toBeVisible();

    const defaultMetrics = await defaultIconBtn.evaluate((btn) => {
      const slot = btn.querySelector('span[class*="icon"]') as HTMLElement;
      const svg = btn.querySelector('svg') as SVGElement;
      const btnStyle = window.getComputedStyle(btn);
      const slotStyle = window.getComputedStyle(slot);
      const svgStyle = window.getComputedStyle(svg);

      return {
        tokenPx: parseFloat(btnStyle.getPropertyValue('--_control-icon-size')),
        slotWidth: slot.getBoundingClientRect().width,
        slotHeight: slot.getBoundingClientRect().height,
        slotCssInline: parseFloat(slotStyle.inlineSize),
        slotCssBlock: parseFloat(slotStyle.blockSize),
        svgWidth: svg.getBoundingClientRect().width,
        svgHeight: svg.getBoundingClientRect().height,
        svgCssInline: parseFloat(svgStyle.inlineSize),
        svgCssBlock: parseFloat(svgStyle.blockSize),
      };
    });

    expect(defaultMetrics.tokenPx).toBe(16);
    expect(defaultMetrics.slotWidth).toBeCloseTo(16, 1);
    expect(defaultMetrics.slotHeight).toBeCloseTo(16, 1);
    expect(defaultMetrics.slotCssInline).toBeCloseTo(16, 1);
    expect(defaultMetrics.slotCssBlock).toBeCloseTo(16, 1);
    expect(defaultMetrics.svgWidth).toBeCloseTo(16, 1);
    expect(defaultMetrics.svgHeight).toBeCloseTo(16, 1);
    expect(defaultMetrics.svgCssInline).toBeCloseTo(16, 1);
    expect(defaultMetrics.svgCssBlock).toBeCloseTo(16, 1);

    // 2. Explicit size icon button (XL -> 20px icon)
    const xlIconBtn = page.locator('[data-testid="specimen-btn-xl-icon"]');
    await expect(xlIconBtn).toBeVisible();

    const xlMetrics = await xlIconBtn.evaluate((btn) => {
      const slot = btn.querySelector('span[class*="icon"]') as HTMLElement;
      const svg = btn.querySelector('svg') as SVGElement;
      const btnStyle = window.getComputedStyle(btn);
      const slotStyle = window.getComputedStyle(slot);
      const svgStyle = window.getComputedStyle(svg);

      return {
        tokenPx: parseFloat(btnStyle.getPropertyValue('--_control-icon-size')),
        slotWidth: slot.getBoundingClientRect().width,
        slotHeight: slot.getBoundingClientRect().height,
        slotCssInline: parseFloat(slotStyle.inlineSize),
        slotCssBlock: parseFloat(slotStyle.blockSize),
        svgWidth: svg.getBoundingClientRect().width,
        svgHeight: svg.getBoundingClientRect().height,
        svgCssInline: parseFloat(svgStyle.inlineSize),
        svgCssBlock: parseFloat(svgStyle.blockSize),
      };
    });

    expect(xlMetrics.tokenPx).toBe(20);
    expect(xlMetrics.slotWidth).toBeCloseTo(20, 1);
    expect(xlMetrics.slotHeight).toBeCloseTo(20, 1);
    expect(xlMetrics.slotCssInline).toBeCloseTo(20, 1);
    expect(xlMetrics.slotCssBlock).toBeCloseTo(20, 1);
    expect(xlMetrics.svgWidth).toBeCloseTo(20, 1);
    expect(xlMetrics.svgHeight).toBeCloseTo(20, 1);
    expect(xlMetrics.svgCssInline).toBeCloseTo(20, 1);
    expect(xlMetrics.svgCssBlock).toBeCloseTo(20, 1);
  });
});
