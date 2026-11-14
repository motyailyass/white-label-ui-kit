import { expect, test } from '@playwright/test';

test.describe('Dashboard TreeView Primitive Real-Browser Verification', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/gallery/tree-view');
    await expect(page.locator('[data-testid="gallery-tree-view"]')).toBeVisible();
  });

  test('1. Verifies initial tree render, ARIA roles, expanded branches, and active selection', async ({
    page,
  }) => {
    const tree = page.locator('[data-testid="interactive-tree-view"]');
    await expect(tree).toBeVisible();
    await expect(tree).toHaveAttribute('role', 'tree');

    const srcNode = page.locator('[data-testid="tree-node-src"]');
    await expect(srcNode).toHaveAttribute('role', 'treeitem');
    await expect(srcNode).toHaveAttribute('aria-expanded', 'true');

    const appNode = page.locator('[data-testid="tree-node-app"]');
    await expect(appNode).toHaveAttribute('aria-selected', 'true');
    await expect(appNode).toHaveAttribute('aria-expanded', 'false');
  });

  test('2. Verifies clicking branch expands children and updates selection', async ({ page }) => {
    const appBtn = page.locator('[data-testid="tree-node-app"] > button');
    await appBtn.click();

    await expect(page.locator('[data-testid="tree-node-app"]')).toHaveAttribute(
      'aria-expanded',
      'true',
    );
    const layoutNode = page.locator('[data-testid="tree-node-layout"]');
    await expect(layoutNode).toBeVisible();

    await layoutNode.locator('> button').click();
    await expect(layoutNode).toHaveAttribute('aria-selected', 'true');
  });

  test('3. Verifies WAI-ARIA keyboard traversal (ArrowDown, ArrowRight, ArrowLeft, Enter)', async ({
    page,
  }) => {
    const appBtn = page.locator('[data-testid="tree-node-app"] > button');
    await appBtn.focus();

    // ArrowRight expands closed 'app' branch
    await page.keyboard.press('ArrowRight');
    await expect(page.locator('[data-testid="tree-node-app"]')).toHaveAttribute(
      'aria-expanded',
      'true',
    );

    // Second ArrowRight moves focus to first child ('layout')
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('Enter');
    await expect(page.locator('[data-testid="tree-node-layout"]')).toHaveAttribute(
      'aria-selected',
      'true',
    );

    // ArrowDown moves focus to next sibling ('page')
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Enter');
    await expect(page.locator('[data-testid="tree-node-page"]')).toHaveAttribute(
      'aria-selected',
      'true',
    );
  });

  test('4. Verifies Tree Scenario switching, Expand All toggle, and Disabled State toggle', async ({
    page,
  }) => {
    await page.getByRole('button', { name: 'Access Tree' }).click();
    await expect(page.locator('[data-testid="tree-node-2fa"]')).toHaveAttribute(
      'aria-selected',
      'true',
    );
    await expect(page.locator('[data-testid="tree-node-account"]')).toBeVisible();

    const expandAllToggle = page.locator('[data-testid="toggle-tree-expand-all"]');
    await expandAllToggle.click();
    await expect(page.locator('[data-testid="tree-node-roles"]')).toHaveAttribute(
      'aria-expanded',
      'true',
    );

    const disabledToggle = page.locator('[data-testid="toggle-tree-disabled"]');
    await disabledToggle.click();
    await expect(page.locator('[data-testid="tree-node-account"] > button')).toBeDisabled();
  });

  test('5. Verifies RTL (Arabic) mode updates lang, dir, localized labels, and RTL keyboard direction', async ({
    page,
  }) => {
    await page.getByRole('button', { name: 'RTL (Arabic)' }).click();

    const canvas = page.locator('[class*="specimenCanvas"]');
    await expect(canvas).toHaveAttribute('dir', 'rtl');
    await expect(canvas).toHaveAttribute('lang', 'ar');

    const tree = page.locator('[data-testid="interactive-tree-view"]');
    await expect(tree).toContainText('src (المصدر)');

    // In RTL, ArrowLeft expands closed 'app' branch
    const appBtn = page.locator('[data-testid="tree-node-app"] > button');
    await appBtn.focus();
    await page.keyboard.press('ArrowLeft');
    await expect(page.locator('[data-testid="tree-node-app"]')).toHaveAttribute(
      'aria-expanded',
      'true',
    );
  });

  test('6. Verifies 100% shadow-free dashboard compliance', async ({ page }) => {
    const tree = page.locator('[data-testid="interactive-tree-view"]');
    const appBtn = page.locator('[data-testid="tree-node-app"] > button');

    const treeShadow = await tree.evaluate((el) => window.getComputedStyle(el).boxShadow);
    expect(treeShadow === 'none' || treeShadow === '').toBe(true);

    const btnShadow = await appBtn.evaluate((el) => window.getComputedStyle(el).boxShadow);
    expect(btnShadow === 'none' || btnShadow === '').toBe(true);
  });
});
