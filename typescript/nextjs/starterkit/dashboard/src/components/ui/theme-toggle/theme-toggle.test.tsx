import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { ThemeToggle } from './theme-toggle';

describe('ThemeToggle (Pure Primitive)', () => {
  it('renders light theme state and triggers onToggle callback', () => {
    const handleToggle = vi.fn();
    render(<ThemeToggle theme="light" resolvedTheme="light" onToggle={handleToggle} />);

    const button = screen.getByRole('button', { name: /switch to dark mode/i });
    expect(button.textContent).toContain('Dark');

    fireEvent.click(button);
    expect(handleToggle).toHaveBeenCalledTimes(1);
  });

  it('renders dark theme state correctly', () => {
    render(<ThemeToggle theme="dark" resolvedTheme="dark" />);

    const button = screen.getByRole('button', { name: /switch to light mode/i });
    expect(button.textContent).toContain('Light');
  });
});
