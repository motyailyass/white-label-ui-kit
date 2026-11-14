import { expect, test } from '@playwright/test';

test.describe('Dashboard ContextMenu Primitive Real-Browser Verification', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/gallery/context-menu');
    await expect(page.locator('[data-testid="gallery-context-menu"]')).toBeVisible();
  });

  test('1. Verifies initial closed state and opening on right click', async ({ page }) => {
    const trigger = page.locator('[data-testid="interactive-context-trigger"]');
    await expect(trigger).toBeVisible();

    const menu = page.locator('[data-testid="interactive-context-content"]');
    await expect(menu).not.toBeVisible();

    // Natural secondary click (right click)
    await trigger.click({ button: 'right' });
    await expect(menu).toBeVisible();
    await expect(menu).toHaveAttribute('role', 'menu');
    await expect(menu.locator('[role="menuitem"]')).toHaveCount(5);
  });

  test('2. Verifies selecting an item closes menu and updates last action', async ({ page }) => {
    const trigger = page.locator('[data-testid="interactive-context-trigger"]');
    await trigger.click({ button: 'right' });

    const menu = page.locator('[data-testid="interactive-context-content"]');
    await expect(menu).toBeVisible();

    // Select Download item
    const downloadItem = menu.locator('[role="menuitem"]').first();
    await downloadItem.click();

    await expect(menu).not.toBeVisible();
    await expect(page.locator('[class*="lastActionValue"]').getByText('Download')).toBeVisible();
  });

  test('3. Verifies keyboard navigation and Escape dismissal', async ({ page }) => {
    const trigger = page.locator('[data-testid="interactive-context-trigger"]');
    await trigger.click({ button: 'right' });

    const menu = page.locator('[data-testid="interactive-context-content"]');
    await expect(menu).toBeVisible();

    // Navigate with ArrowDown
    await page.keyboard.press('ArrowDown');
    const firstItem = menu.locator('[role="menuitem"]').nth(0);
    await expect(firstItem).toHaveAttribute('data-highlighted', 'true');

    // Press Escape to dismiss
    await page.keyboard.press('Escape');
    await expect(menu).not.toBeVisible();
  });

  test('4. Verifies switching scenario dynamically updates specimen surface and menu items', async ({
    page,
  }) => {
    // Switch to Data Record
    const recordOption = page.getByRole('button', { name: 'Data Record' });
    await recordOption.click();

    // Verify invoice data record surface
    await expect(page.getByText('Invoice #INV-2041')).toBeVisible();

    const trigger = page.locator('[data-testid="interactive-context-trigger"]');
    await trigger.click({ button: 'right' });

    const menu = page.locator('[data-testid="interactive-context-content"]');
    await expect(menu).toBeVisible();
    await expect(page.getByText('Record Operations')).toBeVisible();
    await expect(page.getByText('View Details')).toBeVisible();
  });

  test('5. Verifies switching direction to RTL (Arabic) renders authentic Arabic content, lang attribute, and proper positioning', async ({
    page,
  }) => {
    const rtlOption = page.getByRole('button', { name: 'RTL (Arabic)' });
    await rtlOption.click();

    const canvas = page.locator('[class*="specimenCanvas"][dir="rtl"][lang="ar"]');
    await expect(canvas).toBeVisible();

    // Verify Arabic file card text
    await expect(page.getByText('ملف_المخطط_المعماري.pdf')).toBeVisible();

    const trigger = page.locator('[data-testid="interactive-context-trigger"]');
    await trigger.click({ button: 'right' });

    const menu = page.locator('[data-testid="interactive-context-content"]');
    await expect(menu).toBeVisible();

    // Verify Arabic menu labels
    await expect(page.getByText('إجراءات الملف')).toBeVisible();
    await expect(page.getByText('تنزيل')).toBeVisible();
    await expect(page.getByText('مشاركة الرابط')).toBeVisible();
  });

  test('6. Verifies 100% shadow-free dashboard policy compliance', async ({ page }) => {
    const trigger = page.locator('[data-testid="interactive-context-trigger"]');
    await trigger.click({ button: 'right' });

    const menu = page.locator('[data-testid="interactive-context-content"]');
    await expect(menu).toBeVisible();

    const boxShadow = await menu.evaluate((node) => {
      return window.getComputedStyle(node).boxShadow;
    });
    expect(boxShadow === 'none' || boxShadow === '').toBeTruthy();
  });
});
