import { expect, test } from '@playwright/test';

test.describe('Website Accordion Studio Real-Browser Verification', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/gallery/accordion');
    await expect(page.locator('[data-testid="accordion-studio"]')).toBeVisible();
  });

  test('1. Verifies explicit sizing (32/36/40px desktop, >=48px coarse mobile) and variants', async ({
    page,
  }) => {
    const accordion = page.locator('[data-testid="studio-accordion"]');
    const firstTrigger = accordion.locator('button[data-accordion-trigger]').first();
    const isCoarse = await page.evaluate(
      () => window.matchMedia('(any-pointer: coarse), (pointer: coarse)').matches,
    );

    await page.locator('[data-testid="opt-size-sm"]').click();
    const smHeight = (await firstTrigger.boundingBox())?.height ?? 0;
    if (isCoarse) {
      expect(smHeight).toBeGreaterThanOrEqual(48);
    } else {
      expect(smHeight).toBeCloseTo(32, 1);
    }

    await page.locator('[data-testid="opt-size-md"]').click();
    const mdHeight = (await firstTrigger.boundingBox())?.height ?? 0;
    if (isCoarse) {
      expect(mdHeight).toBeGreaterThanOrEqual(48);
    } else {
      expect(mdHeight).toBeCloseTo(36, 1);
    }

    await page.locator('[data-testid="opt-size-lg"]').click();
    const lgHeight = (await firstTrigger.boundingBox())?.height ?? 0;
    if (isCoarse) {
      expect(lgHeight).toBeGreaterThanOrEqual(48);
    } else {
      expect(lgHeight).toBeCloseTo(40, 1);
    }

    await page.locator('[data-testid="opt-var-enclosed"]').click();
    await expect(accordion).toHaveAttribute('data-variant', 'enclosed');
  });

  test('2. Applies RTL lang="ar", keyboard navigation, and renders matrix', async ({ page }) => {
    await page.locator('[data-testid="opt-dir-rtl"]').click();
    const accordion = page.locator('[data-testid="studio-accordion"]');
    const triggers = accordion.locator('button[data-accordion-trigger]');

    await expect(triggers.first()).toContainText('هل يعتمد هذا الطقم');
    const closestLang = await accordion.evaluate((el) =>
      el.closest('[lang]')?.getAttribute('lang'),
    );
    expect(closestLang).toBe('ar');

    await triggers.first().focus();
    await triggers.first().press('ArrowDown');
    await expect(triggers.nth(1)).toBeFocused();

    await page.locator('[data-testid="opt-view-matrix"]').click();
    const matrix = page.locator('[data-testid="accordion-matrix-grid"]');
    await expect(matrix).toBeVisible();
    await expect(matrix.locator('[data-accordion-root][data-variant="enclosed"]')).toHaveCount(1);
    await expect(matrix.locator('[data-accordion-root][data-variant="flush"]')).toHaveCount(1);
  });
});
