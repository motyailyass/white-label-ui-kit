import { expect, test } from '@playwright/test';

test.describe('Dashboard Z-Index & Overlay Architecture Verification', () => {
  test('computes sticky header z-index to 100 (--z-sticky)', async ({ page }) => {
    await page.goto('/classic');
    const header = page.locator('header').first();
    await expect(header).toBeVisible();

    const zIndex = await header.evaluate((el) => {
      return window.getComputedStyle(el).zIndex;
    });

    expect(zIndex).toBe('100');
  });

  test('computes mobile sidebar drawer to 310 (--z-drawer) and backdrop to 300 (--z-overlay)', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/classic');

    const sidebarTrigger = page.locator('[data-sidebar-trigger]');
    await sidebarTrigger.click();

    const sidebar = page.locator('[data-sidebar]');
    await expect(sidebar).toHaveAttribute('data-mobile-open', 'true');

    const backdrop = page.locator('[data-sidebar-backdrop]');
    await expect(backdrop).toHaveAttribute('data-open', 'true');

    const { sidebarZ, backdropZ } = await page.evaluate(() => {
      const sb = document.querySelector('[data-sidebar]');
      const bd = document.querySelector('[data-sidebar-backdrop]');
      return {
        sidebarZ: sb ? window.getComputedStyle(sb).zIndex : null,
        backdropZ: bd ? window.getComputedStyle(bd).zIndex : null,
      };
    });

    expect(sidebarZ).toBe('310');
    expect(backdropZ).toBe('300');
    expect(Number.parseInt(sidebarZ!, 10)).toBeGreaterThan(Number.parseInt(backdropZ!, 10));
  });

  test('enforces monotonic layer order across all 10 semantic tokens on the page', async ({
    page,
  }) => {
    await page.goto('/classic');

    const layerValues = await page.evaluate(() => {
      const root = document.documentElement;
      const style = window.getComputedStyle(root);
      return {
        base: Number.parseInt(style.getPropertyValue('--z-base').trim(), 10),
        raised: Number.parseInt(style.getPropertyValue('--z-raised').trim(), 10),
        sticky: Number.parseInt(style.getPropertyValue('--z-sticky').trim(), 10),
        dropdown: Number.parseInt(style.getPropertyValue('--z-dropdown').trim(), 10),
        overlay: Number.parseInt(style.getPropertyValue('--z-overlay').trim(), 10),
        drawer: Number.parseInt(style.getPropertyValue('--z-drawer').trim(), 10),
        modalBackdrop: Number.parseInt(style.getPropertyValue('--z-modal-backdrop').trim(), 10),
        modal: Number.parseInt(style.getPropertyValue('--z-modal').trim(), 10),
        toast: Number.parseInt(style.getPropertyValue('--z-toast').trim(), 10),
        tooltip: Number.parseInt(style.getPropertyValue('--z-tooltip').trim(), 10),
      };
    });

    expect(layerValues.base).toBe(0);
    expect(layerValues.raised).toBe(10);
    expect(layerValues.sticky).toBe(100);
    expect(layerValues.dropdown).toBe(200);
    expect(layerValues.overlay).toBe(300);
    expect(layerValues.drawer).toBe(310);
    expect(layerValues.modalBackdrop).toBe(400);
    expect(layerValues.modal).toBe(410);
    expect(layerValues.toast).toBe(500);
    expect(layerValues.tooltip).toBe(600);

    expect(layerValues.base).toBeLessThan(layerValues.raised);
    expect(layerValues.raised).toBeLessThan(layerValues.sticky);
    expect(layerValues.sticky).toBeLessThan(layerValues.dropdown);
    expect(layerValues.dropdown).toBeLessThan(layerValues.overlay);
    expect(layerValues.overlay).toBeLessThan(layerValues.drawer);
    expect(layerValues.drawer).toBeLessThan(layerValues.modalBackdrop);
    expect(layerValues.modalBackdrop).toBeLessThan(layerValues.modal);
    expect(layerValues.modal).toBeLessThan(layerValues.toast);
    expect(layerValues.toast).toBeLessThan(layerValues.tooltip);
  });

  test('nested overlay ownership: dropdown inside modal renders above the modal surface', async ({
    page,
  }) => {
    await page.goto('/classic');

    const result = await page.evaluate(() => {
      const modal = document.createElement('div');
      modal.id = 'test-modal';
      modal.style.position = 'fixed';
      modal.style.top = '50px';
      modal.style.left = '50px';
      modal.style.width = '300px';
      modal.style.height = '200px';
      modal.style.zIndex = 'var(--z-modal)';
      modal.style.backgroundColor = 'white';

      const dropdown = document.createElement('div');
      dropdown.id = 'test-nested-dropdown';
      dropdown.style.position = 'absolute';
      dropdown.style.top = '100px';
      dropdown.style.left = '20px';
      dropdown.style.width = '100px';
      dropdown.style.height = '50px';
      dropdown.style.zIndex = 'var(--z-dropdown)';
      dropdown.style.backgroundColor = 'yellow';

      modal.appendChild(dropdown);
      document.body.appendChild(modal);

      const hitElement = document.elementFromPoint(75, 160);
      const modalZ = window.getComputedStyle(modal).zIndex;
      const dropdownZ = window.getComputedStyle(dropdown).zIndex;

      document.body.removeChild(modal);

      return {
        modalZ,
        dropdownZ,
        isDropdownOnTop: hitElement === dropdown,
      };
    });

    expect(result.modalZ).toBe('410');
    expect(result.dropdownZ).toBe('200');
    expect(result.isDropdownOnTop).toBe(true);
  });

  test('visual priority is not interaction permission: backdrop intercepts background pointer clicks', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/classic');

    const sidebarTrigger = page.locator('[data-sidebar-trigger]');
    await sidebarTrigger.click();

    const backdrop = page.locator('[data-sidebar-backdrop]');
    await expect(backdrop).toHaveAttribute('data-open', 'true');

    const backdropBox = await backdrop.boundingBox();
    expect(backdropBox).not.toBeNull();

    await page.mouse.click(350, 400);

    const sidebar = page.locator('[data-sidebar]');
    await expect(sidebar).toHaveAttribute('data-mobile-open', 'false');
  });

  test('maintains identical layer hierarchy across light and dark themes (theme parity)', async ({
    page,
  }) => {
    await page.goto('/classic');

    const lightZ = await page.evaluate(() => {
      document.documentElement.setAttribute('data-theme', 'light');
      return window.getComputedStyle(document.documentElement).getPropertyValue('--z-modal').trim();
    });

    const darkZ = await page.evaluate(() => {
      document.documentElement.setAttribute('data-theme', 'dark');
      return window.getComputedStyle(document.documentElement).getPropertyValue('--z-modal').trim();
    });

    expect(lightZ).toBe('410');
    expect(darkZ).toBe('410');
  });
});
