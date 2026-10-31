import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

describe('White Label UI Kit — Spacing Tokens Contract (Website)', () => {
  const tokensPath = path.resolve(__dirname, 'tokens/spacing.css');
  const websiteSpacingPath = path.resolve(__dirname, 'website/spacing.css');

  it('declares the approved 4px-base primitive scale using rem values', () => {
    const css = fs.readFileSync(tokensPath, 'utf-8');

    const expectedTokens: Record<string, string> = {
      '--space-0': '0',
      '--space-0-5': '0.125rem',
      '--space-1': '0.25rem',
      '--space-2': '0.5rem',
      '--space-3': '0.75rem',
      '--space-4': '1rem',
      '--space-5': '1.25rem',
      '--space-6': '1.5rem',
      '--space-8': '2rem',
      '--space-10': '2.5rem',
      '--space-12': '3rem',
      '--space-16': '4rem',
      '--space-20': '5rem',
      '--space-24': '6rem',
      '--space-32': '8rem',
    };

    for (const [token, value] of Object.entries(expectedTokens)) {
      expect(css).toContain(`${token}: ${value};`);
    }

    expect(css).not.toMatch(/--space-[a-z0-9-]+:\s*\d+px/i);
  });

  it('declares generous, editorial website-owned spacing roles with responsive rhythm', () => {
    const css = fs.readFileSync(websiteSpacingPath, 'utf-8');

    // Page container
    expect(css).toContain('--layout-page-padding-inline: var(--space-4);');
    expect(css).toContain('--layout-page-padding-block: var(--space-4);');

    // Section rhythm (Mobile base)
    expect(css).toContain('--layout-section-padding-block: var(--space-12);');
    expect(css).toContain('--layout-section-padding-block-compact: var(--space-8);');
    expect(css).toContain('--layout-hero-padding-block: var(--space-16);');
    expect(css).toContain('--layout-section-gap: var(--space-8);');
    expect(css).toContain('--layout-section-content-gap: var(--space-8);');

    // Heading groups
    expect(css).toContain('--layout-eyebrow-gap: var(--space-3);');
    expect(css).toContain('--layout-heading-description-gap: var(--space-4);');
    expect(css).toContain('--layout-description-actions-gap: var(--space-6);');

    // Cards, forms, and toolbars
    expect(css).toContain('--layout-grid-gap: var(--space-4);');
    expect(css).toContain('--layout-card-padding: var(--space-6);');
    expect(css).toContain('--layout-form-field-gap: var(--space-6);');
    expect(css).toContain('--layout-form-group-gap: var(--space-8);');
    expect(css).toContain('--layout-toolbar-gap: var(--space-2);');
    expect(css).toContain('--layout-action-gap: var(--space-3);');

    // Tablet breakpoint (48rem)
    expect(css).toContain('@media (min-width: 48rem)');
    expect(css).toContain('--layout-section-padding-block: var(--space-16);');
    expect(css).toContain('--layout-hero-padding-block: var(--space-20);');

    // Desktop breakpoint (64rem)
    expect(css).toContain('@media (min-width: 64rem)');
    expect(css).toContain('--layout-section-padding-block: var(--space-24);');
    expect(css).toContain('--layout-card-padding: var(--space-8);');
  });

  it('maintains strict separation from theme and direction', () => {
    const css = fs.readFileSync(websiteSpacingPath, 'utf-8');
    expect(css.includes('[data-theme="dark"]')).toBe(false);
    expect(css.includes('@media (prefers-color-scheme: dark)')).toBe(false);
  });
});
