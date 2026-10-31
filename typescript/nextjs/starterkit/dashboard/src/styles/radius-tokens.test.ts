import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

describe('White Label UI Kit — Radius Tokens Contract (Dashboard)', () => {
  const tokensPath = path.resolve(__dirname, 'tokens/radius.css');
  const dashboardRadiusPath = path.resolve(__dirname, 'dashboard/radius.css');

  it('declares the approved primitive scale using exact pixel values', () => {
    const css = fs.readFileSync(tokensPath, 'utf-8');

    const expectedTokens: Record<string, string> = {
      '--radius-none': '0',
      '--radius-xs': '2px',
      '--radius-sm': '4px',
      '--radius-md': '6px',
      '--radius-lg': '8px',
      '--radius-xl': '12px',
      '--radius-2xl': '16px',
      '--radius-full': '9999px',
    };

    for (const [token, value] of Object.entries(expectedTokens)) {
      expect(css).toContain(`${token}: ${value};`);
    }
  });

  it('declares compact, restrained dashboard-owned semantic roles', () => {
    const css = fs.readFileSync(dashboardRadiusPath, 'utf-8');

    expect(css).toContain('--radius-control: var(--radius-md);');
    expect(css).toContain('--radius-card: var(--radius-lg);');
    expect(css).toContain('--radius-overlay: var(--radius-lg);');
    expect(css).toContain('--radius-dialog: var(--radius-xl);');
    expect(css).toContain('--radius-navigation: var(--radius-md);');
    expect(css).toContain('--radius-attached: var(--radius-none);');
  });

  it('maintains strict separation from theme and direction', () => {
    const tokensCss = fs.readFileSync(tokensPath, 'utf-8');
    const dashboardCss = fs.readFileSync(dashboardRadiusPath, 'utf-8');

    for (const css of [tokensCss, dashboardCss]) {
      expect(css.includes('[data-theme="dark"]')).toBe(false);
      expect(css.includes('@media (prefers-color-scheme: dark)')).toBe(false);
      expect(css.includes('[dir="rtl"]')).toBe(false);
    }
  });

  it('does not contain obsolete radii.css file or references', () => {
    const oldRadiiPath = path.resolve(__dirname, 'tokens/radii.css');
    expect(fs.existsSync(oldRadiiPath)).toBe(false);

    const indexCss = fs.readFileSync(path.resolve(__dirname, 'tokens/index.css'), 'utf-8');
    expect(indexCss).toContain('@import "./radius.css";');
    expect(indexCss).not.toContain('radii.css');
  });
});
