import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { AppProviders } from '@/providers';
import { ThemeSwitcher } from './theme-switcher';

describe('ThemeSwitcher (Connected Pattern)', () => {
  it('connects to ThemeProvider + I18nProvider and toggles theme state when clicked', () => {
    render(
      <AppProviders initialLocale="en" defaultTheme="light">
        <ThemeSwitcher />
      </AppProviders>,
    );

    const button = screen.getByRole('button', { name: /toggle theme/i });
    expect(button.getAttribute('aria-pressed')).toBe('false');

    fireEvent.click(button);

    expect(button.getAttribute('aria-pressed')).toBe('true');
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });

  it('fails loudly without silent fallback when rendered outside providers', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<ThemeSwitcher />)).toThrow();
    consoleSpy.mockRestore();
  });
});
