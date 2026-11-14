import { expect, test } from '@playwright/test';

test.describe('Dashboard Checkbox Primitive Real-Browser Verification', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/gallery/checkbox');
    await expect(page.locator('[data-testid="checkbox-gallery"]')).toBeVisible();
  });

  test('verifies native input real hitbox target dimensions and six-step scale in all-sizes view', async ({
    page,
  }) => {
    const isCoarse = await page.evaluate(() => window.matchMedia('(pointer: coarse)').matches);

    // 1. Dashboard product default (omitted size): md (36px target, 16px indicator box)
    const activeCheckbox = page.locator('[data-testid="studio-active-checkbox"]');
    await expect(activeCheckbox).toBeVisible();

    const activeRoot = activeCheckbox.locator('..');
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
      const specimen = page.locator(`[data-testid="studio-size-checkbox-${sz}"]`);
      await expect(specimen).toBeVisible();
      const root = specimen.locator('..');
      const box = await root.boundingBox();
      expect(box).not.toBeNull();

      if (isCoarse) {
        expect(box!.height).toBeGreaterThanOrEqual(Math.max(48, expectedTarget));
      } else {
        expect(box!.height).toBeCloseTo(expectedTarget, 1);
      }
    }
  });

  test('verifies real hitbox edge clicks toggle the native input without pseudo-element tricks', async ({
    page,
  }) => {
    const activeCheckbox = page.locator('[data-testid="studio-active-checkbox"]');
    await expect(activeCheckbox).toBeVisible();
    await expect(activeCheckbox).toBeChecked();

    const root = activeCheckbox.locator('..');
    const rootBox = await root.boundingBox();
    expect(rootBox).not.toBeNull();

    // Click near top-left edge of the hitbox (x=2, y=2)
    await root.click({ position: { x: 2, y: 2 } });
    await expect(activeCheckbox).not.toBeChecked();

    // Click near bottom-right edge of the hitbox
    await root.click({ position: { x: rootBox!.width - 2, y: rootBox!.height - 2 } });
    await expect(activeCheckbox).toBeChecked();
  });

  test('verifies keyboard Space toggles checkbox but Enter does not', async ({ page }) => {
    const activeCheckbox = page.locator('[data-testid="studio-active-checkbox"]');
    await expect(activeCheckbox).toBeVisible();
    await expect(activeCheckbox).toBeChecked();

    await activeCheckbox.focus();
    await expect(activeCheckbox).toBeFocused();

    // Enter key should NOT toggle native checkbox
    await page.keyboard.press('Enter');
    await expect(activeCheckbox).toBeChecked();

    // Space key toggles native checkbox
    await page.keyboard.press('Space');
    await expect(activeCheckbox).not.toBeChecked();

    await page.keyboard.press('Space');
    await expect(activeCheckbox).toBeChecked();
  });

  test('verifies comfortable touch-target expands hit area to at least 48x48px', async ({
    page,
  }) => {
    // Select XS size first
    await page.locator('[data-testid="opt-size-xs"]').click();
    const activeCheckbox = page.locator('[data-testid="studio-active-checkbox"]');
    const root = activeCheckbox.locator('..');

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

  test('verifies common configurations presets bar', async ({ page }) => {
    const activeCheckbox = page.locator('[data-testid="studio-active-checkbox"]');

    // 1. Marketing Preset (Unchecked)
    await page.locator('[data-testid="preset-quick-checkbox-marketing"]').click();
    await expect(activeCheckbox).not.toBeChecked();

    // 2. Bulk Permissions Preset (Indeterminate Mixed)
    await page.locator('[data-testid="preset-quick-checkbox-permissions"]').click();
    const isIndeterminate = await activeCheckbox.evaluate(
      (el) => (el as HTMLInputElement).indeterminate,
    );
    expect(isIndeterminate).toBe(true);

    // 3. Crash Diagnostics Preset
    await page.locator('[data-testid="preset-quick-checkbox-diagnostics"]').click();
    await expect(activeCheckbox).toBeChecked();

    // 4. Security Baseline Preset
    await page.locator('[data-testid="preset-quick-checkbox-security"]').click();
    await expect(activeCheckbox).toBeChecked();

    // 5. Terms Preset (Default Checked)
    await page.locator('[data-testid="preset-quick-checkbox-terms"]').click();
    await expect(activeCheckbox).toBeEnabled();
    await expect(activeCheckbox).toBeChecked();

    // 6. Dynamic State Switcher: Invalid (unchecks and triggers alert)
    await page.locator('[data-testid="opt-state-invalid"]').click();
    await expect(activeCheckbox).not.toBeChecked();
    await expect(activeCheckbox).toHaveAttribute('aria-invalid', 'true');
    await expect(page.locator('[data-testid="checkbox-gallery"] [role="alert"]')).toBeVisible();

    // Checking clears invalid state
    await activeCheckbox.click();
    await expect(activeCheckbox).toBeChecked();
    await expect(page.locator('[data-testid="checkbox-gallery"] [role="alert"]')).not.toBeVisible();
  });

  test('verifies external label click toggles checkbox and respects RTL direction switch', async ({
    page,
  }) => {
    const activeCheckbox = page.locator('[data-testid="studio-active-checkbox"]');
    const checkboxId = await activeCheckbox.getAttribute('id');
    const label = page.locator(`label[for="${checkboxId}"]`);
    await expect(label).toBeVisible();

    // Click label to toggle
    await expect(activeCheckbox).toBeChecked();
    await label.click();
    await expect(activeCheckbox).not.toBeChecked();
    await label.click();
    await expect(activeCheckbox).toBeChecked();

    // Switch to RTL
    await page.locator('[data-testid="opt-dir-rtl"]').click();
    const studioPreview = page.locator('[data-testid="checkbox-gallery"]');
    await expect(studioPreview).toBeVisible();
    await expect(label).toContainText('أوافق');
  });
});
