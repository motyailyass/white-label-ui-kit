import { expect, test } from '@playwright/test';

test.describe('Dashboard Slider Primitive Real-Browser Verification', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/gallery/slider');
    await expect(page.locator('[data-testid="gallery-slider"]')).toBeVisible();
  });

  test('1. Verifies rendering, initial WAI-ARIA values, and density sizing', async ({ page }) => {
    const slider = page.locator('[data-testid="live-slider"]');
    await expect(slider).toBeVisible();

    const thumb = slider.locator('[role="slider"]');
    await expect(thumb).toBeVisible();
    await expect(thumb).toHaveAttribute('aria-valuemin', '0');
    await expect(thumb).toHaveAttribute('aria-valuemax', '100');
    await expect(thumb).toHaveAttribute('aria-valuenow', '65');
    await expect(thumb).toHaveAttribute('aria-orientation', 'horizontal');

    // Default size is md
    await expect(slider).toHaveAttribute('data-size', 'md');
  });

  test('2. Verifies keyboard stepping with Arrow keys, Home, and End', async ({ page }) => {
    const slider = page.locator('[data-testid="live-slider"]');
    const thumb = slider.locator('[role="slider"]');

    await thumb.focus();
    await expect(thumb).toBeFocused();

    // ArrowRight increments by step (step=1 default)
    await page.keyboard.press('ArrowRight');
    await expect(thumb).toHaveAttribute('aria-valuenow', '66');

    await page.keyboard.press('ArrowLeft');
    await expect(thumb).toHaveAttribute('aria-valuenow', '65');

    // Home jumps to min (0)
    await page.keyboard.press('Home');
    await expect(thumb).toHaveAttribute('aria-valuenow', '0');

    // End jumps to max (100)
    await page.keyboard.press('End');
    await expect(thumb).toHaveAttribute('aria-valuenow', '100');
  });

  test('3. Verifies disabled toggle prevents interaction and updates attributes', async ({
    page,
  }) => {
    const slider = page.locator('[data-testid="live-slider"]');
    const thumb = slider.locator('[role="slider"]');

    // Toggle disabled
    const disabledToggle = page.locator('[data-testid="toggle-slider-disabled"]');
    await disabledToggle.click();

    await expect(slider).toHaveAttribute('data-disabled', '');
    await expect(thumb).toHaveAttribute('aria-disabled', 'true');
    await expect(thumb).toHaveAttribute('tabindex', '-1');

    // Attempt keyboard interaction while disabled
    await page.keyboard.press('ArrowRight');
    await expect(thumb).toHaveAttribute('aria-valuenow', '65');
  });

  test('4. Verifies RTL direction container switches arrow stepping semantics', async ({
    page,
  }) => {
    const slider = page.locator('[data-testid="live-slider"]');
    const thumb = slider.locator('[role="slider"]');

    // Switch to RTL via studio segmented control
    const rtlOption = page.locator('button', { hasText: 'RTL (Arabic)' });
    await rtlOption.click();

    await thumb.focus();
    const initialVal = Number(await thumb.getAttribute('aria-valuenow'));

    // In RTL, ArrowRight decreases value
    await page.keyboard.press('ArrowRight');
    const afterRightVal = Number(await thumb.getAttribute('aria-valuenow'));
    expect(afterRightVal).toBeLessThan(initialVal);

    // In RTL, ArrowLeft increases value
    await page.keyboard.press('ArrowLeft');
    const afterLeftVal = Number(await thumb.getAttribute('aria-valuenow'));
    expect(afterLeftVal).toBe(initialVal);
  });

  test('5. Verifies 100% shadow-free dashboard policy compliance', async ({ page }) => {
    const slider = page.locator('[data-testid="live-slider"]');
    const thumb = slider.locator('[role="slider"]');
    const track = slider.locator('[class*="track"]');
    const range = slider.locator('[class*="range"]');

    const elements = [slider, thumb, track, range];

    for (const el of elements) {
      const boxShadow = await el.evaluate((node) => {
        const computed = window.getComputedStyle(node);
        return computed.boxShadow;
      });
      expect(boxShadow === 'none' || boxShadow === '').toBeTruthy();
    }
  });
});
