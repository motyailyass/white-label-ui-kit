import { expect, test } from '@playwright/test';

test.describe('Website Timeline Primitive Real-Browser Verification', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/gallery/timeline');
    await expect(page.locator('[data-testid="gallery-timeline"]')).toBeVisible();
  });

  test('1. Verifies rendering, semantic list structure, and chronological items', async ({
    page,
  }) => {
    const timeline = page.locator('[data-testid="interactive-timeline"]');
    await expect(timeline).toBeVisible();

    const items = timeline.locator('li');
    await expect(items).toHaveCount(3);

    // Initial items: Item 1 and 2 are complete, Item 3 is active with animated spinner
    await expect(items.nth(0)).toHaveAttribute('data-status', 'complete');
    await expect(items.nth(1)).toHaveAttribute('data-status', 'complete');
    await expect(items.nth(2)).toHaveAttribute('data-status', 'active');
    await expect(items.nth(2).locator('span[data-size="xs"]')).toBeVisible();

    // Headers and time elements
    await expect(page.getByText('Repository Fork Created')).toBeVisible();
    await expect(page.getByText('Automated Checks Passed')).toBeVisible();
    await expect(page.getByText('Edge Deployment')).toBeVisible();
  });

  test('2. Verifies switching pipeline status updates the active item dynamically', async ({
    page,
  }) => {
    const timeline = page.locator('[data-testid="interactive-timeline"]');
    const thirdItem = timeline.locator('li').nth(2);

    // Switch to Failed (danger)
    const failedOption = page.getByRole('button', { name: 'Failed' });
    await failedOption.click();

    await expect(thirdItem).toHaveAttribute('data-status', 'danger');
    await expect(
      page.getByText('Failed to verify container checksum during distribution.'),
    ).toBeVisible();

    // Switch to Complete
    const completeOption = page.getByRole('button', { name: 'Complete' });
    await completeOption.click();

    await expect(thirdItem).toHaveAttribute('data-status', 'complete');
    await expect(page.getByText('Deployed across all global regions.')).toBeVisible();
  });

  test('3. Verifies switching direction to RTL (Arabic) renders proper Arabic content and lang attribute', async ({
    page,
  }) => {
    // Switch to RTL (Arabic)
    const rtlOption = page.getByRole('button', { name: 'RTL (Arabic)' });
    await rtlOption.click();

    // Verify canvas has dir="rtl" and lang="ar"
    const canvas = page.locator('[class*="specimenCanvas"][dir="rtl"][lang="ar"]');
    await expect(canvas).toBeVisible();

    // Verify Arabic content is rendered cleanly
    await expect(page.getByText('تم إنشاء تفريع للمستودع')).toBeVisible();
    await expect(page.getByText('اجتياز الفحوصات الآلية')).toBeVisible();
    await expect(page.getByText('النشر على الخوادم الطرفية')).toBeVisible();
    await expect(page.getByText('منذ ساعتين')).toBeVisible();
  });
});
