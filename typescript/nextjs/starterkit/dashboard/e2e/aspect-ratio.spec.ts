import { expect, test } from '@playwright/test';

test.describe('Dashboard AspectRatio Studio Real-Browser Verification', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/gallery/aspect-ratio');
    await expect(page.locator('[data-testid="gallery-aspect-ratio"]')).toBeVisible();
  });

  test('1. Switches aspect ratios and verifies fluid geometry (16:9, 4:3, 1:1, 21:9)', async ({
    page,
  }) => {
    const liveContainer = page.locator('[data-testid="live-aspect-ratio"]');
    await expect(liveContainer).toBeVisible();

    // Default 16:9
    let box = await liveContainer.boundingBox();
    expect(box).not.toBeNull();
    if (box) {
      expect(box.width / box.height).toBeCloseTo(16 / 9, 1);
    }

    // Switch to 4:3
    await page.locator('[data-testid="aspect-ratio-ratio-4-3"]').click();
    await expect(liveContainer).toHaveAttribute('data-ratio', String(4 / 3));
    box = await liveContainer.boundingBox();
    if (box) {
      expect(box.width / box.height).toBeCloseTo(4 / 3, 1);
    }

    // Switch to 1:1
    await page.locator('[data-testid="aspect-ratio-ratio-1-1"]').click();
    await expect(liveContainer).toHaveAttribute('data-ratio', '1');
    box = await liveContainer.boundingBox();
    if (box) {
      expect(box.width / box.height).toBeCloseTo(1, 1);
    }

    // Switch to 21:9
    await page.locator('[data-testid="aspect-ratio-ratio-21-9"]').click();
    await expect(liveContainer).toHaveAttribute('data-ratio', String(21 / 9));
    box = await liveContainer.boundingBox();
    if (box) {
      expect(box.width / box.height).toBeCloseTo(21 / 9, 1);
    }
  });

  test('2. Switches content type and verifies universal child filling and zero dashboard shadows', async ({
    page,
  }) => {
    const liveContainer = page.locator('[data-testid="live-aspect-ratio"]');
    const mediaCanvas = page.locator('[data-testid="aspect-ratio-media-canvas"]');

    await expect(mediaCanvas).toBeVisible();

    // Check child stretches to fill container 100%
    const containerBox = await liveContainer.boundingBox();
    const mediaBox = await mediaCanvas.boundingBox();
    expect(mediaBox?.width).toBeCloseTo(containerBox?.width ?? 0, 1);
    expect(mediaBox?.height).toBeCloseTo(containerBox?.height ?? 0, 1);

    // Switch content preset to card
    await page.locator('[data-testid="aspect-ratio-content-card"]').click();
    const cardCanvas = page.locator('[data-testid="aspect-ratio-card-canvas"]');
    await expect(cardCanvas).toBeVisible();

    const cardBox = await cardCanvas.boundingBox();
    expect(cardBox?.width).toBeCloseTo(containerBox?.width ?? 0, 1);
    expect(cardBox?.height).toBeCloseTo(containerBox?.height ?? 0, 1);

    // Zero-shadow policy verification in dashboard
    const shadow = await liveContainer.evaluate((el) => window.getComputedStyle(el).boxShadow);
    expect(shadow).toBe('none');
  });

  test('3. Verifies RTL direction and authentic Arabic specimen text', async ({ page }) => {
    const subtext = page.locator('[data-testid="aspect-ratio-subtext"]');
    await expect(subtext).toBeVisible();

    // Switch to RTL
    await page.locator('[data-testid="aspect-ratio-dir-rtl"]').click();
    const canvas = page.locator('[data-testid="studio-preview-canvas"]');
    await expect(canvas).toHaveAttribute('dir', 'rtl');

    // Subtext must display authentic Arabic characters
    await expect(subtext).toHaveText(/[\u0600-\u06FF]/);

    // Switch content to card under RTL and verify Arabic card text
    await page.locator('[data-testid="aspect-ratio-content-card"]').click();
    await expect(subtext).toHaveText(/[\u0600-\u06FF]/);
  });
});
