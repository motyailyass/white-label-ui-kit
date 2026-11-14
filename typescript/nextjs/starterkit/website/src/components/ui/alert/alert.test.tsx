import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React, { createRef, useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import {
  Alert,
  AlertAction,
  AlertCloseButton,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  type AlertSize,
  type AlertStatus,
  type AlertVariant,
} from './index';

describe('Alert Primitive', () => {
  it('renders compound structure with accessible status role', () => {
    render(
      <Alert status="info">
        <AlertIcon />
        <div>
          <AlertTitle>Scheduled Maintenance</AlertTitle>
          <AlertDescription>Systems will be upgraded tonight at 02:00 UTC.</AlertDescription>
        </div>
      </Alert>,
    );

    const alert = screen.getByRole('status');
    expect(alert).toBeDefined();
    expect(alert.getAttribute('aria-live')).toBe('polite');
    expect(alert.getAttribute('aria-atomic')).toBe('true');
    expect(screen.getByText('Scheduled Maintenance')).toBeDefined();
    expect(screen.getByText('Systems will be upgraded tonight at 02:00 UTC.')).toBeDefined();
  });

  it('assigns role="alert" and aria-live="assertive" for danger status', () => {
    render(
      <Alert status="danger">
        <AlertIcon />
        <div>
          <AlertTitle>Authentication Failed</AlertTitle>
          <AlertDescription>Session token expired.</AlertDescription>
        </div>
      </Alert>,
    );

    const alert = screen.getByRole('alert');
    expect(alert).toBeDefined();
    expect(alert.getAttribute('aria-live')).toBe('assertive');
  });

  it('connects aria-labelledby and aria-describedby dynamically between title, description, and root', () => {
    render(
      <Alert status="warning">
        <AlertIcon />
        <div>
          <AlertTitle>Quota Exceeded</AlertTitle>
          <AlertDescription>You have used 92% of your monthly storage.</AlertDescription>
        </div>
      </Alert>,
    );

    const alert = screen.getByRole('status');
    const title = screen.getByText('Quota Exceeded');
    const description = screen.getByText('You have used 92% of your monthly storage.');

    expect(title.id).toBeTruthy();
    expect(description.id).toBeTruthy();
    expect(alert.getAttribute('aria-labelledby')).toBe(title.id);
    expect(alert.getAttribute('aria-describedby')).toBe(description.id);
  });

  it('omits dangling aria-labelledby when aria-label is provided or title is absent', () => {
    const { rerender } = render(
      <Alert aria-label="Custom system banner">
        <AlertTitle>Visible Title</AlertTitle>
      </Alert>,
    );

    let alert = screen.getByRole('status', { name: 'Custom system banner' });
    expect(alert.getAttribute('aria-labelledby')).toBeNull();
    expect(alert.getAttribute('aria-describedby')).toBeNull();

    rerender(
      <Alert>
        <AlertDescription>Standalone description only</AlertDescription>
      </Alert>,
    );

    alert = screen.getByRole('status');
    expect(alert.getAttribute('aria-labelledby')).toBeNull();
    expect(alert.getAttribute('aria-describedby')).toBe(
      screen.getByText('Standalone description only').id,
    );
  });

  it('does not attach unsolicited aria-live when static role="region" is provided', () => {
    render(
      <Alert role="region" aria-label="Persistent maintenance notice">
        <AlertDescription>Scheduled window starts tomorrow.</AlertDescription>
      </Alert>,
    );

    const region = screen.getByRole('region', { name: 'Persistent maintenance notice' });
    expect(region.getAttribute('aria-live')).toBeNull();
    expect(region.getAttribute('aria-atomic')).toBeNull();
  });

  it('marks AlertIcon decorative with aria-hidden and supports custom icon override', () => {
    render(
      <Alert status="info">
        <AlertIcon data-testid="icon-slot">
          <span data-testid="custom-icon">★</span>
        </AlertIcon>
        <div>
          <AlertTitle>Custom</AlertTitle>
        </div>
      </Alert>,
    );

    const iconSlot = screen.getByTestId('icon-slot');
    expect(iconSlot.getAttribute('aria-hidden')).toBe('true');
    expect(screen.getByTestId('custom-icon')).toBeDefined();
  });

  it('renders dismiss button with closeLabel and sets closed/inert state on dismiss', async () => {
    const user = userEvent.setup();
    const handleClose = vi.fn();
    const handleOpenChange = vi.fn();

    render(
      <Alert
        status="warning"
        dismissible
        closeLabel="Close warning notice"
        onClose={handleClose}
        onOpenChange={handleOpenChange}
      >
        <AlertIcon />
        <div>
          <AlertTitle>Dismissible Notice</AlertTitle>
          <AlertDescription>You can close this notification.</AlertDescription>
        </div>
      </Alert>,
    );

    const closeBtn = screen.getByRole('button', { name: 'Close warning notice' });
    expect(closeBtn.getAttribute('type')).toBe('button');

    await user.click(closeBtn);
    expect(handleClose).toHaveBeenCalledTimes(1);
    expect(handleOpenChange).toHaveBeenCalledWith(false);

    const wrapper = closeBtn.closest('[data-state]');
    expect(wrapper?.getAttribute('data-state')).toBe('closed');
    expect(wrapper?.getAttribute('aria-hidden')).toBe('true');
    expect(wrapper?.hasAttribute('inert')).toBe(true);
  });

  it('supports controlled open state and reopening', async () => {
    const user = userEvent.setup();

    function ControlledAlert() {
      const [open, setOpen] = useState(true);
      return (
        <div>
          <Alert
            open={open}
            onOpenChange={setOpen}
            dismissible
            closeLabel="Dismiss controlled alert"
          >
            <AlertTitle>Controlled Banner</AlertTitle>
          </Alert>
          <button type="button" onClick={() => setOpen(true)}>
            Reopen
          </button>
        </div>
      );
    }

    render(<ControlledAlert />);

    const alertEl = screen.getByRole('status');
    const wrapper = alertEl.closest('[data-state]');
    expect(wrapper?.getAttribute('data-state')).toBe('open');

    await user.click(screen.getByRole('button', { name: 'Dismiss controlled alert' }));
    expect(wrapper?.getAttribute('data-state')).toBe('closed');
    expect(wrapper?.getAttribute('aria-hidden')).toBe('true');

    await user.click(screen.getByRole('button', { name: 'Reopen' }));
    expect(wrapper?.getAttribute('data-state')).toBe('open');
    expect(wrapper?.getAttribute('aria-hidden')).toBeNull();
    expect(wrapper?.hasAttribute('inert')).toBe(false);
  });

  it('supports defaultOpen={false} initial collapsed state', () => {
    render(
      <Alert defaultOpen={false} data-testid="hidden-alert">
        <AlertTitle>Initially Hidden</AlertTitle>
      </Alert>,
    );

    const alertEl = screen.getByTestId('hidden-alert');
    const wrapper = alertEl.closest('[data-state]');
    expect(wrapper?.getAttribute('data-state')).toBe('closed');
    expect(wrapper?.getAttribute('aria-hidden')).toBe('true');
    expect(wrapper?.hasAttribute('inert')).toBe(true);
  });

  it('supports explicit compound AlertCloseButton usage', async () => {
    const user = userEvent.setup();
    const handleClose = vi.fn();

    render(
      <Alert status="info" onClose={handleClose}>
        <AlertTitle>Explicit Close</AlertTitle>
        <AlertCloseButton aria-label="Custom dismiss" />
      </Alert>,
    );

    const closeBtn = screen.getByRole('button', { name: 'Custom dismiss' });
    expect(closeBtn.getAttribute('type')).toBe('button');

    await user.click(closeBtn);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('throws clear errors when compound subcomponents render outside Alert', () => {
    expect(() => render(<AlertIcon />)).toThrow(
      '<AlertIcon> must be used within an <Alert> container.',
    );
    expect(() => render(<AlertTitle>Orphan</AlertTitle>)).toThrow(
      '<AlertTitle> must be used within an <Alert> container.',
    );
    expect(() => render(<AlertDescription>Orphan</AlertDescription>)).toThrow(
      '<AlertDescription> must be used within an <Alert> container.',
    );
    expect(() => render(<AlertCloseButton aria-label="Close" />)).toThrow(
      '<AlertCloseButton> must be used within an <Alert> container.',
    );
  });

  it('renders contextual action slot via AlertAction', () => {
    render(
      <Alert status="danger">
        <AlertIcon />
        <div>
          <AlertTitle>Actionable Alert</AlertTitle>
          <AlertDescription>Something needs your intervention.</AlertDescription>
          <AlertAction>
            <button type="button">Retry Action</button>
          </AlertAction>
        </div>
      </Alert>,
    );

    expect(screen.getByRole('button', { name: 'Retry Action' })).toBeDefined();
  });

  it('supports all status categories and applies data-status attribute', () => {
    const statuses: AlertStatus[] = ['info', 'success', 'warning', 'danger'];

    statuses.forEach((status) => {
      const { unmount } = render(
        <Alert status={status} data-testid={`alert-${status}`}>
          <AlertTitle>{status}</AlertTitle>
        </Alert>,
      );

      const el = screen.getByTestId(`alert-${status}`);
      expect(el.getAttribute('data-status')).toBe(status);
      unmount();
    });
  });

  it('supports all visual variants and sizes', () => {
    const variants: AlertVariant[] = ['subtle', 'bordered', 'solid'];
    const sizes: AlertSize[] = ['sm', 'md', 'lg'];

    variants.forEach((variant) => {
      sizes.forEach((size) => {
        const { unmount } = render(
          <Alert variant={variant} size={size} data-testid={`alert-${variant}-${size}`}>
            <AlertTitle>Variant Test</AlertTitle>
          </Alert>,
        );

        const el = screen.getByTestId(`alert-${variant}-${size}`);
        expect(el.getAttribute('data-variant')).toBe(variant);
        expect(el.getAttribute('data-size')).toBe(size);
        unmount();
      });
    });
  });

  it('supports polymorphic as prop rendering', () => {
    render(
      <Alert as="section" data-testid="polymorphic-alert">
        <AlertTitle as="h2">Section Alert</AlertTitle>
      </Alert>,
    );

    const el = screen.getByTestId('polymorphic-alert');
    expect(el.tagName.toLowerCase()).toBe('section');
    expect(screen.getByRole('heading', { level: 2 }).textContent).toBe('Section Alert');
  });

  it('forwards refs cleanly to root element', () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <Alert ref={ref}>
        <AlertTitle>Ref Title</AlertTitle>
      </Alert>,
    );

    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });
});
