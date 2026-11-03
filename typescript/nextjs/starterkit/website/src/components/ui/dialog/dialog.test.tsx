import { fireEvent, render, screen } from '@testing-library/react';
import React, { useRef, useState } from 'react';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import {
  Dialog,
  DialogBody,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './dialog';

// Ensure jsdom provides showModal and close on HTMLDialogElement prototype
beforeAll(() => {
  HTMLDialogElement.prototype.showModal = function mockShowModal(this: HTMLDialogElement) {
    this.setAttribute('open', '');
    Object.defineProperty(this, 'open', {
      configurable: true,
      enumerable: true,
      get: () => true,
      set: (val: boolean) => {
        if (val) this.setAttribute('open', '');
        else this.removeAttribute('open');
      },
    });
  };

  HTMLDialogElement.prototype.close = function mockClose(this: HTMLDialogElement) {
    this.removeAttribute('open');
    Object.defineProperty(this, 'open', {
      configurable: true,
      enumerable: true,
      get: () => false,
      set: (val: boolean) => {
        if (val) this.setAttribute('open', '');
        else this.removeAttribute('open');
      },
    });
    this.dispatchEvent(new Event('close'));
  };
});

describe('Dialog (Pure Primitive)', () => {
  it('forwards ref to the native HTMLDialogElement', () => {
    const ref = React.createRef<HTMLDialogElement>();
    render(
      <Dialog open={false} onOpenChange={vi.fn()} ref={ref}>
        <p>Content</p>
      </Dialog>,
    );

    expect(ref.current).toBeInstanceOf(HTMLDialogElement);
  });

  it('synchronizes showModal() and close() with open prop', () => {
    const showModalSpy = vi.spyOn(HTMLDialogElement.prototype, 'showModal');
    const closeSpy = vi.spyOn(HTMLDialogElement.prototype, 'close');

    const { rerender } = render(
      <Dialog open={false} onOpenChange={vi.fn()}>
        <p>Modal content</p>
      </Dialog>,
    );

    expect(showModalSpy).not.toHaveBeenCalled();

    // Open dialog
    rerender(
      <Dialog open={true} onOpenChange={vi.fn()}>
        <p>Modal content</p>
      </Dialog>,
    );

    expect(showModalSpy).toHaveBeenCalledTimes(1);

    // Close dialog
    rerender(
      <Dialog open={false} onOpenChange={vi.fn()}>
        <p>Modal content</p>
      </Dialog>,
    );

    expect(closeSpy).toHaveBeenCalledTimes(1);

    showModalSpy.mockRestore();
    closeSpy.mockRestore();
  });

  it('captures active element before opening and restores focus on close', () => {
    function TestComponent() {
      const [isOpen, setIsOpen] = useState(false);
      return (
        <div>
          <button data-testid="trigger-btn" onClick={() => setIsOpen(true)}>
            Open
          </button>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <p>Body</p>
            <button data-testid="dialog-btn" onClick={() => setIsOpen(false)}>
              Close
            </button>
          </Dialog>
        </div>
      );
    }

    render(<TestComponent />);

    const trigger = screen.getByTestId('trigger-btn');
    trigger.focus();
    expect(document.activeElement).toBe(trigger);

    // Click trigger to open
    fireEvent.click(trigger);
    expect(screen.getByRole('dialog')).toBeTruthy();

    // Click inside button to close
    const dialogBtn = screen.getByTestId('dialog-btn');
    fireEvent.click(dialogBtn);

    // Focus restored to trigger
    expect(document.activeElement).toBe(trigger);
  });

  it('moves initial focus to initialFocusRef if provided', () => {
    function TestInitialFocus() {
      const inputRef = useRef<HTMLInputElement>(null);
      return (
        <Dialog open={true} onOpenChange={vi.fn()} initialFocusRef={inputRef}>
          <input data-testid="first-input" />
          <input data-testid="target-input" ref={inputRef} />
        </Dialog>
      );
    }

    render(<TestInitialFocus />);

    const targetInput = screen.getByTestId('target-input');
    expect(document.activeElement).toBe(targetInput);
  });

  it('intercepts cancel event on Escape and fires onOpenChange with reason escape', () => {
    const handleOpenChange = vi.fn();
    render(
      <Dialog open={true} onOpenChange={handleOpenChange}>
        <p>Modal content</p>
      </Dialog>,
    );

    const dialog = screen.getByRole('dialog');
    const cancelEvent = new Event('cancel', { cancelable: true });
    dialog.dispatchEvent(cancelEvent);

    expect(handleOpenChange).toHaveBeenCalledWith(false, { reason: 'escape' });
    expect(cancelEvent.defaultPrevented).toBe(true);
  });

  it('prevents Escape dismissal when preventEscapeClose is true', () => {
    const handleOpenChange = vi.fn();
    render(
      <Dialog open={true} onOpenChange={handleOpenChange} preventEscapeClose={true}>
        <p>Saving in progress</p>
      </Dialog>,
    );

    const dialog = screen.getByRole('dialog');
    const cancelEvent = new Event('cancel', { cancelable: true });
    dialog.dispatchEvent(cancelEvent);

    expect(handleOpenChange).not.toHaveBeenCalled();
    expect(cancelEvent.defaultPrevented).toBe(true);
  });

  it('reconciles native close event with reason native-close when open is true', () => {
    const handleOpenChange = vi.fn();
    render(
      <Dialog open={true} onOpenChange={handleOpenChange}>
        <p>Modal content</p>
      </Dialog>,
    );

    const dialog = screen.getByRole('dialog');
    fireEvent(dialog, new Event('close'));

    expect(handleOpenChange).toHaveBeenCalledWith(false, { reason: 'native-close' });
  });

  it('handles optional top-corner close button with closeLabel', () => {
    const handleOpenChange = vi.fn();
    render(
      <Dialog
        open={true}
        onOpenChange={handleOpenChange}
        showCloseButton={true}
        closeLabel="Dismiss modal"
      >
        <p>Modal content</p>
      </Dialog>,
    );

    const closeBtn = screen.getByRole('button', { name: 'Dismiss modal' });
    expect(closeBtn).toBeTruthy();

    fireEvent.click(closeBtn);
    expect(handleOpenChange).toHaveBeenCalledWith(false, { reason: 'close-button' });
  });

  it('handles backdrop dismissal when closeOnBackdropClick is enabled', () => {
    const handleOpenChange = vi.fn();
    render(
      <Dialog open={true} onOpenChange={handleOpenChange} closeOnBackdropClick={true}>
        <p>Content</p>
      </Dialog>,
    );

    const dialog = screen.getByRole('dialog');
    // Mock getBoundingClientRect so click at (10, 10) is outside the dialog box at (100, 100, 200, 200)
    vi.spyOn(dialog, 'getBoundingClientRect').mockReturnValue({
      top: 100,
      left: 100,
      right: 300,
      bottom: 300,
      width: 200,
      height: 200,
      x: 100,
      y: 100,
      toJSON: () => {},
    });

    // Click outside dialog coordinates on the backdrop
    fireEvent.click(dialog, { clientX: 10, clientY: 10 });
    expect(handleOpenChange).toHaveBeenCalledWith(false, { reason: 'backdrop' });

    // Click inside dialog coordinates does not trigger dismissal
    handleOpenChange.mockClear();
    fireEvent.click(dialog, { clientX: 150, clientY: 150 });
    expect(handleOpenChange).not.toHaveBeenCalled();
  });

  it('does not dismiss on backdrop click by default when closeOnBackdropClick is omitted', () => {
    const handleOpenChange = vi.fn();
    render(
      <Dialog open={true} onOpenChange={handleOpenChange}>
        <p>Content</p>
      </Dialog>,
    );

    const dialog = screen.getByRole('dialog');
    vi.spyOn(dialog, 'getBoundingClientRect').mockReturnValue({
      top: 100,
      left: 100,
      right: 300,
      bottom: 300,
      width: 200,
      height: 200,
      x: 100,
      y: 100,
      toJSON: () => {},
    });

    fireEvent.click(dialog, { clientX: 10, clientY: 10 });
    expect(handleOpenChange).not.toHaveBeenCalled();
  });

  it('renders compound subcomponents with semantic tags and custom attributes', () => {
    render(
      <Dialog
        open={true}
        onOpenChange={vi.fn()}
        size="lg"
        aria-labelledby="dialog-title"
        aria-describedby="dialog-desc"
      >
        <DialogHeader data-testid="header">
          <DialogTitle id="dialog-title" as="h1">
            Edit Profile
          </DialogTitle>
          <DialogDescription id="dialog-desc">Make changes to your account.</DialogDescription>
        </DialogHeader>
        <DialogBody data-testid="body">
          <p>Form inputs here</p>
        </DialogBody>
        <DialogFooter data-testid="footer">
          <button type="button">Cancel</button>
          <button type="submit">Save</button>
        </DialogFooter>
      </Dialog>,
    );

    const dialog = screen.getByRole('dialog');
    expect(dialog.getAttribute('data-size')).toBe('lg');
    expect(dialog.getAttribute('aria-labelledby')).toBe('dialog-title');
    expect(dialog.getAttribute('aria-describedby')).toBe('dialog-desc');

    const heading = screen.getByRole('heading', { level: 1, name: 'Edit Profile' });
    expect(heading).toBeTruthy();

    expect(screen.getByText('Make changes to your account.')).toBeTruthy();
    expect(screen.getByTestId('header')).toBeTruthy();
    expect(screen.getByTestId('body')).toBeTruthy();
    expect(screen.getByTestId('footer')).toBeTruthy();
  });
});
