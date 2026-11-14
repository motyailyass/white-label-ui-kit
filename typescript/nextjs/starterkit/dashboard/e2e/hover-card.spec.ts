import { expect, test } from '@playwright/test';

test.describe('Dashboard HoverCard Primitive Real-Browser Verification', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/gallery/hover-card');
    await expect(page.locator('[data-testid="gallery-hover-card"]')).toBeVisible();
  });

  test('1. Verifies rendering, initial closed state, and trigger ARIA attributes', async ({
    page,
  }) => {
    const hoverCard = page.locator('[data-testid="interactive-hover-card"]');
    await expect(hoverCard).toBeVisible();

    const trigger = hoverCard.locator('button');
    await expect(trigger).toBeVisible();
    await expect(trigger).toHaveAttribute('aria-haspopup', 'dialog');
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await expect(trigger).toHaveAttribute('data-state', 'closed');

    const content = hoverCard.locator('[role="dialog"]');
    await expect(content).toHaveAttribute('data-state', 'closed');
  });

  test('2. Verifies hovering trigger opens preview and cursor can safely travel into card', async ({
    page,
  }) => {
    const hoverCard = page.locator('[data-testid="interactive-hover-card"]');
    const trigger = hoverCard.locator('button');
    const content = hoverCard.locator('[role="dialog"]');

    // Hover over trigger
    await trigger.hover();

    // Wait for openDelay to open the card
    await expect(content).toHaveAttribute('data-state', 'open', { timeout: 2000 });
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');
    await expect(page.getByText('Lead Systems Architect')).toBeVisible();

    // Move cursor into card content (safe pointer bridge)
    await content.hover();
    await expect(content).toHaveAttribute('data-state', 'open');

    // Move mouse away to an outside area
    await page.mouse.move(10, 10);
    await expect(content).toHaveAttribute('data-state', 'closed', { timeout: 2000 });
  });

  test('3. Verifies keyboard focus opens card and Escape dismisses it immediately', async ({
    page,
  }) => {
    const hoverCard = page.locator('[data-testid="interactive-hover-card"]');
    const trigger = hoverCard.locator('button');
    const content = hoverCard.locator('[role="dialog"]');

    // Focus trigger via keyboard
    await trigger.focus();
    await expect(content).toHaveAttribute('data-state', 'open', { timeout: 2000 });

    // Press Escape to dismiss
    await page.keyboard.press('Escape');
    await expect(content).toHaveAttribute('data-state', 'closed');
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });

  test('4. Verifies switching direction to RTL (Arabic) renders authentic Arabic profile and lang attribute', async ({
    page,
  }) => {
    // Switch to RTL (Arabic)
    const rtlOption = page.getByRole('button', { name: 'RTL (Arabic)' });
    await rtlOption.click();

    // Verify canvas has dir="rtl" and lang="ar"
    const canvas = page.locator('[class*="specimenCanvas"][dir="rtl"][lang="ar"]');
    await expect(canvas).toBeVisible();

    // Hover to reveal card
    const hoverCard = page.locator('[data-testid="interactive-hover-card"]');
    const trigger = hoverCard.locator('button');
    await trigger.hover();

    // Verify Arabic content is rendered cleanly
    await expect(page.getByText('صوفيا منصور')).toBeVisible();
    await expect(page.getByText('تتابعهم')).toBeVisible();
  });

  test('5. Verifies 100% shadow-free dashboard policy compliance', async ({ page }) => {
    const hoverCard = page.locator('[data-testid="interactive-hover-card"]');
    const trigger = hoverCard.locator('button');
    const content = hoverCard.locator('[role="dialog"]');

    // Open card
    await trigger.hover();
    await expect(content).toHaveAttribute('data-state', 'open', { timeout: 2000 });

    for (const el of [trigger, content]) {
      const boxShadow = await el.evaluate((node) => {
        return window.getComputedStyle(node).boxShadow;
      });
      expect(boxShadow === 'none' || boxShadow === '').toBeTruthy();
    }
  });
});
