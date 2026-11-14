import { expect, test } from '@playwright/test';

test.describe('Dashboard InputOtp Studio Real-Browser Verification', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/gallery/input-otp');
    await expect(page.locator('[data-testid="gallery-input-otp"]')).toBeVisible();
  });

  test('1. Switches slot count (4 vs 6), size density, and verifies zero dashboard shadows', async ({
    page,
  }) => {
    const liveOtp = page.locator('[data-testid="live-input-otp"]');
    await expect(liveOtp).toBeVisible();

    // Default 6 slots, md size
    await expect(liveOtp).toHaveAttribute('data-length', '6');
    await expect(liveOtp).toHaveAttribute('data-size', 'md');
    let slots = liveOtp.locator('input');
    await expect(slots).toHaveCount(6);

    // Switch to 4 slots
    await page.locator('[data-testid="input-otp-length-4"]').click();
    await expect(liveOtp).toHaveAttribute('data-length', '4');
    slots = liveOtp.locator('input');
    await expect(slots).toHaveCount(4);

    // Switch size density to sm
    await page.locator('[data-testid="input-otp-size-sm"]').click();
    await expect(liveOtp).toHaveAttribute('data-size', 'sm');

    // Switch size density to lg
    await page.locator('[data-testid="input-otp-size-lg"]').click();
    await expect(liveOtp).toHaveAttribute('data-size', 'lg');

    // Zero-shadow policy verification in dashboard
    const shadow = await slots.first().evaluate((el) => window.getComputedStyle(el).boxShadow);
    expect(shadow).toBe('none');
  });

  test('2. Verifies typing, auto-advance, separator split, and complete attribute', async ({
    page,
  }) => {
    const liveOtp = page.locator('[data-testid="live-input-otp"]');
    const slots = liveOtp.locator('input');

    // Switch to 4 slots for rapid completion
    await page.locator('[data-testid="input-otp-length-4"]').click();

    // Fill all 4 slots
    await slots.nth(0).focus();
    await page.keyboard.type('1234');

    // Verify all 4 slots contain the typed digits
    await expect(slots.nth(0)).toHaveValue('1');
    await expect(slots.nth(1)).toHaveValue('2');
    await expect(slots.nth(2)).toHaveValue('3');
    await expect(slots.nth(3)).toHaveValue('4');
    await expect(liveOtp).toHaveAttribute('data-complete', 'true');

    // Switch back to 6 slots and verify separator
    await page.locator('[data-testid="input-otp-length-6"]').click();
    const separator = liveOtp.locator('[data-separator="true"]');
    await expect(separator).toBeVisible();
    await expect(separator).toHaveText('—');

    // Toggle separator off
    await page.locator('[data-testid="toggle-input-otp-separator"]').click();
    await expect(separator).toHaveCount(0);
  });

  test('3. Verifies masking toggle, error state, and RTL direction', async ({ page }) => {
    const liveOtp = page.locator('[data-testid="live-input-otp"]');
    const slots = liveOtp.locator('input');

    // Initially unmasked (type="text")
    await expect(slots.first()).toHaveAttribute('type', 'text');

    // Toggle mask on
    await page.locator('[data-testid="toggle-input-otp-mask"]').click();
    await expect(slots.first()).toHaveAttribute('type', 'password');

    // Toggle error on
    await expect(liveOtp).not.toHaveAttribute('data-error', 'true');
    await page.locator('[data-testid="toggle-input-otp-error"]').click();
    await expect(liveOtp).toHaveAttribute('data-error', 'true');

    // Switch direction to RTL
    await page.locator('[data-testid="input-otp-dir-rtl"]').click();
    const canvas = page.locator('[data-testid="studio-preview-canvas"]');
    await expect(canvas).toHaveAttribute('dir', 'rtl');
  });

  test('4. Enforces smart focus (clicking empty slot ahead snaps to first empty slot) and switches grouped variant', async ({
    page,
  }) => {
    const liveOtp = page.locator('[data-testid="live-input-otp"]');
    const slots = liveOtp.locator('input');

    // Default value is "42" (slots 0 and 1 filled, slots 2-5 empty)
    // Clicking slot 5 should snap focus directly to slot 2
    await slots.nth(5).click();
    await expect(slots.nth(2)).toBeFocused();

    // Switch layout variant to grouped
    await page.locator('[data-testid="input-otp-variant-grouped"]').click();
    await expect(liveOtp).toHaveAttribute('data-variant', 'grouped');
  });
});
