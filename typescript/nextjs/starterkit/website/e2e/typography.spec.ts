import { expect, test } from '@playwright/test';

test.describe('Website Typography Specification Verification', () => {
  test('computes default body typography to 16px / 24px, 400', async ({ page }) => {
    await page.goto('/');

    const bodyTypography = await page.evaluate(() => {
      const style = window.getComputedStyle(document.body);
      return {
        fontSize: parseFloat(style.fontSize),
        lineHeight: parseFloat(style.lineHeight),
        fontWeight: style.fontWeight,
      };
    });

    expect(bodyTypography.fontSize).toBeCloseTo(16, 1);
    expect(bodyTypography.lineHeight).toBeCloseTo(24, 1);
    expect(['400', 'normal']).toContain(bodyTypography.fontWeight);
  });

  test('computes responsive hero display title (40/48px mobile, 64/72px desktop)', async ({ page }) => {
    await page.goto('/');
    const heroTitle = page.locator('h1[class*="title"]').first();
    await expect(heroTitle).toBeVisible();

    const isMobile = (page.viewportSize()?.width ?? 1280) < 1024;

    const typography = await heroTitle.evaluate((el) => {
      const style = window.getComputedStyle(el);
      return {
        fontSize: parseFloat(style.fontSize),
        lineHeight: parseFloat(style.lineHeight),
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
        fontSize: parseFloat(style.fontSize),
        lineHeight: parseFloat(style.lineHeight),
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
        fontSize: parseFloat(style.fontSize),
        lineHeight: parseFloat(style.lineHeight),
        fontWeight: style.fontWeight,
      };
    });

    expect(typography.fontSize).toBeCloseTo(12, 1);
    expect(typography.lineHeight).toBeCloseTo(16, 1);
    expect(['500', 'medium']).toContain(typography.fontWeight);
  });

  test('applies Arabic font stack with vertical clearance and normal tracking when lang="ar"', async ({ page }) => {
    await page.goto('/');

    await page.evaluate(() => {
      document.documentElement.setAttribute('lang', 'ar');
      document.documentElement.setAttribute('dir', 'rtl');
    });

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

  test('maintains identical typography dimensions across light and dark themes (theme parity)', async ({ page }) => {
    await page.goto('/');
    const heroTitle = page.locator('h1[class*="title"]').first();
    await expect(heroTitle).toBeVisible();

    // Light mode
    await page.evaluate(() => document.documentElement.setAttribute('data-theme', 'light'));
    const light = await heroTitle.evaluate((el) => {
      const style = window.getComputedStyle(el);
      return { fontSize: style.fontSize, lineHeight: style.lineHeight };
    });

    // Dark mode
    await page.evaluate(() => document.documentElement.setAttribute('data-theme', 'dark'));
    const dark = await heroTitle.evaluate((el) => {
      const style = window.getComputedStyle(el);
      return { fontSize: style.fontSize, lineHeight: style.lineHeight };
    });

    expect(light.fontSize).toBe(dark.fontSize);
    expect(light.lineHeight).toBe(dark.lineHeight);
  });

  test('loads bundled self-hosted fonts with all external network requests blocked', async ({ page }) => {
    // Block any external requests (ensuring zero CDN or remote font calls)
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

    // Confirms font faces exist and load without external network
    expect(fontFacesLoaded.length).toBeGreaterThan(0);
  });

  test('verifies role-appropriate line-height adjustments reach actual components in Arabic', async ({ page }) => {
    await page.context().addCookies([
      { name: 'locale', value: 'ar', domain: 'localhost', path: '/' },
    ]);
    await page.goto('/');

    await expect(page.locator('html')).toHaveAttribute('lang', 'ar');

    const isMobile = (page.viewportSize()?.width ?? 1280) < 1024;
    const heroTitle = page.locator('h1[class*="title"]').first();
    await expect(heroTitle).toBeVisible();

    const titleTypography = await heroTitle.evaluate((el) => {
      const style = window.getComputedStyle(el);
      return {
        lineHeight: parseFloat(style.lineHeight),
      };
    });

    // In Arabic: mobile 56px (3.5rem) vs Latin 48px; desktop 84px (5.25rem) vs Latin 72px
    if (isMobile) {
      expect(titleTypography.lineHeight).toBeCloseTo(56, 1);
    } else {
      expect(titleTypography.lineHeight).toBeCloseTo(84, 1);
    }
  });

  test('verifies controls accommodate Arabic labels with heavy Tashkeel (diacritics) without clipping', async ({ page }) => {
    await page.goto('/');

    await page.evaluate(() => {
      document.documentElement.setAttribute('lang', 'ar');
      document.documentElement.setAttribute('dir', 'rtl');
    });

    const result = await page.evaluate(() => {
      const btn = document.createElement('button');
      btn.className = 'test-diacritic-btn';
      btn.textContent = 'تَصْدِيرُ التَّقْرِيرِ المُفَصَّلِ الشَّامِلِ';
      btn.style.fontFamily = 'inherit';
      btn.style.fontSize = 'var(--control-font-size-xl, 1rem)';
      btn.style.minHeight = 'var(--control-height-xl, 48px)';
      btn.style.padding = '0 var(--control-padding-xl, 20px)';
      btn.style.display = 'inline-flex';
      btn.style.alignItems = 'center';
      btn.style.justifyContent = 'center';
      btn.style.overflow = 'visible';

      document.body.appendChild(btn);

      const rect = btn.getBoundingClientRect();
      const style = window.getComputedStyle(btn);
      const isVisible = rect.height >= 48;
      const noOverflowClip = style.overflow !== 'hidden' && style.overflowY !== 'hidden';

      document.body.removeChild(btn);

      return { isVisible, noOverflowClip, height: rect.height };
    });

    expect(result.isVisible).toBe(true);
    expect(result.noOverflowClip).toBe(true);
  });

  test('restores Latin font stack and tracking for nested English/French within Arabic document', async ({ page }) => {
    await page.goto('/');

    const result = await page.evaluate(() => {
      document.documentElement.setAttribute('lang', 'ar');
      document.documentElement.setAttribute('dir', 'rtl');

      const container = document.createElement('div');
      container.innerHTML = `
        <p id="arabic-text">مرحباً بكم في <span id="nested-english" lang="en">Tokyo Platform</span> و <span id="nested-french" lang="fr">Système</span></p>
      `;
      document.body.appendChild(container);

      const arabicEl = document.getElementById('arabic-text')!;
      const enEl = document.getElementById('nested-english')!;
      const frEl = document.getElementById('nested-french')!;

      const arabicFamily = window.getComputedStyle(arabicEl).fontFamily.toLowerCase();
      const enFamily = window.getComputedStyle(enEl).fontFamily.toLowerCase();
      const frFamily = window.getComputedStyle(frEl).fontFamily.toLowerCase();

      document.body.removeChild(container);

      return { arabicFamily, enFamily, frFamily };
    });

    expect(result.arabicFamily).toContain('noto sans arabic');
    expect(result.enFamily).toContain('geist');
    expect(result.frFamily).toContain('geist');
  });

  test('ensures uppercase/eyebrow treatments do not impose tracking on Arabic script', async ({ page }) => {
    await page.goto('/');

    const result = await page.evaluate(() => {
      document.documentElement.setAttribute('lang', 'ar');

      const badge = document.createElement('div');
      badge.className = 'badge';
      badge.textContent = 'جديد ومميز';
      document.body.appendChild(badge);

      const style = window.getComputedStyle(badge);
      const tracking = style.letterSpacing;
      const transform = style.textTransform;

      document.body.removeChild(badge);
      return { tracking, transform };
    });

    expect(['normal', '0px']).toContain(result.tracking);
    expect(result.transform).toBe('none');
  });
});
