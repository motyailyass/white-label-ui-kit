import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

describe('White Label UI Kit — Z-Index & Layer Tokens Contract (Website)', () => {
  const zIndexPath = path.resolve(__dirname, 'tokens/z-index.css');

  it('declares the identical approved 10-step semantic layer scale matching dashboard', () => {
    const css = fs.readFileSync(zIndexPath, 'utf-8');

    const expectedTokens: Record<string, string> = {
      '--z-base': '0',
      '--z-raised': '10',
      '--z-sticky': '100',
      '--z-dropdown': '200',
      '--z-overlay': '300',
      '--z-drawer': '310',
      '--z-modal-backdrop': '400',
      '--z-modal': '410',
      '--z-toast': '500',
      '--z-tooltip': '600',
    };

    for (const [token, value] of Object.entries(expectedTokens)) {
      expect(css).toContain(`${token}: ${value};`);
    }
  });

  it('enforces strictly monotonic stacking hierarchy across all layers', () => {
    const css = fs.readFileSync(zIndexPath, 'utf-8');

    const extractValue = (token: string): number => {
      const match = css.match(new RegExp(`${token}:\\s*(\\d+)`));
      if (!match) throw new Error(`Token ${token} not found in z-index.css`);
      return parseInt(match[1], 10);
    };

    const base = extractValue('--z-base');
    const raised = extractValue('--z-raised');
    const sticky = extractValue('--z-sticky');
    const dropdown = extractValue('--z-dropdown');
    const overlay = extractValue('--z-overlay');
    const drawer = extractValue('--z-drawer');
    const modalBackdrop = extractValue('--z-modal-backdrop');
    const modal = extractValue('--z-modal');
    const toast = extractValue('--z-toast');
    const tooltip = extractValue('--z-tooltip');

    expect(base).toBeLessThan(raised);
    expect(raised).toBeLessThan(sticky);
    expect(sticky).toBeLessThan(dropdown);
    expect(dropdown).toBeLessThan(overlay);
    expect(overlay).toBeLessThan(drawer);
    expect(drawer).toBeLessThan(modalBackdrop);
    expect(modalBackdrop).toBeLessThan(modal);
    expect(modal).toBeLessThan(toast);
    expect(toast).toBeLessThan(tooltip);
  });

  it('maps shell component semantic aliases cleanly without arbitrary numbers', () => {
    const css = fs.readFileSync(zIndexPath, 'utf-8');

    expect(css).toContain('--z-header: var(--z-sticky);');
    expect(css).toContain('--z-sidebar: var(--z-drawer);');
    expect(css).toContain('--z-panel: var(--z-drawer);');

    // Never contain arbitrary magic numbers
    expect(css).not.toContain('9999');
    expect(css).not.toContain('99999');
  });
});
