import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { DirectionToggle } from './direction-toggle';

describe('DirectionToggle (Pure Primitive)', () => {
  it('renders LTR state and invokes onToggle callback when clicked', () => {
    const handleToggle = vi.fn();
    render(<DirectionToggle direction="ltr" onToggle={handleToggle} />);

    const button = screen.getByRole('button');
    expect(button.textContent).toContain('LTR');
    expect(button.textContent).toContain('English (LTR)');

    fireEvent.click(button);
    expect(handleToggle).toHaveBeenCalledTimes(1);
  });

  it('renders RTL state correctly', () => {
    render(<DirectionToggle direction="rtl" isRtl />);

    const button = screen.getByRole('button');
    expect(button.textContent).toContain('RTL');
    expect(button.textContent).toContain('العربية (RTL)');
  });
});
