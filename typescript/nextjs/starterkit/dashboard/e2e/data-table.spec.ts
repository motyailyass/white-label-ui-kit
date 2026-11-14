import { expect, test } from '@playwright/test';

test.describe('Dashboard DataTable Studio Real-Browser Verification', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/gallery/data-table');
    await expect(page.locator('[data-testid="data-table-studio"]')).toBeVisible();
  });

  test('1. Verifies density, sorting, filtering, selection, sticky scrolling, pagination, and zero shadows', async ({
    page,
  }) => {
    const container = page.locator('[data-testid="data-table-container"]');
    const table = page.locator('[data-testid="specimen-data-table"]');

    await expect(table).toHaveAttribute('data-density', 'default');
    await expect(table.locator('tbody tr')).toHaveCount(5);

    // Shadow-free policy check in Dashboard
    const containerShadow = await container.evaluate((el) => getComputedStyle(el).boxShadow);
    const tableShadow = await table.evaluate((el) => getComputedStyle(el).boxShadow);
    expect(containerShadow).toBe('none');
    expect(tableShadow).toBe('none');

    // Sort by Customer: ascending -> descending -> none
    const customerHead = table.locator('thead th', { hasText: 'Customer' });
    const customerSortBtn = customerHead.getByRole('button');
    await customerSortBtn.click();
    await expect(customerHead).toHaveAttribute('aria-sort', 'ascending');
    await customerSortBtn.click();
    await expect(customerHead).toHaveAttribute('aria-sort', 'descending');
    await customerSortBtn.click();
    await expect(customerHead).toHaveAttribute('aria-sort', 'none');

    // Switch density to compact and striped
    await page.locator('[data-testid="data-table-density-compact"]').click();
    await expect(table).toHaveAttribute('data-density', 'compact');
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

    // Search filter + clear + page size 10 + sticky header vertical overflow
    const searchInput = page.locator('[data-testid="data-table-search"]');
    await searchInput.fill('Stark');
    await expect(table.locator('tbody tr')).toHaveCount(1);
    await expect(table).toContainText('INV-1006');
    await searchInput.fill('');

    await page.locator('[data-testid="data-table-page-size"]').click();
    await page.locator('[data-testid="data-table-page-size-10"]').click();
    await expect(table.locator('tbody tr')).toHaveCount(10);

    // TableFooter is opt-in (off by default) and toggles on cleanly
    await expect(table.locator('tfoot')).toHaveCount(0);
    await page.locator('[data-testid="toggle-table-footer"]').click();
    await expect(table.locator('tfoot')).toBeVisible();

    // Pagination switches pages dynamically
    await page.locator('[data-testid="data-table-page-2"]').click();
    await expect(table).toContainText('INV-1011');
    await page.locator('[data-testid="data-table-page-1"]').click();

    await page.locator('[data-testid="toggle-table-sticky"]').click();
    await expect(container).toHaveAttribute('data-sticky-header', 'true');
    const scrollViewport = container.locator('[data-orientation]');
    await expect(scrollViewport).toHaveAttribute('data-orientation', 'both');
    const isVerticallyScrollable = await scrollViewport.evaluate(
      (el) => el.scrollHeight > el.clientHeight,
    );
    expect(isVerticallyScrollable).toBe(true);

    // Clear selection & export inline status (zero browser alert)
    await page.locator('[data-testid="data-table-clear-selection"]').click();
    await expect(page.locator('[data-testid="data-table-selection-count"]')).toContainText(
      '0 rows',
    );
    await page.locator('[data-testid="data-table-export-btn"]').click();
    await expect(page.locator('[data-testid="data-table-export-status"]')).toContainText('25');

    // Toggle empty state -> Pagination hides, Export CSV disables, EmptyState recovery button restores rows
    await page.locator('[data-testid="toggle-table-empty"]').click();
    await expect(page.locator('[data-testid="data-table-empty"]')).toBeVisible();
    await expect(page.locator('[data-testid="data-table-page-1"]')).toHaveCount(0);
    await expect(page.locator('[data-testid="data-table-export-btn"]')).toBeDisabled();
    await page.locator('[data-testid="data-table-reset-filters"]').click();
    await expect(table.locator('tbody tr')).toHaveCount(10);
  });

  test('2. Verifies RTL lang="ar" copy, normal Arabic header tracking, column order, and mobile overflow', async ({
    page,
  }) => {
    await page.locator('[data-testid="data-table-dir-rtl"]').click();

    const canvas = page.locator('[data-testid="data-table-canvas"]');
    const table = page.locator('[data-testid="specimen-data-table"]');

    await expect(canvas).toHaveAttribute('dir', 'rtl');
    await expect(canvas).toHaveAttribute('lang', 'ar');

    const invoiceHead = table.locator('thead th', { hasText: 'رقم الفاتورة' });
    const customerHead = table.locator('thead th', { hasText: 'العميل' });
    const amountHead = table.locator('thead th', { hasText: 'المبلغ' });

    await expect(invoiceHead).toBeVisible();
    await expect(customerHead).toBeVisible();
    await expect(amountHead).toBeVisible();

    // Arabic uppercase headers must restore letter-spacing: normal so glyphs join cleanly
    const headTracking = await customerHead.evaluate((el) => getComputedStyle(el).letterSpacing);
    expect(headTracking).toBe('normal');

    // In RTL, logical start (Invoice ID) sits physically to the RIGHT of logical end (Amount)
    const idBox = await invoiceHead.boundingBox();
    const amountBox = await amountHead.boundingBox();
    expect(idBox).not.toBeNull();
    expect(amountBox).not.toBeNull();
    expect(idBox!.x).toBeGreaterThan(amountBox!.x);

    // Zero document horizontal overflow on 375x812 mobile viewport (table scrolls inside TableContainer)
    await page.setViewportSize({ width: 375, height: 812 });
    const hasDocumentOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
    );
    expect(hasDocumentOverflow).toBe(false);
  });
});
