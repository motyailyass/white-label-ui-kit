import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

describe('White Label UI Kit — Typography Tokens Contract (Website)', () => {
  const tokensPath = path.resolve(__dirname, 'tokens/typography.css');
  const websiteTypographyPath = path.resolve(__dirname, 'website/typography.css');
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

  it('declares comfortable, expressive website-owned semantic typography roles with role-appropriate Arabic adjustments', () => {
    const css = fs.readFileSync(websiteTypographyPath, 'utf-8');

    // Default body: 16px / 24px, 400
    expect(css).toContain('--typography-body-size: var(--font-size-base);');
    expect(css).toContain('--typography-body-line-height: 1.5rem;');
    expect(css).toContain('--typography-body-weight: var(--font-weight-regular);');

    // Role-appropriate Arabic adjustments
    expect(css).toContain('--typography-body-line-height: 1.75rem;');
    expect(css).toContain('--typography-lead-line-height: 2rem;');
    expect(css).toContain('--typography-page-title-line-height: 3rem;');
    expect(css).toContain('--typography-hero-display-line-height: 3.5rem;');

    // Lead paragraph: 18/28px mobile -> 20/32px desktop, 400
    expect(css).toContain('--typography-lead-size: var(--font-size-lg);');
    expect(css).toContain('--typography-lead-line-height: 1.75rem;');

    // Supporting text: 14px / 20px, 400
    expect(css).toContain('--typography-supporting-size: var(--font-size-sm);');
    expect(css).toContain('--typography-supporting-line-height: 1.25rem;');

    // Page title: 32/40px mobile -> 48/56px desktop, 600
    expect(css).toContain('--typography-page-title-size: var(--font-size-4xl);');
    expect(css).toContain('--typography-page-title-line-height: 2.5rem;');

    // Section title: 28/36px mobile -> 40/48px desktop, 600
    expect(css).toContain('--typography-section-title-size: var(--font-size-3xl);');
    expect(css).toContain('--typography-section-title-line-height: 2.25rem;');

    // Card title: 20/28px mobile -> 24/32px desktop, 600
    expect(css).toContain('--typography-card-title-size: var(--font-size-xl);');
    expect(css).toContain('--typography-card-title-line-height: 1.75rem;');

    // Hero display: 40/48px mobile -> 64/72px desktop, 600
    expect(css).toContain('--typography-hero-display-size: var(--font-size-5xl);');
    expect(css).toContain('--typography-hero-display-line-height: 3rem;');

    // Eyebrow: 12px / 16px, 500
    expect(css).toContain('--typography-eyebrow-size: var(--font-size-xs);');
    expect(css).toContain('--typography-eyebrow-line-height: 1rem;');
    expect(css).toContain('--typography-eyebrow-weight: var(--font-weight-medium);');

    // Responsive adaptation breakpoints
    expect(css).toContain('@media (min-width: 48rem)');
    expect(css).toContain('--typography-lead-size: var(--font-size-xl);');
    expect(css).toContain('--typography-lead-line-height: 2rem;');

    expect(css).toContain('@media (min-width: 64rem)');
    expect(css).toContain('--typography-page-title-size: var(--font-size-6xl);');
    expect(css).toContain('--typography-page-title-line-height: 3.5rem;');
    expect(css).toContain('--typography-hero-display-size: var(--font-size-7xl);');
    expect(css).toContain('--typography-hero-display-line-height: 4.5rem;');
  });

  it('preserves existing control sizing typography contract intact (website xl default)', () => {
    const css = fs.readFileSync(controlsPath, 'utf-8');

    expect(css).toContain('--control-font-size-xl: 1rem;');
    expect(css).toContain('--control-line-height-xl: 1.5rem;');
  });
});
