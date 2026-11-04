import { act, fireEvent, render, screen } from '@testing-library/react';
import React, { createRef, useRef, useState } from 'react';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import {
  Popover,
  PopoverBody,
  PopoverClose,
  PopoverContent,
  PopoverDescription,
  PopoverFooter,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from './popover';

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

describe('Popover (Pure Primitive)', () => {
  it('opens and closes via trigger click in uncontrolled mode', () => {
    render(
      <Popover>
        <PopoverTrigger>Open Popover</PopoverTrigger>
        <PopoverContent data-testid="popover-surface">
          <p>Popover Content</p>
        </PopoverContent>
      </Popover>,
    );

    const trigger = screen.getByRole('button', { name: 'Open Popover' });
    const surface = screen.getByTestId('popover-surface');

    // Initially closed
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
    expect(surface.getAttribute('data-state')).toBe('closed');

    // Click trigger to open
    fireEvent.click(trigger);
    expect(trigger.getAttribute('aria-expanded')).toBe('true');
    expect(surface.getAttribute('data-state')).toBe('open');

    // Click trigger again to close
    fireEvent.click(trigger);
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
    expect(surface.getAttribute('data-state')).toBe('closed');
  });

  it('opens via Enter and Space keyboard events on trigger', () => {
    render(
      <Popover>
        <PopoverTrigger>Keyboard Trigger</PopoverTrigger>
        <PopoverContent data-testid="popover-surface">
          <p>Content</p>
        </PopoverContent>
      </Popover>,
    );

    const trigger = screen.getByRole('button', { name: 'Keyboard Trigger' });
    const surface = screen.getByTestId('popover-surface');

    // Open via Enter
    fireEvent.keyDown(trigger, { key: 'Enter' });
    expect(surface.getAttribute('data-state')).toBe('open');

    // Close via Space
    fireEvent.keyDown(trigger, { key: ' ' });
    expect(surface.getAttribute('data-state')).toBe('closed');
  });

  it('synchronizes with controlled open prop and calls onOpenChange', () => {
    const handleOpenChange = vi.fn();
    const { rerender } = render(
      <Popover open={false} onOpenChange={handleOpenChange}>
        <PopoverTrigger>Controlled Trigger</PopoverTrigger>
        <PopoverContent data-testid="popover-surface">
          <p>Controlled Content</p>
        </PopoverContent>
      </Popover>,
    );

    const trigger = screen.getByRole('button', { name: 'Controlled Trigger' });
    const surface = screen.getByTestId('popover-surface');

    expect(surface.getAttribute('data-state')).toBe('closed');

    // Trigger click requests open
    fireEvent.click(trigger);
    expect(handleOpenChange).toHaveBeenCalledWith(true);

    // Parent updates open to true
    rerender(
      <Popover open={true} onOpenChange={handleOpenChange}>
        <PopoverTrigger>Controlled Trigger</PopoverTrigger>
        <PopoverContent data-testid="popover-surface">
          <p>Controlled Content</p>
        </PopoverContent>
      </Popover>,
    );

    expect(surface.getAttribute('data-state')).toBe('open');
  });

  it('reconciles controlled state when parent rejects dismissal request', async () => {
    const handleOpenChange = vi.fn(); // Doesn't set open to false

    const { container } = render(
      <Popover open={true} onOpenChange={handleOpenChange}>
        <PopoverTrigger data-testid="trigger">Open</PopoverTrigger>
        <PopoverContent data-testid="surface">
          <p>Content</p>
        </PopoverContent>
      </Popover>,
    );

    const popoverDiv = container.querySelector('[popover]') as HTMLElement;
    expect(popoverDiv).toBeTruthy();

    // Simulate browser native close (e.g. native light dismiss)
    const toggleEvent = new Event('toggle') as unknown as { newState: string };
    toggleEvent.newState = 'closed';
    popoverDiv.dispatchEvent(toggleEvent as unknown as Event);

    // onOpenChange requested false
    expect(handleOpenChange).toHaveBeenCalledWith(false);

    // After microtask, since parent still passed open={true}, component reconciles
    await new Promise<void>((resolve) => queueMicrotask(() => resolve()));
    const surface = screen.getByTestId('surface');
    expect(surface.getAttribute('data-state')).toBe('open');
  });

  it('coordinates competing controlled popovers: opening B closes A without infinite thrashing', async () => {
    function CompetingControlledPopovers() {
      const [openA, setOpenA] = useState(true);
      const [openB, setOpenB] = useState(false);

      return (
        <div>
          <Popover open={openA} onOpenChange={setOpenA}>
            <PopoverTrigger data-testid="trigger-a">Trigger A</PopoverTrigger>
            <PopoverContent data-testid="surface-a">
              <p>Content A</p>
            </PopoverContent>
          </Popover>

          <Popover open={openB} onOpenChange={setOpenB}>
            <PopoverTrigger data-testid="trigger-b">Trigger B</PopoverTrigger>
            <PopoverContent data-testid="surface-b">
              <p>Content B</p>
            </PopoverContent>
          </Popover>
        </div>
      );
    }

    render(<CompetingControlledPopovers />);

    const surfaceA = screen.getByTestId('surface-a');
    const surfaceB = screen.getByTestId('surface-b');
    const triggerB = screen.getByTestId('trigger-b');

    expect(surfaceA.getAttribute('data-state')).toBe('open');
    expect(surfaceB.getAttribute('data-state')).toBe('closed');

    // Click trigger B to open B
    fireEvent.click(triggerB);

    // B opens
    expect(surfaceB.getAttribute('data-state')).toBe('open');
  });

  it('restores focus to trigger on Escape key dismissal', () => {
    render(
      <div>
        <Popover defaultOpen={true}>
          <PopoverTrigger data-testid="trigger">Open</PopoverTrigger>
          <PopoverContent data-testid="surface">
            <button data-testid="inside-btn">Inside</button>
          </PopoverContent>
        </Popover>
      </div>,
    );

    const trigger = screen.getByTestId('trigger');
    const insideBtn = screen.getByTestId('inside-btn');

    insideBtn.focus();
    expect(document.activeElement).toBe(insideBtn);

    // Press Escape
    fireEvent.keyDown(document, { key: 'Escape' });

    // Focus restored to trigger
    expect(document.activeElement).toBe(trigger);
  });

  it('does NOT steal focus on outside click and allows clicked control to perform action', () => {
    const handleExternalClick = vi.fn();

    render(
      <div>
        <Popover defaultOpen={true}>
          <PopoverTrigger data-testid="trigger">Trigger</PopoverTrigger>
          <PopoverContent data-testid="surface">
            <p>Body</p>
          </PopoverContent>
        </Popover>
        <button data-testid="external-btn" onClick={handleExternalClick}>
          External Button
        </button>
      </div>,
    );

    const surface = screen.getByTestId('surface');
    const externalBtn = screen.getByTestId('external-btn');

    expect(surface.getAttribute('data-state')).toBe('open');

    // Click external element
    fireEvent.pointerDown(externalBtn);
    fireEvent.click(externalBtn);

    // Popover closed
    expect(surface.getAttribute('data-state')).toBe('closed');

    // External action executed
    expect(handleExternalClick).toHaveBeenCalledTimes(1);

    // Focus was NOT hijacked to trigger
    const trigger = screen.getByTestId('trigger');
    expect(document.activeElement).not.toBe(trigger);
  });

  it('applies aria-haspopup="dialog" only when role="dialog", omitting it for generic disclosures', () => {
    const { rerender } = render(
      <Popover>
        <PopoverTrigger data-testid="trigger">Trigger</PopoverTrigger>
        <PopoverContent role="dialog" aria-label="Settings Dialog" data-testid="surface">
          <p>Dialog Content</p>
        </PopoverContent>
      </Popover>,
    );

    const trigger = screen.getByTestId('trigger');
    const surface = screen.getByTestId('surface');

    // Dialog popover has dialog semantics
    expect(trigger.getAttribute('aria-haspopup')).toBe('dialog');
    expect(surface.getAttribute('role')).toBe('dialog');
    expect(surface.getAttribute('aria-modal')).toBe('false');

    // Generic disclosure without forced dialog semantics
    rerender(
      <Popover>
        <PopoverTrigger data-testid="trigger">Trigger</PopoverTrigger>
        <PopoverContent data-testid="surface">
          <p>Generic Content</p>
        </PopoverContent>
      </Popover>,
    );

    expect(trigger.getAttribute('aria-haspopup')).toBeNull();
    expect(surface.getAttribute('role')).toBeNull();
  });

  it('enforces accessible name on role="dialog" and throws when missing', () => {
    // Suppress console.error during throw test
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => {
      render(
        <Popover defaultOpen={true}>
          <PopoverTrigger>Open</PopoverTrigger>
          {/* @ts-expect-error role="dialog" without aria-label or aria-labelledby should fail compile */}
          <PopoverContent role="dialog">
            <p>Invalid dialog</p>
          </PopoverContent>
        </Popover>,
      );
    }).toThrowError(/When role="dialog" is specified, a non-empty accessible name is required/);

    consoleSpy.mockRestore();
  });

  it('enforces accessible name on icon-only PopoverClose and throws when missing', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => {
      render(
        <Popover defaultOpen={true}>
          <PopoverTrigger>Open</PopoverTrigger>
          <PopoverContent>
            <PopoverClose />
          </PopoverContent>
        </Popover>,
      );
    }).toThrowError(/Icon-only close button requires a valid caller-supplied accessible name/);

    consoleSpy.mockRestore();
  });

  it('composes forwardedRef, childRef, and internal refs with asChild on PopoverTrigger and PopoverClose', () => {
    const triggerForwardedRef = createRef<HTMLElement>();
    const triggerChildRef = createRef<HTMLButtonElement>();
    const closeForwardedRef = createRef<HTMLButtonElement>();
    const closeChildRef = createRef<HTMLButtonElement>();

    render(
      <Popover defaultOpen={true}>
        <PopoverTrigger asChild ref={triggerForwardedRef} data-custom-prop="custom-trigger">
          <button ref={triggerChildRef} data-testid="as-child-trigger">
            Custom Trigger
          </button>
        </PopoverTrigger>
        <PopoverContent data-testid="surface">
          <PopoverClose asChild ref={closeForwardedRef} data-custom-prop="custom-close">
            <button ref={closeChildRef} data-testid="as-child-close">
              Close Custom
            </button>
          </PopoverClose>
        </PopoverContent>
      </Popover>,
    );

    const triggerEl = screen.getByTestId('as-child-trigger');
    const closeEl = screen.getByTestId('as-child-close');

    // Both trigger refs received the DOM element
    expect(triggerForwardedRef.current).toBe(triggerEl);
    expect(triggerChildRef.current).toBe(triggerEl);
    expect(triggerEl.getAttribute('data-custom-prop')).toBe('custom-trigger');

    // Both close refs received the DOM element
    expect(closeForwardedRef.current).toBe(closeEl);
    expect(closeChildRef.current).toBe(closeEl);
    expect(closeEl.getAttribute('data-custom-prop')).toBe('custom-close');
  });

  it('computes true lateral inline placements in LTR and RTL correctly', () => {
    function PlacementTest({
      dir,
      placement,
    }: {
      dir: 'ltr' | 'rtl';
      placement: 'inline-start' | 'inline-end';
    }) {
      return (
        <div style={{ direction: dir }}>
          <Popover open={true} placement={placement} autoFlip={false}>
            <PopoverTrigger data-testid="trigger">Trigger</PopoverTrigger>
            <PopoverContent data-testid="surface">
              <p>Placed Content</p>
            </PopoverContent>
          </Popover>
        </div>
      );
    }

    // 1. In LTR, inline-start positions to the left (physical left)
    const { rerender } = render(<PlacementTest dir="ltr" placement="inline-start" />);
    let trigger = screen.getByTestId('trigger');
    let surface = screen.getByTestId('surface');

    // Mock bounding rects
    vi.spyOn(trigger, 'getBoundingClientRect').mockReturnValue({
      left: 300,
      right: 400,
      top: 100,
      bottom: 140,
      width: 100,
      height: 40,
      x: 300,
      y: 100,
      toJSON: () => {},
    });
    vi.spyOn(surface, 'getBoundingClientRect').mockReturnValue({
      left: 0,
      right: 150,
      top: 0,
      bottom: 80,
      width: 150,
      height: 80,
      x: 0,
      y: 0,
      toJSON: () => {},
    });

    // Fire window resize to recompute position
    fireEvent(window, new Event('resize'));

    // In LTR, inline-start is left: 300 - 150 - 8 = 142px
    expect(surface.style.left).toBe('142px');

    // 2. In LTR, inline-end positions to the right (physical right): 400 + 8 = 408px
    rerender(<PlacementTest dir="ltr" placement="inline-end" />);
    trigger = screen.getByTestId('trigger');
    surface = screen.getByTestId('surface');
    vi.spyOn(trigger, 'getBoundingClientRect').mockReturnValue({
      left: 300,
      right: 400,
      top: 100,
      bottom: 140,
      width: 100,
      height: 40,
      x: 300,
      y: 100,
      toJSON: () => {},
    });
    vi.spyOn(surface, 'getBoundingClientRect').mockReturnValue({
      left: 0,
      right: 150,
      top: 0,
      bottom: 80,
      width: 150,
      height: 80,
      x: 0,
      y: 0,
      toJSON: () => {},
    });
    fireEvent(window, new Event('resize'));
    expect(surface.style.left).toBe('408px');
  });

  it('moves initial focus into dialog or initialFocusRef when opened', () => {
    function InitialFocusTest() {
      const inputRef = useRef<HTMLInputElement>(null);
      return (
        <Popover defaultOpen={true}>
          <PopoverTrigger>Open</PopoverTrigger>
          <PopoverContent role="dialog" aria-label="Form" initialFocusRef={inputRef}>
            <button>First Button</button>
            <input data-testid="target-input" ref={inputRef} />
          </PopoverContent>
        </Popover>
      );
    }

    render(<InitialFocusTest />);

    const targetInput = screen.getByTestId('target-input');
    expect(document.activeElement).toBe(targetInput);
  });

  it('closes popover via PopoverClose button and restores focus to trigger', () => {
    render(
      <Popover defaultOpen={true}>
        <PopoverTrigger data-testid="trigger">Open</PopoverTrigger>
        <PopoverContent data-testid="surface">
          <PopoverClose closeLabel="Dismiss popover" data-testid="close-btn" />
        </PopoverContent>
      </Popover>,
    );

    const closeBtn = screen.getByTestId('close-btn');
    const surface = screen.getByTestId('surface');
    const trigger = screen.getByTestId('trigger');

    fireEvent.click(closeBtn);

    expect(surface.getAttribute('data-state')).toBe('closed');
    expect(document.activeElement).toBe(trigger);
  });

  it('moves initial focus into dialog, skipping disabled controls to first enabled interactive element', () => {
    render(
      <Popover defaultOpen={true}>
        <PopoverTrigger data-testid="trigger">Open</PopoverTrigger>
        <PopoverContent role="dialog" aria-label="Action Dialog" data-testid="surface">
          <button disabled data-testid="disabled-btn">
            Disabled Action
          </button>
          <fieldset disabled>
            <button data-testid="fieldset-disabled-btn">Fieldset Disabled</button>
          </fieldset>
          <button data-testid="enabled-btn">First Enabled Action</button>
        </PopoverContent>
      </Popover>,
    );

    const enabledBtn = screen.getByTestId('enabled-btn');
    expect(document.activeElement).toBe(enabledBtn);
  });

  it('safely focuses surface container when role="dialog" has no focusable enabled controls', () => {
    render(
      <Popover defaultOpen={true}>
        <PopoverTrigger data-testid="trigger">Open</PopoverTrigger>
        <PopoverContent role="dialog" aria-label="Informational Dialog" data-testid="surface">
          <p>Read-only notification</p>
          <button disabled data-testid="disabled-only-btn">
            Unavailable
          </button>
        </PopoverContent>
      </Popover>,
    );

    const surface = screen.getByTestId('surface');
    expect(document.activeElement).toBe(surface);
    expect(surface.getAttribute('tabindex')).toBe('-1');
  });

  it('emits exactly one close notification on dismiss without duplicates', () => {
    const handleOpenChange = vi.fn();

    render(
      <div>
        <Popover open={true} onOpenChange={handleOpenChange}>
          <PopoverTrigger data-testid="trigger">Open</PopoverTrigger>
          <PopoverContent data-testid="surface">
            <p>Content</p>
          </PopoverContent>
        </Popover>
        <button data-testid="outside-btn">Outside Target</button>
      </div>,
    );

    const outsideBtn = screen.getByTestId('outside-btn');
    fireEvent.pointerDown(outsideBtn);

    expect(handleOpenChange).toHaveBeenCalledTimes(1);
    expect(handleOpenChange).toHaveBeenCalledWith(false);
  });

  it('moves initial focus into dialog, skipping elements with visibility: hidden to first visible interactive control', () => {
    render(
      <Popover defaultOpen={true}>
        <PopoverTrigger data-testid="trigger">Open</PopoverTrigger>
        <PopoverContent role="dialog" aria-label="Visibility Test Dialog" data-testid="surface">
          <button style={{ visibility: 'hidden' }} data-testid="hidden-first-btn">
            Hidden Button
          </button>
          <button data-testid="visible-second-btn">Visible Button</button>
        </PopoverContent>
      </Popover>,
    );

    const visibleBtn = screen.getByTestId('visible-second-btn');
    expect(document.activeElement).toBe(visibleBtn);
  });

  it('sends repeated close requests on repeated Escape presses when parent rejects dismissal', () => {
    const handleOpenChange = vi.fn();

    render(
      <Popover open={true} onOpenChange={handleOpenChange}>
        <PopoverTrigger data-testid="trigger">Open</PopoverTrigger>
        <PopoverContent data-testid="surface">
          <p>Persistent Content</p>
        </PopoverContent>
      </Popover>,
    );

    // First Escape attempt
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(handleOpenChange).toHaveBeenCalledTimes(1);

    // Second Escape attempt must not be lost
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(handleOpenChange).toHaveBeenCalledTimes(2);

    // Third Escape attempt
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(handleOpenChange).toHaveBeenCalledTimes(3);
  });

  it('allows yielded controlled popover to reopen when its trigger is clicked afterward', async () => {
    const handleOpenChangeA = vi.fn();
    const handleOpenChangeB = vi.fn();

    function CompetingControlledHarness() {
      // Parent A insists on open=true
      const [openA] = useState(true);
      const [openB, setOpenB] = useState(false);

      return (
        <div>
          <Popover open={openA} onOpenChange={handleOpenChangeA}>
            <PopoverTrigger data-testid="trigger-a">Trigger A</PopoverTrigger>
            <PopoverContent data-testid="surface-a">
              <p>Content A</p>
            </PopoverContent>
          </Popover>

          <Popover open={openB} onOpenChange={(val) => { setOpenB(val); handleOpenChangeB(val); }}>
            <PopoverTrigger data-testid="trigger-b">Trigger B</PopoverTrigger>
            <PopoverContent data-testid="surface-b">
              <p>Content B</p>
            </PopoverContent>
          </Popover>
        </div>
      );
    }

    render(<CompetingControlledHarness />);

    const triggerA = screen.getByTestId('trigger-a');
    const triggerB = screen.getByTestId('trigger-b');
    const surfaceA = screen.getByTestId('surface-a');

    expect(triggerA.getAttribute('aria-expanded')).toBe('true');
    expect(surfaceA.getAttribute('data-state')).toBe('open');

    // Open B
    fireEvent.click(triggerB);
    expect(handleOpenChangeB).toHaveBeenCalledWith(true);

    // Simulate browser engine light-dismissing A due to B's top-layer presence
    const contentA = surfaceA.parentElement!;
    const toggleEventClosed = new Event('toggle') as unknown as { newState: string };
    toggleEventClosed.newState = 'closed';
    act(() => {
      contentA.dispatchEvent(toggleEventClosed as unknown as Event);
    });

    // A yielded: A's trigger must report false, not true
    expect(triggerA.getAttribute('aria-expanded')).toBe('false');

    // Now click Trigger A to reopen A afterward
    act(() => {
      fireEvent.click(triggerA);
    });

    // Reopening A fires onOpenChange(true) and re-asserts expanded state
    expect(handleOpenChangeA).toHaveBeenCalledWith(true);
    expect(triggerA.getAttribute('aria-expanded')).toBe('true');
  });

  it('keeps popover closed when parent supplies open={false} and rejects open requests on trigger click', () => {
    const handleOpenChange = vi.fn();

    render(
      <Popover open={false} onOpenChange={handleOpenChange}>
        <PopoverTrigger data-testid="trigger">Trigger</PopoverTrigger>
        <PopoverContent data-testid="surface">
          <p>Content</p>
        </PopoverContent>
      </Popover>,
    );

    const trigger = screen.getByTestId('trigger');
    const surface = screen.getByTestId('surface');

    expect(trigger.getAttribute('aria-expanded')).toBe('false');
    expect(surface.getAttribute('data-state')).toBe('closed');

    // Click trigger to attempt open
    fireEvent.click(trigger);

    // onOpenChange fired with true
    expect(handleOpenChange).toHaveBeenCalledWith(true);

    // Because parent keeps open={false}, popover must remain closed
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
    expect(surface.getAttribute('data-state')).toBe('closed');
  });

  it('renders compound subcomponents with semantic classes and attributes', () => {
    render(
      <Popover defaultOpen={true}>
        <PopoverTrigger>Open</PopoverTrigger>
        <PopoverContent role="dialog" aria-labelledby="popover-title">
          <PopoverHeader data-testid="header">
            <PopoverTitle id="popover-title" as="h2">
              Filter Records
            </PopoverTitle>
            <PopoverDescription>Select filters below</PopoverDescription>
          </PopoverHeader>
          <PopoverBody data-testid="body">
            <p>Body Controls</p>
          </PopoverBody>
          <PopoverFooter data-testid="footer">
            <button type="button">Reset</button>
            <button type="submit">Apply</button>
          </PopoverFooter>
        </PopoverContent>
      </Popover>,
    );

    const title = screen.getByRole('heading', { level: 2, name: 'Filter Records' });
    expect(title).toBeTruthy();
    expect(screen.getByText('Select filters below')).toBeTruthy();
    expect(screen.getByTestId('header')).toBeTruthy();
    expect(screen.getByTestId('body')).toBeTruthy();
    expect(screen.getByTestId('footer')).toBeTruthy();
  });
});
