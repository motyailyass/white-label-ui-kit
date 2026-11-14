import { expect, test } from '@playwright/test';

test.describe('Dashboard Stepper Primitive Real-Browser Verification', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/gallery/stepper');
    await expect(page.locator('[data-testid="gallery-stepper"]')).toBeVisible();
  });

  test('1. Verifies rendering, initial active step, and semantic progress list attributes', async ({
    page,
  }) => {
    const stepper = page.locator('[data-testid="interactive-stepper"]');
    await expect(stepper).toBeVisible();
    await expect(stepper).toHaveAttribute('data-orientation', 'horizontal');
    await expect(stepper).toHaveAttribute('data-size', 'md');

    const steps = stepper.locator('li');
    await expect(steps).toHaveCount(4);

    // Initial state: Step 1 (index 1) is active (current)
    await expect(steps.nth(0)).toHaveAttribute('data-status', 'complete');
    await expect(steps.nth(1)).toHaveAttribute('data-status', 'current');
    await expect(steps.nth(1)).toHaveAttribute('aria-current', 'step');
    await expect(steps.nth(2)).toHaveAttribute('data-status', 'upcoming');
    await expect(steps.nth(3)).toHaveAttribute('data-status', 'upcoming');
  });

  test('2. Verifies interactive step progression via Next Step and Previous Step buttons', async ({
    page,
  }) => {
    const stepper = page.locator('[data-testid="interactive-stepper"]');
    const steps = stepper.locator('li');

    // Click Next Step
    const nextBtn = page.getByRole('button', { name: 'Next Step' });
    await nextBtn.click();

    // Now Step 3 (index 2) should be current
    await expect(steps.nth(2)).toHaveAttribute('data-status', 'current');
    await expect(steps.nth(2)).toHaveAttribute('aria-current', 'step');
    await expect(steps.nth(1)).toHaveAttribute('data-status', 'complete');

    // Click Previous Step
    const prevBtn = page.getByRole('button', { name: 'Previous Step' });
    await prevBtn.click();
    await expect(steps.nth(1)).toHaveAttribute('data-status', 'current');
    await expect(steps.nth(1)).toHaveAttribute('aria-current', 'step');
  });

  test('3. Verifies clickable direct step navigation when clickable is enabled', async ({
    page,
  }) => {
    const stepper = page.locator('[data-testid="interactive-stepper"]');
    const steps = stepper.locator('li');

    // Click directly on Step 4 (index 3)
    const step4Button = steps.nth(3).locator('button');
    await expect(step4Button).toBeVisible();
    await step4Button.click();

    await expect(steps.nth(3)).toHaveAttribute('data-status', 'current');
    await expect(steps.nth(3)).toHaveAttribute('aria-current', 'step');
    await expect(steps.nth(0)).toHaveAttribute('data-status', 'complete');
    await expect(steps.nth(1)).toHaveAttribute('data-status', 'complete');
    await expect(steps.nth(2)).toHaveAttribute('data-status', 'complete');
  });

  test('4. Verifies disabling clickable navigation renders static non-interactive steps', async ({
    page,
  }) => {
    // Toggle off clickable
    const clickableToggle = page.locator('[data-testid="toggle-stepper-clickable"]');
    await clickableToggle.click();

    const stepper = page.locator('[data-testid="interactive-stepper"]');
    const stepButtons = stepper.locator('button');
    await expect(stepButtons).toHaveCount(0);
  });

  test('5. Verifies 100% shadow-free dashboard policy compliance', async ({ page }) => {
    const stepper = page.locator('[data-testid="interactive-stepper"]');
    const indicators = stepper.locator('[class*="indicator"]');

    const count = await indicators.count();
    for (let i = 0; i < count; i++) {
      const boxShadow = await indicators.nth(i).evaluate((node) => {
        return window.getComputedStyle(node).boxShadow;
      });
      expect(boxShadow === 'none' || boxShadow === '').toBeTruthy();
    }
  });

  test('6. Verifies switching content display mode to Indicator Only and Title Only', async ({
    page,
  }) => {
    const stepper = page.locator('[data-testid="interactive-stepper"]');

    // Switch to Title Only
    const titleOnlyOption = page.getByRole('button', { name: 'Title Only' });
    await titleOnlyOption.click();

    await expect(page.getByText('Account')).toBeVisible();
    await expect(page.getByText('Organization info')).not.toBeVisible();

    // Switch to Indicator Only
    const indicatorOption = page.getByRole('button', { name: 'Indicator', exact: true });
    await indicatorOption.click();

    await expect(page.getByText('Account')).not.toBeVisible();
    const firstStep = stepper.locator('li').first();
    await expect(firstStep).toHaveAttribute('aria-label', 'Step 1: Account');
  });
});
