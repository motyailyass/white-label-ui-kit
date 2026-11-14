import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { HoverCard, HoverCardContent, HoverCardTrigger } from './hover-card';

describe('HoverCard Primitive', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders closed by default and opens after openDelay on pointer enter', () => {
    render(
      <HoverCard openDelay={100} closeDelay={100}>
        <HoverCardTrigger>Hover trigger</HoverCardTrigger>
        <HoverCardContent>Card preview content</HoverCardContent>
      </HoverCard>,
    );

    const trigger = screen.getByRole('button', { name: /hover trigger/i });
    expect(trigger.getAttribute('aria-expanded')).toBe('false');

    fireEvent.pointerEnter(trigger);

    // Fast-forward partially
    act(() => {
      vi.advanceTimersByTime(50);
    });
    expect(trigger.getAttribute('aria-expanded')).toBe('false');

    // Fast-forward past openDelay
    act(() => {
      vi.advanceTimersByTime(60);
    });
    expect(trigger.getAttribute('aria-expanded')).toBe('true');
    expect(screen.getByText('Card preview content')).toBeTruthy();
  });

  it('closes after closeDelay when pointer leaves', () => {
    render(
      <HoverCard defaultOpen openDelay={100} closeDelay={100}>
        <HoverCardTrigger>Hover trigger</HoverCardTrigger>
        <HoverCardContent>Card preview content</HoverCardContent>
      </HoverCard>,
    );

    const trigger = screen.getByRole('button', { name: /hover trigger/i });
    expect(trigger.getAttribute('aria-expanded')).toBe('true');

    fireEvent.pointerLeave(trigger);

    act(() => {
      vi.advanceTimersByTime(50);
    });
    expect(trigger.getAttribute('aria-expanded')).toBe('true');

    act(() => {
      vi.advanceTimersByTime(60);
    });
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
  });

  it('stays open when pointer moves into card content', () => {
    render(
      <HoverCard defaultOpen openDelay={100} closeDelay={100}>
        <HoverCardTrigger>Hover trigger</HoverCardTrigger>
        <HoverCardContent>Card preview content</HoverCardContent>
      </HoverCard>,
    );

    const trigger = screen.getByRole('button', { name: /hover trigger/i });
    const content = screen.getByRole('dialog');

    fireEvent.pointerLeave(trigger);
    // Pointer enters content before closeDelay expires
    fireEvent.pointerEnter(content);

    act(() => {
      vi.advanceTimersByTime(200);
    });
    // Should still be open
    expect(trigger.getAttribute('aria-expanded')).toBe('true');
  });

  it('dismisses immediately on Escape key', () => {
    render(
      <HoverCard defaultOpen>
        <HoverCardTrigger>Hover trigger</HoverCardTrigger>
        <HoverCardContent>Card preview content</HoverCardContent>
      </HoverCard>,
    );

    const trigger = screen.getByRole('button', { name: /hover trigger/i });
    expect(trigger.getAttribute('aria-expanded')).toBe('true');

    fireEvent.keyDown(trigger, { key: 'Escape' });
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
  });

  it('supports controlled open prop', () => {
    const handleOpenChange = vi.fn();
    const { rerender } = render(
      <HoverCard open={false} onOpenChange={handleOpenChange}>
        <HoverCardTrigger>Controlled trigger</HoverCardTrigger>
        <HoverCardContent>Controlled content</HoverCardContent>
      </HoverCard>,
    );

    const trigger = screen.getByRole('button');
    expect(trigger.getAttribute('aria-expanded')).toBe('false');

    rerender(
      <HoverCard open={true} onOpenChange={handleOpenChange}>
        <HoverCardTrigger>Controlled trigger</HoverCardTrigger>
        <HoverCardContent>Controlled content</HoverCardContent>
      </HoverCard>,
    );
    expect(trigger.getAttribute('aria-expanded')).toBe('true');
  });

  it('applies placement and alignment classes correctly', () => {
    render(
      <HoverCard defaultOpen placement="start" align="end">
        <HoverCardTrigger>Trigger</HoverCardTrigger>
        <HoverCardContent data-testid="test-content">Content</HoverCardContent>
      </HoverCard>,
    );

    const content = screen.getByTestId('test-content');
    expect(content.className).toContain('placement_start');
    expect(content.className).toContain('align_end');
  });

  it('throws error when subcomponents rendered outside HoverCard', () => {
    expect(() => {
      render(<HoverCardTrigger>Orphan</HoverCardTrigger>);
    }).toThrow('HoverCard compound components must be rendered inside <HoverCard>');
  });

  it('names the dialog content from the trigger by default', () => {
    render(
      <HoverCard defaultOpen>
        <HoverCardTrigger>User profile</HoverCardTrigger>
        <HoverCardContent>Profile details</HoverCardContent>
      </HoverCard>,
    );

    const dialog = screen.getByRole('dialog', { name: 'User profile' });
    expect(dialog).toBeTruthy();
  });

  it('allows overriding accessible name with aria-label', () => {
    render(
      <HoverCard defaultOpen>
        <HoverCardTrigger>User profile</HoverCardTrigger>
        <HoverCardContent aria-label="Account summary">Profile details</HoverCardContent>
      </HoverCard>,
    );

    const dialog = screen.getByRole('dialog', { name: 'Account summary' });
    expect(dialog).toBeTruthy();
  });
});
