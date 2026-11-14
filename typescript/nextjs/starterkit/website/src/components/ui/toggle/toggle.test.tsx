import { createRef } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Toggle } from './toggle';

describe('Toggle Primitive', () => {
  it('renders button with aria-pressed="false" by default', () => {
    render(<Toggle data-testid="toggle">Bold</Toggle>);

    const button = screen.getByRole('button');
    expect(button).toBeTruthy();
    expect(button.getAttribute('aria-pressed')).toBe('false');
    expect(button.getAttribute('data-state')).toBe('off');
  });

  it('toggles aria-pressed on click and fires onPressedChange', () => {
    const handleChange = vi.fn();
    render(<Toggle onPressedChange={handleChange}>Italic</Toggle>);

    const button = screen.getByRole('button');
    fireEvent.click(button);

    expect(handleChange).toHaveBeenCalledWith(true);
    expect(button.getAttribute('aria-pressed')).toBe('true');
    expect(button.getAttribute('data-state')).toBe('on');
  });

  it('respects controlled pressed prop', () => {
    render(<Toggle pressed>Pinned</Toggle>);

    const button = screen.getByRole('button');
    expect(button.getAttribute('aria-pressed')).toBe('true');
    expect(button.getAttribute('data-state')).toBe('on');
  });

  it('applies variant and density size data attributes', () => {
    const { rerender } = render(
      <Toggle variant="outline" size="sm" data-testid="t">
        T
      </Toggle>,
    );
    const el = screen.getByTestId('t');
    expect(el.getAttribute('data-variant')).toBe('outline');
    expect(el.getAttribute('data-size')).toBe('sm');

    rerender(
      <Toggle variant="subtle" size="lg" data-testid="t">
        T
      </Toggle>,
    );
    expect(el.getAttribute('data-variant')).toBe('subtle');
    expect(el.getAttribute('data-size')).toBe('lg');
  });

  it('does not fire onPressedChange when disabled and reflects data-disabled', () => {
    const handleChange = vi.fn();
    render(
      <Toggle disabled onPressedChange={handleChange}>
        Disabled
      </Toggle>,
    );

    const button = screen.getByRole('button');
    expect(button.getAttribute('data-disabled')).toBe('');
    expect((button as HTMLButtonElement).disabled).toBe(true);

    fireEvent.click(button);

    expect(handleChange).not.toHaveBeenCalled();
    expect(button.getAttribute('aria-pressed')).toBe('false');
  });

  it('supports custom data-touch-target attribute', () => {
    render(<Toggle data-touch-target="comfortable">Comfortable</Toggle>);

    const button = screen.getByRole('button');
    expect(button.getAttribute('data-touch-target')).toBe('comfortable');
  });

  it('forwards ref to HTMLButtonElement', () => {
    const ref = createRef<HTMLButtonElement>();
    render(<Toggle ref={ref}>Ref</Toggle>);

    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
  });
});
