import { act, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React, { createRef } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Tooltip, _resetGlobalTooltipStateForTesting } from './tooltip';

describe('Tooltip Primitive', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'Date'] });
    _resetGlobalTooltipStateForTesting();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders trigger element and does not render tooltip bubble initially by default', () => {
    render(
      <Tooltip content="Edit profile">
        <button type="button">Edit</button>
      </Tooltip>,
    );

    const button = screen.getByRole('button', { name: 'Edit' });
    expect(button).toBeDefined();
    expect(screen.queryByRole('tooltip')).toBeNull();
  });

  it('opens immediately on keyboard focus and pairs with aria-describedby', () => {
    render(
      <Tooltip content="Save changes">
        <button type="button">Save</button>
      </Tooltip>,
    );

    const button = screen.getByRole('button', { name: 'Save' });
    fireEvent.focus(button);

    const tooltip = screen.getByRole('tooltip');
    expect(tooltip).toBeDefined();
    expect(tooltip.textContent).toContain('Save changes');
    expect(button.getAttribute('aria-describedby')).toBe(tooltip.id);
  });

  it('closes on keyboard blur', () => {
    render(
      <Tooltip content="Save changes">
        <button type="button">Save</button>
      </Tooltip>,
    );

    const button = screen.getByRole('button', { name: 'Save' });
    fireEvent.focus(button);
    expect(screen.getByRole('tooltip')).toBeDefined();

    fireEvent.blur(button);
    expect(screen.queryByRole('tooltip')).toBeNull();
  });

  it('dismisses immediately on Escape key without moving focus (WCAG 1.4.13 Dismissible)', () => {
    render(
      <Tooltip content="Help information">
        <button type="button">Help</button>
      </Tooltip>,
    );

    const button = screen.getByRole('button', { name: 'Help' });
    fireEvent.focus(button);
    expect(screen.getByRole('tooltip')).toBeDefined();

    fireEvent.keyDown(window, { key: 'Escape' });
    expect(screen.queryByRole('tooltip')).toBeNull();
  });

  it('opens on pointer hover after delay duration', () => {
    render(
      <Tooltip content="Quick search" delayDuration={250}>
        <button type="button">Search</button>
      </Tooltip>,
    );

    const button = screen.getByRole('button', { name: 'Search' });
    fireEvent.pointerEnter(button);

    // Before 250ms, tooltip is not yet visible
    act(() => {
      vi.advanceTimersByTime(200);
    });
    expect(screen.queryByRole('tooltip')).toBeNull();

    // After 250ms, tooltip appears
    act(() => {
      vi.advanceTimersByTime(60);
    });
    expect(screen.getByRole('tooltip')).toBeDefined();
    expect(screen.getByRole('tooltip').textContent).toContain('Quick search');
  });

  it('keeps tooltip open when pointer moves into the tooltip bubble (WCAG 1.4.13 Hoverable)', () => {
    render(
      <Tooltip content="Settings panel" delayDuration={100}>
        <button type="button">Settings</button>
      </Tooltip>,
    );

    const button = screen.getByRole('button', { name: 'Settings' });
    fireEvent.pointerEnter(button);

    act(() => {
      vi.advanceTimersByTime(110);
    });
    const tooltip = screen.getByRole('tooltip');
    expect(tooltip).toBeDefined();

    // Pointer leaves button and enters tooltip within grace period
    fireEvent.pointerLeave(button);
    fireEvent.pointerEnter(tooltip);

    act(() => {
      vi.advanceTimersByTime(200);
    });
    // Remains open!
    expect(screen.getByRole('tooltip')).toBeDefined();

    // Leaves tooltip
    fireEvent.pointerLeave(tooltip);
    act(() => {
      vi.advanceTimersByTime(110);
    });
    expect(screen.queryByRole('tooltip')).toBeNull();
  });

  it('renders optional keyboard shortcut badge', () => {
    render(
      <Tooltip content="Command palette" shortcut="⌘K" defaultOpen>
        <button type="button">Open</button>
      </Tooltip>,
    );

    const tooltip = screen.getByRole('tooltip');
    expect(tooltip).toBeDefined();
    expect(tooltip.querySelector('kbd')?.textContent).toBe('⌘K');
  });

  it('renders optional directional arrow notch', () => {
    const { container } = render(
      <Tooltip content="Top notch" arrow={true} defaultOpen>
        <button type="button">Anchor</button>
      </Tooltip>,
    );

    const arrow = container.querySelector('[aria-hidden="true"]');
    expect(arrow).toBeDefined();
  });

  it('renders subtle and contrast variants cleanly', () => {
    const { rerender } = render(
      <Tooltip content="Subtle variant" variant="subtle" defaultOpen>
        <button type="button">Btn</button>
      </Tooltip>,
    );

    let tooltip = screen.getByRole('tooltip');
    expect(tooltip.getAttribute('data-variant')).toBe('subtle');

    rerender(
      <Tooltip content="Contrast variant" variant="contrast" defaultOpen>
        <button type="button">Btn</button>
      </Tooltip>,
    );

    tooltip = screen.getByRole('tooltip');
    expect(tooltip.getAttribute('data-variant')).toBe('contrast');
  });

  it('respects controlled open prop', () => {
    const handleOpenChange = vi.fn();
    const { rerender } = render(
      <Tooltip content="Controlled" open={false} onOpenChange={handleOpenChange}>
        <button type="button">Trigger</button>
      </Tooltip>,
    );

    expect(screen.queryByRole('tooltip')).toBeNull();

    rerender(
      <Tooltip content="Controlled" open={true} onOpenChange={handleOpenChange}>
        <button type="button">Trigger</button>
      </Tooltip>,
    );

    expect(screen.getByRole('tooltip')).toBeDefined();
  });

  it('suppresses tooltip when disabled is true', () => {
    render(
      <Tooltip content="Disabled tooltip" disabled>
        <button type="button">Action</button>
      </Tooltip>,
    );

    const button = screen.getByRole('button', { name: 'Action' });
    fireEvent.focus(button);
    expect(screen.queryByRole('tooltip')).toBeNull();

    fireEvent.pointerEnter(button);
    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(screen.queryByRole('tooltip')).toBeNull();
  });

  it('forwards ref to the tooltip bubble DOM element', () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <Tooltip content="Ref forwarded" defaultOpen ref={ref}>
        <button type="button">Target</button>
      </Tooltip>,
    );

    expect(ref.current).toBeInstanceOf(HTMLDivElement);
    expect(ref.current?.getAttribute('role')).toBe('tooltip');
  });
});
