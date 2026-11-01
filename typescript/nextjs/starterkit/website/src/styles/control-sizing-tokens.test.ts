import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

describe('Website Control Sizing Tokens', () => {
  const cssPath = path.resolve(__dirname, 'tokens/controls.css');
  const cssContent = fs.readFileSync(cssPath, 'utf8');

  it('defines all six explicit control sizes across dimensions', () => {
    const sizes = ['xs', 'sm', 'md', 'lg', 'xl', '2xl'];
    const tokenTypes = [
      '--control-height-',
      '--control-padding-',
      '--control-padding-block-',
      '--control-font-size-',
      '--control-line-height-',
      '--control-icon-size-',
      '--control-glyph-size-',
      '--control-gap-',
    ];

    for (const size of sizes) {
      for (const prefix of tokenTypes) {
        expect(
          cssContent.includes(`${prefix}${size}:`),
          `Expected token ${prefix}${size} in website controls.css`,
        ).toBe(true);
      }
    }
  });

  it('resolves Website default aliases strictly to xl (48px)', () => {
    expect(cssContent).toMatch(/--control-height-default:\s*var\(--control-height-xl\);/);
    expect(cssContent).toMatch(/--control-padding-default:\s*var\(--control-padding-xl\);/);
    expect(cssContent).toMatch(
      /--control-padding-block-default:\s*var\(--control-padding-block-xl\);/,
    );
    expect(cssContent).toMatch(/--control-font-size-default:\s*var\(--control-font-size-xl\);/);
    expect(cssContent).toMatch(/--control-line-height-default:\s*var\(--control-line-height-xl\);/);
    expect(cssContent).toMatch(/--control-icon-size-default:\s*var\(--control-icon-size-xl\);/);
    expect(cssContent).toMatch(/--control-glyph-size-default:\s*var\(--control-glyph-size-xl\);/);
    expect(cssContent).toMatch(/--control-gap-default:\s*var\(--control-gap-xl\);/);
  });

  it('defines the 48px minimum touch target policy', () => {
    expect(cssContent).toMatch(/--control-touch-target-min:\s*3rem;/);
  });

  it('contains zero dark-mode sizing overrides (theme independence)', () => {
    expect(cssContent.includes('[data-theme="dark"]')).toBe(false);
    expect(cssContent.includes('@media (prefers-color-scheme: dark)')).toBe(false);
  });
});
