import { expect, test } from '@playwright/test';

test.describe('Website Toggle Primitive Real-Browser Verification', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/gallery/toggle');
    await expect(page.locator('[data-testid="gallery-toggle"]')).toBeVisible();
  });

  test('1. Verifies rendering, initial WAI-ARIA values, and group selection', async ({ page }) => {
    const group = page.locator('[data-testid="live-toggle-group"]');
    await expect(group).toBeVisible();

    const buttons = group.locator('button');
    await expect(buttons).toHaveCount(4);

    // Initial value is "center"
    const centerBtn = group.locator('button', { hasText: 'Center' });
    await expect(centerBtn).toHaveAttribute('aria-pressed', 'true');
    await expect(centerBtn).toHaveAttribute('data-state', 'on');
    await expect(centerBtn).toHaveAttribute('data-size', 'md');

    // Click "Right" button
    const rightBtn = group.locator('button', { hasText: 'Right' });
    await rightBtn.click();
    await expect(rightBtn).toHaveAttribute('aria-pressed', 'true');
    await expect(centerBtn).toHaveAttribute('aria-pressed', 'false');
  });

  test('2. Verifies switching studio mode to standalone Toggle and state flipping', async ({
    page,
  }) => {
    // Switch to Standalone Toggle
    const singleModeBtn = page.locator('button', { hasText: 'Single Toggle' });
    await singleModeBtn.click();

    const toggle = page.locator('[data-testid="live-toggle"]');
    await expect(toggle).toBeVisible();
    await expect(toggle).toHaveAttribute('aria-pressed', 'false');
    await expect(toggle).toHaveAttribute('data-state', 'off');

    // Click to toggle on
    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-pressed', 'true');
    await expect(toggle).toHaveAttribute('data-state', 'on');

    // Click to toggle off
    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-pressed', 'false');
    await expect(toggle).toHaveAttribute('data-state', 'off');
  });

  test('3. Verifies disabled state prevents interaction and reflects data-disabled', async ({
    page,
  }) => {
    // Switch to Standalone Toggle
    await page.locator('button', { hasText: 'Single Toggle' }).click();
    const toggle = page.locator('[data-testid="live-toggle"]');

    // Toggle disabled in studio
    const disabledToggle = page.locator('[data-testid="toggle-disabled"]');
    await disabledToggle.click();

    await expect(toggle).toHaveAttribute('data-disabled', '');
    await expect(toggle).toBeDisabled();

    // Click should not toggle state
    await toggle.click({ force: true });
    await expect(toggle).toHaveAttribute('aria-pressed', 'false');
  });

  test('4. Verifies 100% shadow-free dashboard policy compliance', async ({ page }) => {
    const group = page.locator('[data-testid="live-toggle-group"]');
    await expect(group).toBeVisible();

    const buttons = await group.locator('button').all();
    for (const btn of buttons) {
      const boxShadow = await btn.evaluate((node) => {
        const computed = window.getComputedStyle(node);
        return computed.boxShadow;
      });
      expect(boxShadow === 'none' || boxShadow === '').toBeTruthy();
    }
  });
});
