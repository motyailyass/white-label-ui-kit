import { expect, test } from '@playwright/test';

test.describe('Website Card Studio Real-Browser Verification', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/gallery/card');
    await expect(page.locator('[data-testid="card-studio"]')).toBeVisible();
  });

  test('1. Verifies website card radius token (12px), unclipped overflow, and padding density variants', async ({
    page,
  }) => {
    const card = page.locator('[data-testid="studio-card"]');
    await expect(card).toHaveAttribute('data-variant', 'default');

    const styles = await card.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return { borderRadius: cs.borderRadius, overflow: cs.overflow };
    });
    expect(styles.borderRadius).toBe('12px');
    expect(styles.overflow).toBe('visible');

    await page.locator('[data-testid="opt-variant-subtle"]').click();
    await expect(card).toHaveAttribute('data-variant', 'subtle');

    await page.locator('[data-testid="opt-pad-none"]').click();
    await expect(card.locator('img')).toBeVisible();
  });

  test('2. Interactive card keyboard activation ignores nested buttons', async ({ page }) => {
    await page.locator('[data-testid="opt-variant-interactive"]').click();
    const card = page.locator('[data-testid="studio-card"]');
    const counter = page.locator('[data-testid="studio-card-clicks"]');

    await expect(counter).toContainText('0');
    await card.getByRole('button', { name: 'Export Report' }).click();
    await expect(counter).toContainText('0');

    await card.focus();
    await card.press(' ');
    await expect(counter).toContainText('1');
  });

  test('3. Applies RTL lang="ar" and renders the variants matrix', async ({ page }) => {
    await page.locator('[data-testid="opt-dir-rtl"]').click();
    const card = page.locator('[data-testid="studio-card"]');
    await expect(card).toContainText('ملخص الأداء الشهري');

    const closestLang = await card.evaluate((el) => el.closest('[lang]')?.getAttribute('lang'));
    expect(closestLang).toBe('ar');

    await page.locator('[data-testid="opt-view-matrix"]').click();
    const matrix = page.locator('[data-testid="card-matrix-grid"]');
    await expect(matrix).toBeVisible();
    await expect(matrix.locator('[data-variant="subtle"]')).toHaveCount(1);
    await expect(matrix.locator('[data-variant="raised"]')).toHaveCount(1);
    await expect(matrix.locator('[data-variant="interactive"]')).toHaveCount(1);
  });
});
