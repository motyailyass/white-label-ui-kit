import { createRef } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './collapsible';

describe('Collapsible', () => {
  it('renders closed by default and toggles on trigger click', () => {
    render(
      <Collapsible>
        <CollapsibleTrigger>Toggle Details</CollapsibleTrigger>
        <CollapsibleContent>Hidden details content</CollapsibleContent>
      </Collapsible>,
    );

    const trigger = screen.getByRole('button', { name: /toggle details/i });
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
    expect(trigger.getAttribute('data-state')).toBe('closed');

    fireEvent.click(trigger);
    expect(trigger.getAttribute('aria-expanded')).toBe('true');
    expect(trigger.getAttribute('data-state')).toBe('open');
    expect(screen.getByText('Hidden details content')).toBeTruthy();

    fireEvent.click(trigger);
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
    expect(trigger.getAttribute('data-state')).toBe('closed');
  });

  it('respects defaultOpen=true', () => {
    render(
      <Collapsible defaultOpen>
        <CollapsibleTrigger>Toggle Details</CollapsibleTrigger>
        <CollapsibleContent>Initial visible content</CollapsibleContent>
      </Collapsible>,
    );

    const trigger = screen.getByRole('button', { name: /toggle details/i });
    expect(trigger.getAttribute('aria-expanded')).toBe('true');
    expect(screen.getByText('Initial visible content')).toBeTruthy();
  });

  it('supports controlled open and onOpenChange', () => {
    const handleOpenChange = vi.fn();

    const { rerender } = render(
      <Collapsible open={false} onOpenChange={handleOpenChange}>
        <CollapsibleTrigger>Toggle Details</CollapsibleTrigger>
        <CollapsibleContent>Controlled content</CollapsibleContent>
      </Collapsible>,
    );

    const trigger = screen.getByRole('button', { name: /toggle details/i });
    expect(trigger.getAttribute('aria-expanded')).toBe('false');

    fireEvent.click(trigger);
    expect(handleOpenChange).toHaveBeenCalledWith(true);

    rerender(
      <Collapsible open={true} onOpenChange={handleOpenChange}>
        <CollapsibleTrigger>Toggle Details</CollapsibleTrigger>
        <CollapsibleContent>Controlled content</CollapsibleContent>
      </Collapsible>,
    );

    expect(trigger.getAttribute('aria-expanded')).toBe('true');
  });

  it('does not toggle when disabled and reflects data-disabled', () => {
    const handleOpenChange = vi.fn();

    render(
      <Collapsible disabled onOpenChange={handleOpenChange} data-testid="root">
        <CollapsibleTrigger>Toggle Details</CollapsibleTrigger>
        <CollapsibleContent>Disabled content</CollapsibleContent>
      </Collapsible>,
    );

    const root = screen.getByTestId('root');
    expect(root.getAttribute('data-disabled')).toBe('');

    const trigger = screen.getByRole('button', { name: /toggle details/i });
    expect((trigger as HTMLButtonElement).disabled).toBe(true);
    expect(trigger.getAttribute('data-disabled')).toBe('');

    fireEvent.click(trigger);
    expect(handleOpenChange).not.toHaveBeenCalled();
  });

  it('establishes bidirectional WAI-ARIA linkage between trigger and content', () => {
    render(
      <Collapsible>
        <CollapsibleTrigger>Toggle</CollapsibleTrigger>
        <CollapsibleContent>Content</CollapsibleContent>
      </Collapsible>,
    );

    const trigger = screen.getByRole('button', { name: /toggle/i });
    const contentRegion = screen.getByRole('region', { hidden: true });

    // Trigger points to content
    expect(trigger.getAttribute('aria-controls')).toBe(contentRegion.id);
    // Content points back to trigger as its accessible label
    expect(contentRegion.getAttribute('aria-labelledby')).toBe(trigger.id);
  });

  it('supports explicit ID and ARIA overrides', () => {
    render(
      <Collapsible>
        <CollapsibleTrigger id="custom-trigger" aria-controls="custom-content">
          Toggle
        </CollapsibleTrigger>
        <CollapsibleContent id="custom-content" aria-labelledby="custom-trigger">
          Content
        </CollapsibleContent>
      </Collapsible>,
    );

    const trigger = screen.getByRole('button', { name: /toggle/i });
    const contentRegion = screen.getByRole('region', { hidden: true });

    expect(trigger.id).toBe('custom-trigger');
    expect(contentRegion.id).toBe('custom-content');
    expect(trigger.getAttribute('aria-controls')).toBe('custom-content');
    expect(contentRegion.getAttribute('aria-labelledby')).toBe('custom-trigger');
  });

  it('forwards ref to compound elements', () => {
    const rootRef = createRef<HTMLDivElement>();
    const triggerRef = createRef<HTMLButtonElement>();
    const contentRef = createRef<HTMLDivElement>();

    render(
      <Collapsible ref={rootRef}>
        <CollapsibleTrigger ref={triggerRef}>Trigger</CollapsibleTrigger>
        <CollapsibleContent ref={contentRef}>Content</CollapsibleContent>
      </Collapsible>,
    );

    expect(rootRef.current).toBeInstanceOf(HTMLDivElement);
    expect(triggerRef.current).toBeInstanceOf(HTMLButtonElement);
    expect(contentRef.current).toBeInstanceOf(HTMLDivElement);
  });
});
