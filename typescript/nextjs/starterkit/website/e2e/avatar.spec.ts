import { expect, test } from '@playwright/test';

test.describe('Website Avatar Studio Real-Browser Verification', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/gallery/avatar');
    await expect(page.locator('[data-testid="avatar-studio"]')).toBeVisible();
  });

  test('1. Switches 6-step size scale (24px–64px) and website rounded radius token (8px)', async ({
    page,
  }) => {
    const avatar = page.locator('[data-testid="studio-avatar"]');

    await page.locator('[data-testid="opt-size-xs"]').click();
    const xsBox = await avatar.boundingBox();
    expect(xsBox?.width).toBeCloseTo(24, 1);
    expect(xsBox?.height).toBeCloseTo(24, 1);

    await page.locator('[data-testid="opt-size-2xl"]').click();
    const xxlBox = await avatar.boundingBox();
    expect(xxlBox?.width).toBeCloseTo(64, 1);
    expect(xxlBox?.height).toBeCloseTo(64, 1);

    await page.locator('[data-testid="opt-shape-rounded"]').click();
    await expect(avatar).toHaveAttribute('data-shape', 'rounded');
    const radius = await avatar.evaluate((el) => window.getComputedStyle(el).borderRadius);
    expect(radius).toBe('8px');

    await page.locator('[data-testid="opt-status-offline"]').click();
    const offlineDotBg = await avatar
      .locator('[role="status"]')
      .evaluate((el) => window.getComputedStyle(el).backgroundColor);
    expect(offlineDotBg).not.toBe('rgba(0, 0, 0, 0)');
  });

  test('2. Exercises 3-tier fallback hierarchy (image -> broken -> initials -> anonymous)', async ({
    page,
  }) => {
    const avatar = page.locator('[data-testid="studio-avatar"]');

    await expect(avatar.locator('img')).toBeVisible();

    await page.locator('[data-testid="opt-fallback-broken"]').click();
    await expect(avatar.locator('img')).toHaveCount(0);
    await expect(avatar).toContainText('SC');

    await page.locator('[data-testid="opt-fallback-initials"]').click();
    await expect(avatar.locator('img')).toHaveCount(0);
    await expect(avatar).toContainText('SC');

    await page.locator('[data-testid="opt-fallback-anon"]').click();
    await expect(avatar.locator('svg[aria-hidden="true"]')).toBeVisible();
  });

  test('3. Renders AvatarGroup with BiDi-isolated +N counter under RTL and localized Arabic matrix', async ({
    page,
  }) => {
    await page.locator('[data-testid="opt-dir-rtl"]').click();
    await page.locator('[data-testid="toggle-group"]').click();

    const group = page.locator('[data-testid="studio-avatar-group"]');
    await expect(group).toBeVisible();
    const counter = group.getByText('+2');
    await expect(counter).toHaveAttribute('dir', 'ltr');

    const closestLang = await group.evaluate((el) => el.closest('[lang]')?.getAttribute('lang'));
    expect(closestLang).toBe('ar');

    await page.locator('[data-testid="opt-view-matrix"]').click();
    const matrix = page.locator('[data-testid="avatar-matrix-grid"]');
    await expect(matrix).toBeVisible();
  });
});
