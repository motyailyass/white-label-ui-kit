import { expect, test } from '@playwright/test';

test.describe('Website NavigationMenu Primitive Real-Browser Verification', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/gallery/navigation-menu');
    await expect(page.locator('[data-testid="gallery-navigation-menu"]')).toBeVisible();
  });

  test('1. Verifies initial render, ARIA roles, open flyout panel, and submenu links', async ({
    page,
  }) => {
    const nav = page.locator('[data-testid="interactive-nav-menu"]');
    await expect(nav).toBeVisible();
    await expect(nav.locator('[role="menubar"]')).toHaveAttribute('aria-orientation', 'horizontal');

    const productsTrigger = page.locator('[data-testid="nav-trigger-products"]');
    await expect(productsTrigger).toHaveAttribute('aria-expanded', 'true');
    await expect(page.locator('[data-testid="nav-content-products"]')).toContainText('Analytics');
  });

  test('2. Verifies switching flyout triggers and auto-closing on link click', async ({ page }) => {
    const resourcesTrigger = page.locator('[data-testid="nav-trigger-resources"]');
    await resourcesTrigger.click();

    await expect(resourcesTrigger).toHaveAttribute('aria-expanded', 'true');
    await expect(page.locator('[data-testid="nav-content-resources"]')).toBeVisible();

    await page.locator('[data-testid="nav-link-api"]').click();
    await expect(resourcesTrigger).toHaveAttribute('aria-expanded', 'false');
  });

  test('3. Verifies keyboard navigation (ArrowDown into flyout, Escape restores trigger focus)', async ({
    page,
  }) => {
    const productsTrigger = page.locator('[data-testid="nav-trigger-products"]');
    await productsTrigger.focus();

    await page.keyboard.press('ArrowDown');
    await expect(page.locator('[data-testid="nav-link-analytics"]')).toBeFocused();

    await page.keyboard.press('Escape');
    await expect(productsTrigger).toHaveAttribute('aria-expanded', 'false');
    await expect(productsTrigger).toBeFocused();
  });

  test('4. Verifies Scenario switching, Orientation toggle, and Disabled State toggle', async ({
    page,
  }) => {
    await page.getByRole('button', { name: 'Text Only' }).click();
    await expect(page.locator('[data-testid="nav-trigger-products"]')).toHaveAttribute(
      'aria-expanded',
      'true',
    );

    await page.getByRole('button', { name: 'Vertical' }).click();
    await expect(
      page.locator('[data-testid="interactive-nav-menu"] [role="menubar"]'),
    ).toHaveAttribute('aria-orientation', 'vertical');

    await page.locator('[data-testid="toggle-nav-disabled"]').click();
    await expect(page.locator('[data-testid="nav-trigger-products"]')).toBeDisabled();
  });

  test('5. Verifies RTL (Arabic) mode updates lang, dir, and localized labels', async ({
    page,
  }) => {
    await page.getByRole('button', { name: 'RTL (Arabic)' }).click();

    const canvas = page.locator('[class*="specimenCanvas"]');
    await expect(canvas).toHaveAttribute('dir', 'rtl');
    await expect(canvas).toHaveAttribute('lang', 'ar');

    await expect(page.locator('[data-testid="nav-trigger-products"]')).toContainText('المنتجات');
  });
});
