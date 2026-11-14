import { createRef } from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { StatusDot } from './status-dot';

describe('StatusDot Primitive', () => {
  it('renders role="status" container with accessible label and data attributes', () => {
    render(<StatusDot status="online" data-testid="status-dot" />);

    const el = screen.getByRole('status');
    expect(el).toBeTruthy();
    expect(el.getAttribute('aria-label')).toBe('online');
    expect(el.getAttribute('data-status')).toBe('online');
    expect(el.getAttribute('data-size')).toBe('md');
    expect(el.getAttribute('data-ping')).toBeNull();
  });

  it('applies semantic status classes and data-status attribute', () => {
    const { rerender } = render(<StatusDot status="online" data-testid="dot" />);
    const el = screen.getByTestId('dot');
    expect(el.className).toContain('statusOnline');
    expect(el.getAttribute('data-status')).toBe('online');

    rerender(<StatusDot status="busy" data-testid="dot" />);
    expect(el.className).toContain('statusBusy');
    expect(el.getAttribute('data-status')).toBe('busy');

    rerender(<StatusDot status="away" data-testid="dot" />);
    expect(el.className).toContain('statusAway');
    expect(el.getAttribute('data-status')).toBe('away');

    rerender(<StatusDot status="offline" data-testid="dot" />);
    expect(el.className).toContain('statusOffline');
    expect(el.getAttribute('data-status')).toBe('offline');

    rerender(<StatusDot status="info" data-testid="dot" />);
    expect(el.className).toContain('statusInfo');
    expect(el.getAttribute('data-status')).toBe('info');
  });

  it('applies density sizes correctly via classes and data-size attribute', () => {
    const { rerender } = render(<StatusDot size="sm" data-testid="dot" />);
    const el = screen.getByTestId('dot');
    expect(el.className).toContain('sizeSm');
    expect(el.getAttribute('data-size')).toBe('sm');

    rerender(<StatusDot size="md" data-testid="dot" />);
    expect(el.className).toContain('sizeMd');
    expect(el.getAttribute('data-size')).toBe('md');

    rerender(<StatusDot size="lg" data-testid="dot" />);
    expect(el.className).toContain('sizeLg');
    expect(el.getAttribute('data-size')).toBe('lg');
  });

  it('renders ping radar ring and binds data-ping when ping is true', () => {
    const { container, rerender } = render(<StatusDot ping status="online" data-testid="dot" />);
    const el = screen.getByTestId('dot');
    expect(el.getAttribute('data-ping')).toBe('true');
    const pingEl = container.querySelector('[class*="pingRing"]');
    expect(pingEl).toBeTruthy();

    rerender(<StatusDot ping={false} status="online" data-testid="dot" />);
    expect(el.getAttribute('data-ping')).toBeNull();
  });

  it('renders companion label text via label prop or children', () => {
    const { rerender } = render(<StatusDot status="online" label="System Operational" />);
    expect(screen.getByText('System Operational')).toBeTruthy();
    expect(screen.getByRole('status').getAttribute('aria-label')).toBe('System Operational');

    rerender(<StatusDot status="busy">Do Not Disturb</StatusDot>);
    expect(screen.getByText('Do Not Disturb')).toBeTruthy();
    expect(screen.getByRole('status').getAttribute('aria-label')).toBe('Do Not Disturb');
  });

  it('uses statusLabels dictionary for accessible fallback when visible label is absent', () => {
    const labels = {
      online: 'متصل',
      busy: 'مشغول',
    };
    const { rerender } = render(
      <StatusDot status="online" statusLabels={labels} data-testid="dot" />,
    );
    expect(screen.getByRole('status').getAttribute('aria-label')).toBe('متصل');

    rerender(<StatusDot status="busy" statusLabels={labels} data-testid="dot" />);
    expect(screen.getByRole('status').getAttribute('aria-label')).toBe('مشغول');
  });

  it('forwards ref to HTMLSpanElement', () => {
    const ref = createRef<HTMLSpanElement>();
    render(<StatusDot ref={ref} />);

    expect(ref.current).toBeInstanceOf(HTMLSpanElement);
  });
});
