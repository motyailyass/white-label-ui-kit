import { test, expect } from '@playwright/test';

test.describe('Website Spacing & Section Rhythm Verification', () => {
  test('applies generous, responsive section rhythm across desktop and mobile', async ({
    page,
  }) => {
    await page.goto('/');

    const heroSection = page.locator('section[class*="hero"]');
    await expect(heroSection).toBeVisible();

    const isMobileProject = (page.viewportSize()?.width ?? 1280) < 768;

    const heroPaddingBlock = await heroSection.evaluate((el) => {
      const style = window.getComputedStyle(el);
      return parseFloat(style.paddingTop);
    });

    if (isMobileProject) {
      // Mobile: 64px (--space-16 / 4rem)
      expect(heroPaddingBlock).toBeCloseTo(64, 1);
    } else {
      // Desktop (>= 64rem): 96px (--space-24 / 6rem)
      expect(heroPaddingBlock).toBeCloseTo(96, 1);
    }
  });

  test('applies responsive section block padding and page gutters to bento section', async ({
    page,
  }) => {
    await page.goto('/');

    const bentoSection = page.locator('section[class*="section"]').first();
    await expect(bentoSection).toBeVisible();

    const isMobileProject = (page.viewportSize()?.width ?? 1280) < 768;

    const { paddingBlock, paddingInline } = await bentoSection.evaluate((el) => {
      const style = window.getComputedStyle(el);
      return {
        paddingBlock: parseFloat(style.paddingTop),
        paddingInline: parseFloat(style.paddingLeft),
      };
    });

    if (isMobileProject) {
      // Mobile: 48px (--space-12 / 3rem) block, 16px (--space-4 / 1rem) inline
      expect(paddingBlock).toBeCloseTo(48, 1);
      expect(paddingInline).toBeCloseTo(16, 1);
    } else {
      // Desktop (>= 64rem): 96px (--space-24 / 6rem) block, 32px (--space-8 / 2rem) inline
      expect(paddingBlock).toBeCloseTo(96, 1);
      expect(paddingInline).toBeCloseTo(32, 1);
    }
  });

  test('maintains identical spacing across light and dark themes (theme parity)', async ({
    page,
  }) => {
    await page.goto('/');
    const heroSection = page.locator('section[class*="hero"]');

    // Light theme padding
    await page.evaluate(() => document.documentElement.setAttribute('data-theme', 'light'));
    const lightPadding = await heroSection.evaluate((el) =>
      parseFloat(window.getComputedStyle(el).paddingTop),
    );

    // Dark theme padding
    await page.evaluate(() => document.documentElement.setAttribute('data-theme', 'dark'));
    const darkPadding = await heroSection.evaluate((el) =>
      parseFloat(window.getComputedStyle(el).paddingTop),
    );

    expect(lightPadding).toBeCloseTo(darkPadding, 1);
  });

  test('renders zero horizontal overflow on mobile viewports', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');

    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    expect(scrollWidth).toBeLessThanOrEqual(390);
  });
});
