import { expect, test } from '@playwright/test';

test.describe('Dashboard StatusDot Studio Real-Browser Verification', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/gallery/status-dot');
    await expect(page.locator('[data-testid="gallery-status-dot"]')).toBeVisible();
  });

  test('1. Switches status variants (online, busy, away, offline, info) and binds data-status', async ({
    page,
  }) => {
    const statusDot = page.locator('[data-testid="live-status-dot"]');
    await expect(statusDot).toBeVisible();
    await expect(statusDot).toHaveAttribute('data-status', 'online');

    // Switch to busy
    await page.locator('[data-testid="status-dot-status-busy"]').click();
    await expect(statusDot).toHaveAttribute('data-status', 'busy');

    // Switch to away
    await page.locator('[data-testid="status-dot-status-away"]').click();
    await expect(statusDot).toHaveAttribute('data-status', 'away');

    // Switch to offline
    await page.locator('[data-testid="status-dot-status-offline"]').click();
    await expect(statusDot).toHaveAttribute('data-status', 'offline');

    // Switch to info
    await page.locator('[data-testid="status-dot-status-info"]').click();
    await expect(statusDot).toHaveAttribute('data-status', 'info');
  });

  test('2. Verifies density scale (6px / 8px / 10px), data-size, and zero dashboard shadows', async ({
    page,
  }) => {
    const statusDot = page.locator('[data-testid="live-status-dot"]');
    const dot = statusDot.locator('[aria-hidden="true"]');

    // Default md size (8px)
    await expect(statusDot).toHaveAttribute('data-size', 'md');
    let dotBox = await dot.boundingBox();
    expect(dotBox?.width).toBeCloseTo(8, 1);
    expect(dotBox?.height).toBeCloseTo(8, 1);

    // Dashboard zero-shadow verification
    const shadow = await statusDot.evaluate((el) => window.getComputedStyle(el).boxShadow);
    expect(shadow).toBe('none');

    // Switch to sm (6px)
    await page.locator('[data-testid="status-dot-size-sm"]').click();
    await expect(statusDot).toHaveAttribute('data-size', 'sm');
    dotBox = await dot.boundingBox();
    expect(dotBox?.width).toBeCloseTo(6, 1);
    expect(dotBox?.height).toBeCloseTo(6, 1);

    // Switch to lg (10px)
    await page.locator('[data-testid="status-dot-size-lg"]').click();
    await expect(statusDot).toHaveAttribute('data-size', 'lg');
    dotBox = await dot.boundingBox();
    expect(dotBox?.width).toBeCloseTo(10, 1);
    expect(dotBox?.height).toBeCloseTo(10, 1);
  });

  test('3. Verifies ping pulse radar toggle, label toggle, and RTL direction', async ({ page }) => {
    const statusDot = page.locator('[data-testid="live-status-dot"]');

    // Initially ping is active
    await expect(statusDot).toHaveAttribute('data-ping', 'true');
    await expect(statusDot.locator('span[class*="pingRing"]')).toBeVisible();

    // Toggle ping off
    await page.locator('[data-testid="toggle-status-dot-ping"]').click();
    await expect(statusDot).not.toHaveAttribute('data-ping', 'true');
    await expect(statusDot.locator('span[class*="pingRing"]')).toHaveCount(0);

    // Initially label is visible
    await expect(statusDot.locator('span[class*="label"]')).toBeVisible();

    // Toggle label off
    await page.locator('[data-testid="toggle-status-dot-label"]').click();
    await expect(statusDot.locator('span[class*="label"]')).toHaveCount(0);
    // aria-label must still be preserved for standalone status announcement
    await expect(statusDot).toHaveAttribute('aria-label', /.+/);

    // Switch direction to RTL
    await page.locator('[data-testid="status-dot-dir-rtl"]').click();
    const canvas = page.locator('[data-testid="studio-preview-canvas"]');
    await expect(canvas).toHaveAttribute('dir', 'rtl');

    // Turn label back on and verify Arabic text is displayed under RTL
    await page.locator('[data-testid="toggle-status-dot-label"]').click();
    await expect(statusDot.locator('span[class*="label"]')).toBeVisible();
    await expect(statusDot.locator('span[class*="label"]')).toHaveText(/[\u0600-\u06FF]/);
    await expect(statusDot).toHaveAttribute('aria-label', /[\u0600-\u06FF]/);
  });
});
