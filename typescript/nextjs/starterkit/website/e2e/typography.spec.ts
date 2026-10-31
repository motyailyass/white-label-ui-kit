import { expect, test } from '@playwright/test';

test.describe('Website Typography Specification Verification', () => {
  test('computes default body typography to 16px / 24px, 400', async ({ page }) => {
    await page.goto('/');

    const bodyTypography = await page.evaluate(() => {
      const style = window.getComputedStyle(document.body);
      return {
        fontSize: Number.parseFloat(style.fontSize),
        lineHeight: Number.parseFloat(style.lineHeight),
        fontWeight: style.fontWeight,
      };
    });

    expect(bodyTypography.fontSize).toBeCloseTo(16, 1);
    expect(bodyTypography.lineHeight).toBeCloseTo(24, 1);
    expect(['400', 'normal']).toContain(bodyTypography.fontWeight);
  });

  test('computes responsive hero display title (40/48px mobile, 64/72px desktop)', async ({
    page,
  }) => {
    await page.goto('/');
    const heroTitle = page.locator('h1[class*="title"]').first();
    await expect(heroTitle).toBeVisible();

    const isMobile = (page.viewportSize()?.width ?? 1280) < 1024;

    const typography = await heroTitle.evaluate((el) => {
      const style = window.getComputedStyle(el);
      return {
        fontSize: Number.parseFloat(style.fontSize),
        lineHeight: Number.parseFloat(style.lineHeight),
        fontWeight: style.fontWeight,
      };
    });

    if (isMobile) {
      expect(typography.fontSize).toBeCloseTo(40, 1);
      expect(typography.lineHeight).toBeCloseTo(48, 1);
    } else {
      expect(typography.fontSize).toBeCloseTo(64, 1);
      expect(typography.lineHeight).toBeCloseTo(72, 1);
    }
    expect(['600', 'semibold']).toContain(typography.fontWeight);
  });

  test('computes responsive section title (28/36px mobile, 40/48px desktop)', async ({ page }) => {
    await page.goto('/');
    const sectionTitle = page.locator('h2[class*="title"]').first();
    await expect(sectionTitle).toBeVisible();

    const isMobile = (page.viewportSize()?.width ?? 1280) < 1024;

    const typography = await sectionTitle.evaluate((el) => {
      const style = window.getComputedStyle(el);
      return {
        fontSize: Number.parseFloat(style.fontSize),
        lineHeight: Number.parseFloat(style.lineHeight),
      };
    });

    if (isMobile) {
      expect(typography.fontSize).toBeCloseTo(28, 1);
      expect(typography.lineHeight).toBeCloseTo(36, 1);
    } else {
      expect(typography.fontSize).toBeCloseTo(40, 1);
      expect(typography.lineHeight).toBeCloseTo(48, 1);
    }
  });

  test('computes eyebrow label to 12px / 16px, 500', async ({ page }) => {
    await page.goto('/');
    const eyebrow = page.locator('div[class*="tag"]').first();
    await expect(eyebrow).toBeVisible();

    const typography = await eyebrow.evaluate((el) => {
      const style = window.getComputedStyle(el);
      return {
        fontSize: Number.parseFloat(style.fontSize),
        lineHeight: Number.parseFloat(style.lineHeight),
        fontWeight: style.fontWeight,
      };
    });

    expect(typography.fontSize).toBeCloseTo(12, 1);
    expect(typography.lineHeight).toBeCloseTo(16, 1);
    expect(['500', 'medium']).toContain(typography.fontWeight);
  });

  test('applies Arabic font stack with vertical clearance and normal tracking when lang="ar"', async ({
    page,
  }) => {
    await page.goto('/');
    await page.locator('select').first().selectOption('ar');
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
    await page.goto('/');
    const heroTitle = page.locator('h1[class*="title"]').first();
    await expect(heroTitle).toBeVisible();

    await page.evaluate(() => document.documentElement.setAttribute('data-theme', 'light'));
    const light = await heroTitle.evaluate((el) => {
      const style = window.getComputedStyle(el);
      return { fontSize: style.fontSize, lineHeight: style.lineHeight };
    });

    await page.evaluate(() => document.documentElement.setAttribute('data-theme', 'dark'));
    const dark = await heroTitle.evaluate((el) => {
      const style = window.getComputedStyle(el);
      return { fontSize: style.fontSize, lineHeight: style.lineHeight };
    });

    expect(light.fontSize).toBe(dark.fontSize);
    expect(light.lineHeight).toBe(dark.lineHeight);
  });

  test('loads bundled self-hosted fonts with all external network requests blocked', async ({
    page,
  }) => {
    await page.route('**', (route) => {
      const url = new URL(route.request().url());
      if (url.hostname !== 'localhost' && url.hostname !== '127.0.0.1') {
        route.abort('blockedbyclient');
      } else {
        route.continue();
      }
    });

    await page.goto('/');

    const fontFacesLoaded = await page.evaluate(async () => {
      await document.fonts.ready;
      const loaded: { family: string; status: string }[] = [];
      document.fonts.forEach((font) => {
        loaded.push({ family: font.family, status: font.status });
      });
      return loaded;
    });

    expect(fontFacesLoaded.length).toBeGreaterThan(0);
  });

  test('verifies role-appropriate line-height adjustments reach actual components in Arabic', async ({
    page,
  }) => {
    await page
      .context()
      .addCookies([{ name: 'locale', value: 'ar', domain: 'localhost', path: '/' }]);
    await page.goto('/');

    await expect(page.locator('html')).toHaveAttribute('lang', 'ar');

    const isMobile = (page.viewportSize()?.width ?? 1280) < 1024;
    const heroTitle = page.locator('h1[class*="title"]').first();
    await expect(heroTitle).toBeVisible();

    const titleTypography = await heroTitle.evaluate((el) => {
      const style = window.getComputedStyle(el);
      return {
        lineHeight: Number.parseFloat(style.lineHeight),
      };
    });

    if (isMobile) {
      expect(titleTypography.lineHeight).toBeCloseTo(56, 1);
    } else {
      expect(titleTypography.lineHeight).toBeCloseTo(84, 1);
    }
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

    expect(result.height).toBeGreaterThanOrEqual(48);
    expect(result.noOverflowClip).toBe(true);
    expect(result.fontFamily).toContain('noto sans arabic');
  });

  test('restores Latin font stack for real nested English/French elements and code snippets within Arabic document', async ({
    page,
  }) => {
    await page.goto('/sizing-fixture');
    await page.locator('select').selectOption('ar');
    await expect(page.locator('html')).toHaveAttribute('lang', 'ar');

    const result = await page.evaluate(() => {
      const arabicEl = document.getElementById('mixed-lang-sample')!;
      const enEl = document.getElementById('nested-english')!;
      const frEl = document.getElementById('nested-french')!;

      return {
        arabicFamily: window.getComputedStyle(arabicEl).fontFamily.toLowerCase(),
        enFamily: window.getComputedStyle(enEl).fontFamily.toLowerCase(),
        frFamily: window.getComputedStyle(frEl).fontFamily.toLowerCase(),
      };
    });

    expect(result.arabicFamily).toContain('noto sans arabic');
    expect(result.enFamily).toContain('geist');
    expect(result.frFamily).toContain('geist');
  });

  test('ensures real uppercase/eyebrow roles on landing page do not impose tracking on Arabic script', async ({
    page,
  }) => {
    await page.goto('/');
    await page.locator('select').first().selectOption('ar');
    await expect(page.locator('html')).toHaveAttribute('lang', 'ar');

    const eyebrow = page.locator('[data-role="eyebrow"]').first();
    await expect(eyebrow).toBeVisible();

    const result = await eyebrow.evaluate((el) => {
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
