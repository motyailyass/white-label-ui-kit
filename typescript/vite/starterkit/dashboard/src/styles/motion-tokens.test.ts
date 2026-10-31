import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

describe('White Label UI Kit — Motion Design Tokens Contract (Dashboard)', () => {
  const motionCssPath = path.resolve(__dirname, 'tokens/motion.css');

  it('declares the minimal shared duration scale with exact values', () => {
    const css = fs.readFileSync(motionCssPath, 'utf-8');

    const expectedDurations: Record<string, string> = {
      '--motion-duration-instant': '0ms',
      '--motion-duration-fast': '120ms',
      '--motion-duration-normal': '180ms',
      '--motion-duration-slow': '240ms',
    };

    for (const [token, value] of Object.entries(expectedDurations)) {
      expect(css).toContain(`${token}: ${value};`);
    }
  });

  it('declares the approved three easing tokens', () => {
    const css = fs.readFileSync(motionCssPath, 'utf-8');

    const expectedEasings: Record<string, string> = {
      '--motion-ease-standard': 'cubic-bezier(0.2, 0, 0, 1)',
      '--motion-ease-enter': 'cubic-bezier(0, 0, 0, 1)',
      '--motion-ease-exit': 'cubic-bezier(0.4, 0, 1, 1)',
    };

    for (const [token, value] of Object.entries(expectedEasings)) {
      expect(css).toContain(`${token}: ${value};`);
    }
  });

  it('declares composite transition helpers using motion duration and easing tokens', () => {
    const css = fs.readFileSync(motionCssPath, 'utf-8');

    expect(css).toContain(
      '--transition-fast: var(--motion-duration-fast) var(--motion-ease-standard);',
    );
    expect(css).toContain(
      '--transition-normal: var(--motion-duration-normal) var(--motion-ease-standard);',
    );
    expect(css).toContain(
      '--transition-slow: var(--motion-duration-slow) var(--motion-ease-standard);',
    );
  });

  it('enforces monotonic progression across duration tokens', () => {
    const css = fs.readFileSync(motionCssPath, 'utf-8');

    const extractMs = (token: string): number => {
      const match = css.match(new RegExp(`${token}:\\s*(\\d+)ms`));
      if (!match) throw new Error(`Token ${token} not found in motion.css`);
      return parseInt(match[1], 10);
    };

    const instant = extractMs('--motion-duration-instant');
    const fast = extractMs('--motion-duration-fast');
    const normal = extractMs('--motion-duration-normal');
    const slow = extractMs('--motion-duration-slow');

    expect(instant).toBe(0);
    expect(fast).toBe(120);
    expect(normal).toBe(180);
    expect(slow).toBe(240);

    expect(instant).toBeLessThan(fast);
    expect(fast).toBeLessThan(normal);
    expect(normal).toBeLessThan(slow);
  });

  it('defines reduced motion overrides collapsing durations and disabling smooth scroll', () => {
    const css = fs.readFileSync(motionCssPath, 'utf-8');

    expect(css).toContain('@media (prefers-reduced-motion: reduce)');
    expect(css).toContain('scroll-behavior: auto !important');
    expect(css).toMatch(/prefers-reduced-motion:\s*reduce[\s\S]*--motion-duration-fast:\s*0ms/);
    expect(css).toMatch(/prefers-reduced-motion:\s*reduce[\s\S]*--motion-duration-normal:\s*0ms/);
    expect(css).toMatch(/prefers-reduced-motion:\s*reduce[\s\S]*--motion-duration-slow:\s*0ms/);
  });
});
