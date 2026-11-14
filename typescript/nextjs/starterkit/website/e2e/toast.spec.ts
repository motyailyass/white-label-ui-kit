import { expect, test } from '@playwright/test';

test.describe('Website Toast Studio Real-Browser Verification', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/gallery/toast');
    await expect(page.locator('[data-testid="toast-studio"]')).toBeVisible();
  });

  test('1. Dispatches status/alert toasts and dismisses via action and close buttons', async ({
    page,
  }) => {
    const triggerBtn = page.locator('[data-testid="trigger-toast-btn"]');
    const viewport = page.locator('[data-testid="toast-viewport"]');
    const activeBadge = page.locator('[data-testid="toast-active-badge"]');

    await expect(viewport).toHaveAttribute('role', 'region');
    await expect(viewport).toHaveAttribute('aria-label', 'Notifications');

    await triggerBtn.click();
    const firstToast = page.locator('[data-testid="live-toast-toast-1"]');
    await expect(firstToast).toBeVisible();
    await expect(firstToast).toHaveAttribute('role', 'status');

    await page.locator('[data-testid="toast-var-danger"]').click();
    await triggerBtn.click();
    const secondToast = page.locator('[data-testid="live-toast-toast-2"]');
    await expect(secondToast).toHaveAttribute('role', 'alert');

    await page.locator('[data-testid="live-toast-action-toast-1"]').click();
    await expect(firstToast).toHaveCount(0);

    await secondToast.locator('button[aria-label="Dismiss notification"]').click();
    await expect(secondToast).toHaveCount(0);
    await expect(activeBadge).toContainText('Active: 0');
  });

  test('2. Verifies RTL lang="ar" docking, symmetric top-center centering, and mobile overflow', async ({
    page,
  }) => {
    await page.locator('[data-testid="toast-dir-rtl"]').click();

    const canvas = page.locator('[data-testid="toast-canvas"]');
    const viewport = page.locator('[data-testid="toast-viewport"]');
    await expect(canvas).toHaveAttribute('dir', 'rtl');
    await expect(canvas).toHaveAttribute('lang', 'ar');
    await expect(viewport).toHaveAttribute('aria-label', 'الإشعارات');

    await page.locator('[data-testid="toast-dur-0"]').click();
    await page.locator('[data-testid="toast-pos-top-center"]').click();
    await page.locator('[data-testid="trigger-toast-btn"]').click();

    const liveToast = page.locator('[data-testid="live-toast-toast-1"]');
    await expect(liveToast).toBeVisible();

    const browserViewport = page.viewportSize()!;
    const rtlCenterBox = await liveToast.boundingBox();
    expect(rtlCenterBox).not.toBeNull();
    const centerDelta = Math.abs(
      rtlCenterBox!.x + rtlCenterBox!.width / 2 - browserViewport.width / 2,
    );
    expect(centerDelta).toBeLessThanOrEqual(2);

    await page.locator('[data-testid="clear-toasts-btn"]').click();

    await page.setViewportSize({ width: 375, height: 812 });
    const hasHorizontalOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
    );
    expect(hasHorizontalOverflow).toBe(false);
  });
});
