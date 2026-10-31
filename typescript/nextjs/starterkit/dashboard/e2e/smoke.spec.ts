import { expect, test } from '@playwright/test';

test.describe('Dashboard Smoke & Accessibility Tests', () => {
  test('renders classic layout, sequential headings, active nav, and dynamic ARIA state', async ({
    page,
  }) => {
    await page.goto('/classic');

    await expect(page).toHaveTitle(/Control Hub - Dashboard Starter Kit/i);
    await expect(page.getByRole('heading', { level: 1, name: /classic layout/i })).toBeVisible();
    await expect(page.getByRole('heading', { level: 2, name: /system overview/i })).toBeVisible();

    const sidebarTrigger = page.locator('[data-sidebar-trigger]');
    const sidebar = page.locator('[data-sidebar]');
    await expect(sidebarTrigger).toBeVisible();

    const sidebarId = await sidebar.getAttribute('id');
    expect(sidebarId).toBeTruthy();
    await expect(sidebarTrigger).toHaveAttribute('aria-controls', sidebarId!);

    const isMobile = (page.viewportSize()?.width ?? 1280) <= 768;
    if (!isMobile) {
      await expect(sidebarTrigger).toHaveAttribute('aria-expanded', 'true');
      const activeLink = page.getByRole('link', { name: /classic layout/i });
      await expect(activeLink).toHaveAttribute('aria-current', 'page');
    }
  });

  test('handles 390px mobile viewport and mobile-to-desktop resize cleanup in three-column layout', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/three-column');

    const mainContainer = page.locator('main');
    await expect(mainContainer).toBeVisible();
    const box = await mainContainer.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.width).toBeGreaterThanOrEqual(350);

    const sidebar = page.locator('[data-sidebar]');
    await expect(sidebar).toHaveAttribute('data-mobile-open', 'false');

    const sidebarTrigger = page.locator('[data-sidebar-trigger]');
    await expect(sidebarTrigger).toHaveAttribute('aria-expanded', 'false');

    await sidebarTrigger.click();
    await expect(sidebar).toHaveAttribute('data-mobile-open', 'true');
    await expect(sidebarTrigger).toHaveAttribute('aria-expanded', 'true');

    await page.keyboard.press('Escape');
    await expect(sidebar).toHaveAttribute('data-mobile-open', 'false');

    // Reopen drawer on mobile, then resize viewport to desktop (> 768px): must close & unlock scroll
    await sidebarTrigger.click();
    await expect(sidebar).toHaveAttribute('data-mobile-open', 'true');

    await page.setViewportSize({ width: 1280, height: 800 });
    await expect(sidebar).toHaveAttribute('data-mobile-open', 'false');
    const bodyOverflow = await page.evaluate(() => document.body.style.overflow);
    expect(bodyOverflow).not.toBe('hidden');
  });

  test('derives RTL direction, translates shell & metadata, and preserves USD currency in Arabic', async ({
    page,
  }) => {
    await page.goto('/classic');

    const languageSelect = page.locator('select');
    await languageSelect.selectOption('ar');

    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
    await expect(page.locator('html')).toHaveAttribute('lang', 'ar');

    const themeBtn = page.getByRole('button', { name: /تبديل المظهر/i });
    await expect(themeBtn).toBeVisible();

    // Revenue metric stays USD in Arabic (never converted to EUR/SAR)
    const pageText = await page.locator('main').textContent();
    expect(pageText).not.toMatch(/€|EUR|SAR|ر\.س/);
  });
});
