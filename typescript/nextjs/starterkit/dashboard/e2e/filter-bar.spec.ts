import { expect, test } from '@playwright/test';

test.describe('Dashboard FilterBar Primitive Real-Browser Verification', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/gallery/filter-bar');
    await expect(page.locator('[data-testid="gallery-filter-bar"]')).toBeVisible();
  });

  test('1. Verifies initial toolbar render, role="toolbar", aria-pressed, active tags, and summary', async ({
    page,
  }) => {
    const toolbar = page.locator('[data-testid="interactive-filter-bar"]');
    await expect(toolbar).toBeVisible();
    await expect(toolbar).toHaveAttribute('role', 'toolbar');

    const statusBtn = page.locator('[data-testid="filter-item-status"]');
    await expect(statusBtn).toHaveAttribute('aria-pressed', 'true');
    await expect(statusBtn).toHaveAttribute('data-active', 'true');

    const tagsRow = page.locator('[data-testid="filter-bar-tags"]');
    await expect(tagsRow).toContainText('Status:');
    await expect(tagsRow).toContainText('Paid');
    await expect(tagsRow).toContainText('Category:');
    await expect(tagsRow).toContainText('Infrastructure');
    await expect(tagsRow).toContainText('Cluster:');
    await expect(tagsRow).toContainText('EU-Central');

    const summary = page.locator('[data-testid="filter-bar-summary"]');
    await expect(summary).toHaveAttribute('role', 'status');
    await expect(summary).toContainText('Showing 24 of 148 entries');
  });

  test('2. Verifies interactive facet toggling, tag removal, and Clear all action', async ({
    page,
  }) => {
    const summary = page.locator('[data-testid="filter-bar-summary"]');

    // Remove the Status: Paid tag via its remove button
    const removeStatusBtn = page.getByRole('button', { name: 'Remove filter Status: Paid' });
    await removeStatusBtn.click();

    await expect(page.locator('[data-testid="filter-item-status"]')).toHaveAttribute(
      'aria-pressed',
      'false',
    );
    await expect(summary).toContainText('Showing 52 of 148 entries');

    // Toggle Status back on by clicking the facet button
    await page.locator('[data-testid="filter-item-status"]').click();
    await expect(page.locator('[data-testid="filter-item-status"]')).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    await expect(summary).toContainText('Showing 24 of 148 entries');

    // Click Clear all
    await page.locator('[data-testid="filter-bar-clear"]').click();
    await expect(page.locator('[data-testid="filter-bar-clear"]')).toHaveCount(0);
    await expect(page.locator('[data-testid="filter-bar-tags"]')).toContainText(
      'No active filters applied',
    );
    await expect(summary).toContainText('Showing 148 of 148 entries');
  });

  test('3. Verifies Active Filter Count sidebar presets and SearchInput filtering', async ({
    page,
  }) => {
    const summary = page.locator('[data-testid="filter-bar-summary"]');

    await page.getByRole('button', { name: '1 Active' }).click();
    await expect(summary).toContainText('Showing 94 of 148 entries');

    const searchInput = page.locator('[data-testid="filter-bar-search"]');
    await searchInput.fill('inv');
    await expect(summary).toContainText('Showing 23 of 148 entries');
  });

  test('4. Verifies Disabled state disables search, facet triggers, tag remove, and clear buttons', async ({
    page,
  }) => {
    await page.locator('[data-testid="toggle-filter-disabled"]').click();

    await expect(page.locator('[data-testid="filter-bar-search"]')).toBeDisabled();
    await expect(page.locator('[data-testid="filter-item-status"]')).toBeDisabled();
    await expect(page.getByRole('button', { name: 'Remove filter Status: Paid' })).toBeDisabled();
    await expect(page.locator('[data-testid="filter-bar-clear"]')).toBeDisabled();
  });

  test('5. Verifies RTL (Arabic) mode updates lang, dir, localized triggers, tags, and summary', async ({
    page,
  }) => {
    await page.getByRole('button', { name: 'RTL (Arabic)' }).click();

    const canvas = page.locator('[class*="specimenCanvas"]');
    await expect(canvas).toHaveAttribute('dir', 'rtl');
    await expect(canvas).toHaveAttribute('lang', 'ar');

    const toolbar = page.locator('[data-testid="interactive-filter-bar"]');
    await expect(toolbar).toContainText('الحالة');
    await expect(toolbar).toContainText('مدفوع');
    await expect(toolbar).toContainText('البنية التحتية');
    await expect(toolbar).toContainText('مسح الكل');
    await expect(page.locator('[data-testid="filter-bar-summary"]')).toContainText(
      'عرض 24 من أصل 148 سجل',
    );
  });

  test('6. Verifies 100% shadow-free dashboard compliance', async ({ page }) => {
    const toolbar = page.locator('[data-testid="interactive-filter-bar"]');
    const statusBtn = page.locator('[data-testid="filter-item-status"]');

    const toolbarShadow = await toolbar.evaluate((el) => window.getComputedStyle(el).boxShadow);
    expect(toolbarShadow === 'none' || toolbarShadow === '').toBe(true);

    const btnShadow = await statusBtn.evaluate((el) => window.getComputedStyle(el).boxShadow);
    expect(btnShadow === 'none' || btnShadow === '').toBe(true);
  });
});
