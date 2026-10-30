import { test, expect } from '@playwright/test';

test.describe('Dashboard Smoke & Accessibility Tests', () => {
  test('renders classic layout, active nav, and correct ARIA state on desktop', async ({ page }) => {
    await page.goto('/classic');

    // Title and Header
    await expect(page).toHaveTitle(/Control Hub - Dashboard Starter Kit/i);
    const heading = page.getByRole('heading', { name: /system overview/i });
    await expect(heading).toBeVisible();

    // Navigation and ARIA
    const sidebarTrigger = page.locator('#app-sidebar-trigger');
    await expect(sidebarTrigger).toBeVisible();

    const isMobile = (page.viewportSize()?.width ?? 1280) < 768;
    if (!isMobile) {
      await expect(sidebarTrigger).toHaveAttribute('aria-expanded', 'true');
      // Classic Layout item should be active page
      const activeLink = page.getByRole('link', { name: /classic layout/i });
      await expect(activeLink).toHaveAttribute('aria-current', 'page');
    }
  });

  test('handles 390px mobile viewport without squeezing main content in three-column layout', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/three-column');

    // Main content must take full available mobile screen width (> 300px), not 50px!
    const mainContainer = page.locator('main');
    await expect(mainContainer).toBeVisible();
    const box = await mainContainer.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.width).toBeGreaterThanOrEqual(350);

    // Sidebar drawer is closed initially on mobile
    const sidebar = page.locator('#app-sidebar');
    await expect(sidebar).toHaveAttribute('data-mobile-open', 'false');

    // Sidebar trigger reports aria-expanded="false" when closed on mobile
    const sidebarTrigger = page.locator('#app-sidebar-trigger');
    await expect(sidebarTrigger).toHaveAttribute('aria-expanded', 'false');

    // Clicking trigger opens mobile drawer
    await sidebarTrigger.click();
    await expect(sidebar).toHaveAttribute('data-mobile-open', 'true');
    await expect(sidebarTrigger).toHaveAttribute('aria-expanded', 'true');

    // Pressing Escape closes mobile drawer
    await page.keyboard.press('Escape');
    await expect(sidebar).toHaveAttribute('data-mobile-open', 'false');
  });

  test('derives RTL direction and translates theme labels when Arabic locale is selected', async ({
    page,
  }) => {
    await page.goto('/classic');

    // Select Arabic in language switcher
    const languageSelect = page.locator('select');
    await languageSelect.selectOption('ar');

    // HTML attributes update correctly
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
    await expect(page.locator('html')).toHaveAttribute('lang', 'ar');

    // Theme toggle button should render Arabic label
    const themeBtn = page.getByRole('button', { name: /تبديل المظهر/i });
    await expect(themeBtn).toBeVisible();
  });
});

