import { expect, test } from '@playwright/test';

test.describe('Dashboard Toast Studio Real-Browser Verification', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/gallery/toast');
    await expect(page.locator('[data-testid="toast-studio"]')).toBeVisible();
  });

  test('1. Dispatches live status/alert toasts, supports action/close/clear, and is shadow-free', async ({
    page,
  }) => {
    const triggerBtn = page.locator('[data-testid="trigger-toast-btn"]');
    const viewport = page.locator('[data-testid="toast-viewport"]');
    const activeBadge = page.locator('[data-testid="toast-active-badge"]');

    await expect(viewport).toHaveAttribute('role', 'region');
    await expect(viewport).toHaveAttribute('aria-label', 'Notifications');
    await expect(activeBadge).toContainText('Active: 0');

    // Default variant is success -> role="status", polite
    await triggerBtn.click();
    const firstToast = page.locator('[data-testid="live-toast-toast-1"]');
    await expect(firstToast).toBeVisible();
    await expect(firstToast).toHaveAttribute('role', 'status');
    await expect(firstToast).toHaveAttribute('aria-live', 'polite');
    await expect(activeBadge).toContainText('Active: 1');

    // Verify zero shadows on Dashboard Toast card
    const boxShadow = await firstToast.evaluate((el) => getComputedStyle(el).boxShadow);
    expect(boxShadow).toBe('none');

    // Switch to danger variant -> role="alert", assertive
    await page.locator('[data-testid="toast-var-danger"]').click();
    await triggerBtn.click();
    const secondToast = page.locator('[data-testid="live-toast-toast-2"]');
    await expect(secondToast).toBeVisible();
    await expect(secondToast).toHaveAttribute('role', 'alert');
    await expect(secondToast).toHaveAttribute('aria-live', 'assertive');
    await expect(activeBadge).toContainText('Active: 2');

    // Dismiss first via action button, second via close button
    await page.locator('[data-testid="live-toast-action-toast-1"]').click();
    await expect(firstToast).toHaveCount(0);
    await expect(activeBadge).toContainText('Active: 1');

    await secondToast.locator('button[aria-label="Dismiss notification"]').click();
    await expect(secondToast).toHaveCount(0);
    await expect(activeBadge).toContainText('Active: 0');

    // Clear all batch dismiss
    await triggerBtn.click();
    await triggerBtn.click();
    await expect(activeBadge).toContainText('Active: 2');
    await page.locator('[data-testid="clear-toasts-btn"]').click();
    await expect(activeBadge).toContainText('Active: 0');
  });

  test('2. Verifies RTL lang="ar" logical docking, symmetric top-center alignment, and zero mobile overflow', async ({
    page,
  }) => {
    await page.locator('[data-testid="toast-dir-rtl"]').click();

    const canvas = page.locator('[data-testid="toast-canvas"]');
    const viewport = page.locator('[data-testid="toast-viewport"]');
    await expect(canvas).toHaveAttribute('dir', 'rtl');
    await expect(canvas).toHaveAttribute('lang', 'ar');
    await expect(viewport).toHaveAttribute('dir', 'rtl');
    await expect(viewport).toHaveAttribute('lang', 'ar');
    await expect(viewport).toHaveAttribute('aria-label', 'الإشعارات');

    // Use persistent duration while verifying placement
    await page.locator('[data-testid="toast-dur-0"]').click();
    await page.locator('[data-testid="trigger-toast-btn"]').click();

    const liveToast = page.locator('[data-testid="live-toast-toast-1"]');
    await expect(liveToast).toBeVisible();

    // In RTL, bottom-end anchors on physical left side
    const browserViewport = page.viewportSize()!;
    const rtlEndBox = await liveToast.boundingBox();
    expect(rtlEndBox).not.toBeNull();
    expect(rtlEndBox!.x).toBeLessThan(40);

    // Switch to top-center in RTL and verify symmetric horizontal centering
    await page.locator('[data-testid="toast-pos-top-center"]').click();
    const rtlCenterBox = await liveToast.boundingBox();
    expect(rtlCenterBox).not.toBeNull();
    const centerDelta = Math.abs(
      rtlCenterBox!.x + rtlCenterBox!.width / 2 - browserViewport.width / 2,
    );
    expect(centerDelta).toBeLessThanOrEqual(2);

    // Switch to top-start in RTL -> anchors on physical right side
    await page.locator('[data-testid="toast-pos-top-start"]').click();
    const rtlStartBox = await liveToast.boundingBox();
    expect(rtlStartBox).not.toBeNull();
    expect(browserViewport.width - (rtlStartBox!.x + rtlStartBox!.width)).toBeLessThan(40);

    await page.locator('[data-testid="clear-toasts-btn"]').click();

    // Zero horizontal overflow at mobile 375x812
    await page.setViewportSize({ width: 375, height: 812 });
    const hasHorizontalOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
    );
    expect(hasHorizontalOverflow).toBe(false);
  });
});
