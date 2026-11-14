import { expect, test } from '@playwright/test';

test.describe('Dashboard Switch Primitive Real-Browser Verification', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/gallery/switch');
    await expect(page.locator('[data-testid="switch-gallery"]')).toBeVisible();
  });

  test('verifies native input real hitbox target dimensions and six-step scale in all-sizes view', async ({
    page,
  }) => {
    const isCoarse = await page.evaluate(() => window.matchMedia('(pointer: coarse)').matches);

    // 1. Dashboard product default (omitted size): md (36px target, 32×16px track)
    const activeSwitch = page.locator('[data-testid="studio-active-switch"]');
    await expect(activeSwitch).toBeVisible();

    const activeRoot = activeSwitch.locator('..');
    const activeRootBox = await activeRoot.boundingBox();
    expect(activeRootBox).not.toBeNull();

    if (isCoarse) {
      expect(activeRootBox!.height).toBeGreaterThanOrEqual(48);
      expect(activeRootBox!.width).toBeGreaterThanOrEqual(48);
    } else {
      expect(activeRootBox!.height).toBeCloseTo(36, 1);
      expect(activeRootBox!.width).toBeCloseTo(36, 1);
    }

    // 2. Switch to all-sizes view
    await page.locator('[data-testid="opt-view-all-sizes"]').click();

    const scaleTargets: Record<string, number> = {
      xs: 28,
      sm: 32,
      md: 36,
      lg: 40,
      xl: 48,
      '2xl': 56,
    };

    for (const [sz, expectedTarget] of Object.entries(scaleTargets)) {
      const specimen = page.locator(`[data-testid="studio-size-switch-${sz}"]`);
      await expect(specimen).toBeVisible();
      const root = specimen.locator('..');
      const box = await root.boundingBox();
      expect(box).not.toBeNull();

      if (isCoarse) {
        expect(box!.height).toBeGreaterThanOrEqual(Math.max(48, expectedTarget));
      } else {
        expect(box!.height).toBeCloseTo(expectedTarget, 1);
        expect(box!.width).toBeCloseTo(expectedTarget, 1);
      }
    }
  });

  test('verifies real hitbox edge clicks toggle the native switch input', async ({ page }) => {
    const activeSwitch = page.locator('[data-testid="studio-active-switch"]');
    await expect(activeSwitch).toBeVisible();
    await expect(activeSwitch).toBeChecked();

    const root = activeSwitch.locator('..');
    const rootBox = await root.boundingBox();
    expect(rootBox).not.toBeNull();

    // Click near top-left edge of the hitbox (x=2, y=2)
    await root.click({ position: { x: 2, y: 2 } });
    await expect(activeSwitch).not.toBeChecked();

    // Click near bottom-right edge of the hitbox
    await root.click({ position: { x: rootBox!.width - 2, y: rootBox!.height - 2 } });
    await expect(activeSwitch).toBeChecked();
  });

  test('verifies keyboard Space toggles switch but Enter does not', async ({ page }) => {
    const activeSwitch = page.locator('[data-testid="studio-active-switch"]');
    await expect(activeSwitch).toBeVisible();
    await expect(activeSwitch).toBeChecked();

    await activeSwitch.focus();
    await expect(activeSwitch).toBeFocused();

    // Enter key should NOT toggle native switch checkbox
    await page.keyboard.press('Enter');
    await expect(activeSwitch).toBeChecked();

    // Space key toggles native switch
    await page.keyboard.press('Space');
    await expect(activeSwitch).not.toBeChecked();

    await page.keyboard.press('Space');
    await expect(activeSwitch).toBeChecked();
  });

  test('verifies comfortable touch-target expands hit area to at least 48x48px', async ({
    page,
  }) => {
    // Select XS size first
    await page.locator('[data-testid="opt-size-xs"]').click();
    const activeSwitch = page.locator('[data-testid="studio-active-switch"]');
    const root = activeSwitch.locator('..');

    // Default auto on fine pointer is 28px
    const autoBox = await root.boundingBox();
    expect(autoBox).not.toBeNull();

    // Switch to comfortable touch target
    await page.locator('[data-testid="opt-touch-comfortable"]').click();
    const comfortableBox = await root.boundingBox();
    expect(comfortableBox).not.toBeNull();
    expect(comfortableBox!.width).toBeGreaterThanOrEqual(48);
    expect(comfortableBox!.height).toBeGreaterThanOrEqual(48);
  });

  test('verifies common configurations presets bar and dynamic state switcher', async ({
    page,
  }) => {
    const activeSwitch = page.locator('[data-testid="studio-active-switch"]');

    // 1. Analytics Preset (Unchecked by default)
    await page.locator('[data-testid="preset-quick-switch-analytics"]').click();
    await expect(activeSwitch).not.toBeChecked();

    // 2. Two-Factor Preset (Checked by default)
    await page.locator('[data-testid="preset-quick-switch-twofactor"]').click();
    await expect(activeSwitch).toBeChecked();

    // 3. Maintenance Preset (Unchecked by default)
    await page.locator('[data-testid="preset-quick-switch-maintenance"]').click();
    await expect(activeSwitch).not.toBeChecked();

    // 4. Notifications Preset (Default Checked)
    await page.locator('[data-testid="preset-quick-switch-notifications"]').click();
    await expect(activeSwitch).toBeChecked();

    // 5. Dynamic State Switcher: Invalid (clears check and shows alert)
    await page.locator('[data-testid="opt-state-invalid"]').click();
    await expect(activeSwitch).not.toBeChecked();
    await expect(activeSwitch).toHaveAttribute('aria-invalid', 'true');
    await expect(page.locator('[data-testid="switch-gallery"] [role="alert"]')).toBeVisible();

    // Toggling ON clears invalid state
    await activeSwitch.click();
    await expect(activeSwitch).toBeChecked();
    await expect(page.locator('[data-testid="switch-gallery"] [role="alert"]')).not.toBeVisible();

    // 6. Dynamic State Switcher: Disabled
    await page.locator('[data-testid="opt-state-disabled"]').click();
    await expect(activeSwitch).toBeDisabled();
  });

  test('verifies external label click toggles switch and respects RTL direction switch', async ({
    page,
  }) => {
    const activeSwitch = page.locator('[data-testid="studio-active-switch"]');
    const switchId = await activeSwitch.getAttribute('id');
    const label = page.locator(`label[for="${switchId}"]`);
    await expect(label).toBeVisible();

    // Click label to toggle
    await expect(activeSwitch).toBeChecked();
    await label.click();
    await expect(activeSwitch).not.toBeChecked();
    await label.click();
    await expect(activeSwitch).toBeChecked();

    // Switch to RTL
    await page.locator('[data-testid="opt-dir-rtl"]').click();
    const studioPreview = page.locator('[data-testid="switch-gallery"]');
    await expect(studioPreview).toBeVisible();
    await expect(label).toContainText('الإشعارات');
  });
});
