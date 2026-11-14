import { expect, test } from '@playwright/test';

test.describe('Website Chart Primitive Real-Browser Verification', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/gallery/chart');
    await expect(page.locator('[data-testid="gallery-chart"]')).toBeVisible();
  });

  test('1. Verifies initial BarChart render, ARIA roles, bars, and legend', async ({ page }) => {
    const container = page.locator('[data-testid="interactive-chart"]');
    await expect(container).toBeVisible();
    await expect(container).toHaveAttribute('role', 'region');

    const barChart = page.locator('[data-testid="chart-bar"]');
    await expect(barChart).toBeVisible();
    await expect(barChart.locator('svg')).toHaveAttribute('role', 'img');
    await expect(barChart.locator('rect')).toHaveCount(6);

    const legend = page.locator('[data-testid="chart-legend"]');
    await expect(legend).toBeVisible();
    await expect(legend).toContainText('Revenue');
  });

  test('2. Verifies keyboard focus on bar node reveals tooltip', async ({ page }) => {
    const firstBar = page.locator('[data-testid="chart-bar"] rect').first();
    await firstBar.focus();

    const tooltip = page.locator('[data-testid="chart-tooltip"]');
    await expect(tooltip).toBeVisible();
    await expect(tooltip).toContainText('Jan');
    await expect(tooltip).toContainText('$420k');
  });

  test('3. Verifies switching between Bar, Line, and Donut chart types', async ({ page }) => {
    await page.getByRole('button', { name: 'Line', exact: true }).click();
    const lineChart = page.locator('[data-testid="chart-line"]');
    await expect(lineChart).toBeVisible();
    await expect(lineChart.locator('circle')).toHaveCount(7);

    await page.getByRole('button', { name: 'Donut', exact: true }).click();
    const donutChart = page.locator('[data-testid="chart-donut"]');
    await expect(donutChart).toBeVisible();
    await expect(donutChart.locator('circle')).toHaveCount(4);
    await expect(donutChart).toContainText('100%');
  });

  test('4. Verifies Show Gridlines and Show Legend toggles', async ({ page }) => {
    const legend = page.locator('[data-testid="chart-legend"]');
    await expect(legend).toBeVisible();

    await page.locator('[data-testid="toggle-chart-legend"]').click();
    await expect(legend).toHaveCount(0);

    await expect(page.locator('[data-testid="chart-bar"] svg line')).toHaveCount(5);
    await page.locator('[data-testid="toggle-chart-grid"]').click();
    await expect(page.locator('[data-testid="chart-bar"] svg line')).toHaveCount(1);
  });

  test('5. Verifies RTL (Arabic) mode updates lang, dir, localized labels, and tooltip', async ({
    page,
  }) => {
    await page.getByRole('button', { name: 'RTL (Arabic)' }).click();

    const canvas = page.locator('[class*="specimenCanvas"]');
    await expect(canvas).toHaveAttribute('dir', 'rtl');
    await expect(canvas).toHaveAttribute('lang', 'ar');

    await expect(page.locator('[data-testid="chart-legend"]')).toContainText('الإيرادات');

    const firstBar = page.locator('[data-testid="chart-bar"] rect').first();
    await firstBar.focus();
    await expect(page.locator('[data-testid="chart-tooltip"]')).toContainText('يناير');
  });
});
