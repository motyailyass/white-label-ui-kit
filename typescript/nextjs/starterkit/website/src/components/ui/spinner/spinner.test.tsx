import { render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { describe, expect, it } from 'vitest';
import { Spinner, type SpinnerSize, type SpinnerVariant } from './spinner';

describe('Spinner Primitive', () => {
  it('renders decorative spinner with aria-hidden="true" when no accessible name is provided', () => {
    const { container } = render(<Spinner />);
    const spinner = container.firstElementChild;
    expect(spinner).toBeTruthy();
    expect(spinner?.getAttribute('aria-hidden')).toBe('true');
    expect(spinner?.getAttribute('role')).toBeNull();
    expect(spinner?.getAttribute('aria-live')).toBeNull();
    expect(spinner?.getAttribute('data-size')).toBe('md');
    expect(spinner?.getAttribute('data-variant')).toBe('default');

    const svg = spinner?.querySelector('svg');
    expect(svg?.getAttribute('aria-hidden')).toBe('true');
    expect(svg?.getAttribute('focusable')).toBe('false');
  });

  it('treats whitespace-only label as decorative rather than empty status text', () => {
    const { container } = render(<Spinner label="   " />);
    const spinner = container.firstElementChild;
    expect(spinner?.getAttribute('aria-hidden')).toBe('true');
    expect(spinner?.getAttribute('role')).toBeNull();
  });

  it('renders accessible role="status" and screen reader text when label is provided', () => {
    render(<Spinner label="Loading records..." />);
    const status = screen.getByRole('status');
    expect(status).toBeTruthy();
    expect(status.getAttribute('aria-live')).toBe('polite');
    expect(status.getAttribute('aria-hidden')).toBeNull();
    expect(screen.getByText('Loading records...')).toBeTruthy();
  });

  it('renders label visibly when showLabel is true while retaining role="status"', () => {
    render(<Spinner label="Saving changes..." showLabel />);
    const status = screen.getByRole('status');
    const textEl = screen.getByText('Saving changes...');
    expect(status.contains(textEl)).toBe(true);
    expect(textEl.className).not.toContain('visuallyHidden');
  });

  it('supports explicit aria-label and aria-labelledby without duplicating hidden text', () => {
    const { rerender } = render(<Spinner aria-label="Fetching analytics" />);
    const byLabel = screen.getByRole('status', { name: 'Fetching analytics' });
    expect(byLabel.getAttribute('aria-live')).toBe('polite');
    expect(byLabel.getAttribute('aria-hidden')).toBeNull();

    rerender(
      <>
        <span id="ext-label">Syncing workspace</span>
        <Spinner aria-labelledby="ext-label" />
      </>,
    );
    const byLabelledBy = screen.getByRole('status', { name: 'Syncing workspace' });
    expect(byLabelledBy.getAttribute('aria-labelledby')).toBe('ext-label');
  });

  it('applies all 5 size data attributes and all 4 semantic variants', () => {
    const sizes: SpinnerSize[] = ['xs', 'sm', 'md', 'lg', 'xl'];
    for (const s of sizes) {
      const { container, unmount } = render(<Spinner size={s} />);
      expect(container.firstElementChild?.getAttribute('data-size')).toBe(s);
      unmount();
    }

    const variants: SpinnerVariant[] = ['default', 'primary', 'current', 'inverse'];
    for (const v of variants) {
      const { container, unmount } = render(<Spinner variant={v} />);
      expect(container.firstElementChild?.getAttribute('data-variant')).toBe(v);
      unmount();
    }
  });

  it('propagates custom strokeWidth onto inner SVG track and indicator', () => {
    const { container } = render(<Spinner strokeWidth={3} />);
    const circle = container.querySelector('circle');
    const path = container.querySelector('path');
    expect(circle?.getAttribute('stroke-width')).toBe('3');
    expect(path?.getAttribute('stroke-width')).toBe('3');
  });

  it('supports RTL Arabic label announcements and ref forwarding', () => {
    const ref = createRef<HTMLSpanElement>();
    render(
      <div dir="rtl" lang="ar">
        <Spinner ref={ref} label="جارٍ تحميل البيانات..." />
      </div>,
    );
    expect(ref.current).toBeInstanceOf(HTMLSpanElement);
    expect(screen.getByRole('status')).toBe(ref.current);
    expect(screen.getByText('جارٍ تحميل البيانات...')).toBeTruthy();
  });
});
