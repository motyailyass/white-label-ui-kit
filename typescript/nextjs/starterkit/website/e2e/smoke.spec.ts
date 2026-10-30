import { test, expect } from '@playwright/test';

test.describe('Website Smoke & Mobile Viewport Tests', () => {
  test('renders Tokyo wireframe landing page with brand header', async ({ page }) => {
    await page.goto('/');

    const heroHeading = page.locator('h1');
    await expect(heroHeading).toBeVisible();

    const brand = page.locator('header a', { hasText: 'Tokyo.dev' });
    await expect(brand).toBeVisible();
  });

  test('navbar and hamburger menu fit 390px viewport with zero horizontal overflow', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');

    // Document width must not exceed viewport (zero horizontal overflow, no 542px blowout!)
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    expect(scrollWidth).toBeLessThanOrEqual(390);

    // Mobile menu trigger button must be visible within the 390px viewport
    const menuTrigger = page.getByRole('button', { name: /toggle navigation menu/i });
    await expect(menuTrigger).toBeVisible();
    const box = await menuTrigger.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.x + box!.width).toBeLessThanOrEqual(390);

    // Clicking hamburger opens mobile drawer with links and CTA
    await menuTrigger.click();
    await expect(menuTrigger).toHaveAttribute('aria-expanded', 'true');

    const mobileMenu = page.locator('header div[data-open="true"]');
    await expect(mobileMenu).toBeVisible();

    // Clicking again closes drawer
    await menuTrigger.click();
    await expect(menuTrigger).toHaveAttribute('aria-expanded', 'false');
  });
});
