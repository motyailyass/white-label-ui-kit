import { expect, test } from '@playwright/test';

test.describe('Website Z-Index & Overlay Architecture Verification', () => {
  test('computes floating navbar wrapper z-index to 100 (--z-sticky)', async ({ page }) => {
    await page.goto('/');
    const navbarWrapper = page.locator('header').first();
    await expect(navbarWrapper).toBeVisible();

    const zIndex = await navbarWrapper.evaluate((el) => {
      return window.getComputedStyle(el).zIndex;
    });

    expect(zIndex).toBe('100');
  });

  test('enforces monotonic layer order across all 10 semantic tokens matching dashboard', async ({
    page,
  }) => {
    await page.goto('/');

    const layerValues = await page.evaluate(() => {
      const root = document.documentElement;
      const style = window.getComputedStyle(root);
      return {
        base: parseInt(style.getPropertyValue('--z-base').trim(), 10),
        raised: parseInt(style.getPropertyValue('--z-raised').trim(), 10),
        sticky: parseInt(style.getPropertyValue('--z-sticky').trim(), 10),
        dropdown: parseInt(style.getPropertyValue('--z-dropdown').trim(), 10),
        overlay: parseInt(style.getPropertyValue('--z-overlay').trim(), 10),
        drawer: parseInt(style.getPropertyValue('--z-drawer').trim(), 10),
        modalBackdrop: parseInt(style.getPropertyValue('--z-modal-backdrop').trim(), 10),
        modal: parseInt(style.getPropertyValue('--z-modal').trim(), 10),
        toast: parseInt(style.getPropertyValue('--z-toast').trim(), 10),
        tooltip: parseInt(style.getPropertyValue('--z-tooltip').trim(), 10),
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

  test('nested overlay ownership: select popover inside modal renders above the modal surface', async ({
    page,
  }) => {
    await page.goto('/');

    const result = await page.evaluate(() => {
      // 1. Create simulated modal dialog surface at --z-modal (410)
      const modal = document.createElement('div');
      modal.id = 'website-test-modal';
      modal.style.position = 'fixed';
      modal.style.top = '100px';
      modal.style.left = '100px';
      modal.style.width = '400px';
      modal.style.height = '300px';
      modal.style.zIndex = 'var(--z-modal)';
      modal.style.backgroundColor = 'white';

      // 2. Create nested popover menu inside modal using --z-dropdown (200)
      const dropdown = document.createElement('div');
      dropdown.id = 'website-nested-popover';
      dropdown.style.position = 'absolute';
      dropdown.style.top = '150px';
      dropdown.style.left = '50px';
      dropdown.style.width = '150px';
      dropdown.style.height = '60px';
      dropdown.style.zIndex = 'var(--z-dropdown)';
      dropdown.style.backgroundColor = 'yellow';

      modal.appendChild(dropdown);
      document.body.appendChild(modal);

      const hitElement = document.elementFromPoint(200, 275);

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

  test('maintains identical layer hierarchy across light and dark themes (theme parity)', async ({
    page,
  }) => {
    await page.goto('/');

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
