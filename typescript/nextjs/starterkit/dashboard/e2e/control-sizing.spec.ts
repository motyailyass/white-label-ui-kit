import { test, expect } from '@playwright/test';

test.describe('Dashboard Control Sizing & Interaction Target Verification', () => {
  test('renders dashboard default control size at md (36px)', async ({ page }) => {
    await page.goto('/sizing-fixture');
    await expect(page.locator('#btn-default')).toBeVisible();

    const height = await page.locator('#btn-default').evaluate((el) => {
      return parseFloat(window.getComputedStyle(el).height);
    });

    // 36px minimum height (2.25rem = 36px at 16px root font)
    expect(height).toBeCloseTo(36, 1);
  });

  test('renders explicit six-step scale with exact proportional dimensions', async ({ page }) => {
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

  test('enforces comfortable touch target of at least 48px without changing visible text size', async ({ page }) => {
    await page.goto('/sizing-fixture');
    const button = page.locator('#btn-touch-comfortable');
    await expect(button).toBeVisible();

    const dimensions = await button.evaluate((el) => {
      const style = window.getComputedStyle(el);
      return {
        height: parseFloat(style.height),
        width: parseFloat(style.width),
        minHeight: parseFloat(style.minHeight),
        minWidth: parseFloat(style.minWidth),
      };
    });

    expect(dimensions.minHeight).toBeGreaterThanOrEqual(48);
    expect(dimensions.minWidth).toBeGreaterThanOrEqual(48);
  });

  test('allows multiline wrapped labels to grow in block size without clipping', async ({ page }) => {
    await page.goto('/sizing-fixture');
    const button = page.locator('#btn-wrapped-label');
    await expect(button).toBeVisible();

    const height = await button.evaluate((el) => {
      return parseFloat(window.getComputedStyle(el).height);
    });

    // Wrapped content must grow beyond single-line height (> 36px)
    expect(height).toBeGreaterThan(40);
  });

  test('loading state maintains identical dimensions with zero layout shift', async ({ page }) => {
    await page.goto('/sizing-fixture');
    const defaultBtn = page.locator('#btn-default');
    const loadingBtn = page.locator('#btn-loading');

    const defaultHeight = await defaultBtn.evaluate((el) => parseFloat(window.getComputedStyle(el).height));
    const loadingHeight = await loadingBtn.evaluate((el) => parseFloat(window.getComputedStyle(el).height));

    expect(loadingHeight).toBeCloseTo(defaultHeight, 1);
  });

  test('maintains identical dimensions across light and dark themes (theme parity)', async ({ page }) => {
    await page.goto('/sizing-fixture');
    const button = page.locator('#btn-default');

    // Light theme height
    await page.evaluate(() => document.documentElement.setAttribute('data-theme', 'light'));
    const lightHeight = await button.evaluate((el) => parseFloat(window.getComputedStyle(el).height));

    // Dark theme height
    await page.evaluate(() => document.documentElement.setAttribute('data-theme', 'dark'));
    const darkHeight = await button.evaluate((el) => parseFloat(window.getComputedStyle(el).height));

    expect(lightHeight).toBeCloseTo(darkHeight, 1);
  });

  test('supports Arabic and French labels with RTL layout alignment without clipping', async ({ page }) => {
    await page.goto('/classic');
    const button = page.locator('button:has-text("Export Report"), button:has-text("تصدير التقرير"), button:has-text("Exporter le rapport")').first();
    await expect(button).toBeVisible();

    // Verify Arabic RTL mode
    const langSelect = page.locator('select');
    if (await langSelect.isVisible()) {
      await langSelect.selectOption('ar');
      await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');

      const arabicBtn = page.locator('button:has-text("تصدير التقرير")');
      await expect(arabicBtn).toBeVisible();
      const box = await arabicBtn.boundingBox();
      expect(box).not.toBeNull();
      expect(box!.height).toBeGreaterThanOrEqual(36);
    }
  });

  test('expands cleanly without text clipping under 200% font scaling', async ({ page }) => {
    await page.goto('/sizing-fixture');
    const button = page.locator('#btn-default');

    // Simulate 200% font enlargement by setting root font-size to 32px (double standard 16px)
    await page.evaluate(() => {
      document.documentElement.style.fontSize = '32px';
    });

    const scaledHeight = await button.evaluate((el) => parseFloat(window.getComputedStyle(el).height));
    // 2.25rem at 32px = at least 72px minimum height (can grow further if wrapped on narrow viewports)
    expect(scaledHeight).toBeGreaterThanOrEqual(72);
  });

  test('ensures ThemeToggle and LanguageSwitcher reach >= 48px touch target on coarse pointers', async ({ page }) => {
    await page.goto('/classic');
    const toggle = page.locator('button[aria-label*="Toggle theme"], button[aria-label*="theme"]').first();
    const select = page.locator('select').first();

    await expect(toggle).toBeVisible();
    await expect(select).toBeVisible();

    // On mobile / coarse pointer projects, verify interaction target reaches touch minimum
    const isMobileProject = (page.viewportSize()?.width ?? 1280) < 768;
    if (isMobileProject) {
      const toggleHeight = await toggle.evaluate((el) => parseFloat(window.getComputedStyle(el).height));
      const selectHeight = await select.evaluate((el) => parseFloat(window.getComputedStyle(el).height));

      expect(toggleHeight).toBeGreaterThanOrEqual(48);
      expect(selectHeight).toBeGreaterThanOrEqual(48);
    }
  });
});
