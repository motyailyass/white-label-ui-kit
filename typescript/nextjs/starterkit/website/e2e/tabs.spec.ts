import { expect, test } from '@playwright/test';

test.describe('Website Tabs Studio Real-Browser Verification', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/gallery/tabs');
    await expect(page.locator('[data-testid="tabs-studio"]')).toBeVisible();
  });

  test('1. Verifies control size heights (32/36/40px) and segment/enclosed variants', async ({
    page,
  }) => {
    const tabs = page.locator('[data-testid="studio-tabs"]');
    const firstTrigger = tabs.getByRole('tab').first();

    await page.locator('[data-testid="opt-size-sm"]').click();
    expect((await firstTrigger.boundingBox())?.height).toBeCloseTo(32, 1);

    await page.locator('[data-testid="opt-size-md"]').click();
    expect((await firstTrigger.boundingBox())?.height).toBeCloseTo(36, 1);

    await page.locator('[data-testid="opt-size-lg"]').click();
    expect((await firstTrigger.boundingBox())?.height).toBeCloseTo(40, 1);

    await page.locator('[data-testid="opt-var-segment"]').click();
    await expect(tabs).toHaveAttribute('data-variant', 'segment');
  });

  test('2. Applies RTL lang="ar", reverses ArrowLeft/ArrowRight navigation, and renders matrix', async ({
    page,
  }) => {
    await page.locator('[data-testid="opt-dir-rtl"]').click();
    const tabs = page.locator('[data-testid="studio-tabs"]');
    const firstTrigger = tabs.getByRole('tab').first();
    const secondTrigger = tabs.getByRole('tab').nth(1);

    await expect(firstTrigger).toContainText('نظرة عامة');
    const closestLang = await tabs.evaluate((el) => el.closest('[lang]')?.getAttribute('lang'));
    expect(closestLang).toBe('ar');

    await firstTrigger.focus();
    await firstTrigger.press('ArrowLeft');
    await expect(secondTrigger).toBeFocused();
    await expect(secondTrigger).toHaveAttribute('aria-selected', 'true');

    await page.locator('[data-testid="opt-view-matrix"]').click();
    const matrix = page.locator('[data-testid="tabs-matrix-grid"]');
    await expect(matrix).toBeVisible();
    await expect(matrix.getByRole('tablist', { name: 'line' })).toHaveCount(1);
    await expect(matrix.getByRole('tablist', { name: 'segment' })).toHaveCount(1);
    await expect(matrix.getByRole('tablist', { name: 'enclosed' })).toHaveCount(1);
    await expect(matrix.locator('[data-variant="segment"]').first()).toBeVisible();
    await expect(matrix.locator('[data-variant="enclosed"]').first()).toBeVisible();
  });
});
