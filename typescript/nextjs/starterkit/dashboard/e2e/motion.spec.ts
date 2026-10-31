import { expect, test } from '@playwright/test';

const parseDurationMs = (val: string): number => {
  const trimmed = val.trim();
  if (trimmed.endsWith('ms')) return parseFloat(trimmed);
  if (trimmed.endsWith('s')) return parseFloat(trimmed) * 1000;
  return parseFloat(trimmed);
};

const normalizeEasing = (val: string): string => {
  return val.replace(/(?<=[,( ]|^)\.([0-9]+)/g, '0.$1');
};

test.describe('Dashboard Motion & Reduced Motion Specification Verification', () => {
  test('computes shared duration scale and easing tokens correctly in normal mode', async ({
    page,
  }) => {
    await page.goto('/classic');

    const tokens = await page.evaluate(() => {
      const style = window.getComputedStyle(document.documentElement);
      return {
        instant: style.getPropertyValue('--motion-duration-instant'),
        fast: style.getPropertyValue('--motion-duration-fast'),
        normal: style.getPropertyValue('--motion-duration-normal'),
        slow: style.getPropertyValue('--motion-duration-slow'),
        easeStandard: style.getPropertyValue('--motion-ease-standard').trim(),
        easeEnter: style.getPropertyValue('--motion-ease-enter').trim(),
        easeExit: style.getPropertyValue('--motion-ease-exit').trim(),
      };
    });

    expect(parseDurationMs(tokens.instant)).toBe(0);
    expect(parseDurationMs(tokens.fast)).toBe(120);
    expect(parseDurationMs(tokens.normal)).toBe(180);
    expect(parseDurationMs(tokens.slow)).toBe(240);
    expect(normalizeEasing(tokens.easeStandard)).toBe('cubic-bezier(0.2, 0, 0, 1)');
    expect(normalizeEasing(tokens.easeEnter)).toBe('cubic-bezier(0, 0, 0, 1)');
    expect(normalizeEasing(tokens.easeExit)).toBe('cubic-bezier(0.4, 0, 1, 1)');
  });

  test('collapses durations to 0ms and enforces auto scroll under prefers-reduced-motion: reduce', async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/classic');

    const reducedTokens = await page.evaluate(() => {
      const style = window.getComputedStyle(document.documentElement);
      return {
        fast: style.getPropertyValue('--motion-duration-fast'),
        normal: style.getPropertyValue('--motion-duration-normal'),
        slow: style.getPropertyValue('--motion-duration-slow'),
        scrollBehavior: style.scrollBehavior,
      };
    });

    expect(parseDurationMs(reducedTokens.fast)).toBe(0);
    expect(parseDurationMs(reducedTokens.normal)).toBe(0);
    expect(parseDurationMs(reducedTokens.slow)).toBe(0);
    expect(reducedTokens.scrollBehavior).toBe('auto');
  });

  test('drawer lifecycle completes immediately without stalling under reduced motion (focus, scroll lock, inert, backdrop)', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/classic');

    const trigger = page.locator('#app-sidebar-trigger');
    const sidebar = page.locator('#app-sidebar');
    const backdrop = page.locator('#app-sidebar-backdrop');

    await expect(trigger).toBeVisible();
    await expect(sidebar).toHaveAttribute('data-mobile-open', 'false');
    expect(await page.evaluate(() => document.body.style.overflow)).toBe('');

    // Open mobile sidebar drawer
    await trigger.click();
    await expect(sidebar).toHaveAttribute('data-mobile-open', 'true');
    await expect(backdrop).toHaveAttribute('data-open', 'true');

    // Verify body scroll is locked and inert is removed from sidebar
    const openState = await page.evaluate(() => ({
      bodyOverflow: document.body.style.overflow,
      sidebarInert: document.querySelector('#app-sidebar')?.hasAttribute('inert'),
    }));
    expect(openState.bodyOverflow).toBe('hidden');
    expect(openState.sidebarInert).toBe(false);

    // Close mobile drawer by clicking outside on the uncovered backdrop (x: 350, y: 400)
    await page.mouse.click(350, 400);

    // Verify immediate state cleanup: drawer closed, backdrop hidden, scroll unlocked, inert restored, focus restored
    await expect(sidebar).toHaveAttribute('data-mobile-open', 'false');
    await expect(backdrop).toHaveAttribute('data-open', 'false');

    const closedState = await page.evaluate(() => ({
      bodyOverflow: document.body.style.overflow,
      sidebarInert: document.querySelector('#app-sidebar')?.hasAttribute('inert'),
    }));
    expect(closedState.bodyOverflow).toBe('');
    expect(closedState.sidebarInert).toBe(true);

    // Focus restored to trigger without depending on transitionend
    await expect(trigger).toBeFocused();
  });

  test('focus indicators appear immediately without delayed transition', async ({ page }) => {
    await page.goto('/classic');

    const focusableButton = page.locator('button').first();
    await expect(focusableButton).toBeVisible();

    const transitionProperty = await focusableButton.evaluate((el) => {
      return window.getComputedStyle(el).transitionProperty;
    });

    expect(transitionProperty).not.toContain('outline');
    expect(transitionProperty).not.toBe('all');
  });

  test('does not animate global body/html background during theme changes', async ({ page }) => {
    await page.goto('/classic');

    const durations = await page.evaluate(() => {
      const bodyStyle = window.getComputedStyle(document.body);
      const htmlStyle = window.getComputedStyle(document.documentElement);
      return {
        bodyDuration: parseFloat(bodyStyle.transitionDuration),
        htmlDuration: parseFloat(htmlStyle.transitionDuration),
      };
    });

    expect(durations.bodyDuration).toBe(0);
    expect(durations.htmlDuration).toBe(0);
  });
});
