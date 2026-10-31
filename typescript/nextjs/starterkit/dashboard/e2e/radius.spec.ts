import { expect, test } from '@playwright/test';

test.describe('Dashboard Radius Specification Verification', () => {
  test('computes button control radius to 6px (--radius-control -> --radius-md)', async ({ page }) => {
    await page.goto('/sizing-fixture');
    const button = page.locator('#btn-default');
    await expect(button).toBeVisible();

    const radius = await button.evaluate((el) => {
      return parseFloat(window.getComputedStyle(el).borderTopLeftRadius);
    });

    expect(radius).toBeCloseTo(6, 1);
  });

  test('explicit control sizes retain identical 6px semantic radius', async ({ page }) => {
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

      expect(radius, `Radius mismatch for ${id}`).toBeCloseTo(6, 1);
    }
  });

  test('computes dashboard card radius to 8px (--radius-card -> --radius-lg)', async ({ page }) => {
    await page.goto('/classic');
    const card = page.locator('div[class*="metricCard"]').first();
    await expect(card).toBeVisible();

    const radius = await card.evaluate((el) => {
      return parseFloat(window.getComputedStyle(el).borderTopLeftRadius);
    });

    expect(radius).toBeCloseTo(8, 1);
  });

  test('attached surface retains 0px radius (--radius-attached -> --radius-none)', async ({ page }) => {
    await page.goto('/classic');
    const sidebar = page.locator('aside[class*="sidebar"]').first();

    const radius = await sidebar.evaluate((el) => {
      return parseFloat(window.getComputedStyle(el).borderTopLeftRadius);
    });

    expect(radius).toBeCloseTo(0, 1);
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

    expect(lightRadius).toBeCloseTo(6, 1);
    expect(darkRadius).toBeCloseTo(6, 1);
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

    expect(ltrRadius).toBeCloseTo(6, 1);
    expect(rtlRadius).toBeCloseTo(6, 1);
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
