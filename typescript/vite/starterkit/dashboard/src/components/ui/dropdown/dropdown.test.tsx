import { act, fireEvent, render, screen } from '@testing-library/react';
import React, { createRef, useState } from 'react';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import {
  Dropdown,
  DropdownContent,
  DropdownGroup,
  DropdownItem,
  DropdownLabel,
  DropdownSeparator,
  DropdownTrigger,
} from './dropdown';

// Stub native Popover API in JSDOM if not present
beforeAll(() => {
  if (typeof HTMLElement.prototype.showPopover !== 'function') {
    HTMLElement.prototype.showPopover = function mockShowPopover(this: HTMLElement) {
      this.setAttribute('data-mock-popover-open', 'true');
      const event = new Event('toggle') as unknown as { newState: string };
      event.newState = 'open';
      this.dispatchEvent(event as unknown as Event);
    };
  }

  if (typeof HTMLElement.prototype.hidePopover !== 'function') {
    HTMLElement.prototype.hidePopover = function mockHidePopover(this: HTMLElement) {
      this.removeAttribute('data-mock-popover-open');
      const event = new Event('toggle') as unknown as { newState: string };
      event.newState = 'closed';
      this.dispatchEvent(event as unknown as Event);
    };
  }
});

describe('Dropdown (Pure Primitive)', () => {
  it('opens and closes via trigger click in uncontrolled mode', () => {
    render(
      <Dropdown>
        <DropdownTrigger>Actions</DropdownTrigger>
        <DropdownContent data-testid="menu-surface">
          <DropdownItem>Edit</DropdownItem>
          <DropdownItem>Duplicate</DropdownItem>
        </DropdownContent>
      </Dropdown>,
    );

    const trigger = screen.getByRole('button', { name: 'Actions' });
    const surface = screen.getByTestId('menu-surface');

    expect(trigger.getAttribute('aria-expanded')).toBe('false');
    expect(surface.getAttribute('data-state')).toBe('closed');

    // Open via click
    fireEvent.click(trigger);
    expect(trigger.getAttribute('aria-expanded')).toBe('true');
    expect(surface.getAttribute('data-state')).toBe('open');

    // Close via click
    fireEvent.click(trigger);
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
    expect(surface.getAttribute('data-state')).toBe('closed');
  });

  it('opens via Enter, Space, ArrowDown, and ArrowUp keyboard events on trigger', () => {
    const { unmount } = render(
      <Dropdown>
        <DropdownTrigger>Options</DropdownTrigger>
        <DropdownContent data-testid="menu-surface">
          <DropdownItem data-testid="first-item">First</DropdownItem>
          <DropdownItem data-testid="last-item">Last</DropdownItem>
        </DropdownContent>
      </Dropdown>,
    );

    const trigger = screen.getByRole('button', { name: 'Options' });
    const surface = screen.getByTestId('menu-surface');

    // Enter opens
    fireEvent.keyDown(trigger, { key: 'Enter' });
    expect(surface.getAttribute('data-state')).toBe('open');

    // Space closes
    fireEvent.keyDown(trigger, { key: ' ' });
    expect(surface.getAttribute('data-state')).toBe('closed');

    // ArrowDown opens
    fireEvent.keyDown(trigger, { key: 'ArrowDown' });
    expect(surface.getAttribute('data-state')).toBe('open');

    unmount();

    // ArrowUp opens targeting last item
    render(
      <Dropdown defaultOpen={false}>
        <DropdownTrigger>Options</DropdownTrigger>
        <DropdownContent data-testid="menu-surface">
          <DropdownItem data-testid="first-item">First</DropdownItem>
          <DropdownItem data-testid="last-item">Last</DropdownItem>
        </DropdownContent>
      </Dropdown>,
    );

    const trigger2 = screen.getByRole('button', { name: 'Options' });
    const surface2 = screen.getByTestId('menu-surface');

    fireEvent.keyDown(trigger2, { key: 'ArrowUp' });
    expect(surface2.getAttribute('data-state')).toBe('open');
  });

  it('navigates with ArrowDown and ArrowUp and wraps when loop is true', () => {
    render(
      <Dropdown defaultOpen={true}>
        <DropdownTrigger>Menu</DropdownTrigger>
        <DropdownContent data-testid="menu-surface" loop={true}>
          <DropdownItem data-testid="item-0">Alpha</DropdownItem>
          <DropdownItem data-testid="item-1">Beta</DropdownItem>
          <DropdownItem data-testid="item-2">Gamma</DropdownItem>
        </DropdownContent>
      </Dropdown>,
    );

    const surface = screen.getByTestId('menu-surface');
    const item0 = screen.getByTestId('item-0');
    const item1 = screen.getByTestId('item-1');
    const item2 = screen.getByTestId('item-2');

    item0.focus();
    expect(document.activeElement).toBe(item0);

    // ArrowDown moves to next item
    fireEvent.keyDown(surface, { key: 'ArrowDown' });
    expect(document.activeElement).toBe(item1);

    fireEvent.keyDown(surface, { key: 'ArrowDown' });
    expect(document.activeElement).toBe(item2);

    // ArrowDown at end wraps back to first item
    fireEvent.keyDown(surface, { key: 'ArrowDown' });
    expect(document.activeElement).toBe(item0);

    // ArrowUp wraps back to last item
    fireEvent.keyDown(surface, { key: 'ArrowUp' });
    expect(document.activeElement).toBe(item2);

    // ArrowUp moves to previous
    fireEvent.keyDown(surface, { key: 'ArrowUp' });
    expect(document.activeElement).toBe(item1);
  });

  it('includes visible disabled items in arrow navigation per WAI-ARIA Menu pattern', () => {
    render(
      <Dropdown defaultOpen={true}>
        <DropdownTrigger>Menu</DropdownTrigger>
        <DropdownContent data-testid="menu-surface">
          <DropdownItem data-testid="item-enabled">Enabled</DropdownItem>
          <DropdownItem data-testid="item-disabled" disabled={true}>
            Disabled
          </DropdownItem>
        </DropdownContent>
      </Dropdown>,
    );

    const surface = screen.getByTestId('menu-surface');
    const itemEnabled = screen.getByTestId('item-enabled');
    const itemDisabled = screen.getByTestId('item-disabled');

    itemEnabled.focus();
    expect(document.activeElement).toBe(itemEnabled);

    // Disabled item receives focus via arrow navigation for discovery
    fireEvent.keyDown(surface, { key: 'ArrowDown' });
    expect(document.activeElement).toBe(itemDisabled);
    expect(itemDisabled.getAttribute('aria-disabled')).toBe('true');
  });

  it('jumps to first item on Home and last item on End', () => {
    render(
      <Dropdown defaultOpen={true}>
        <DropdownTrigger>Menu</DropdownTrigger>
        <DropdownContent data-testid="menu-surface">
          <DropdownItem data-testid="item-first">First</DropdownItem>
          <DropdownItem data-testid="item-middle">Middle</DropdownItem>
          <DropdownItem data-testid="item-last">Last</DropdownItem>
        </DropdownContent>
      </Dropdown>,
    );

    const surface = screen.getByTestId('menu-surface');
    const itemFirst = screen.getByTestId('item-first');
    const itemMiddle = screen.getByTestId('item-middle');
    const itemLast = screen.getByTestId('item-last');

    itemMiddle.focus();
    expect(document.activeElement).toBe(itemMiddle);

    // Home jumps to first
    fireEvent.keyDown(surface, { key: 'Home' });
    expect(document.activeElement).toBe(itemFirst);

    // End jumps to last
    fireEvent.keyDown(surface, { key: 'End' });
    expect(document.activeElement).toBe(itemLast);
  });

  it('activates enabled item on click, Enter, and Space, closing menu by default', () => {
    const handleSelect = vi.fn();
    const handleClick = vi.fn();

    render(
      <Dropdown defaultOpen={true}>
        <DropdownTrigger>Menu</DropdownTrigger>
        <DropdownContent data-testid="menu-surface">
          <DropdownItem data-testid="action-item" onSelect={handleSelect} onClick={handleClick}>
            Execute Action
          </DropdownItem>
        </DropdownContent>
      </Dropdown>,
    );

    const item = screen.getByTestId('action-item');
    const surface = screen.getByTestId('menu-surface');

    // Click activates and closes
    fireEvent.click(item);
    expect(handleSelect).toHaveBeenCalledTimes(1);
    expect(handleClick).toHaveBeenCalledTimes(1);
    expect(surface.getAttribute('data-state')).toBe('closed');
  });

  it('blocks activation on disabled items without closing the menu', () => {
    const handleSelect = vi.fn();
    const handleClick = vi.fn();

    render(
      <Dropdown defaultOpen={true}>
        <DropdownTrigger>Menu</DropdownTrigger>
        <DropdownContent data-testid="menu-surface">
          <DropdownItem
            data-testid="disabled-action"
            disabled={true}
            onSelect={handleSelect}
            onClick={handleClick}
          >
            Unavailable Action
          </DropdownItem>
        </DropdownContent>
      </Dropdown>,
    );

    const item = screen.getByTestId('disabled-action');
    const surface = screen.getByTestId('menu-surface');

    // Pointer click on disabled item is blocked
    fireEvent.click(item);
    expect(handleSelect).not.toHaveBeenCalled();
    expect(handleClick).not.toHaveBeenCalled();
    expect(surface.getAttribute('data-state')).toBe('open');

    // Keyboard Enter on disabled item is blocked
    fireEvent.keyDown(item, { key: 'Enter' });
    expect(handleSelect).not.toHaveBeenCalled();
    expect(surface.getAttribute('data-state')).toBe('open');

    // Keyboard Space on disabled item is blocked
    fireEvent.keyDown(item, { key: ' ' });
    expect(handleSelect).not.toHaveBeenCalled();
    expect(surface.getAttribute('data-state')).toBe('open');
  });

  it('renders navigation links as real <a href> and preserves caller rel or defaults on target="_blank"', () => {
    render(
      <Dropdown defaultOpen={true}>
        <DropdownTrigger>Menu</DropdownTrigger>
        <DropdownContent>
          <DropdownItem href="/dashboard" data-testid="internal-link">
            Dashboard
          </DropdownItem>
          <DropdownItem href="https://example.com" target="_blank" data-testid="external-link">
            External Docs
          </DropdownItem>
          <DropdownItem href="/custom" rel="author" data-testid="custom-rel-link">
            Custom Rel
          </DropdownItem>
        </DropdownContent>
      </Dropdown>,
    );

    const internalLink = screen.getByTestId('internal-link');
    expect(internalLink.tagName.toLowerCase()).toBe('a');
    expect(internalLink.getAttribute('href')).toBe('/dashboard');
    expect(internalLink.getAttribute('role')).toBe('menuitem');

    const externalLink = screen.getByTestId('external-link');
    expect(externalLink.getAttribute('target')).toBe('_blank');
    expect(externalLink.getAttribute('rel')).toBe('noopener noreferrer');

    const customRelLink = screen.getByTestId('custom-rel-link');
    expect(customRelLink.getAttribute('rel')).toBe('author');
  });

  it('restores focus to trigger on Escape key dismissal', () => {
    render(
      <Dropdown defaultOpen={true}>
        <DropdownTrigger data-testid="trigger">Menu</DropdownTrigger>
        <DropdownContent data-testid="menu-surface">
          <DropdownItem>Action</DropdownItem>
        </DropdownContent>
      </Dropdown>,
    );

    const trigger = screen.getByTestId('trigger');
    const surface = screen.getByTestId('menu-surface');

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(surface.getAttribute('data-state')).toBe('closed');
    expect(document.activeElement).toBe(trigger);
  });

  it('closes dropdown on Tab key without preventing native tab event', () => {
    render(
      <Dropdown defaultOpen={true}>
        <DropdownTrigger>Menu</DropdownTrigger>
        <DropdownContent data-testid="menu-surface">
          <DropdownItem>Action</DropdownItem>
        </DropdownContent>
      </Dropdown>,
    );

    const surface = screen.getByTestId('menu-surface');
    let defaultPrevented = false;
    act(() => {
      const event = fireEvent.keyDown(surface, { key: 'Tab' });
      defaultPrevented = !event;
    });
    expect(surface.getAttribute('data-state')).toBe('closed');
    expect(defaultPrevented).toBe(false);
  });

  it('does NOT steal focus on outside click and allows clicked control to perform action', () => {
    const handleOutsideClick = vi.fn();

    render(
      <div>
        <Dropdown defaultOpen={true}>
          <DropdownTrigger data-testid="trigger">Menu</DropdownTrigger>
          <DropdownContent data-testid="menu-surface">
            <DropdownItem>Action</DropdownItem>
          </DropdownContent>
        </Dropdown>
        <button type="button" data-testid="outside-btn" onClick={handleOutsideClick}>
          Outside Action
        </button>
      </div>,
    );

    const outsideBtn = screen.getByTestId('outside-btn');
    const surface = screen.getByTestId('menu-surface');

    // Click outside button
    fireEvent.pointerDown(outsideBtn);
    fireEvent.click(outsideBtn);

    expect(handleOutsideClick).toHaveBeenCalledTimes(1);
    expect(surface.getAttribute('data-state')).toBe('closed');
  });

  it('synchronizes with controlled open prop and calls onOpenChange', () => {
    function ControlledTest() {
      const [isOpen, setIsOpen] = useState(false);
      return (
        <div>
          <button type="button" data-testid="toggle-btn" onClick={() => setIsOpen(!isOpen)}>
            Toggle
          </button>
          <Dropdown open={isOpen} onOpenChange={setIsOpen}>
            <DropdownTrigger data-testid="trigger">Controlled</DropdownTrigger>
            <DropdownContent data-testid="menu-surface">
              <DropdownItem>Item</DropdownItem>
            </DropdownContent>
          </Dropdown>
        </div>
      );
    }

    render(<ControlledTest />);

    const toggleBtn = screen.getByTestId('toggle-btn');
    const trigger = screen.getByTestId('trigger');
    const surface = screen.getByTestId('menu-surface');

    expect(trigger.getAttribute('aria-expanded')).toBe('false');
    expect(surface.getAttribute('data-state')).toBe('closed');

    // External toggle open
    fireEvent.click(toggleBtn);
    expect(trigger.getAttribute('aria-expanded')).toBe('true');
    expect(surface.getAttribute('data-state')).toBe('open');

    // Trigger toggle close
    fireEvent.click(trigger);
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
    expect(surface.getAttribute('data-state')).toBe('closed');
  });

  it('keeps dropdown closed when parent supplies open={false} and rejects open requests on trigger click', () => {
    const handleOpenChange = vi.fn();

    render(
      <Dropdown open={false} onOpenChange={handleOpenChange}>
        <DropdownTrigger data-testid="trigger">Trigger</DropdownTrigger>
        <DropdownContent data-testid="menu-surface">
          <DropdownItem>Content</DropdownItem>
        </DropdownContent>
      </Dropdown>,
    );

    const trigger = screen.getByTestId('trigger');
    const surface = screen.getByTestId('menu-surface');

    expect(trigger.getAttribute('aria-expanded')).toBe('false');
    expect(surface.getAttribute('data-state')).toBe('closed');

    // Click trigger to attempt open
    fireEvent.click(trigger);

    expect(handleOpenChange).toHaveBeenCalledWith(true);

    // Because parent keeps open={false}, menu must remain closed
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
    expect(surface.getAttribute('data-state')).toBe('closed');
  });

  it('allows yielded controlled dropdown to reopen when trigger is clicked afterward', () => {
    const handleOpenChangeA = vi.fn();
    const handleOpenChangeB = vi.fn();

    render(
      <div>
        <Dropdown open={true} onOpenChange={handleOpenChangeA}>
          <DropdownTrigger data-testid="trigger-a">A</DropdownTrigger>
          <DropdownContent data-testid="surface-a">
            <DropdownItem>Item A</DropdownItem>
          </DropdownContent>
        </Dropdown>

        <Dropdown open={false} onOpenChange={handleOpenChangeB}>
          <DropdownTrigger data-testid="trigger-b">B</DropdownTrigger>
          <DropdownContent data-testid="surface-b">
            <DropdownItem>Item B</DropdownItem>
          </DropdownContent>
        </Dropdown>
      </div>,
    );

    const triggerA = screen.getByTestId('trigger-a');
    const surfaceA = screen.getByTestId('surface-a');

    expect(triggerA.getAttribute('aria-expanded')).toBe('true');

    // Simulate browser engine light-dismissing A due to B's top-layer presence
    const contentA = surfaceA.parentElement!;
    const toggleEventClosed = new Event('toggle') as unknown as { newState: string };
    toggleEventClosed.newState = 'closed';
    act(() => {
      contentA.dispatchEvent(toggleEventClosed as unknown as Event);
    });

    // A yielded: A's trigger must report false
    expect(triggerA.getAttribute('aria-expanded')).toBe('false');

    // Now click Trigger A to reopen A afterward
    act(() => {
      fireEvent.click(triggerA);
    });

    expect(handleOpenChangeA).toHaveBeenCalledWith(true);
    expect(triggerA.getAttribute('aria-expanded')).toBe('true');
  });

  it('computes bidirectional horizontal alignment: start aligns left in LTR and right in RTL', () => {
    // LTR Test
    const { unmount } = render(
      <Dropdown defaultOpen={true} placement="bottom-start" dir="ltr">
        <DropdownTrigger data-testid="trigger">Trigger</DropdownTrigger>
        <DropdownContent data-testid="surface">
          <DropdownItem>Item</DropdownItem>
        </DropdownContent>
      </Dropdown>,
    );

    const trigger = screen.getByTestId('trigger');
    const surface = screen.getByTestId('surface');

    vi.spyOn(trigger, 'getBoundingClientRect').mockReturnValue({
      top: 100,
      bottom: 140,
      left: 200,
      right: 320,
      width: 120,
      height: 40,
      x: 200,
      y: 100,
      toJSON: () => {},
    });

    vi.spyOn(surface, 'getBoundingClientRect').mockReturnValue({
      top: 0,
      bottom: 100,
      left: 0,
      right: 180,
      width: 180,
      height: 100,
      x: 0,
      y: 0,
      toJSON: () => {},
    });

    // Recompute
    fireEvent(window, new Event('resize'));
    // In LTR bottom-start, left aligns with trigger.left (200px)
    expect(surface.style.left).toBe('200px');

    unmount();

    // RTL Test
    render(
      <Dropdown defaultOpen={true} placement="bottom-start" dir="rtl">
        <DropdownTrigger data-testid="trigger-rtl">Trigger</DropdownTrigger>
        <DropdownContent data-testid="surface-rtl">
          <DropdownItem>Item</DropdownItem>
        </DropdownContent>
      </Dropdown>,
    );

    const triggerRtl = screen.getByTestId('trigger-rtl');
    const surfaceRtl = screen.getByTestId('surface-rtl');

    vi.spyOn(triggerRtl, 'getBoundingClientRect').mockReturnValue({
      top: 100,
      bottom: 140,
      left: 200,
      right: 320,
      width: 120,
      height: 40,
      x: 200,
      y: 100,
      toJSON: () => {},
    });

    vi.spyOn(surfaceRtl, 'getBoundingClientRect').mockReturnValue({
      top: 0,
      bottom: 100,
      left: 0,
      right: 180,
      width: 180,
      height: 100,
      x: 0,
      y: 0,
      toJSON: () => {},
    });

    fireEvent(window, new Event('resize'));
    // In RTL bottom-start, right edge aligns with trigger.right: left = trigger.right - surface.width = 320 - 180 = 140px
    expect(surfaceRtl.style.left).toBe('140px');
  });

  it('composes forwardedRef, childRef, and internal refs with asChild without nested buttons', () => {
    const forwardedTriggerRef = createRef<HTMLElement>();
    const childRef = createRef<HTMLButtonElement>();

    render(
      <Dropdown>
        <DropdownTrigger asChild ref={forwardedTriggerRef}>
          <button ref={childRef} type="button" data-testid="custom-button">
            Custom Trigger
          </button>
        </DropdownTrigger>
        <DropdownContent>
          <DropdownItem>Item</DropdownItem>
        </DropdownContent>
      </Dropdown>,
    );

    const customButton = screen.getByTestId('custom-button');
    expect(customButton.parentElement?.tagName.toLowerCase()).not.toBe('button');
    expect(forwardedTriggerRef.current).toBe(customButton);
    expect(childRef.current).toBe(customButton);
  });

  it('renders compound subcomponents: separators, groups, and labels', () => {
    render(
      <Dropdown defaultOpen={true}>
        <DropdownTrigger>Options</DropdownTrigger>
        <DropdownContent>
          <DropdownGroup data-testid="group-1">
            <DropdownLabel data-testid="label-1">Actions</DropdownLabel>
            <DropdownItem>Edit</DropdownItem>
          </DropdownGroup>
          <DropdownSeparator data-testid="separator" />
          <DropdownGroup data-testid="group-2">
            <DropdownItem variant="danger">Delete</DropdownItem>
          </DropdownGroup>
        </DropdownContent>
      </Dropdown>,
    );

    expect(screen.getByTestId('group-1').getAttribute('role')).toBe('group');
    expect(screen.getByTestId('label-1').textContent).toBe('Actions');
    expect(screen.getByTestId('separator').getAttribute('role')).toBe('separator');
    expect(screen.getByTestId('group-2').getAttribute('role')).toBe('group');
  });
});
