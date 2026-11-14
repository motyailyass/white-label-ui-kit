import { expect, test } from '@playwright/test';

test.describe('Dashboard Card Studio Real-Browser Verification', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/gallery/card');
    await expect(page.locator('[data-testid="card-studio"]')).toBeVisible();
  });

  test('1. Switches variants, density padding, dividers, and verifies dashboard radius (8px) & overflow', async ({
    page,
  }) => {
    const card = page.locator('[data-testid="studio-card"]');
    await expect(card).toHaveAttribute('data-variant', 'default');

    const styles = await card.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return { borderRadius: cs.borderRadius, overflow: cs.overflow };
    });
    expect(styles.borderRadius).toBe('8px');
    expect(styles.overflow).toBe('visible');

    await page.locator('[data-testid="opt-variant-subtle"]').click();
    await expect(card).toHaveAttribute('data-variant', 'subtle');

    await page.locator('[data-testid="opt-variant-raised"]').click();
    await expect(card).toHaveAttribute('data-variant', 'raised');

    await page.locator('[data-testid="opt-pad-none"]').click();
    await expect(card.locator('img')).toBeVisible();

    await page.locator('[data-testid="opt-pad-lg"]').click();
    await expect(card.locator('img')).toHaveCount(0);

    await page.locator('[data-testid="toggle-header-divider"]').click();
    await page.locator('[data-testid="toggle-footer-divider"]').click();
    await expect(card.locator('[data-divider="true"]')).toHaveCount(2);
  });

  test('2. Interactive card supports keyboard/click without misfiring on nested action buttons', async ({
    page,
  }) => {
    await page.locator('[data-testid="opt-variant-interactive"]').click();
    const card = page.locator('[data-testid="studio-card"]');
    const counter = page.locator('[data-testid="studio-card-clicks"]');

    await expect(card).toHaveAttribute('role', 'button');
    await expect(counter).toContainText('0');

    // Clicking nested footer button should not increment outer card counter
    await card.getByRole('button', { name: 'Export Report' }).click();
    await expect(counter).toContainText('0');

    // Focusing card and pressing Enter increments counter
    await card.focus();
    await card.press('Enter');
    await expect(counter).toContainText('1');
  });

  test('3. Applies RTL lang="ar" and switches to the 4-variant + 3-density matrix view', async ({
    page,
  }) => {
    await page.locator('[data-testid="opt-dir-rtl"]').click();
    const card = page.locator('[data-testid="studio-card"]');
    await expect(card).toContainText('ملخص الأداء الشهري');

    const closestLang = await card.evaluate((el) => el.closest('[lang]')?.getAttribute('lang'));
    expect(closestLang).toBe('ar');

    await page.locator('[data-testid="opt-view-matrix"]').click();
    const matrix = page.locator('[data-testid="card-matrix-grid"]');
    await expect(matrix).toBeVisible();
    await expect(matrix.locator('[data-variant="default"]')).toHaveCount(4);
    await expect(matrix.locator('[data-variant="subtle"]')).toHaveCount(1);
    await expect(matrix.locator('[data-variant="raised"]')).toHaveCount(1);
    await expect(matrix.locator('[data-variant="interactive"]')).toHaveCount(1);
  });

  test('4. Zero dashboard shadows verified on rendered card surfaces', async ({ page }) => {
    const card = page.locator('[data-testid="studio-card"]');
    const boxShadow = await card.evaluate((el) => window.getComputedStyle(el).boxShadow);
    expect(boxShadow === 'none' || boxShadow === '').toBe(true);
  });
});
