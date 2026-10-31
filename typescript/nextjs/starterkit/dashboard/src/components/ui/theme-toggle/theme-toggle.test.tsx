import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { ThemeToggle } from './theme-toggle';

describe('ThemeToggle (Pure Primitive)', () => {
  it('renders light theme state with aria-pressed="false" and composes onClick + onToggle', () => {
    const handleToggle = vi.fn();
    const handleClick = vi.fn();
    render(
      <ThemeToggle
        theme="light"
        resolvedTheme="light"
        lightLabel="Light"
        darkLabel="Dark"
        ariaLabel="Toggle theme"
        onClick={handleClick}
        onToggle={handleToggle}
      />,
    );

    const button = screen.getByRole('button', { name: /toggle theme/i });
    expect(button.getAttribute('type')).toBe('button');
    expect(button.getAttribute('aria-pressed')).toBe('false');
    expect(button.getAttribute('data-touch-target')).toBe('auto');
    expect(button.getAttribute('title')).toBeNull();
    expect(button.textContent).toContain('Dark');

    fireEvent.click(button);
    expect(handleClick).toHaveBeenCalledTimes(1);
    expect(handleToggle).toHaveBeenCalledTimes(1);
  });

  it('renders dark theme state with aria-pressed="true" and respects explicit size', () => {
    render(
      <ThemeToggle
        size="sm"
        theme="dark"
        resolvedTheme="dark"
        lightLabel="Light"
        darkLabel="Dark"
        ariaLabel="Toggle theme"
      />,
    );

    const button = screen.getByRole('button', { name: /toggle theme/i });
    expect(button.getAttribute('aria-pressed')).toBe('true');
    expect(button.getAttribute('data-size')).toBe('sm');
    expect(button.textContent).toContain('Light');
  });
});
