import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

describe('Website Shadow Policy', () => {
  const shadowsCssPath = path.resolve(import.meta.dirname, 'website/shadows.css');
  const css = fs.readFileSync(shadowsCssPath, 'utf8');

  it('defines all five semantic website shadow tokens', () => {
    expect(css).toContain('--website-shadow-none');
    expect(css).toContain('--website-shadow-card');
    expect(css).toContain('--website-shadow-header');
    expect(css).toContain('--website-shadow-menu');
    expect(css).toContain('--website-shadow-dialog');
  });

  it('enforces zero horizontal x-offset for natural LTR/RTL parity and neutral black colors only', () => {
    const rawShadowLines = css
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.startsWith('--website-shadow-') && line.includes('rgb('));

    expect(rawShadowLines.length).toBeGreaterThanOrEqual(8);

    for (const line of rawShadowLines) {
      const value = line.split(':')[1]?.replace(';', '').trim() ?? '';
      const layers = value.split(',').map((s) => s.trim());
      for (const layer of layers) {
        // First token in each shadow layer is x-offset and must be strictly 0
        expect(layer.startsWith('0 ')).toBe(true);
        // Shadow color must be neutral black rgb(0 0 0 / ...)
        expect(layer).toContain('rgb(0 0 0 /');
      }
    }
  });
});
