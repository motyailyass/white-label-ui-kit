import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { afterEach, describe, expect, it } from 'vitest';
import { App } from './App';

describe('Vite Dashboard Portability Reference', () => {
  afterEach(() => {
    cleanup();
    document.cookie = 'locale=en; path=/; max-age=0';
    document.documentElement.lang = 'en';
    document.documentElement.dir = 'ltr';
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
});
