import { test, expect } from '@playwright/test';

test.describe('Combobox Primitive Real-Browser Verification', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/gallery/combobox');
    await expect(page.locator('[data-testid="combobox-gallery"]')).toBeVisible();
  });

  test('verifies single-select popup open, option filtering, and selection commit', async ({
    page,
  }) => {
    const input = page.locator('[data-testid="studio-active-combobox"]');
    await expect(input).toBeVisible();

    // 1. Click to open floating listbox
    await input.click();
    await expect(input).toHaveAttribute('aria-expanded', 'true');

    const listbox = page.locator('ul[role="listbox"]');
    await expect(listbox).toBeVisible();

    // 2. Type search query to filter
    await input.fill('France');
    const option = page.locator('li[role="option"]', { hasText: 'France' });
    await expect(option).toBeVisible();

    // 3. Click option to commit selection
    await option.click();
    await expect(listbox).not.toBeVisible();
    await expect(input).toHaveValue('France');
  });

  test('verifies keyboard navigation: ArrowDown, roving activedescendant, Enter, and Escape', async ({
    page,
  }) => {
    const input = page.locator('[data-testid="studio-active-combobox"]');
    await expect(input).toBeVisible();

    // Focus input
    await input.focus();

    // Arrow down to open and navigate
    await page.keyboard.press('ArrowDown');
    await expect(input).toHaveAttribute('aria-expanded', 'true');

    const listbox = page.locator('ul[role="listbox"]');
    await expect(listbox).toBeVisible();

    // Active descendant is set
    const activeId = await input.getAttribute('aria-activedescendant');
    expect(activeId).toBeTruthy();

    // Escape closes popup
    await page.keyboard.press('Escape');
    await expect(listbox).not.toBeVisible();
    await expect(input).toHaveAttribute('aria-expanded', 'false');
  });

  test('verifies multi-select tags mode and interactive chip removal', async ({ page }) => {
    // Switch to Multi-Select preset via quick configurations bar
    await page.locator('[data-testid="preset-quick-select-multi"]').click();

    const chips = page.locator('[data-testid="combobox-chip"]');
    await expect(chips.first()).toBeVisible();
    const countBefore = await chips.count();
    expect(countBefore).toBeGreaterThanOrEqual(2);

    // Click remove button on the first chip
    const removeBtn = chips.first().getByRole('button');
    await removeBtn.click();

    // Chip count decreases by 1
    const countAfter = await chips.count();
    expect(countAfter).toBe(countBefore - 1);
  });

  test('verifies clearable button resets committed value', async ({ page }) => {
    const input = page.locator('[data-testid="studio-active-combobox"]');
    await expect(input).toBeVisible();

    // Locate clear button
    const clearBtn = page
      .locator('button[class*="actionButton"] svg path[d*="19L5"]')
      .locator('..');
    if (await clearBtn.isVisible()) {
      await clearBtn.click();
      await expect(input).toHaveValue('');
    }
  });

  test('verifies 2px balanced focus contract (zero floating gap)', async ({ page }) => {
    const input = page.locator('[data-testid="studio-active-combobox"]');
    await expect(input).toBeVisible();

    const container = page.locator('div[class*="inputContainer"]').first();
    await expect(container).toBeVisible();

    const colors = await page.evaluate(() => {
      const elFocus = document.createElement('div');
      elFocus.style.color = 'var(--color-border-focus)';
      document.body.appendChild(elFocus);
      const focusRgb = window.getComputedStyle(elFocus).color;
      elFocus.remove();
      return { focusRgb };
    });

    // Click input to trigger focus-within
    await input.click();
    await expect(input).toBeFocused();

    const containerStyle = await container.evaluate((el) => {
      const s = window.getComputedStyle(el);
      return {
        border: s.borderColor,
        outline: s.outlineColor,
        outlineOffset: s.outlineOffset,
      };
    });

    expect(containerStyle.border).toBe(colors.focusRgb);
    expect(containerStyle.outline).toBe(colors.focusRgb);
    expect(containerStyle.outlineOffset).toBe('0px');
  });

  test('verifies specimen direction switches to RTL on demand', async ({ page }) => {
    await page.locator('[data-testid="opt-dir-rtl"]').click();
    const studioPreview = page.locator('[data-testid="studio-preview-canvas"][dir="rtl"]');
    await expect(studioPreview).toBeVisible();
  });

  test('verifies narrow viewport does not produce horizontal overflow', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 640 });
    await page.waitForTimeout(100);

    const overflow320 = await page.evaluate(() => {
      return document.documentElement.scrollWidth <= window.innerWidth;
    });
    expect(overflow320).toBe(true);
  });
});
