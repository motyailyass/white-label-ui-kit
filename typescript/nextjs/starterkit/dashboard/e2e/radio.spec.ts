import { expect, test } from '@playwright/test';

test.describe('Dashboard Radio Primitive Real-Browser Verification', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/gallery/radio');
    await expect(page.locator('[data-testid="radio-gallery"]')).toBeVisible();
  });

  test('verifies native input real hitbox target dimensions and six-step scale in all-sizes view', async ({
    page,
  }) => {
    const isCoarse = await page.evaluate(() => window.matchMedia('(pointer: coarse)').matches);

    // 1. Dashboard product default (omitted size): md (36px target, 16px indicator circle)
    const annualRadio = page.locator('[data-testid="studio-radio-annual"]');
    await expect(annualRadio).toBeVisible();

    const root = annualRadio.locator('..');
    const rootBox = await root.boundingBox();
    expect(rootBox).not.toBeNull();

    if (isCoarse) {
      expect(rootBox!.height).toBeGreaterThanOrEqual(48);
      expect(rootBox!.width).toBeGreaterThanOrEqual(48);
    } else {
      expect(rootBox!.height).toBeCloseTo(36, 1);
      expect(rootBox!.width).toBeCloseTo(36, 1);
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
      const specimen = page.locator(`[data-testid="studio-size-radio-${sz}-1"]`);
      await expect(specimen).toBeVisible();
      const specimenRoot = specimen.locator('..');
      const box = await specimenRoot.boundingBox();
      expect(box).not.toBeNull();

      if (isCoarse) {
        expect(box!.height).toBeGreaterThanOrEqual(Math.max(48, expectedTarget));
      } else {
        expect(box!.height).toBeCloseTo(expectedTarget, 1);
      }
    }
  });

  test('verifies radio mutual exclusivity and selection toggle', async ({ page }) => {
    const monthlyRadio = page.locator('[data-testid="studio-radio-monthly"]');
    const annualRadio = page.locator('[data-testid="studio-radio-annual"]');

    await expect(annualRadio).toBeChecked();
    await expect(monthlyRadio).not.toBeChecked();

    // Click monthly
    await monthlyRadio.click();
    await expect(monthlyRadio).toBeChecked();
    await expect(annualRadio).not.toBeChecked();

    // Click annual back
    await annualRadio.click();
    await expect(annualRadio).toBeChecked();
    await expect(monthlyRadio).not.toBeChecked();
  });

  test('verifies keyboard Arrow key navigation between options', async ({ page }) => {
    const monthlyRadio = page.locator('[data-testid="studio-radio-monthly"]');
    const annualRadio = page.locator('[data-testid="studio-radio-annual"]');

    await annualRadio.focus();
    await expect(annualRadio).toBeFocused();

    // Press ArrowUp or ArrowLeft to navigate to previous radio in the group
    await page.keyboard.press('ArrowUp');
    await expect(monthlyRadio).toBeChecked();
    await expect(annualRadio).not.toBeChecked();

    // Press ArrowDown to navigate back
    await page.keyboard.press('ArrowDown');
    await expect(annualRadio).toBeChecked();
    await expect(monthlyRadio).not.toBeChecked();
  });

  test('verifies comfortable touch-target expands hit area to at least 48x48px', async ({
    page,
  }) => {
    // Select XS size
    await page.locator('[data-testid="opt-size-xs"]').click();
    const annualRadio = page.locator('[data-testid="studio-radio-annual"]');
    const root = annualRadio.locator('..');

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
    // 1. Subscription Tier Preset
    await page.locator('[data-testid="preset-quick-radio-tier"]').click();
    const proRadio = page.locator('[data-testid="studio-radio-pro"]');
    await expect(proRadio).toBeVisible();
    await expect(proRadio).toBeChecked();

    // 2. Deployment Model Preset
    await page.locator('[data-testid="preset-quick-radio-deployment"]').click();
    const cloudRadio = page.locator('[data-testid="studio-radio-cloud"]');
    await expect(cloudRadio).toBeVisible();
    await expect(cloudRadio).toBeChecked();

    // 3. Data Residency Preset
    await page.locator('[data-testid="preset-quick-radio-residency"]').click();
    const euRadio = page.locator('[data-testid="studio-radio-eu"]');
    await expect(euRadio).toBeVisible();
    await expect(euRadio).toBeChecked();

    // 4. Notification Cadence Preset
    await page.locator('[data-testid="preset-quick-radio-notification"]').click();
    const dailyRadio = page.locator('[data-testid="studio-radio-daily"]');
    await expect(dailyRadio).toBeVisible();
    await expect(dailyRadio).toBeChecked();

    // 5. Dynamic Interaction State: Switch to Invalid (clears selection, triggers alert)
    await page.locator('[data-testid="opt-state-invalid"]').click();
    await expect(dailyRadio).not.toBeChecked();
    await expect(dailyRadio).toHaveAttribute('aria-invalid', 'true');
    await expect(page.locator('[data-testid="radio-gallery"] [role="alert"]')).toBeVisible();

    // Clicking an option satisfies the requirement and clears invalid state
    await dailyRadio.click();
    await expect(dailyRadio).toBeChecked();
    await expect(page.locator('[data-testid="radio-gallery"] [role="alert"]')).not.toBeVisible();

    // 6. Dynamic Interaction State: Switch to Disabled
    await page.locator('[data-testid="opt-state-disabled"]').click();
    await expect(dailyRadio).toBeDisabled();
  });
});
