import { fireEvent, render, screen } from '@testing-library/react';
import React, { useRef, useState } from 'react';
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
      this.dispatchEvent(new Event('toggle'));
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

  it('does NOT steal focus on outside click, allowing external elements to receive focus naturally', () => {
    render(
      <div>
        <Popover defaultOpen={true}>
          <PopoverTrigger data-testid="trigger">Trigger</PopoverTrigger>
          <PopoverContent data-testid="surface">
            <p>Body</p>
          </PopoverContent>
        </Popover>
        <button data-testid="external-btn">External Button</button>
      </div>,
    );

    const surface = screen.getByTestId('surface');
    const externalBtn = screen.getByTestId('external-btn');

    expect(surface.getAttribute('data-state')).toBe('open');

    // Click external element
    fireEvent.pointerDown(externalBtn);

    // Popover closed
    expect(surface.getAttribute('data-state')).toBe('closed');

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

  it('coordinates competing popovers without infinite loop', () => {
    function CompetingPopovers() {
      const [popA, setPopA] = useState(false);
      const [popB, setPopB] = useState(false);

      return (
        <div>
          <Popover open={popA} onOpenChange={setPopA}>
            <PopoverTrigger data-testid="trigger-a">Popover A</PopoverTrigger>
            <PopoverContent data-testid="surface-a">
              <p>Content A</p>
            </PopoverContent>
          </Popover>

          <Popover open={popB} onOpenChange={setPopB}>
            <PopoverTrigger data-testid="trigger-b">Popover B</PopoverTrigger>
            <PopoverContent data-testid="surface-b">
              <p>Content B</p>
            </PopoverContent>
          </Popover>
        </div>
      );
    }

    render(<CompetingPopovers />);

    const triggerA = screen.getByTestId('trigger-a');
    const triggerB = screen.getByTestId('trigger-b');
    const surfaceA = screen.getByTestId('surface-a');
    const surfaceB = screen.getByTestId('surface-b');

    // Open A
    fireEvent.click(triggerA);
    expect(surfaceA.getAttribute('data-state')).toBe('open');

    // Open B
    fireEvent.click(triggerB);
    expect(surfaceB.getAttribute('data-state')).toBe('open');
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
