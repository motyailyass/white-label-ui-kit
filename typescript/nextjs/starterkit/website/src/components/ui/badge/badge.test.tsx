import { fireEvent, render, screen } from '@testing-library/react';
import React, { createRef } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { Badge, type BadgeSize, type BadgeVariant } from './badge';

describe('Badge Primitive', () => {
  it('renders children text correctly', () => {
    render(<Badge>Active Status</Badge>);
    const badge = screen.getByText('Active Status');
    expect(badge).toBeDefined();
  });

  it('applies all semantic variants via data-variant attribute', () => {
    const variants: BadgeVariant[] = [
      'default',
      'primary',
      'success',
      'warning',
      'danger',
      'info',
      'outline',
    ];

    variants.forEach((variant) => {
      const { unmount } = render(
        <Badge variant={variant} data-testid={`badge-${variant}`}>
          {variant}
        </Badge>,
      );
      const badge = screen.getByTestId(`badge-${variant}`);
      expect(badge.getAttribute('data-variant')).toBe(variant);
      unmount();
    });
  });

  it('applies sizing density steps via data-size attribute', () => {
    const sizes: BadgeSize[] = ['sm', 'md', 'lg'];

    sizes.forEach((size) => {
      const { unmount } = render(
        <Badge size={size} data-testid={`badge-${size}`}>
          {size}
        </Badge>,
      );
      const badge = screen.getByTestId(`badge-${size}`);
      expect(badge.getAttribute('data-size')).toBe(size);
      unmount();
    });
  });

  it('supports pill and rounded shapes', () => {
    const { rerender } = render(
      <Badge shape="pill" data-testid="badge-shape">
        Pill
      </Badge>,
    );
    let badge = screen.getByTestId('badge-shape');
    expect(badge.getAttribute('data-shape')).toBe('pill');

    rerender(
      <Badge shape="rounded" data-testid="badge-shape">
        Rounded
      </Badge>,
    );
    badge = screen.getByTestId('badge-shape');
    expect(badge.getAttribute('data-shape')).toBe('rounded');
  });

  it('renders status dot when dot={true}', () => {
    const { container } = render(
      <Badge dot variant="success">
        Live
      </Badge>,
    );
    const dot = container.querySelector('[aria-hidden="true"]');
    expect(dot).toBeDefined();
    expect(dot?.tagName.toLowerCase()).toBe('span');
  });

  it('renders start icon slot', () => {
    render(
      <Badge startIcon={<span data-testid="test-icon">★</span>}>
        Featured
      </Badge>,
    );
    expect(screen.getByTestId('test-icon')).toBeDefined();
  });

  it('renders dismissible remove button and fires onRemove', () => {
    const handleRemove = vi.fn();
    render(
      <Badge onRemove={handleRemove} removeAriaLabel="Remove Draft tag">
        Draft
      </Badge>,
    );

    const removeBtn = screen.getByRole('button', { name: 'Remove Draft tag' });
    expect(removeBtn).toBeDefined();

    fireEvent.click(removeBtn);
    expect(handleRemove).toHaveBeenCalledTimes(1);
  });

  it('forwards ref to the span element', () => {
    const ref = createRef<HTMLSpanElement>();
    render(<Badge ref={ref}>Ref Target</Badge>);

    expect(ref.current).toBeInstanceOf(HTMLSpanElement);
    expect(ref.current?.textContent).toContain('Ref Target');
  });

  it('passes through extra HTML attributes', () => {
    render(
      <Badge id="custom-badge-id" data-testid="custom-badge" data-custom="test-attr">
        Custom
      </Badge>,
    );
    const badge = screen.getByTestId('custom-badge');
    expect(badge.id).toBe('custom-badge-id');
    expect(badge.getAttribute('data-custom')).toBe('test-attr');
  });
});
