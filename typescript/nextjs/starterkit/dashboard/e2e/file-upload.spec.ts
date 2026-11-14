import { expect, test } from '@playwright/test';

test.describe('Dashboard FileUpload Primitive Real-Browser Verification', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/gallery/file-upload');
    await expect(page.locator('[data-testid="gallery-file-upload"]')).toBeVisible();
  });

  test('1. Verifies initial Mixed Queue render with Uploading 52%, Completed 100%, and Failed Try Again item', async ({
    page,
  }) => {
    const dropzone = page.locator('[data-testid="interactive-file-dropzone"]');
    await expect(dropzone).toBeVisible();
    await expect(dropzone).toHaveAttribute('role', 'button');
    await expect(dropzone).toHaveAttribute('tabindex', '0');
    await expect(dropzone).toHaveAttribute('data-variant', 'dropzone');

    const list = page.locator('[data-testid="interactive-file-list"]');
    await expect(list).toBeVisible();
    await expect(list.locator('li')).toHaveCount(3);

    await expect(list).toContainText('infrastructure_diagram.png');
    await expect(list).toContainText('1.8 MB');
    await expect(list).toContainText('52%');
    const progressBar = list.getByRole('progressbar', { name: 'infrastructure_diagram.png' });
    await expect(progressBar).toHaveAttribute('aria-valuenow', '52');

    await expect(list).toContainText('security_audit_report.pdf');
    await expect(list).toContainText('Upload Successful!');
    await expect(list).toContainText('100%');

    await expect(list).toContainText('database_snapshot_raw.sql');
    await expect(list).toContainText('Upload failed! Please try again.');
    await expect(list).toContainText('Try Again');
  });

  test('2. Verifies Dropzone Variant switching between Standard Dropzone and Compact Inline', async ({
    page,
  }) => {
    const compactBtn = page.getByRole('button', { name: 'Compact Inline' });
    await compactBtn.click();

    const dropzone = page.locator('[data-testid="interactive-file-dropzone"]');
    await expect(dropzone).toHaveAttribute('data-variant', 'compact');
    await expect(dropzone).toContainText('Browse files');
  });

  test('3. Verifies Upload Queue State presets and Try Again action on failed uploads', async ({
    page,
  }) => {
    const list = page.locator('[data-testid="interactive-file-list"]');

    const retryBtn = page.getByRole('button', { name: 'Retry database_snapshot_raw.sql' });
    await retryBtn.click();
    await expect(list.locator('li[data-status="error"]')).toHaveCount(0);

    await page.getByRole('button', { name: 'Uploading', exact: true }).click();
    await expect(list.locator('li[data-status="uploading"]')).toHaveCount(2);
    await expect(list.getByRole('progressbar')).toHaveCount(2);

    await page.getByRole('button', { name: 'Failed', exact: true }).click();
    await expect(list.locator('li[data-status="error"]')).toHaveCount(2);
  });

  test('4. Verifies removing a staged file and toggling Multiple off', async ({ page }) => {
    const list = page.locator('[data-testid="interactive-file-list"]');
    const removeReportBtn = page.getByRole('button', { name: 'Remove security_audit_report.pdf' });
    await removeReportBtn.click();

    await expect(list.locator('li')).toHaveCount(2);
    await expect(list).not.toContainText('security_audit_report.pdf');

    const multipleToggle = page.locator('[data-testid="toggle-file-multiple"]');
    await multipleToggle.click();
    await expect(list.locator('li')).toHaveCount(1);
    await expect(page.locator('[class*="headerMeta"]')).toContainText('1 item(s) in queue');
  });

  test('5. Verifies Disabled state disables dropzone, retry, and remove buttons', async ({
    page,
  }) => {
    const disabledToggle = page.locator('[data-testid="toggle-file-disabled"]');
    await disabledToggle.click();

    const dropzone = page.locator('[data-testid="interactive-file-dropzone"]');
    await expect(dropzone).toHaveAttribute('aria-disabled', 'true');
    await expect(dropzone).toHaveAttribute('tabindex', '-1');

    const removeBtn = page.getByRole('button', { name: 'Remove security_audit_report.pdf' });
    await expect(removeBtn).toBeDisabled();

    const retryBtn = page.getByRole('button', { name: 'Retry database_snapshot_raw.sql' });
    await expect(retryBtn).toBeDisabled();
  });

  test('6. Verifies RTL (Arabic) mode updates lang, dir, localized status text, and retry labels', async ({
    page,
  }) => {
    const rtlButton = page.getByRole('button', { name: 'RTL (Arabic)' });
    await rtlButton.click();

    const canvas = page.locator('[class*="specimenCanvas"]');
    await expect(canvas).toHaveAttribute('dir', 'rtl');
    await expect(canvas).toHaveAttribute('lang', 'ar');

    const list = page.locator('[data-testid="interactive-file-list"]');
    await expect(list).toContainText('تقرير_التدقيق_الأمني.pdf');
    await expect(list).toContainText('تم الرفع بنجاح!');
    await expect(list).toContainText('52%');
    await expect(list).toContainText('فشل الرفع! يرجى المحاولة مرة أخرى.');
    await expect(list).toContainText('إعادة المحاولة');
  });

  test('7. Verifies 100% shadow-free dashboard compliance', async ({ page }) => {
    const dropzone = page.locator('[data-testid="interactive-file-dropzone"]');
    const list = page.locator('[data-testid="interactive-file-list"]');

    const dropzoneShadow = await dropzone.evaluate((el) => window.getComputedStyle(el).boxShadow);
    expect(dropzoneShadow === 'none' || dropzoneShadow === '').toBe(true);

    const listShadow = await list.evaluate((el) => window.getComputedStyle(el).boxShadow);
    expect(listShadow === 'none' || listShadow === '').toBe(true);
  });
});
