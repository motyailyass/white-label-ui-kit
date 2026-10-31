import { test, expect } from '@playwright/test';

test.describe('Website Control Sizing & Interaction Target Verification', () => {
  test('renders website default control size at xl (48px)', async ({ page }) => {
    await page.goto('/sizing-fixture');
    await expect(page.locator('#btn-default')).toBeVisible();

    const height = await page.locator('#btn-default').evaluate((el) => {
      return parseFloat(window.getComputedStyle(el).height);
    });

    // 48px minimum height (3.00rem = 48px at 16px root font)
    expect(height).toBeCloseTo(48, 1);
  });

  test('renders explicit six-step scale with exact proportional dimensions matching dashboard', async ({ page }) => {
    await page.goto('/sizing-fixture');

    const expectedHeights: Record<string, number> = {
      '#btn-size-xs': 28,  // 1.75rem
      '#btn-size-sm': 32,  // 2.00rem
      '#btn-size-md': 36,  // 2.25rem
      '#btn-size-lg': 40,  // 2.50rem
      '#btn-size-xl': 48,  // 3.00rem
      '#btn-size-2xl': 56, // 3.50rem
    };

    for (const [selector, expected] of Object.entries(expectedHeights)) {
      const height = await page.locator(selector).evaluate((el) => {
        return parseFloat(window.getComputedStyle(el).height);
      });
      expect(height, `Failed height check for ${selector}`).toBeCloseTo(expected, 1);
    }
  });

  test('enforces comfortable touch target of at least 48px', async ({ page }) => {
    await page.goto('/sizing-fixture');
    const button = page.locator('#btn-touch-comfortable');
    await expect(button).toBeVisible();

    const dimensions = await button.evaluate((el) => {
      const style = window.getComputedStyle(el);
      return {
        minHeight: parseFloat(style.minHeight),
        minWidth: parseFloat(style.minWidth),
      };
    });

    expect(dimensions.minHeight).toBeGreaterThanOrEqual(48);
    expect(dimensions.minWidth).toBeGreaterThanOrEqual(48);
  });

  test('maintains identical dimensions across light and dark themes (theme parity)', async ({ page }) => {
    await page.goto('/sizing-fixture');
    const button = page.locator('#btn-default');

    await page.evaluate(() => document.documentElement.setAttribute('data-theme', 'light'));
    const lightHeight = await button.evaluate((el) => parseFloat(window.getComputedStyle(el).height));

    await page.evaluate(() => document.documentElement.setAttribute('data-theme', 'dark'));
    const darkHeight = await button.evaluate((el) => parseFloat(window.getComputedStyle(el).height));

    expect(lightHeight).toBeCloseTo(darkHeight, 1);
  });

  test('expands cleanly without text clipping under 200% font scaling', async ({ page }) => {
    await page.goto('/sizing-fixture');
    const button = page.locator('#btn-default');

    await page.evaluate(() => {
      document.documentElement.style.fontSize = '32px';
    });

    const scaledHeight = await button.evaluate((el) => parseFloat(window.getComputedStyle(el).height));
    // 3.00rem at 32px = at least 96px minimum height (can grow further if wrapped on narrow viewports)
    expect(scaledHeight).toBeGreaterThanOrEqual(96);
  });
});
