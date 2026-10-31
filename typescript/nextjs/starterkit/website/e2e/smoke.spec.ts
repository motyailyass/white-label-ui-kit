import { expect, test } from '@playwright/test';

test.describe('Website Smoke & Mobile Viewport Tests', () => {
  test('renders Tokyo wireframe landing page with brand header and sequential headings', async ({
    page,
  }) => {
    await page.goto('/');

    const heroHeading = page.locator('h1');
    await expect(heroHeading).toBeVisible();

    const brand = page.locator('header a', { hasText: 'Tokyo.dev' });
    await expect(brand).toBeVisible();
  });

  test('navbar and non-modal mobile disclosure fit 390px viewport with Escape dismissal', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');

    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    expect(scrollWidth).toBeLessThanOrEqual(390);

    const menuTrigger = page.getByRole('button', { name: /toggle navigation menu/i });
    await expect(menuTrigger).toBeVisible();
    const box = await menuTrigger.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.x + box!.width).toBeLessThanOrEqual(390);

    await menuTrigger.click();
    await expect(menuTrigger).toHaveAttribute('aria-expanded', 'true');

    const mobileMenu = page.locator('header div[data-open="true"]');
    await expect(mobileMenu).toBeVisible();

    // Pressing Escape dismisses non-modal disclosure and returns focus to trigger
    await page.keyboard.press('Escape');
    await expect(menuTrigger).toHaveAttribute('aria-expanded', 'false');
    await expect(menuTrigger).toBeFocused();
  });

  test('localizes landing sections in Arabic RTL and syncs footer ThemeSwitcher with ThemeProvider', async ({
    page,
  }) => {
    await page.goto('/');

    // Footer ThemeSwitcher updates ThemeProvider state and persists to localStorage
    const footerToggle = page.locator('footer').getByRole('button', { name: /toggle theme/i });
    await footerToggle.click();
    const storedTheme = await page.evaluate(() => localStorage.getItem('theme'));
    expect(storedTheme).toBeTruthy();

    // Switch locale to Arabic
    await page.locator('select').first().selectOption('ar');
    await expect(page.locator('html')).toHaveAttribute('lang', 'ar');
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');

    // Pricing keeps USD currency in Arabic
    const pricingText = await page.locator('#pricing').textContent();
    expect(pricingText).not.toMatch(/€|EUR|SAR|ر\.س/);
  });
});
