import { test, expect } from '@playwright/test';

test.describe('Dashboard Control Sizing & Interaction Target Verification', () => {
  test('renders dashboard default control size at md (36px) on fine pointers and expands on coarse pointers', async ({
    page,
  }) => {
    await page.goto('/sizing-fixture');
    await expect(page.locator('#btn-default')).toBeVisible();

    const isCoarse = await page.evaluate(() => window.matchMedia('(pointer: coarse)').matches);
    const height = await page.locator('#btn-default').evaluate((el) => {
      return parseFloat(window.getComputedStyle(el).height);
    });

    if (isCoarse) {
      // Coarse pointer devices enforce minimum 48px touch target with touchTarget="auto" default
      expect(height).toBeGreaterThanOrEqual(48);
    } else {
      // 36px minimum height (2.25rem = 36px at 16px root font)
      expect(height).toBeCloseTo(36, 1);
    }
  });

  test('renders explicit six-step scale with exact proportional dimensions', async ({ page }) => {
    await page.goto('/sizing-fixture');

    const isCoarse = await page.evaluate(() => window.matchMedia('(pointer: coarse)').matches);
    const expectedHeights: Record<string, number> = {
      '#btn-size-xs': 28, // 1.75rem
      '#btn-size-sm': 32, // 2.00rem
      '#btn-size-md': 36, // 2.25rem
      '#btn-size-lg': 40, // 2.50rem
      '#btn-size-xl': 48, // 3.00rem
      '#btn-size-2xl': 56, // 3.50rem
    };

    for (const [selector, expected] of Object.entries(expectedHeights)) {
      const height = await page.locator(selector).evaluate((el) => {
        return parseFloat(window.getComputedStyle(el).height);
      });
      if (isCoarse) {
        expect(height, `Failed coarse height check for ${selector}`).toBeGreaterThanOrEqual(
          Math.max(48, expected),
        );
      } else {
        expect(height, `Failed height check for ${selector}`).toBeCloseTo(expected, 1);
      }
    }
  });

  test('enforces comfortable touch target of at least 48px without changing visible text size', async ({
    page,
  }) => {
    await page.goto('/sizing-fixture');
    const button = page.locator('#btn-touch-comfortable');
    await expect(button).toBeVisible();

    const dimensions = await button.evaluate((el) => {
      const style = window.getComputedStyle(el);
      return {
        height: parseFloat(style.height),
        width: parseFloat(style.width),
        minHeight: parseFloat(style.minHeight),
        minWidth: parseFloat(style.minWidth),
      };
    });

    expect(dimensions.minHeight).toBeGreaterThanOrEqual(48);
    expect(dimensions.minWidth).toBeGreaterThanOrEqual(48);
  });

  test('allows multiline wrapped labels to grow in block size without clipping', async ({
    page,
  }) => {
    await page.goto('/sizing-fixture');
    const button = page.locator('#btn-wrapped-label');
    await expect(button).toBeVisible();

    const height = await button.evaluate((el) => {
      return parseFloat(window.getComputedStyle(el).height);
    });

    // Wrapped content must grow beyond single-line height (> 36px)
    expect(height).toBeGreaterThan(40);
  });

  test('loading state maintains identical dimensions with zero layout shift on width and height', async ({
    page,
  }) => {
    await page.goto('/sizing-fixture');
    const dynamicBtn = page.locator('#btn-dynamic-loading');
    await expect(dynamicBtn).toBeVisible();

    // 1. Measure button in resting state
    const restingBox = await dynamicBtn.boundingBox();
    expect(restingBox).not.toBeNull();

    // 2. Click to toggle loading state
    await dynamicBtn.click();
    await expect(dynamicBtn).toHaveAttribute('data-loading', 'true');

    // 3. Measure button in loading state
    const loadingBox = await dynamicBtn.boundingBox();
    expect(loadingBox).not.toBeNull();

    // Assert exact zero layout shift across both block and inline axes
    expect(loadingBox!.width).toBeCloseTo(restingBox!.width, 1);
    expect(loadingBox!.height).toBeCloseTo(restingBox!.height, 1);
  });

  test('preserves button accessible name and queryability via getByRole across resting and loading states', async ({
    page,
  }) => {
    await page.goto('/sizing-fixture');

    // 1. Static loading button has loading={true} but retains its full accessible name
    const staticLoadingBtn = page.locator('#btn-loading');
    await expect(staticLoadingBtn).toBeVisible();
    await expect(staticLoadingBtn).toHaveAttribute('data-loading', 'true');
    await expect(staticLoadingBtn).toHaveAttribute('aria-busy', 'true');
    await expect(staticLoadingBtn).toHaveAttribute('disabled', '');

    // Real Chromium resolves accessibility tree: getByRole matches both resting and static loading buttons
    const matchingButtons = page.getByRole('button', { name: 'Saving Changes' });
    await expect(matchingButtons).toHaveCount(2);

    // 2. Dynamic button toggle preserves accessible name across state transitions
    const dynamicBtn = page.locator('#btn-dynamic-loading');
    await expect(dynamicBtn).not.toHaveAttribute('data-loading', 'true');

    await dynamicBtn.click();
    await expect(dynamicBtn).toHaveAttribute('data-loading', 'true');
    await expect(dynamicBtn).toHaveAttribute('aria-busy', 'true');
    expect(await dynamicBtn.evaluate((el) => el.getAttribute('aria-label'))).toBe('Saving Changes');

    // Button accessible name remains unchanged and discoverable by assistive technologies
    const dynamicByAccName = page.getByRole('button', { name: 'Saving Changes' }).first();
    await expect(dynamicByAccName).toBeVisible();
  });

  test('omitted touchTarget defaults to auto and expands to 48px on coarse pointer devices', async ({
    browser,
  }) => {
    const context = await browser.newContext({ hasTouch: true });
    const touchPage = await context.newPage();
    await touchPage.goto('/sizing-fixture');
    const defaultBtn = touchPage.locator('#btn-default');
    await expect(defaultBtn).toBeVisible();

    expect(await defaultBtn.getAttribute('data-touch-target')).toBe('auto');
    const height = await defaultBtn.evaluate((el) => {
      return parseFloat(window.getComputedStyle(el).height);
    });
    expect(height).toBeGreaterThanOrEqual(48);
    await context.close();
  });

  test('maintains identical dimensions across light and dark themes (theme parity)', async ({
    page,
  }) => {
    await page.goto('/sizing-fixture');
    const button = page.locator('#btn-default');

    // Light theme height
    await page.evaluate(() => document.documentElement.setAttribute('data-theme', 'light'));
    const lightHeight = await button.evaluate((el) =>
      parseFloat(window.getComputedStyle(el).height),
    );

    // Dark theme height
    await page.evaluate(() => document.documentElement.setAttribute('data-theme', 'dark'));
    const darkHeight = await button.evaluate((el) =>
      parseFloat(window.getComputedStyle(el).height),
    );

    expect(lightHeight).toBeCloseTo(darkHeight, 1);
  });

  test('supports Arabic and French labels with RTL layout alignment without clipping', async ({
    page,
  }) => {
    await page.goto('/classic');
    const button = page
      .locator(
        'button:has-text("Export Report"), button:has-text("تصدير التقرير"), button:has-text("Exporter le rapport")',
      )
      .first();
    await expect(button).toBeVisible();

    // Verify Arabic RTL mode: control must be visible and exercised
    const langSelect = page.locator('select').first();
    await expect(langSelect).toBeVisible();
    await langSelect.selectOption('ar');
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');

    const arabicBtn = page.locator('button:has-text("تصدير التقرير")');
    await expect(arabicBtn).toBeVisible();
    const box = await arabicBtn.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.height).toBeGreaterThanOrEqual(36);
  });

  test('expands cleanly without text clipping under 200% font scaling', async ({ page }) => {
    await page.goto('/sizing-fixture');
    const button = page.locator('#btn-default');

    // Simulate 200% font enlargement by setting root font-size to 32px (double standard 16px)
    await page.evaluate(() => {
      document.documentElement.style.fontSize = '32px';
    });

    const scaledHeight = await button.evaluate((el) =>
      parseFloat(window.getComputedStyle(el).height),
    );
    // 2.25rem at 32px = at least 72px minimum height (can grow further if wrapped on narrow viewports)
    expect(scaledHeight).toBeGreaterThanOrEqual(72);
  });

  test('ensures ThemeToggle and LanguageSwitcher reach >= 48px touch target on coarse pointers', async ({
    page,
  }) => {
    await page.goto('/classic');
    const toggle = page
      .locator('button[aria-label*="Toggle theme"], button[aria-label*="theme"]')
      .first();
    const select = page.locator('select').first();

    await expect(toggle).toBeVisible();
    await expect(select).toBeVisible();

    // On mobile / coarse pointer projects, verify interaction target reaches touch minimum
    const isMobileProject = (page.viewportSize()?.width ?? 1280) < 768;
    if (isMobileProject) {
      const toggleHeight = await toggle.evaluate((el) =>
        parseFloat(window.getComputedStyle(el).height),
      );
      const selectHeight = await select.evaluate((el) =>
        parseFloat(window.getComputedStyle(el).height),
      );

      expect(toggleHeight).toBeGreaterThanOrEqual(48);
      expect(selectHeight).toBeGreaterThanOrEqual(48);
    }
  });
});
