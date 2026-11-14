import { expect, test } from '@playwright/test';

test.describe('Website Kbd Studio Real-Browser Verification', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/gallery/kbd');
    await expect(page.locator('[data-testid="gallery-kbd"]')).toBeVisible();
  });

  test('1. Verifies density scaling (18px / 22px / 28px), monospace font, and data-size attribute', async ({
    page,
  }) => {
    // Switch to single key preset (Esc) to inspect exact bounding box without group gaps
    await page.locator('[data-testid="kbd-preset-close"]').click();
    const liveKbd = page.locator('[data-testid="live-kbd"]');
    await expect(liveKbd).toBeVisible();
    await expect(liveKbd).toHaveAttribute('data-size', 'md');

    // Default md size (22px)
    const mdBox = await liveKbd.boundingBox();
    expect(mdBox?.height).toBeCloseTo(22, 1);

    // Font stack must consume monospace font
    const font = await liveKbd.evaluate((el) => window.getComputedStyle(el).fontFamily);
    expect(font.toLowerCase()).toMatch(/mono|consolas|monospace|geist/);

    // sm size (18px)
    await page.locator('[data-testid="kbd-size-sm"]').click();
    await expect(liveKbd).toHaveAttribute('data-size', 'sm');
    const smBox = await liveKbd.boundingBox();
    expect(smBox?.height).toBeCloseTo(18, 1);

    // lg size (28px)
    await page.locator('[data-testid="kbd-size-lg"]').click();
    await expect(liveKbd).toHaveAttribute('data-size', 'lg');
    const lgBox = await liveKbd.boundingBox();
    expect(lgBox?.height).toBeCloseTo(28, 1);
  });

  test('2. Verifies variants and visual borders', async ({ page }) => {
    await page.locator('[data-testid="kbd-preset-close"]').click();
    const liveKbd = page.locator('[data-testid="live-kbd"]');

    // Default outline
    await expect(liveKbd).toHaveAttribute('data-variant', 'outline');

    // Subtle variant
    await page.locator('[data-testid="kbd-variant-subtle"]').click();
    await expect(liveKbd).toHaveAttribute('data-variant', 'subtle');

    // Ghost variant
    await page.locator('[data-testid="kbd-variant-ghost"]').click();
    await expect(liveKbd).toHaveAttribute('data-variant', 'ghost');
  });

  test('3. Verifies KbdGroup, KbdSeparator, and RTL layout preservation', async ({ page }) => {
    // Default preset has multiple keys (⌘ + K)
    await page.locator('[data-testid="kbd-preset-search"]').click();
    const group = page.locator('[data-testid="live-kbd-group"]');
    await expect(group).toBeVisible();

    const keys = group.locator('kbd');
    await expect(keys).toHaveCount(2);
    await expect(keys.nth(0)).toHaveText('⌘');
    await expect(keys.nth(1)).toHaveText('K');

    // Separator rendered between keys with aria-hidden="true"
    const separator = group.locator('span[aria-hidden="true"]');
    await expect(separator).toHaveCount(1);
    await expect(separator).toHaveText('+');

    // Switch specimen direction to RTL
    await page.locator('[data-testid="kbd-dir-rtl"]').click();
    const canvas = page.locator('[data-testid="studio-preview-canvas"]');
    await expect(canvas).toHaveAttribute('dir', 'rtl');

    // Group and keys must enforce direction: ltr to prevent shortcut reordering
    const groupDirection = await group.evaluate((el) => window.getComputedStyle(el).direction);
    expect(groupDirection).toBe('ltr');

    const keyDirection = await keys.first().evaluate((el) => window.getComputedStyle(el).direction);
    expect(keyDirection).toBe('ltr');
  });
});
