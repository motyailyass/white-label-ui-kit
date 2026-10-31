import { fireEvent, render, screen } from '@testing-library/react';
import React, { createRef } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { Button } from './button';

describe('Button Primitive', () => {
  it('renders with omitted size and leaves data-size undefined for CSS default alias consumption', () => {
    render(<Button>Click me</Button>);
    const button = screen.getByRole('button', { name: /click me/i });
    expect(button.getAttribute('data-size')).toBeNull();
    expect(button.getAttribute('data-variant')).toBe('secondary');
  });

  it('renders explicit size attribute across all six scale steps', () => {
    const sizes = ['xs', 'sm', 'md', 'lg', 'xl', '2xl'] as const;
    for (const size of sizes) {
      const { unmount } = render(<Button size={size}>Size {size}</Button>);
      const button = screen.getByRole('button', { name: `Size ${size}` });
      expect(button.getAttribute('data-size')).toBe(size);
      unmount();
    }
  });

  it('attaches touchTarget data attribute', () => {
    const { rerender } = render(<Button touchTarget="comfortable">Touch</Button>);
    let button = screen.getByRole('button', { name: /touch/i });
    expect(button.getAttribute('data-touch-target')).toBe('comfortable');

    rerender(<Button touchTarget="auto">Touch</Button>);
    button = screen.getByRole('button', { name: /touch/i });
    expect(button.getAttribute('data-touch-target')).toBe('auto');
  });

  it('handles loading state with disabled attribute and loading indicator', () => {
    render(<Button loading>Saving</Button>);
    const button = screen.getByRole('button', { name: /saving/i });
    expect(button.getAttribute('disabled')).not.toBeNull();
    expect(button.getAttribute('data-loading')).toBe('true');
  });

  it('handles click events when enabled', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Submit</Button>);
    fireEvent.click(screen.getByRole('button', { name: /submit/i }));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('forwards ref to the native button element', () => {
    const ref = createRef<HTMLButtonElement>();
    render(<Button ref={ref}>Target</Button>);
    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
  });
});
