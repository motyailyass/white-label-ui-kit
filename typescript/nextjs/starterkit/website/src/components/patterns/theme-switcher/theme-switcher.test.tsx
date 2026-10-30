import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it } from 'vitest';
import { ThemeProvider } from '@/providers/theme-provider';
import { ThemeSwitcher } from './theme-switcher';

describe('ThemeSwitcher (Connected Pattern)', () => {
  it('connects to ThemeProvider and toggles theme when clicked', () => {
    render(
      <ThemeProvider defaultTheme="light">
        <ThemeSwitcher />
      </ThemeProvider>,
    );

    const button = screen.getByRole('button', { name: /switch to dark mode/i });
    expect(button).toBeDefined();

    fireEvent.click(button);

    // After click, should toggle
    expect(screen.getByRole('button', { name: /switch to light mode/i })).toBeDefined();
  });
});
