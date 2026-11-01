import { expect, test } from '@playwright/test';

test.describe('Exclusive Modal Ownership & Drawer Regressions', () => {
  test('enforces exclusive modal ownership when opening Inspector while Sidebar is open (Sidebar -> Inspector)', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/three-column');

    const sidebar = page.locator('[data-sidebar]');
    const panel = page.locator('[data-panel]');
    const main = page.locator('main');
    const sidebarTrigger = page.locator('[data-sidebar-trigger]');
    const panelTrigger = page.locator('[data-panel-trigger]');

    await expect(sidebarTrigger).toBeVisible();
    await expect(panelTrigger).toBeVisible();

    // 1. Open mobile sidebar drawer first
    await sidebarTrigger.click();
    await expect(sidebar).toHaveAttribute('data-mobile-open', 'true');
    await expect(panel).toHaveAttribute('data-open', 'false');
    await expect(main).toHaveAttribute('inert', '');
    await expect(panel).toHaveAttribute('inert', '');

    // 2. Open Inspector via keyboard shortcut (Cmd+.)
    const isMac = process.platform === 'darwin';
    const modifier = isMac ? 'Meta' : 'Control';
    await page.keyboard.press(`${modifier}+Period`);

    // 3. Exclusive ownership: Panel becomes active dialog; Sidebar automatically closes & becomes inert
    await expect(panel).toHaveAttribute('data-open', 'true');
    await expect(panel).toHaveAttribute('role', 'dialog');
    await expect(panel).toHaveAttribute('aria-modal', 'true');
    await expect(sidebar).toHaveAttribute('data-mobile-open', 'false');
    await expect(sidebar).toHaveAttribute('inert', '');
    await expect(main).toHaveAttribute('inert', '');

    // 4. Closing Inspector releases modal state and removes inert from main
    await page.keyboard.press('Escape');
    await expect(panel).toHaveAttribute('data-open', 'false');
    await expect(main).not.toHaveAttribute('inert', '');
    expect(await page.evaluate(() => document.body.style.overflow)).toBe('');
  });

  test('enforces exclusive modal ownership when opening Sidebar while Inspector is open (Inspector -> Sidebar)', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/three-column');

    const sidebar = page.locator('[data-sidebar]');
    const panel = page.locator('[data-panel]');
    const main = page.locator('main');
    const panelTrigger = page.locator('[data-panel-trigger]');

    // 1. Open Inspector overlay first
    await panelTrigger.click();
    await expect(panel).toHaveAttribute('data-open', 'true');
    await expect(sidebar).toHaveAttribute('data-mobile-open', 'false');
    await expect(main).toHaveAttribute('inert', '');
    await expect(sidebar).toHaveAttribute('inert', '');

    // 2. Trigger Sidebar via keyboard shortcut (Cmd+B)
    const isMac = process.platform === 'darwin';
    const modifier = isMac ? 'Meta' : 'Control';
    await page.keyboard.press(`${modifier}+KeyB`);

    // 3. Exclusive ownership: Sidebar becomes active drawer; Inspector automatically closes & becomes inert
    await expect(sidebar).toHaveAttribute('data-mobile-open', 'true');
    await expect(panel).toHaveAttribute('data-open', 'false');
    await expect(panel).toHaveAttribute('inert', '');
    await expect(main).toHaveAttribute('inert', '');

    // 4. Pressing Escape closes Sidebar and restores background interaction
    await page.keyboard.press('Escape');
    await expect(sidebar).toHaveAttribute('data-mobile-open', 'false');
    await expect(main).not.toHaveAttribute('inert', '');
    expect(await page.evaluate(() => document.body.style.overflow)).toBe('');
  });

  test('manages Tab and Shift+Tab focus trap recovery and boundary wrapping inside drawers', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/three-column');

    const sidebarTrigger = page.locator('[data-sidebar-trigger]');
    const sidebar = page.locator('[data-sidebar]');

    await sidebarTrigger.click();
    await expect(sidebar).toHaveAttribute('data-mobile-open', 'true');

    // Wait for initial focus placement inside sidebar
    await expect(sidebar.locator('a, button').first()).toBeFocused();

    // 1. Outside focus recovery: simulate focus moving outside sidebar (blur active element)
    await page.evaluate(() => {
      (document.activeElement as HTMLElement | null)?.blur();
    });

    // Pressing Tab must immediately recover focus into the drawer's first focusable element
    await page.keyboard.press('Tab');
    const firstFocusable = sidebar.locator('a[href], button:not([disabled])').first();
    await expect(firstFocusable).toBeFocused();

    // Outside focus recovery with Shift+Tab: recovers focus to the drawer's last focusable element
    await page.evaluate(() => {
      (document.activeElement as HTMLElement | null)?.blur();
    });
    await page.keyboard.press('Shift+Tab');
    const lastFocusable = sidebar.locator('a[href], button:not([disabled])').last();
    await expect(lastFocusable).toBeFocused();

    // 2. Boundary wrapping: Tab on last focusable wraps to first focusable
    await page.keyboard.press('Tab');
    await expect(firstFocusable).toBeFocused();

    // Shift+Tab on first focusable wraps to last focusable
    await page.keyboard.press('Shift+Tab');
    await expect(lastFocusable).toBeFocused();
  });

  test('restores focus to trigger element on Escape and cleanup across resize transitions', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/three-column');

    const sidebarTrigger = page.locator('[data-sidebar-trigger]');
    const sidebar = page.locator('[data-sidebar]');
    const main = page.locator('main');

    // 1. Focus trigger and open
    await sidebarTrigger.focus();
    await sidebarTrigger.click();
    await expect(sidebar).toHaveAttribute('data-mobile-open', 'true');
    expect(await page.evaluate(() => document.body.style.overflow)).toBe('hidden');

    // 2. Escape closes and restores focus to trigger
    await page.keyboard.press('Escape');
    await expect(sidebar).toHaveAttribute('data-mobile-open', 'false');
    await expect(sidebarTrigger).toBeFocused();
    expect(await page.evaluate(() => document.body.style.overflow)).toBe('');
    await expect(main).not.toHaveAttribute('inert', '');

    // 3. Resize cleanup: Open mobile drawer, resize to desktop (1280px)
    await sidebarTrigger.click();
    await expect(sidebar).toHaveAttribute('data-mobile-open', 'true');

    await page.setViewportSize({ width: 1280, height: 800 });
    await expect(sidebar).toHaveAttribute('data-mobile-open', 'false');
    expect(await page.evaluate(() => document.body.style.overflow)).toBe('');
    await expect(main).not.toHaveAttribute('inert', '');

    // Returning to mobile viewport retains closed drawer state
    await page.setViewportSize({ width: 390, height: 844 });
    await expect(sidebar).toHaveAttribute('data-mobile-open', 'false');
  });

  test('drawer lifecycle operates synchronously under prefers-reduced-motion: reduce', async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/three-column');

    const panelTrigger = page.locator('[data-panel-trigger]');
    const panel = page.locator('[data-panel]');

    await panelTrigger.click();
    await expect(panel).toHaveAttribute('data-open', 'true');
    expect(await page.evaluate(() => document.body.style.overflow)).toBe('hidden');

    // Close panel with Escape
    await page.keyboard.press('Escape');
    await expect(panel).toHaveAttribute('data-open', 'false');
    expect(await page.evaluate(() => document.body.style.overflow)).toBe('');
    await expect(panelTrigger).toBeFocused();
  });
});
