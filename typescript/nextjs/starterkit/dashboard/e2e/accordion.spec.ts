import { expect, test } from '@playwright/test';

test.describe('Dashboard Accordion Studio Real-Browser Verification', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/gallery/accordion');
    await expect(page.locator('[data-testid="accordion-studio"]')).toBeVisible();
  });

  test('1. Verifies control size heights (32/36/40px desktop, >=48px coarse mobile) and visual variants', async ({
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

    await page.locator('[data-testid="opt-var-flush"]').click();
    await expect(accordion).toHaveAttribute('data-variant', 'flush');
  });

  test('2. Supports arrow-key roving focus, multiple expansion, and icon aria-hidden', async ({
    page,
  }) => {
    const accordion = page.locator('[data-testid="studio-accordion"]');
    const triggers = accordion.locator('button[data-accordion-trigger]');

    await triggers.nth(0).focus();
    await triggers.nth(0).press('ArrowDown');
    await expect(triggers.nth(1)).toBeFocused();
    await triggers.nth(1).press('End');
    await expect(triggers.nth(3)).toBeFocused();
    await triggers.nth(3).press('Home');
    await expect(triggers.nth(0)).toBeFocused();

    await page.locator('[data-testid="opt-type-multiple"]').click();
    await triggers.nth(1).click();
    await expect(triggers.nth(0)).toHaveAttribute('aria-expanded', 'true');
    await expect(triggers.nth(1)).toHaveAttribute('aria-expanded', 'true');

    await page.locator('[data-testid="opt-scen-settings"]').click();
    await expect(
      accordion.locator('button[data-accordion-trigger] span[aria-hidden="true"] svg').first(),
    ).toBeVisible();
  });

  test('3. Applies RTL lang="ar" and renders Variants Matrix cleanly', async ({ page }) => {
    await page.locator('[data-testid="opt-dir-rtl"]').click();
    const accordion = page.locator('[data-testid="studio-accordion"]');
    const firstTrigger = accordion.locator('button[data-accordion-trigger]').first();

    await expect(firstTrigger).toContainText('هل يعتمد هذا الطقم');
    const closestLang = await accordion.evaluate((el) =>
      el.closest('[lang]')?.getAttribute('lang'),
    );
    expect(closestLang).toBe('ar');

    await page.locator('[data-testid="opt-view-matrix"]').click();
    const matrix = page.locator('[data-testid="accordion-matrix-grid"]');
    await expect(matrix).toBeVisible();
    await expect(matrix.locator('[data-accordion-root][data-variant="default"]')).toHaveCount(4);
    await expect(matrix.locator('[data-accordion-root][data-variant="enclosed"]')).toHaveCount(1);
    await expect(matrix.locator('[data-accordion-root][data-variant="flush"]')).toHaveCount(1);
  });

  test('4. Zero dashboard shadows verified on rendered enclosed accordion', async ({ page }) => {
    await page.locator('[data-testid="opt-var-enclosed"]').click();
    const accordion = page.locator('[data-testid="studio-accordion"]');
    const trigger = accordion.locator('button[data-accordion-trigger]').first();

    const rootShadow = await accordion.evaluate((el) => window.getComputedStyle(el).boxShadow);
    const triggerShadow = await trigger.evaluate((el) => window.getComputedStyle(el).boxShadow);
    expect(rootShadow === 'none' || rootShadow === '').toBe(true);
    expect(triggerShadow === 'none' || triggerShadow === '').toBe(true);
  });
});
