import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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

  it('defaults to type="button" so clicking inside a form does not accidentally submit', async () => {
    const user = userEvent.setup();
    const handleSubmit = vi.fn((e: React.FormEvent) => e.preventDefault());
    render(
      <form onSubmit={handleSubmit}>
        <Button>Non-submit action</Button>
        <Button type="submit">Explicit submit</Button>
      </form>,
    );

    await user.click(screen.getByRole('button', { name: /non-submit action/i }));
    expect(handleSubmit).not.toHaveBeenCalled();

    await user.click(screen.getByRole('button', { name: /explicit submit/i }));
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
    expect(screen.getByTestId('start-icon')).toBeTruthy();
    expect(screen.getByTestId('end-icon')).toBeTruthy();
    expect(button.querySelector('[aria-hidden="true"]')).toBeTruthy();
    expect(button.querySelector('[aria-hidden="true"] svg')).toBeTruthy();
  });

  it('handles click events when enabled via userEvent', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Submit</Button>);
    await user.click(screen.getByRole('button', { name: /submit/i }));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('handles keyboard activation via Enter and Space keys', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Keyboard Action</Button>);
    const button = screen.getByRole('button', { name: /keyboard action/i });

    button.focus();
    expect(document.activeElement).toBe(button);

    await user.keyboard('{Enter}');
    expect(handleClick).toHaveBeenCalledTimes(1);

    await user.keyboard(' ');
    expect(handleClick).toHaveBeenCalledTimes(2);
  });

  it('suppresses click and keyboard activation when disabled or loading', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();
    const { rerender } = render(
      <Button disabled onClick={handleClick}>
        Disabled Action
      </Button>,
    );

    const disabledBtn = screen.getByRole('button', { name: /disabled action/i });
    await user.click(disabledBtn);
    expect(handleClick).not.toHaveBeenCalled();

    // Verify keyboard activation is suppressed when disabled
    disabledBtn.focus();
    expect(document.activeElement).not.toBe(disabledBtn);
    await user.keyboard('{Enter}');
    await user.keyboard(' ');
    expect(handleClick).not.toHaveBeenCalled();

    rerender(
      <Button loading onClick={handleClick}>
        Loading Action
      </Button>,
    );

    const loadingBtn = screen.getByRole('button', { name: /loading action/i });
    await user.click(loadingBtn);
    expect(handleClick).not.toHaveBeenCalled();

    // Verify keyboard activation is suppressed when loading
    loadingBtn.focus();
    expect(document.activeElement).not.toBe(loadingBtn);
    await user.keyboard('{Enter}');
    await user.keyboard(' ');
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('preserves accessible naming across plain text, nested elements, aria-label, and aria-labelledby in resting and loading states', () => {
    // 1. Nested content resting and loading
    const { rerender, unmount } = render(
      <Button>
        <span>Save</span> <strong>Draft</strong>
      </Button>,
    );
    expect(screen.getByRole('button', { name: 'Save Draft' })).toBeTruthy();

    rerender(
      <Button loading>
        <span>Save</span> <strong>Draft</strong>
      </Button>,
    );
    expect(screen.getByRole('button', { name: 'Save Draft' })).toBeTruthy();
    unmount();

    // 2. Explicit aria-label resting and loading
    const { rerender: rerenderAria, unmount: unmountAria } = render(
      <Button aria-label="Close dialog">X</Button>,
    );
    expect(screen.getByRole('button', { name: 'Close dialog' })).toBeTruthy();

    rerenderAria(
      <Button loading aria-label="Close dialog">
        X
      </Button>,
    );
    expect(screen.getByRole('button', { name: 'Close dialog' })).toBeTruthy();
    unmountAria();

    // 3. aria-labelledby resting and loading
    const { rerender: rerenderLabelled } = render(
      <div>
        <span id="heading-label">Delete Item</span>
        <Button aria-labelledby="heading-label" variant="danger">
          Trash
        </Button>
      </div>,
    );
    expect(screen.getByRole('button', { name: 'Delete Item' })).toBeTruthy();

    rerenderLabelled(
      <div>
        <span id="heading-label">Delete Item</span>
        <Button loading aria-labelledby="heading-label" variant="danger">
          Trash
        </Button>
      </div>,
    );
    expect(screen.getByRole('button', { name: 'Delete Item' })).toBeTruthy();
  });

  it('forwards aria-pressed, aria-expanded, and aria-controls attributes', () => {
    render(
      <Button aria-pressed={true} aria-expanded={false} aria-controls="disclosure-panel">
        Toggle View
      </Button>,
    );

    const button = screen.getByRole('button', { name: /toggle view/i });
    expect(button.getAttribute('aria-pressed')).toBe('true');
    expect(button.getAttribute('aria-expanded')).toBe('false');
    expect(button.getAttribute('aria-controls')).toBe('disclosure-panel');
  });

  it('renders data-icon-only="true" when iconOnly prop is set', () => {
    render(
      <Button iconOnly aria-label="Confirm">
        <span data-testid="icon">✓</span>
      </Button>,
    );
    const button = screen.getByRole('button', { name: /confirm/i });
    expect(button.getAttribute('data-icon-only')).toBe('true');
  });

  it('forwards ref to the native button element', () => {
    const ref = createRef<HTMLButtonElement>();
    render(<Button ref={ref}>Target</Button>);
    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
  });
});
