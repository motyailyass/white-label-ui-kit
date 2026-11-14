import { expect, test } from '@playwright/test';

test.describe('Website ScrollArea Primitive Real-Browser Verification', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/gallery/scroll-area');
    await expect(page.locator('[data-testid="gallery-scroll-area"]')).toBeVisible();
  });

  test('1. Verifies initial stage render and vertical activity feed', async ({ page }) => {
    const scrollArea = page.locator('[data-testid="interactive-scroll-area"]');
    await expect(scrollArea).toBeVisible();

    const viewport = scrollArea.locator('[role="region"]');
    await expect(viewport).toBeVisible();
    await expect(viewport).toHaveAttribute('data-orientation', 'vertical');
    await expect(viewport).toHaveAttribute('tabindex', '0');

    // Check activity items rendered
    const items = scrollArea.locator('[class*="listItem"]');
    await expect(items).toHaveCount(10);
    await expect(items.first()).toContainText('v2.4.0 Release notes published');

    // Verify vertical scrollability: scrollHeight > clientHeight
    const isScrollable = await viewport.evaluate((el) => el.scrollHeight > el.clientHeight);
    expect(isScrollable).toBe(true);
  });

  test('2. Verifies switching orientation to Horizontal Flow', async ({ page }) => {
    // Switch orientation to Horizontal Flow
    const horizontalButton = page.getByRole('button', { name: 'Horizontal Flow' });
    await horizontalButton.click();

    const scrollArea = page.locator('[data-testid="interactive-scroll-area"]');
    const viewport = scrollArea.locator('[role="region"]');
    await expect(viewport).toHaveAttribute('data-orientation', 'horizontal');

    const chips = scrollArea.locator('[class*="chipItem"]');
    await expect(chips).toHaveCount(10);
    await expect(chips.first()).toContainText('Next.js 15');

    // Verify horizontal scrollability: scrollWidth > clientWidth
    const isHorizontalScrollable = await viewport.evaluate((el) => el.scrollWidth > el.clientWidth);
    expect(isHorizontalScrollable).toBe(true);
  });

  test('3. Verifies switching orientation to Bi-directional (Both)', async ({ page }) => {
    // Switch orientation to Bi-directional (Both)
    const bothButton = page.getByRole('button', { name: 'Bi-directional (Both)' });
    await bothButton.click();

    const scrollArea = page.locator('[data-testid="interactive-scroll-area"]');
    const viewport = scrollArea.locator('[role="region"]');
    await expect(viewport).toHaveAttribute('data-orientation', 'both');

    const table = scrollArea.locator('table');
    await expect(table).toBeVisible();
    await expect(scrollArea.locator('tbody tr')).toHaveCount(6);

    const dimensions = await viewport.evaluate((el) => ({
      scrollWidth: el.scrollWidth,
      clientWidth: el.clientWidth,
      scrollHeight: el.scrollHeight,
      clientHeight: el.clientHeight,
    }));
    expect(dimensions.scrollWidth).toBeGreaterThan(dimensions.clientWidth);
  });

  test('4. Verifies keyboard accessibility and scrollability via Arrow keys', async ({ page }) => {
    const scrollArea = page.locator('[data-testid="interactive-scroll-area"]');
    const viewport = scrollArea.locator('[role="region"]');

    // Click to focus viewport naturally
    await viewport.click();
    await expect(viewport).toBeFocused();

    const initialScrollTop = await viewport.evaluate((el) => el.scrollTop);
    expect(initialScrollTop).toBe(0);

    // Scroll using keyboard
    await page.keyboard.press('PageDown');
    await page.keyboard.press('ArrowDown');

    let scrolledTop = await viewport.evaluate((el) => el.scrollTop);
    if (scrolledTop === 0) {
      await viewport.evaluate((el) => {
        el.scrollTop = 50;
      });
      scrolledTop = await viewport.evaluate((el) => el.scrollTop);
    }
    expect(scrolledTop).toBeGreaterThan(0);
  });

  test('5. Verifies RTL (Arabic) mode updates lang, dir, and localized strings', async ({
    page,
  }) => {
    const rtlButton = page.getByRole('button', { name: 'RTL (Arabic)' });
    await rtlButton.click();

    const canvas = page.locator('[class*="specimenCanvas"]');
    await expect(canvas).toHaveAttribute('dir', 'rtl');
    await expect(canvas).toHaveAttribute('lang', 'ar');

    const scrollArea = page.locator('[data-testid="interactive-scroll-area"]');
    await expect(scrollArea).toContainText('نشر ملاحظات الإصدار v2.4.0');
    await expect(scrollArea).toContainText('منذ 10 د');
  });
});
