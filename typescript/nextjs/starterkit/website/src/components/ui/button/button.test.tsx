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
    expect(button.getAttribute('data-touch-target')).toBe('auto');
    expect(button.getAttribute('type')).toBe('button');
  });

  it('defaults to type="button" so clicking inside a form does not accidentally submit', () => {
    const handleSubmit = vi.fn((e: React.FormEvent) => e.preventDefault());
    render(
      <form onSubmit={handleSubmit}>
        <Button>Non-submit action</Button>
        <Button type="submit">Explicit submit</Button>
      </form>,
    );

    fireEvent.click(screen.getByRole('button', { name: /non-submit action/i }));
    expect(handleSubmit).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: /explicit submit/i }));
    expect(handleSubmit).toHaveBeenCalledTimes(1);
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

  it('renders startIcon and endIcon in logical slots and preserves content structure during loading', () => {
    const { rerender } = render(
      <Button
        startIcon={<span data-testid="start-icon">S</span>}
        endIcon={<span data-testid="end-icon">E</span>}
      >
        Save
      </Button>,
    );

    expect(screen.getByTestId('start-icon')).toBeTruthy();
    expect(screen.getByTestId('end-icon')).toBeTruthy();

    rerender(
      <Button
        loading
        startIcon={<span data-testid="start-icon">S</span>}
        endIcon={<span data-testid="end-icon">E</span>}
      >
        Save
      </Button>,
    );

    const button = screen.getByRole('button', { name: /save/i });
    expect(button.hasAttribute('disabled')).toBe(true);
    expect(button.getAttribute('data-loading')).toBe('true');
    expect(button.getAttribute('aria-busy')).toBe('true');
    expect(button.getAttribute('aria-label')).toBe('Save');
    // content is preserved in layout flow for zero layout shift, spinner is displayed
    expect(screen.getByTestId('start-icon')).toBeTruthy();
    expect(screen.getByTestId('end-icon')).toBeTruthy();
    expect(button.querySelector('[aria-hidden="true"]')).toBeTruthy();
  });

  it('preserves accessible name when loading without explicit aria-label', () => {
    render(<Button loading>Submit Form</Button>);
    const button = screen.getByRole('button', { name: 'Submit Form' });
    expect(button.getAttribute('aria-label')).toBe('Submit Form');
    expect(button.getAttribute('aria-busy')).toBe('true');
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
