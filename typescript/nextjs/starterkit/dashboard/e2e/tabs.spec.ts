import { expect, test } from '@playwright/test';

test.describe('Dashboard Tabs Studio Real-Browser Verification', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/gallery/tabs');
    await expect(page.locator('[data-testid="tabs-studio"]')).toBeVisible();
  });

  test('1. Verifies control size heights (32/36/40px) and visual variants', async ({ page }) => {
    const tabs = page.locator('[data-testid="studio-tabs"]');
    const firstTrigger = tabs.getByRole('tab').first();

    await page.locator('[data-testid="opt-size-sm"]').click();
    const smBox = await firstTrigger.boundingBox();
    expect(smBox?.height).toBeCloseTo(32, 1);

    await page.locator('[data-testid="opt-size-md"]').click();
    const mdBox = await firstTrigger.boundingBox();
    expect(mdBox?.height).toBeCloseTo(36, 1);

    await page.locator('[data-testid="opt-size-lg"]').click();
    const lgBox = await firstTrigger.boundingBox();
    expect(lgBox?.height).toBeCloseTo(40, 1);

    await page.locator('[data-testid="opt-var-segment"]').click();
    await expect(tabs).toHaveAttribute('data-variant', 'segment');

    await page.locator('[data-testid="opt-var-enclosed"]').click();
    await expect(tabs).toHaveAttribute('data-variant', 'enclosed');
  });

  test('2. Supports arrow-key roving focus, manual activation, and icon aria-hidden', async ({
    page,
  }) => {
    await page.locator('[data-testid="opt-act-manual"]').click();
    const tabs = page.locator('[data-testid="studio-tabs"]');
    const triggers = tabs.getByRole('tab');

    await triggers.nth(0).focus();
    await triggers.nth(0).press('ArrowRight');
    await expect(triggers.nth(1)).toBeFocused();
    await expect(triggers.nth(0)).toHaveAttribute('aria-selected', 'true');

    await triggers.nth(1).press('Enter');
    await expect(triggers.nth(1)).toHaveAttribute('aria-selected', 'true');

    await page.locator('[data-testid="opt-scen-icons"]').click();
    await expect(tabs.locator('span[aria-hidden="true"] svg').first()).toBeVisible();
  });

  test('3. Applies RTL lang="ar", reverses ArrowLeft/ArrowRight navigation, and renders matrix', async ({
    page,
  }) => {
    await page.locator('[data-testid="opt-dir-rtl"]').click();
    const tabs = page.locator('[data-testid="studio-tabs"]');
    const firstTrigger = tabs.getByRole('tab').first();
    const secondTrigger = tabs.getByRole('tab').nth(1);

    await expect(firstTrigger).toContainText('نظرة عامة');
    const closestLang = await tabs.evaluate((el) => el.closest('[lang]')?.getAttribute('lang'));
    expect(closestLang).toBe('ar');

    // In RTL, ArrowLeft moves to the next logical tab
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

  test('4. Zero dashboard shadows verified on rendered tabs', async ({ page }) => {
    await page.locator('[data-testid="opt-var-segment"]').click();
    const tabList = page.locator('[data-testid="studio-tabs"] [role="tablist"]');
    const boxShadow = await tabList.evaluate((el) => window.getComputedStyle(el).boxShadow);
    expect(boxShadow === 'none' || boxShadow === '').toBe(true);
  });
});
