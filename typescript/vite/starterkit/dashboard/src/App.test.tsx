import fs from 'node:fs';
import path from 'node:path';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { App } from './App';

describe('Vite Dashboard Portability Reference', () => {
  afterEach(() => {
    cleanup();
    localStorage.clear();
    document.cookie = 'locale=en; path=/; max-age=0';
    document.documentElement.lang = 'en';
    document.documentElement.dir = 'ltr';
    document.documentElement.removeAttribute('data-theme');
    document.documentElement.style.colorScheme = '';
  });

  it('runs inline bootstrap script from index.html setting initial theme and bidi attributes before React hydration', () => {
    // 1. Simulate saved dark theme with light system preference
    localStorage.setItem('theme', 'dark');
    document.cookie = 'locale=ar; path=/';

    // Mock matchMedia for system preference (light)
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: false, // system is light
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    // Read the exact inline bootstrap script from index.html
    const indexPath = path.resolve(__dirname, '../index.html');
    const indexHtml = fs.readFileSync(indexPath, 'utf-8');
    const scriptMatch = indexHtml.match(/<script>([\s\S]*?)<\/script>/);
    expect(scriptMatch).toBeTruthy();
    const inlineScript = scriptMatch![1];

    // Execute the inline script directly in the current window/document
    const runBootstrap = new Function(inlineScript);
    runBootstrap();

    // Verifies data-theme and colorScheme are set to dark before React renders (no flash)
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    expect(document.documentElement.style.colorScheme).toBe('dark');
    expect(document.documentElement.lang).toBe('ar');
    expect(document.documentElement.dir).toBe('rtl');
  });

  it('resolves system theme preference in inline script when theme is set to system or omitted', () => {
    localStorage.setItem('theme', 'system');

    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: query.includes('dark'), // system is dark
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    const indexPath = path.resolve(__dirname, '../index.html');
    const indexHtml = fs.readFileSync(indexPath, 'utf-8');
    const scriptMatch = indexHtml.match(/<script>([\s\S]*?)<\/script>/);
    expect(scriptMatch).toBeTruthy();

    const runBootstrap = new Function(scriptMatch![1]);
    runBootstrap();

    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    expect(document.documentElement.style.colorScheme).toBe('dark');
  });

  it('renders semantic landmarks, sequential headings, Button primitives, and switches to Arabic RTL while keeping USD currency', () => {
    render(<App initialLocale="en" />);

    expect(screen.getByRole('heading', { level: 1, name: /classic layout/i })).toBeTruthy();
    expect(screen.getByRole('heading', { level: 2, name: /system overview/i })).toBeTruthy();
    expect(screen.getByRole('button', { name: /export report/i }).getAttribute('type')).toBe(
      'button',
    );

    const langSelect = screen.getByRole('combobox', { name: /language/i });
    fireEvent.change(langSelect, { target: { value: 'ar' } });

    expect(document.documentElement.lang).toBe('ar');
    expect(document.documentElement.dir).toBe('rtl');
    expect(screen.getByRole('heading', { level: 2, name: 'نظرة عامة على النظام' })).toBeTruthy();
    // Currency stays USD in Arabic (data determines currency; locale determines formatting)
    expect(document.body.textContent).not.toMatch(/€|EUR|SAR|ر\.س/);
  });

  it('wires metric roles and delta tokens without undefined CSS variables', () => {
    const { container } = render(<App initialLocale="en" />);

    const metricValue = container.querySelector('[class*="metricValue"]');
    expect(metricValue).toBeTruthy();
    expect(metricValue?.textContent).toContain('$128,430.00');

    const metricDelta = container.querySelector('[class*="metricDelta"]');
    expect(metricDelta).toBeTruthy();
    expect(metricDelta?.textContent).toContain('↑ 12.5%');

    // Read App.module.css to verify token mapping
    const cssPath = path.resolve(__dirname, './App.module.css');
    const cssContent = fs.readFileSync(cssPath, 'utf-8');

    // Metric value tokens must use approved typography tokens
    expect(cssContent).toContain('var(--typography-metric-value-size)');
    expect(cssContent).toContain('var(--typography-metric-value-line-height)');
    expect(cssContent).toContain('var(--typography-metric-value-weight)');
    expect(cssContent).toContain('font-variant-numeric: tabular-nums');

    // Metric delta token must use approved color-success (not undefined --color-status-success)
    expect(cssContent).toContain('var(--color-success)');
    expect(cssContent).not.toContain('--color-status-success');
    expect(cssContent).not.toContain('--typography-metric-value:');
  });
});
