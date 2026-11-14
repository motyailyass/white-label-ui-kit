import { expect, test } from '@playwright/test';

test.describe('Website Collapsible Primitive Real-Browser Verification', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/gallery/collapsible');
    await expect(page.locator('[data-testid="gallery-collapsible"]')).toBeVisible();
  });

  test('1. Verifies rendering, initial open state, and bidirectional ARIA linkage', async ({
    page,
  }) => {
    const collapsible = page.locator('[data-testid="interactive-collapsible"]');
    await expect(collapsible).toBeVisible();
    await expect(collapsible).toHaveAttribute('data-state', 'open');

    const trigger = page.locator('[data-testid="collapsible-trigger"]');
    await expect(trigger).toBeVisible();
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');
    await expect(trigger).toHaveAttribute('data-state', 'open');

    const content = page.locator('[data-testid="collapsible-content"]');
    await expect(content).toBeVisible();

    // Check bidirectional ARIA linkage
    const controlsId = await trigger.getAttribute('aria-controls');
    expect(controlsId).toBeTruthy();

    const wrapper = page.locator(`[id="${controlsId}"]`);
    await expect(wrapper).toBeVisible();
    await expect(wrapper).toHaveAttribute('role', 'region');

    const triggerId = await trigger.getAttribute('id');
    expect(triggerId).toBeTruthy();
    await expect(wrapper).toHaveAttribute('aria-labelledby', triggerId!);
  });

  test('2. Verifies clicking trigger collapses and expands content smoothly', async ({ page }) => {
    const trigger = page.locator('[data-testid="collapsible-trigger"]');
    const collapsible = page.locator('[data-testid="interactive-collapsible"]');

    // Click to collapse
    await trigger.click();
    await expect(collapsible).toHaveAttribute('data-state', 'closed');
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await expect(trigger).toHaveAttribute('data-state', 'closed');

    // Click to expand
    await trigger.click();
    await expect(collapsible).toHaveAttribute('data-state', 'open');
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');
    await expect(trigger).toHaveAttribute('data-state', 'open');
  });

  test('3. Verifies disabled toggle in studio disables trigger and prevents interaction', async ({
    page,
  }) => {
    const trigger = page.locator('[data-testid="collapsible-trigger"]');
    const collapsible = page.locator('[data-testid="interactive-collapsible"]');

    // Toggle disabled
    const disabledToggle = page.locator('[data-testid="toggle-collapsible-disabled"]');
    await disabledToggle.click();

    await expect(collapsible).toHaveAttribute('data-disabled', '');
    await expect(trigger).toBeDisabled();
    await expect(trigger).toHaveAttribute('data-disabled', '');

    // Attempt click on disabled trigger
    await trigger.click({ force: true });
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');
    await expect(collapsible).toHaveAttribute('data-state', 'open');
  });

  test('4. Verifies 100% shadow-free dashboard policy compliance', async ({ page }) => {
    const trigger = page.locator('[data-testid="collapsible-trigger"]');
    const content = page.locator('[data-testid="collapsible-content"]');

    for (const el of [trigger, content]) {
      const boxShadow = await el.evaluate((node) => {
        const computed = window.getComputedStyle(node);
        return computed.boxShadow;
      });
      expect(boxShadow === 'none' || boxShadow === '').toBeTruthy();
    }
  });
});
