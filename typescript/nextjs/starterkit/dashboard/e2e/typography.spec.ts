import { expect, test } from '@playwright/test';

test.describe('Dashboard Typography Specification Verification', () => {
  test('computes default body typography to 14px / 20px, 400', async ({ page }) => {
    await page.goto('/classic');

    const bodyTypography = await page.evaluate(() => {
      const style = window.getComputedStyle(document.body);
      return {
        fontSize: Number.parseFloat(style.fontSize),
        lineHeight: Number.parseFloat(style.lineHeight),
        fontWeight: style.fontWeight,
      };
    });

    expect(bodyTypography.fontSize).toBeCloseTo(14, 1);
    expect(bodyTypography.lineHeight).toBeCloseTo(20, 1);
    expect(['400', 'normal']).toContain(bodyTypography.fontWeight);
  });

  test('computes page title to 24px / 32px, 600', async ({ page }) => {
    await page.goto('/classic');
    const title = page.locator('h2[class*="title"]').first();
    await expect(title).toBeVisible();

    const titleTypography = await title.evaluate((el) => {
      const style = window.getComputedStyle(el);
      return {
        fontSize: Number.parseFloat(style.fontSize),
        lineHeight: Number.parseFloat(style.lineHeight),
        fontWeight: style.fontWeight,
      };
    });

    expect(titleTypography.fontSize).toBeCloseTo(24, 1);
    expect(titleTypography.lineHeight).toBeCloseTo(32, 1);
    expect(['600', 'semibold']).toContain(titleTypography.fontWeight);
  });

  test('computes card title to 16px / 24px, 600', async ({ page }) => {
    await page.goto('/classic');
    const cardTitle = page.locator('[class*="bidiTitle"]').first();
    await expect(cardTitle).toBeVisible();

    const cardTypography = await cardTitle.evaluate((el) => {
      const style = window.getComputedStyle(el);
      return {
        fontSize: Number.parseFloat(style.fontSize),
        lineHeight: Number.parseFloat(style.lineHeight),
        fontWeight: style.fontWeight,
      };
    });

    expect(cardTypography.fontSize).toBeCloseTo(16, 1);
    expect(cardTypography.lineHeight).toBeCloseTo(24, 1);
    expect(['600', 'semibold']).toContain(cardTypography.fontWeight);
  });

  test('computes metric value to 28px / 36px, 600 with tabular figures', async ({ page }) => {
    await page.goto('/classic');
    const metricValue = page.locator('[class*="metricValue"]').first();
    await expect(metricValue).toBeVisible();

    const metricTypography = await metricValue.evaluate((el) => {
      const style = window.getComputedStyle(el);
      return {
        fontSize: Number.parseFloat(style.fontSize),
        lineHeight: Number.parseFloat(style.lineHeight),
        fontWeight: style.fontWeight,
        fontVariantNumeric: style.fontVariantNumeric,
      };
    });

    expect(metricTypography.fontSize).toBeCloseTo(28, 1);
    expect(metricTypography.lineHeight).toBeCloseTo(36, 1);
    expect(['600', 'semibold']).toContain(metricTypography.fontWeight);
    expect(metricTypography.fontVariantNumeric).toContain('tabular-nums');
  });

  test('applies Arabic font stack with vertical clearance and no added letter-spacing when lang="ar"', async ({
    page,
  }) => {
    await page.goto('/classic');

    const languageSelect = page.locator('select');
    await languageSelect.selectOption('ar');
    await expect(page.locator('html')).toHaveAttribute('lang', 'ar');

    const arabicTypography = await page.evaluate(() => {
      const style = window.getComputedStyle(document.body);
      return {
        fontFamily: style.fontFamily,
        letterSpacing: style.letterSpacing,
      };
    });

    expect(arabicTypography.fontFamily.toLowerCase()).toContain('noto sans arabic');
    expect(['normal', '0px']).toContain(arabicTypography.letterSpacing);
  });

  test('maintains identical typography dimensions across light and dark themes (theme parity)', async ({
    page,
  }) => {
    await page.goto('/classic');
    const title = page.locator('h2[class*="title"]').first();
    await expect(title).toBeVisible();

    await page.evaluate(() => document.documentElement.setAttribute('data-theme', 'light'));
    const light = await title.evaluate((el) => {
      const style = window.getComputedStyle(el);
      return { fontSize: style.fontSize, lineHeight: style.lineHeight };
    });

    await page.evaluate(() => document.documentElement.setAttribute('data-theme', 'dark'));
    const dark = await title.evaluate((el) => {
      const style = window.getComputedStyle(el);
      return { fontSize: style.fontSize, lineHeight: style.lineHeight };
    });

    expect(light.fontSize).toBe(dark.fontSize);
    expect(light.lineHeight).toBe(dark.lineHeight);
  });

  test('loads bundled self-hosted fonts with all external network requests blocked', async ({
    page,
  }) => {
    let externalRequestMade = false;
    await page.route('**', (route) => {
      const url = new URL(route.request().url());
      if (url.hostname !== 'localhost' && url.hostname !== '127.0.0.1') {
        externalRequestMade = true;
        route.abort('blockedbyclient');
      } else {
        route.continue();
      }
    });

    await page.goto('/classic');

    // 1. Verify intended primary font (Geist Sans) loaded offline
    const fontFacesLoaded = await page.evaluate(async () => {
      await document.fonts.ready;
      const results: { family: string; status: string }[] = [];
      document.fonts.forEach((font) => {
        results.push({ family: font.family, status: font.status });
      });
      return results;
    });

    expect(fontFacesLoaded.length).toBeGreaterThan(0);
    const geistLoaded = fontFacesLoaded.some(
      (f) => /geistSans/i.test(f.family) && f.status === 'loaded',
    );
    expect(geistLoaded).toBe(true);

    const errorFaces = fontFacesLoaded.filter((f) => f.status === 'error');
    expect(errorFaces.length).toBe(0);
    expect(externalRequestMade).toBe(false);

    // 2. Verify intended Arabic font (Noto Sans Arabic) loads when Arabic is rendered
    const languageSelect = page.locator('select');
    await languageSelect.selectOption('ar');
    await page.evaluate(async () => {
      await document.fonts.ready;
    });

    const arabicFontFaces = await page.evaluate(() => {
      const results: { family: string; status: string }[] = [];
      document.fonts.forEach((font) => {
        results.push({ family: font.family, status: font.status });
      });
      return results;
    });

    const arabicLoaded = arabicFontFaces.some(
      (f) => /notoSansArabic/i.test(f.family) && f.status === 'loaded',
    );
    expect(arabicLoaded).toBe(true);
    expect(externalRequestMade).toBe(false);
  });

  test('verifies role-appropriate line-height adjustments reach actual components in Arabic', async ({
    page,
  }) => {
    await page.goto('/classic');

    const languageSelect = page.locator('select');
    await languageSelect.selectOption('ar');
    await expect(page.locator('html')).toHaveAttribute('lang', 'ar');

    const title = page.locator('h2[class*="title"]').first();
    await expect(title).toBeVisible();

    const titleTypography = await title.evaluate((el) => {
      const style = window.getComputedStyle(el);
      return {
        fontSize: Number.parseFloat(style.fontSize),
        lineHeight: Number.parseFloat(style.lineHeight),
      };
    });

    expect(titleTypography.fontSize).toBeCloseTo(24, 1);
    expect(titleTypography.lineHeight).toBeCloseTo(40, 1);
  });

  test('verifies real Button primitive accommodates Arabic labels with heavy Tashkeel without clipping', async ({
    page,
  }) => {
    await page.goto('/sizing-fixture');
    await page.locator('select').selectOption('ar');
    await expect(page.locator('html')).toHaveAttribute('lang', 'ar');

    const btn = page.locator('#btn-arabic-diacritics');
    await expect(btn).toBeVisible();

    const result = await btn.evaluate((el) => {
      const rect = el.getBoundingClientRect();
      const style = window.getComputedStyle(el);
      return {
        height: rect.height,
        noOverflowClip: style.overflow !== 'hidden' && style.overflowY !== 'hidden',
        fontFamily: style.fontFamily.toLowerCase(),
      };
    });

    expect(result.height).toBeGreaterThanOrEqual(36);
    expect(result.noOverflowClip).toBe(true);
    expect(result.fontFamily).toContain('noto sans arabic');
  });

  test('restores Latin font stack for real nested English/French elements within Arabic document', async ({
    page,
  }) => {
    await page.goto('/sizing-fixture');
    await page.locator('select').selectOption('ar');
    await expect(page.locator('html')).toHaveAttribute('lang', 'ar');

    const result = await page.evaluate(() => {
      const arabicEl = document.getElementById('mixed-lang-sample')!;
      const enEl = document.getElementById('nested-english')!;
      const frEl = document.getElementById('nested-french')!;
      const enOption = document.querySelector('select option[lang="en"]')!;
      const frOption = document.querySelector('select option[lang="fr"]')!;

      return {
        arabicFamily: window.getComputedStyle(arabicEl).fontFamily.toLowerCase(),
        enFamily: window.getComputedStyle(enEl).fontFamily.toLowerCase(),
        frFamily: window.getComputedStyle(frEl).fontFamily.toLowerCase(),
        enOptionFamily: window.getComputedStyle(enOption).fontFamily.toLowerCase(),
        frOptionFamily: window.getComputedStyle(frOption).fontFamily.toLowerCase(),
      };
    });

    expect(result.arabicFamily).toContain('noto sans arabic');
    expect(result.enFamily).toContain('geist');
    expect(result.frFamily).toContain('geist');
    expect(result.enOptionFamily).toContain('geist');
    expect(result.frOptionFamily).toContain('geist');
  });

  test('ensures real uppercase/badge roles do not impose tracking on Arabic script', async ({
    page,
  }) => {
    await page.goto('/sizing-fixture');
    await page.locator('select').selectOption('ar');
    await expect(page.locator('html')).toHaveAttribute('lang', 'ar');

    const badge = page.locator('#fixture-badge');
    await expect(badge).toBeVisible();

    const result = await badge.evaluate((el) => {
      const style = window.getComputedStyle(el);
      return {
        tracking: style.letterSpacing,
        transform: style.textTransform,
      };
    });

    expect(['normal', '0px']).toContain(result.tracking);
    expect(result.transform).toBe('none');
  });
});
