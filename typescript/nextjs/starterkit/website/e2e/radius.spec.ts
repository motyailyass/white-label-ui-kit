import { expect, test } from '@playwright/test';

test.describe('Website Radius Specification Verification', () => {
  test('computes button control radius to 8px (--radius-control -> --radius-lg)', async ({ page }) => {
    await page.goto('/sizing-fixture');
    const button = page.locator('#btn-default');
    await expect(button).toBeVisible();

    const radius = await button.evaluate((el) => {
      return parseFloat(window.getComputedStyle(el).borderTopLeftRadius);
    });

    expect(radius).toBeCloseTo(8, 1);
  });

  test('explicit control sizes retain identical 8px semantic radius', async ({ page }) => {
    await page.goto('/sizing-fixture');

    const controlIds = [
      '#btn-size-xs',
      '#btn-size-sm',
      '#btn-size-md',
      '#btn-size-lg',
      '#btn-size-xl',
      '#btn-size-2xl',
    ];

    for (const id of controlIds) {
      const button = page.locator(id);
      await expect(button).toBeVisible();

      const radius = await button.evaluate((el) => {
        return parseFloat(window.getComputedStyle(el).borderTopLeftRadius);
      });

      expect(radius, `Radius mismatch for ${id}`).toBeCloseTo(8, 1);
    }
  });

  test('computes website card radius to 12px (--radius-card -> --radius-xl)', async ({ page }) => {
    await page.goto('/');
    const card = page.locator('div[class*="card"]').first();
    await expect(card).toBeVisible();

    const radius = await card.evaluate((el) => {
      return parseFloat(window.getComputedStyle(el).borderTopLeftRadius);
    });

    expect(radius).toBeCloseTo(12, 1);
  });

  test('computes large media feature surface to 16px (--radius-feature -> --radius-2xl)', async ({ page }) => {
    await page.goto('/');
    const mockup = page.locator('div[class*="mockup"]').first();
    await expect(mockup).toBeVisible();

    const radius = await mockup.evaluate((el) => {
      return parseFloat(window.getComputedStyle(el).borderTopLeftRadius);
    });

    expect(radius).toBeCloseTo(16, 1);
  });

  test('maintains identical radius across light and dark themes (theme parity)', async ({ page }) => {
    await page.goto('/sizing-fixture');
    const button = page.locator('#btn-default');
    await expect(button).toBeVisible();

    // Light theme check
    await page.evaluate(() => document.documentElement.setAttribute('data-theme', 'light'));
    const lightRadius = await button.evaluate((el) => {
      return parseFloat(window.getComputedStyle(el).borderTopLeftRadius);
    });

    // Dark theme check
    await page.evaluate(() => document.documentElement.setAttribute('data-theme', 'dark'));
    const darkRadius = await button.evaluate((el) => {
      return parseFloat(window.getComputedStyle(el).borderTopLeftRadius);
    });

    expect(lightRadius).toBeCloseTo(8, 1);
    expect(darkRadius).toBeCloseTo(8, 1);
    expect(darkRadius).toBe(lightRadius);
  });

  test('maintains identical radius across LTR and RTL directions', async ({ page }) => {
    await page.goto('/sizing-fixture');
    const button = page.locator('#btn-default');
    await expect(button).toBeVisible();

    // LTR
    await page.evaluate(() => document.documentElement.setAttribute('dir', 'ltr'));
    const ltrRadius = await button.evaluate((el) => {
      return parseFloat(window.getComputedStyle(el).borderTopLeftRadius);
    });

    // RTL
    await page.evaluate(() => document.documentElement.setAttribute('dir', 'rtl'));
    const rtlRadius = await button.evaluate((el) => {
      return parseFloat(window.getComputedStyle(el).borderTopLeftRadius);
    });

    expect(ltrRadius).toBeCloseTo(8, 1);
    expect(rtlRadius).toBeCloseTo(8, 1);
    expect(rtlRadius).toBe(ltrRadius);
  });

  test('focus outlines are not clipped by overflow', async ({ page }) => {
    await page.goto('/sizing-fixture');
    const button = page.locator('#btn-default');
    await button.focus();

    const hasOutline = await button.evaluate((el) => {
      const style = window.getComputedStyle(el);
      return style.outlineStyle !== 'none' && style.overflow !== 'hidden';
    });

    expect(hasOutline).toBe(true);
  });
});
