import { expect, test } from '@playwright/test';

test.describe('Website Control Sizing & Interaction Target Verification', () => {
  test('renders website default control size at xl (48px)', async ({ page }) => {
    await page.goto('/sizing-fixture');
    await expect(page.locator('#btn-default')).toBeVisible();

    const height = await page.locator('#btn-default').evaluate((el) => {
      return Number.parseFloat(window.getComputedStyle(el).height);
    });

    expect(height).toBeCloseTo(48, 1);
  });

  test('renders explicit six-step scale with exact proportional dimensions matching dashboard', async ({
    page,
  }) => {
    await page.goto('/sizing-fixture');

    const isCoarse = await page.evaluate(() => window.matchMedia('(pointer: coarse)').matches);
    const expectedHeights: Record<string, number> = {
      '#btn-size-xs': 28,
      '#btn-size-sm': 32,
      '#btn-size-md': 36,
      '#btn-size-lg': 40,
      '#btn-size-xl': 48,
      '#btn-size-2xl': 56,
    };

    for (const [selector, expected] of Object.entries(expectedHeights)) {
      const height = await page.locator(selector).evaluate((el) => {
        return Number.parseFloat(window.getComputedStyle(el).height);
      });
      if (isCoarse) {
        expect(height, `Failed coarse height check for ${selector}`).toBeGreaterThanOrEqual(
          Math.max(48, expected),
        );
      } else {
        expect(height, `Failed height check for ${selector}`).toBeCloseTo(expected, 1);
      }
    }
  });

  test('enforces comfortable touch target of at least 48px', async ({ page }) => {
    await page.goto('/sizing-fixture');
    const button = page.locator('#btn-touch-comfortable');
    await expect(button).toBeVisible();

    const dimensions = await button.evaluate((el) => {
      const style = window.getComputedStyle(el);
      return {
        minHeight: Number.parseFloat(style.minHeight),
        minWidth: Number.parseFloat(style.minWidth),
      };
    });

    expect(dimensions.minHeight).toBeGreaterThanOrEqual(48);
    expect(dimensions.minWidth).toBeGreaterThanOrEqual(48);
  });

  test('maintains identical dimensions across light and dark themes (theme parity)', async ({
    page,
  }) => {
    await page.goto('/sizing-fixture');
    const button = page.locator('#btn-default');

    await page.evaluate(() => document.documentElement.setAttribute('data-theme', 'light'));
    const lightHeight = await button.evaluate((el) =>
      Number.parseFloat(window.getComputedStyle(el).height),
    );

    await page.evaluate(() => document.documentElement.setAttribute('data-theme', 'dark'));
    const darkHeight = await button.evaluate((el) =>
      Number.parseFloat(window.getComputedStyle(el).height),
    );

    expect(lightHeight).toBeCloseTo(darkHeight, 1);
  });

  test('expands cleanly without text clipping under 200% font scaling', async ({ page }) => {
    await page.goto('/sizing-fixture');
    const button = page.locator('#btn-default');

    await page.evaluate(() => {
      document.documentElement.style.fontSize = '32px';
    });

    const scaledHeight = await button.evaluate((el) =>
      Number.parseFloat(window.getComputedStyle(el).height),
    );
    expect(scaledHeight).toBeGreaterThanOrEqual(96);
  });

  test('ensures ThemeSwitcher, LanguageSwitcher, and mobile menu trigger reach >= 48px touch target on coarse pointers', async ({
    page,
  }) => {
    await page.goto('/');
    const toggle = page
      .locator('header')
      .getByRole('button', { name: /toggle theme/i })
      .first();
    const select = page.locator('header select').first();

    await expect(toggle).toBeVisible();
    await expect(select).toBeVisible();

    const isMobileProject = (page.viewportSize()?.width ?? 1280) < 768;
    if (isMobileProject) {
      const menuTrigger = page.getByRole('button', { name: /toggle navigation menu/i });
      await expect(menuTrigger).toBeVisible();

      const toggleHeight = await toggle.evaluate((el) =>
        Number.parseFloat(window.getComputedStyle(el).height),
      );
      const selectHeight = await select.evaluate((el) =>
        Number.parseFloat(window.getComputedStyle(el).height),
      );
      const menuHeight = await menuTrigger.evaluate((el) =>
        Number.parseFloat(window.getComputedStyle(el).height),
      );

      expect(toggleHeight).toBeGreaterThanOrEqual(48);
      expect(selectHeight).toBeGreaterThanOrEqual(48);
      expect(menuHeight).toBeGreaterThanOrEqual(48);
    }
  });
});
