import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

describe('White Label UI Kit — Typography Tokens Contract (Dashboard)', () => {
  const tokensPath = path.resolve(__dirname, 'tokens/typography.css');
  const dashboardTypographyPath = path.resolve(__dirname, 'dashboard/typography.css');
  const controlsPath = path.resolve(__dirname, 'tokens/controls.css');

  it('declares the approved primitive scale using rem values (strictly 11 steps)', () => {
    const css = fs.readFileSync(tokensPath, 'utf-8');

    const expectedTokens: Record<string, string> = {
      '--font-size-xs': '0.75rem', // 12px
      '--font-size-sm': '0.875rem', // 14px
      '--font-size-base': '1rem', // 16px
      '--font-size-lg': '1.125rem', // 18px
      '--font-size-xl': '1.25rem', // 20px
      '--font-size-2xl': '1.5rem', // 24px
      '--font-size-3xl': '1.75rem', // 28px
      '--font-size-4xl': '2rem', // 32px
      '--font-size-5xl': '2.5rem', // 40px
      '--font-size-6xl': '3rem', // 48px
      '--font-size-7xl': '4rem', // 64px
    };

    for (const [token, value] of Object.entries(expectedTokens)) {
      expect(css).toContain(`${token}: ${value};`);
    }

    // Must NOT contain 11px micro-exception token; scale is strictly 11 steps starting at 12px
    expect(css).not.toContain('--font-size-2xs');
  });

  it('declares the approved font family stacks and four useful weights', () => {
    const css = fs.readFileSync(tokensPath, 'utf-8');

    expect(css).toContain('--font-family-sans:');
    expect(css).toContain('var(--font-geist-sans)');
    expect(css).toContain('"Geist Sans"');
    expect(css).toContain('--font-family-arabic:');
    expect(css).toContain('var(--font-noto-arabic)');
    expect(css).toContain('"Noto Sans Arabic"');
    expect(css).toContain('--font-family-mono:');
    expect(css).toContain('var(--font-geist-mono)');
    expect(css).toContain('"Geist Mono"');

    expect(css).toContain('--font-weight-regular: 400;');
    expect(css).toContain('--font-weight-medium: 500;');
    expect(css).toContain('--font-weight-semibold: 600;');
    expect(css).toContain('--font-weight-bold: 700;');

    expect(css).toContain('--line-height-arabic-normal: 1.65;');
  });

  it('ships self-hosted local font assets and OFL licenses directly in the starter', () => {
    const geistFont = path.resolve(__dirname, 'fonts/geist/Geist-Variable.woff2');
    const geistMono = path.resolve(__dirname, 'fonts/geist/GeistMono-Variable.woff2');
    const geistLicense = path.resolve(__dirname, 'fonts/geist/LICENSE.txt');
    const notoFont = path.resolve(
      __dirname,
      'fonts/noto-sans-arabic/NotoSansArabic-Variable.woff2',
    );
    const notoLicense = path.resolve(__dirname, 'fonts/noto-sans-arabic/LICENSE.txt');

    expect(fs.existsSync(geistFont)).toBe(true);
    expect(fs.existsSync(geistMono)).toBe(true);
    expect(fs.existsSync(geistLicense)).toBe(true);
    expect(fs.existsSync(notoFont)).toBe(true);
    expect(fs.existsSync(notoLicense)).toBe(true);

    const licenseContent = fs.readFileSync(notoLicense, 'utf-8');
    expect(licenseContent).toContain('SIL Open Font License');
  });

  it('declares compact, readable dashboard-owned semantic typography roles with role-appropriate Arabic adjustments', () => {
    const css = fs.readFileSync(dashboardTypographyPath, 'utf-8');

    // Default body: 14px / 20px, 400
    expect(css).toContain('--typography-body-size: var(--font-size-sm);');
    expect(css).toContain('--typography-body-line-height: 1.25rem;');
    expect(css).toContain('--typography-body-weight: var(--font-weight-regular);');

    // Label: 14px / 20px, 500
    expect(css).toContain('--typography-label-size: var(--font-size-sm);');
    expect(css).toContain('--typography-label-line-height: 1.25rem;');
    expect(css).toContain('--typography-label-weight: var(--font-weight-medium);');

    // Supporting text: 12px / 16px, 400
    expect(css).toContain('--typography-supporting-size: var(--font-size-xs);');
    expect(css).toContain('--typography-supporting-line-height: 1rem;');
    expect(css).toContain('--typography-supporting-weight: var(--font-weight-regular);');

    // Page title: 24px / 32px, 600
    expect(css).toContain('--typography-page-title-size: var(--font-size-2xl);');
    expect(css).toContain('--typography-page-title-line-height: 2rem;');
    expect(css).toContain('--typography-page-title-weight: var(--font-weight-semibold);');

    // Role-appropriate Arabic adjustments
    expect(css).toContain('--typography-page-title-line-height: 2.5rem;');
    expect(css).toContain('--typography-body-line-height: 1.5rem;');
    expect(css).toContain('--typography-supporting-line-height: 1.25rem;');

    // Section title: 20px / 28px, 600
    expect(css).toContain('--typography-section-title-size: var(--font-size-xl);');
    expect(css).toContain('--typography-section-title-line-height: 1.75rem;');
    expect(css).toContain('--typography-section-title-weight: var(--font-weight-semibold);');

    // Card title: 16px / 24px, 600
    expect(css).toContain('--typography-card-title-size: var(--font-size-base);');
    expect(css).toContain('--typography-card-title-line-height: 1.5rem;');
    expect(css).toContain('--typography-card-title-weight: var(--font-weight-semibold);');

    // Metric value: 28px / 36px, 600
    expect(css).toContain('--typography-metric-value-size: var(--font-size-3xl);');
    expect(css).toContain('--typography-metric-value-line-height: 2.25rem;');
    expect(css).toContain('--typography-metric-value-weight: var(--font-weight-semibold);');

    // Table body: 14px / 20px, 400
    expect(css).toContain('--typography-table-body-size: var(--font-size-sm);');
    expect(css).toContain('--typography-table-body-line-height: 1.25rem;');

    // Table heading: 12px / 16px, 500
    expect(css).toContain('--typography-table-heading-size: var(--font-size-xs);');
    expect(css).toContain('--typography-table-heading-line-height: 1rem;');
    expect(css).toContain('--typography-table-heading-weight: var(--font-weight-medium);');
  });

  it('preserves existing control sizing typography contract intact', () => {
    const css = fs.readFileSync(controlsPath, 'utf-8');

    expect(css).toContain('--control-font-size-xs: 0.875rem;');
    expect(css).toContain('--control-line-height-xs: 1.25rem;');
    expect(css).toContain('--control-font-size-sm: 0.875rem;');
    expect(css).toContain('--control-line-height-sm: 1.25rem;');
    expect(css).toContain('--control-font-size-md: 0.875rem;');
    expect(css).toContain('--control-line-height-md: 1.25rem;');
    expect(css).toContain('--control-font-size-lg: 0.875rem;');
    expect(css).toContain('--control-line-height-lg: 1.25rem;');
    expect(css).toContain('--control-font-size-xl: 1rem;');
    expect(css).toContain('--control-line-height-xl: 1.5rem;');
    expect(css).toContain('--control-font-size-2xl: 1rem;');
    expect(css).toContain('--control-line-height-2xl: 1.5rem;');
  });
});
