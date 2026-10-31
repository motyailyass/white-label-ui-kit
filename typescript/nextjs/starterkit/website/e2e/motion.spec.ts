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

test.describe('Website Motion & Reduced Motion Specification Verification', () => {
  test('computes shared duration scale and easing tokens matching dashboard in normal mode', async ({
    page,
  }) => {
    await page.goto('/');

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
    await page.goto('/');

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

  test('mobile navigation menu lifecycle operates cleanly under reduced motion', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');

    const mobileTrigger = page.locator('button[aria-label*="menu" i], button[aria-label*="navigation" i]').first();
    await expect(mobileTrigger).toBeVisible();

    // Open mobile menu
    await mobileTrigger.click();
    const mobileMenu = page.locator('[class*="mobileMenu"][data-open="true"]');
    await expect(mobileMenu).toBeVisible();

    // Close mobile menu
    await mobileTrigger.click();
    await expect(mobileMenu).toBeHidden();
  });

  test('focus indicators appear immediately without delayed transition', async ({ page }) => {
    await page.goto('/');

    const focusableButton = page.locator('button').first();
    await expect(focusableButton).toBeVisible();

    const transitionProperty = await focusableButton.evaluate((el) => {
      return window.getComputedStyle(el).transitionProperty;
    });

    expect(transitionProperty).not.toContain('outline');
    expect(transitionProperty).not.toBe('all');
  });

  test('does not animate global body/html background during theme changes', async ({ page }) => {
    await page.goto('/');

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
