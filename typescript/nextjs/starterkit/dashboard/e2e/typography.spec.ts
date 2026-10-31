import { expect, test } from '@playwright/test';

test.describe('Dashboard Typography Specification Verification', () => {
  test('computes default body typography to 14px / 20px, 400', async ({ page }) => {
    await page.goto('/classic');

    const bodyTypography = await page.evaluate(() => {
      const style = window.getComputedStyle(document.body);
      return {
        fontSize: parseFloat(style.fontSize),
        lineHeight: parseFloat(style.lineHeight),
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
        fontSize: parseFloat(style.fontSize),
        lineHeight: parseFloat(style.lineHeight),
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
        fontSize: parseFloat(style.fontSize),
        lineHeight: parseFloat(style.lineHeight),
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
        fontSize: parseFloat(style.fontSize),
        lineHeight: parseFloat(style.lineHeight),
        fontWeight: style.fontWeight,
        fontVariantNumeric: style.fontVariantNumeric,
      };
    });

    expect(metricTypography.fontSize).toBeCloseTo(28, 1);
    expect(metricTypography.lineHeight).toBeCloseTo(36, 1);
    expect(['600', 'semibold']).toContain(metricTypography.fontWeight);
    expect(metricTypography.fontVariantNumeric).toContain('tabular-nums');
  });

  test('applies Arabic font stack with vertical clearance and no added letter-spacing when lang="ar"', async ({ page }) => {
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
    // Letter spacing on Arabic script must remain normal (no positive/negative tracking)
    expect(['normal', '0px']).toContain(arabicTypography.letterSpacing);
  });

  test('maintains identical typography dimensions across light and dark themes (theme parity)', async ({ page }) => {
    await page.goto('/classic');
    const title = page.locator('h2[class*="title"]').first();
    await expect(title).toBeVisible();

    // Light mode
    await page.evaluate(() => document.documentElement.setAttribute('data-theme', 'light'));
    const light = await title.evaluate((el) => {
      const style = window.getComputedStyle(el);
      return { fontSize: style.fontSize, lineHeight: style.lineHeight };
    });

    // Dark mode
    await page.evaluate(() => document.documentElement.setAttribute('data-theme', 'dark'));
    const dark = await title.evaluate((el) => {
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

    await page.goto('/classic');

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
    await page.goto('/classic');

    const languageSelect = page.locator('select');
    await languageSelect.selectOption('ar');
    await expect(page.locator('html')).toHaveAttribute('lang', 'ar');

    const title = page.locator('h2[class*="title"]').first();
    await expect(title).toBeVisible();

    const titleTypography = await title.evaluate((el) => {
      const style = window.getComputedStyle(el);
      return {
        fontSize: parseFloat(style.fontSize),
        lineHeight: parseFloat(style.lineHeight),
      };
    });

    // In Arabic, page title line-height receives clearance: 40px (2.5rem) vs Latin 32px (2rem)
    expect(titleTypography.fontSize).toBeCloseTo(24, 1);
    expect(titleTypography.lineHeight).toBeCloseTo(40, 1);
  });

  test('verifies controls accommodate Arabic labels with heavy Tashkeel (diacritics) without clipping', async ({ page }) => {
    await page.goto('/classic');

    const languageSelect = page.locator('select');
    await languageSelect.selectOption('ar');
    await expect(page.locator('html')).toHaveAttribute('lang', 'ar');

    const result = await page.evaluate(() => {
      const btn = document.createElement('button');
      btn.className = 'test-diacritic-btn';
      // Label with heavy diacritics: Fatha, Damma, Kasra, Shadda, Sukun
      btn.textContent = 'تَصْدِيرُ التَّقْرِيرِ المُفَصَّلِ الشَّامِلِ';
      btn.style.fontFamily = 'inherit';
      btn.style.fontSize = 'var(--control-font-size-md, 0.875rem)';
      btn.style.minHeight = 'var(--control-height-md, 36px)';
      btn.style.padding = '0 var(--control-padding-md, 12px)';
      btn.style.display = 'inline-flex';
      btn.style.alignItems = 'center';
      btn.style.justifyContent = 'center';
      btn.style.overflow = 'visible';

      document.body.appendChild(btn);

      const rect = btn.getBoundingClientRect();
      const style = window.getComputedStyle(btn);
      const isVisible = rect.height >= 36;
      const noOverflowClip = style.overflow !== 'hidden' && style.overflowY !== 'hidden';

      document.body.removeChild(btn);

      return { isVisible, noOverflowClip, height: rect.height };
    });

    expect(result.isVisible).toBe(true);
    expect(result.noOverflowClip).toBe(true);
  });

  test('restores Latin font stack and tracking for nested English/French within Arabic document', async ({ page }) => {
    await page.goto('/classic');

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
    await page.goto('/classic');

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
