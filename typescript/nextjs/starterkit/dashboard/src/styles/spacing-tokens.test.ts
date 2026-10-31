import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

describe('White Label UI Kit — Spacing Tokens Contract (Dashboard)', () => {
  const tokensPath = path.resolve(__dirname, 'tokens/spacing.css');
  const dashboardSpacingPath = path.resolve(__dirname, 'dashboard/spacing.css');

  it('declares the approved 4px-base primitive scale using rem values', () => {
    const css = fs.readFileSync(tokensPath, 'utf-8');

    // Expected tokens and rem values (multiples of 4px at 16px root font)
    const expectedTokens: Record<string, string> = {
      '--space-0': '0',
      '--space-0-5': '0.125rem', // 2px micro-spacing exception
      '--space-1': '0.25rem', // 4px
      '--space-2': '0.5rem', // 8px
      '--space-3': '0.75rem', // 12px
      '--space-4': '1rem', // 16px
      '--space-5': '1.25rem', // 20px
      '--space-6': '1.5rem', // 24px
      '--space-8': '2rem', // 32px
      '--space-10': '2.5rem', // 40px
      '--space-12': '3rem', // 48px
      '--space-16': '4rem', // 64px
      '--space-20': '5rem', // 80px
      '--space-24': '6rem', // 96px
      '--space-32': '8rem', // 128px
    };

    for (const [token, value] of Object.entries(expectedTokens)) {
      expect(css).toContain(`${token}: ${value};`);
    }

    // Must not contain hardcoded pixel values in primitive declarations
    expect(css).not.toMatch(/--space-[a-z0-9-]+:\s*\d+px/i);
  });

  it('declares compact, structured dashboard-owned spacing roles', () => {
    const css = fs.readFileSync(dashboardSpacingPath, 'utf-8');

    // Page structure
    expect(css).toContain('--layout-page-padding-inline: var(--space-4);');
    expect(css).toContain('--layout-page-padding-block: var(--space-4);');
    expect(css).toContain('--layout-page-header-gap: var(--space-6);');
    expect(css).toContain('--layout-section-gap: var(--space-6);');
    expect(css).toContain('--layout-grid-gap: var(--space-4);');

    // Component interiors
    expect(css).toContain('--layout-card-padding: var(--space-4);');
    expect(css).toContain('--layout-card-padding-compact: var(--space-4);');

    // Forms & actions
    expect(css).toContain('--layout-field-label-gap: var(--space-2);');
    expect(css).toContain('--layout-field-message-gap: var(--space-1);');
    expect(css).toContain('--layout-form-field-gap: var(--space-4);');
    expect(css).toContain('--layout-form-group-gap: var(--space-6);');
    expect(css).toContain('--layout-toolbar-gap: var(--space-2);');
    expect(css).toContain('--layout-action-gap: var(--space-2);');

    // Responsive desktop adaptation at 48rem
    expect(css).toContain('@media (min-width: 48rem)');
    expect(css).toContain('--layout-page-padding-inline: var(--space-6);');
    expect(css).toContain('--layout-page-padding-block: var(--space-6);');
    expect(css).toContain('--layout-section-gap: var(--space-8);');
    expect(css).toContain('--layout-card-padding: var(--space-6);');
  });

  it('maintains strict separation from theme and direction', () => {
    const css = fs.readFileSync(dashboardSpacingPath, 'utf-8');
    // Spacing must not vary by theme
    expect(css.includes('[data-theme="dark"]')).toBe(false);
    expect(css.includes('@media (prefers-color-scheme: dark)')).toBe(false);
  });
});
