import { createRef } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { Toast, ToastAction, ToastDescription, ToastTitle, ToastViewport } from './toast';

describe('Toast Primitive', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  it('renders compound compartments with named landmark and dynamic aria references', () => {
    render(
      <ToastViewport label="Notifications" position="top-center">
        <Toast variant="info">
          <ToastTitle>Deployment Successful</ToastTitle>
          <ToastDescription>All edge regions have been updated.</ToastDescription>
          <ToastAction>View logs</ToastAction>
        </Toast>
      </ToastViewport>,
    );

    const region = screen.getByRole('region', { name: 'Notifications' });
    expect(region.getAttribute('data-position')).toBe('top-center');

    const toastItem = screen.getByRole('status');
    expect(toastItem.getAttribute('aria-live')).toBe('polite');
    expect(toastItem.getAttribute('aria-atomic')).toBe('true');

    const title = screen.getByText('Deployment Successful');
    expect(title.tagName).toBe('P');
    expect(toastItem.getAttribute('aria-labelledby')).toBe(title.id);

    const description = screen.getByText('All edge regions have been updated.');
    expect(toastItem.getAttribute('aria-describedby')).toBe(description.id);

    const actionBtn = screen.getByRole('button', { name: 'View logs' });
    expect(actionBtn.getAttribute('type')).toBe('button');
  });

  it('omits aria-describedby when ToastDescription is absent and avoids unnamed region role', () => {
    const { container } = render(
      <ToastViewport>
        <Toast variant="success">
          <ToastTitle as="h3">Saved</ToastTitle>
        </Toast>
      </ToastViewport>,
    );

    const list = container.querySelector('ol');
    expect(list?.getAttribute('role')).toBeNull();

    const toastItem = screen.getByRole('status');
    expect(toastItem.getAttribute('aria-labelledby')).toBe(
      screen.getByRole('heading', { level: 3, name: 'Saved' }).id,
    );
    expect(toastItem.getAttribute('aria-describedby')).toBeNull();
  });

  it('sets role="alert" and aria-live="assertive" for danger and warning variants', () => {
    const { rerender } = render(
      <Toast variant="danger">
        <ToastTitle>Database Error</ToastTitle>
        <ToastDescription>Connection timed out.</ToastDescription>
      </Toast>,
    );

    let toastItem = screen.getByRole('alert');
    expect(toastItem.getAttribute('aria-live')).toBe('assertive');

    rerender(
      <Toast variant="warning">
        <ToastTitle>Storage Depleted</ToastTitle>
        <ToastDescription>Exceeded 90% quota.</ToastDescription>
      </Toast>,
    );

    toastItem = screen.getByRole('alert');
    expect(toastItem.getAttribute('aria-live')).toBe('assertive');
  });

  it('fires onDismiss when close button is clicked', () => {
    const onDismiss = vi.fn();
    render(
      <Toast onDismiss={onDismiss} closeLabel="Close alert">
        <ToastTitle>Notice</ToastTitle>
      </Toast>,
    );

    const closeBtn = screen.getByRole('button', { name: 'Close alert' });
    fireEvent.click(closeBtn);
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it('auto-dismisses after duration expires without resetting on onDismiss identity changes', () => {
    const firstDismiss = vi.fn();
    const secondDismiss = vi.fn();
    const { rerender } = render(
      <Toast duration={3000} onDismiss={firstDismiss}>
        <ToastTitle>Auto Dismiss</ToastTitle>
      </Toast>,
    );

    act(() => {
      vi.advanceTimersByTime(1500);
    });
    expect(firstDismiss).not.toHaveBeenCalled();

    // Parent re-renders with a new closure reference mid-countdown
    rerender(
      <Toast duration={3000} onDismiss={secondDismiss}>
        <ToastTitle>Auto Dismiss</ToastTitle>
      </Toast>,
    );

    act(() => {
      vi.advanceTimersByTime(1499);
    });
    expect(secondDismiss).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(secondDismiss).toHaveBeenCalledTimes(1);
    expect(firstDismiss).not.toHaveBeenCalled();
  });

  it('pauses on hover and internal focus navigation, resuming only after leaving toast', () => {
    const onDismiss = vi.fn();
    render(
      <Toast duration={3000} onDismiss={onDismiss} closeLabel="Close">
        <ToastTitle>Pause Test</ToastTitle>
        <ToastAction>Inspect</ToastAction>
      </Toast>,
    );

    const toastItem = screen.getByRole('status');
    const actionBtn = screen.getByRole('button', { name: 'Inspect' });
    const closeBtn = screen.getByRole('button', { name: 'Close' });

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    // Hover pauses timer
    fireEvent.mouseEnter(toastItem);
    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect(onDismiss).not.toHaveBeenCalled();

    // Leave resumes timer
    fireEvent.mouseLeave(toastItem);

    // Focus inside pauses again
    fireEvent.focus(actionBtn);
    // Moving focus to another child within the same toast keeps it paused
    fireEvent.blur(actionBtn, { relatedTarget: closeBtn });
    fireEvent.focus(closeBtn);

    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect(onDismiss).not.toHaveBeenCalled();

    // Blurring outside the toast resumes remaining ~2000ms
    fireEvent.blur(closeBtn, { relatedTarget: document.body });

    act(() => {
      vi.advanceTimersByTime(1999);
    });
    expect(onDismiss).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(50);
    });
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it('forwards ref directly to HTMLLIElement, HTMLOListElement, and button compartments', () => {
    const viewportRef = createRef<HTMLOListElement>();
    const toastRef = createRef<HTMLLIElement>();
    const titleRef = createRef<HTMLParagraphElement>();
    const actionRef = createRef<HTMLButtonElement>();

    render(
      <ToastViewport ref={viewportRef} position="top-end" label="Alerts">
        <Toast ref={toastRef}>
          <ToastTitle ref={titleRef}>Ref Test</ToastTitle>
          <ToastAction ref={actionRef}>Retry</ToastAction>
        </Toast>
      </ToastViewport>,
    );

    expect(viewportRef.current instanceof HTMLOListElement).toBe(true);
    expect(toastRef.current instanceof HTMLLIElement).toBe(true);
    expect(titleRef.current instanceof HTMLParagraphElement).toBe(true);
    expect(actionRef.current instanceof HTMLButtonElement).toBe(true);
  });
});
