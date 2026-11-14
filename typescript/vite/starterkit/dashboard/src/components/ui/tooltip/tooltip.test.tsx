import { act, fireEvent, render, screen } from '@testing-library/react';
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

  it('isolates shortcut text inside an LTR span while keeping kbd logically ordered', () => {
    render(
      <div dir="rtl">
        <Tooltip content="بحث" shortcut="⌘K" defaultOpen>
          <button type="button">بحث</button>
        </Tooltip>
      </div>,
    );

    const textSpan = screen.getByText('⌘K');
    const kbd = textSpan.closest('kbd');
    expect(kbd).not.toBeNull();
    expect(kbd?.getAttribute('dir')).toBeNull();
    expect(textSpan.getAttribute('dir')).toBe('ltr');
  });

  it('resolves logical placement="start" and "end" physically in LTR and RTL', () => {
    const mockCenteredTriggerRect = (trigger: HTMLElement, tooltip: HTMLElement) => {
      vi.spyOn(trigger, 'getBoundingClientRect').mockReturnValue({
        top: 100,
        bottom: 136,
        left: 200,
        right: 300,
        width: 100,
        height: 36,
        x: 200,
        y: 100,
        toJSON: () => {},
      });
      Object.defineProperty(tooltip, 'offsetHeight', { configurable: true, value: 32 });
      Object.defineProperty(tooltip, 'offsetWidth', { configurable: true, value: 80 });
      fireEvent(window, new Event('resize'));
    };

    const { unmount } = render(
      <div dir="ltr">
        <Tooltip content="Logical start" placement="start" defaultOpen>
          <button type="button" data-testid="trig-ltr">
            Trigger
          </button>
        </Tooltip>
      </div>,
    );

    const tooltipLtr = screen.getByRole('tooltip');
    mockCenteredTriggerRect(screen.getByTestId('trig-ltr'), tooltipLtr);
    expect(tooltipLtr.getAttribute('data-placement')).toBe('left');
    unmount();

    render(
      <div dir="rtl">
        <Tooltip content="بداية" placement="start" defaultOpen>
          <button type="button" data-testid="trig-rtl">
            زر
          </button>
        </Tooltip>
      </div>,
    );

    const tooltipRtl = screen.getByRole('tooltip');
    mockCenteredTriggerRect(screen.getByTestId('trig-rtl'), tooltipRtl);
    expect(tooltipRtl.getAttribute('data-placement')).toBe('right');
  });

  it('automatically flips from top to bottom on top viewport boundary collision', () => {
    render(
      <Tooltip content="Flipped tooltip" placement="top" defaultOpen>
        <button type="button" data-testid="edge-trigger">
          Top Edge
        </button>
      </Tooltip>,
    );

    const trigger = screen.getByTestId('edge-trigger');
    const tooltip = screen.getByRole('tooltip');

    vi.spyOn(trigger, 'getBoundingClientRect').mockReturnValue({
      top: 4,
      bottom: 40,
      left: 100,
      right: 200,
      width: 100,
      height: 36,
      x: 100,
      y: 4,
      toJSON: () => {},
    });

    Object.defineProperty(tooltip, 'offsetHeight', { configurable: true, value: 32 });
    Object.defineProperty(tooltip, 'offsetWidth', { configurable: true, value: 120 });

    fireEvent(window, new Event('resize'));
    expect(tooltip.getAttribute('data-placement')).toBe('bottom');
  });

  it('opens adjacent tooltip immediately within skipDelayDuration grace period', () => {
    render(
      <div>
        <Tooltip content="First" delayDuration={250} skipDelayDuration={200}>
          <button type="button">First Btn</button>
        </Tooltip>
        <Tooltip content="Second" delayDuration={250} skipDelayDuration={200}>
          <button type="button">Second Btn</button>
        </Tooltip>
      </div>,
    );

    const first = screen.getByRole('button', { name: 'First Btn' });
    const second = screen.getByRole('button', { name: 'Second Btn' });

    fireEvent.focus(first);
    expect(screen.getByRole('tooltip').textContent).toContain('First');

    // Blur first sets lastCloseTime
    fireEvent.blur(first);
    expect(screen.queryByRole('tooltip')).toBeNull();

    // Pointer enters second within 200ms -> opens immediately (0ms)
    fireEvent.pointerEnter(second);
    expect(screen.getByRole('tooltip').textContent).toContain('Second');
  });
});
