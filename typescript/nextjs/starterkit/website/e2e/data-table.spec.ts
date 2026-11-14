import { expect, test } from '@playwright/test';

test.describe('Website DataTable Studio Real-Browser Verification', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/gallery/data-table');
    await expect(page.locator('[data-testid="data-table-studio"]')).toBeVisible();
  });

  test('1. Verifies density, sorting, filtering, pagination, and empty state', async ({ page }) => {
    const table = page.locator('[data-testid="specimen-data-table"]');
    await expect(table).toHaveAttribute('data-density', 'default');
    await expect(table.locator('tbody tr')).toHaveCount(5);

    const amountHead = table.locator('thead th', { hasText: 'Amount' });
    await amountHead.getByRole('button').click();
    await expect(amountHead).toHaveAttribute('aria-sort', 'ascending');

    await page.locator('[data-testid="data-table-density-comfortable"]').click();
    await expect(table).toHaveAttribute('data-density', 'comfortable');

    await page.locator('[data-testid="toggle-table-striped"]').click();
    await expect(table).toHaveAttribute('data-striped', 'true');
    const [evenRowBg, oddRowBg] = await Promise.all([
      table
        .locator('tbody tr')
        .nth(1)
        .evaluate((el) => getComputedStyle(el).backgroundColor),
      table
        .locator('tbody tr')
        .nth(2)
        .evaluate((el) => getComputedStyle(el).backgroundColor),
    ]);
    expect(evenRowBg).not.toBe(oddRowBg);

    const page2Btn = page.locator('[data-testid="data-table-page-2"]');
    await page2Btn.click();
    await expect(page2Btn).toHaveAttribute('aria-current', 'page');
    await expect(table).toContainText('INV-1003');

    await page.locator('[data-testid="toggle-table-empty"]').click();
    await expect(page.locator('[data-testid="data-table-empty"]')).toBeVisible();
    await expect(page.locator('[data-testid="data-table-page-1"]')).toHaveCount(0);
    await expect(page.locator('[data-testid="data-table-export-btn"]')).toBeDisabled();
    await page.locator('[data-testid="data-table-reset-filters"]').click();
    await expect(table.locator('tbody tr')).toHaveCount(5);
  });

  test('2. Verifies RTL lang="ar" copy, column ordering, Arabic header tracking, and mobile containment', async ({
    page,
  }) => {
    await page.locator('[data-testid="data-table-dir-rtl"]').click();

    const canvas = page.locator('[data-testid="data-table-canvas"]');
    const table = page.locator('[data-testid="specimen-data-table"]');

    await expect(canvas).toHaveAttribute('dir', 'rtl');
    await expect(canvas).toHaveAttribute('lang', 'ar');

    const invoiceHead = table.locator('thead th', { hasText: 'رقم الفاتورة' });
    const amountHead = table.locator('thead th', { hasText: 'المبلغ' });

    await expect(invoiceHead).toBeVisible();
    await expect(amountHead).toBeVisible();

    const headTracking = await invoiceHead.evaluate((el) => getComputedStyle(el).letterSpacing);
    expect(headTracking).toBe('normal');

    const idBox = await invoiceHead.boundingBox();
    const amountBox = await amountHead.boundingBox();
    expect(idBox).not.toBeNull();
    expect(amountBox).not.toBeNull();
    expect(idBox!.x).toBeGreaterThan(amountBox!.x);

    await page.setViewportSize({ width: 375, height: 812 });
    const hasDocumentOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
    );
    expect(hasDocumentOverflow).toBe(false);
  });
});
