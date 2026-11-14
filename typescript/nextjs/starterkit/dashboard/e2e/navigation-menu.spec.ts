import { expect, test } from '@playwright/test';

test.describe('Dashboard NavigationMenu Primitive Real-Browser Verification', () => {
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
    await expect(productsTrigger).toHaveAttribute('aria-haspopup', 'menu');

    const productsContent = page.locator('[data-testid="nav-content-products"]');
    await expect(productsContent).toBeVisible();
    await expect(productsContent).toContainText('Analytics');
  });

  test('2. Verifies switching flyout triggers and auto-closing on link click', async ({ page }) => {
    const resourcesTrigger = page.locator('[data-testid="nav-trigger-resources"]');
    await resourcesTrigger.click();

    await expect(resourcesTrigger).toHaveAttribute('aria-expanded', 'true');
    await expect(page.locator('[data-testid="nav-content-products"]')).toHaveCount(0);
    await expect(page.locator('[data-testid="nav-content-resources"]')).toBeVisible();

    await page.locator('[data-testid="nav-link-api"]').click();
    await expect(resourcesTrigger).toHaveAttribute('aria-expanded', 'false');
    await expect(page.locator('[data-testid="nav-content-resources"]')).toHaveCount(0);
  });

  test('3. Verifies keyboard navigation (ArrowDown into flyout, Escape restores trigger focus)', async ({
    page,
  }) => {
    const productsTrigger = page.locator('[data-testid="nav-trigger-products"]');
    await productsTrigger.focus();

    await page.keyboard.press('ArrowDown');
    const firstLink = page.locator('[data-testid="nav-link-analytics"]');
    await expect(firstLink).toBeFocused();

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

  test('5. Verifies RTL (Arabic) mode updates lang, dir, localized labels, and RTL keyboard direction', async ({
    page,
  }) => {
    await page.getByRole('button', { name: 'RTL (Arabic)' }).click();

    const canvas = page.locator('[class*="specimenCanvas"]');
    await expect(canvas).toHaveAttribute('dir', 'rtl');
    await expect(canvas).toHaveAttribute('lang', 'ar');

    const productsTrigger = page.locator('[data-testid="nav-trigger-products"]');
    await expect(productsTrigger).toContainText('المنتجات');
    await productsTrigger.focus();

    // In RTL, ArrowLeft moves to next top-level item ('resources')
    await page.keyboard.press('ArrowLeft');
    await expect(page.locator('[data-testid="nav-trigger-resources"]')).toBeFocused();
  });

  test('6. Verifies 100% shadow-free dashboard compliance', async ({ page }) => {
    const nav = page.locator('[data-testid="interactive-nav-menu"]');
    const content = page.locator('[data-testid="nav-content-products"]');

    const navShadow = await nav.evaluate((el) => window.getComputedStyle(el).boxShadow);
    expect(navShadow === 'none' || navShadow === '').toBe(true);

    const contentShadow = await content.evaluate((el) => window.getComputedStyle(el).boxShadow);
    expect(contentShadow === 'none' || contentShadow === '').toBe(true);
  });
});
