import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React, { createRef, useRef, useState } from 'react';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogBody,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
  AlertDialogTrigger,
} from './index';

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

describe('AlertDialog Primitive', () => {
  it('renders compound structure with role="alertdialog" and aria-modal="true"', () => {
    render(
      <AlertDialog defaultOpen={true}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Repository</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to permanently delete this repository?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction variant="danger">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>,
    );

    const dialog = screen.getByRole('alertdialog');
    expect(dialog).toBeDefined();
    expect(dialog.getAttribute('aria-modal')).toBe('true');
  });

  it('links aria-labelledby and aria-describedby dynamically and omits dangling attributes', () => {
    const { rerender } = render(
      <AlertDialog defaultOpen={true}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Permanent Account Closure</AlertDialogTitle>
            <AlertDialogDescription>
              All active subscriptions and data will be erased immediately.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep Account</AlertDialogCancel>
            <AlertDialogAction>Close Account</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>,
    );

    let dialog = screen.getByRole('alertdialog');
    const title = screen.getByText('Permanent Account Closure');
    const desc = screen.getByText('All active subscriptions and data will be erased immediately.');

    expect(title.id).toBeTruthy();
    expect(desc.id).toBeTruthy();
    expect(dialog.getAttribute('aria-labelledby')).toBe(title.id);
    expect(dialog.getAttribute('aria-describedby')).toBe(desc.id);

    rerender(
      <AlertDialog defaultOpen={true}>
        <AlertDialogContent aria-label="Explicit Label">
          <AlertDialogHeader>
            <AlertDialogTitle id="custom-title-id">Custom ID Title</AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>,
    );

    dialog = screen.getByRole('alertdialog', { name: 'Explicit Label' });
    expect(dialog.getAttribute('aria-labelledby')).toBeNull();
    expect(dialog.getAttribute('aria-describedby')).toBeNull();
  });

  it('opens via AlertDialogTrigger, moves initial focus to AlertDialogCancel, and restores focus on close', async () => {
    const user = userEvent.setup();

    render(
      <AlertDialog>
        <AlertDialogTrigger>Open Confirmation</AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Action</AlertDialogTitle>
            <AlertDialogDescription>Please confirm.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction>Confirm</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>,
    );

    const trigger = screen.getByRole('button', { name: 'Open Confirmation' });
    expect(trigger.getAttribute('type')).toBe('button');
    expect(trigger.getAttribute('aria-haspopup')).toBe('dialog');
    expect(trigger.getAttribute('aria-expanded')).toBe('false');

    await user.click(trigger);
    expect(trigger.getAttribute('aria-expanded')).toBe('true');

    const dialog = screen.getByRole('alertdialog');
    expect(dialog.hasAttribute('open')).toBe(true);

    const cancelBtn = screen.getByRole('button', { name: 'Cancel' });
    await waitFor(() => {
      expect(document.activeElement).toBe(cancelBtn);
    });

    await user.click(cancelBtn);
    expect(screen.queryByRole('alertdialog')).toBeNull();
    expect(document.activeElement).toBe(trigger);
  });

  it('supports initialFocusRef and returnFocusRef overrides', async () => {
    const user = userEvent.setup();

    function CustomFocusDialog() {
      const [open, setOpen] = useState(false);
      const inputRef = useRef<HTMLInputElement>(null);
      const returnRef = useRef<HTMLButtonElement>(null);

      return (
        <div>
          <button type="button" onClick={() => setOpen(true)}>
            Launch Modal
          </button>
          <button type="button" ref={returnRef}>
            Return Target
          </button>
          <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogContent initialFocusRef={inputRef} returnFocusRef={returnRef}>
              <AlertDialogHeader>
                <AlertDialogTitle>Confirm Workspace Removal</AlertDialogTitle>
              </AlertDialogHeader>
              <AlertDialogBody>
                <input ref={inputRef} aria-label="Confirmation token" />
              </AlertDialogBody>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction>Confirm</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      );
    }

    render(<CustomFocusDialog />);

    await user.click(screen.getByRole('button', { name: 'Launch Modal' }));
    const tokenInput = screen.getByRole('textbox', { name: 'Confirmation token' });
    await waitFor(() => {
      expect(document.activeElement).toBe(tokenInput);
    });

    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Return Target' }));
  });

  it('traps Tab and Shift+Tab keyboard navigation inside modal controls', async () => {
    const user = userEvent.setup();

    render(
      <AlertDialog defaultOpen={true}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Trap Verification</AlertDialogTitle>
            <AlertDialogDescription>Verify focus stays inside dialog.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction>Confirm</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>,
    );

    const cancelBtn = screen.getByRole('button', { name: 'Cancel' });
    const confirmBtn = screen.getByRole('button', { name: 'Confirm' });

    await waitFor(() => {
      expect(document.activeElement).toBe(cancelBtn);
    });

    await user.tab();
    expect(document.activeElement).toBe(confirmBtn);

    await user.tab();
    expect(document.activeElement).toBe(cancelBtn);

    await user.tab({ shift: true });
    expect(document.activeElement).toBe(confirmBtn);
  });

  it('ignores backdrop clicks so destructive confirmation cannot be dismissed accidentally', async () => {
    const user = userEvent.setup();
    const handleOpenChange = vi.fn();

    render(
      <AlertDialog defaultOpen={true} onOpenChange={handleOpenChange}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Critical Gate</AlertDialogTitle>
            <AlertDialogDescription>Backdrop click must stay open.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction>Confirm</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>,
    );

    const dialog = screen.getByRole('alertdialog');
    await user.click(dialog);

    expect(handleOpenChange).not.toHaveBeenCalled();
    expect(dialog.hasAttribute('open')).toBe(true);
  });

  it('supports controlled open state and action/escape reasons with preventEscapeClose', async () => {
    const user = userEvent.setup();
    const handleOpenChange = vi.fn();

    function ControlledTest() {
      const [isOpen, setIsOpen] = useState(false);
      const [locked, setLocked] = useState(true);
      return (
        <>
          <button type="button" onClick={() => setIsOpen(true)}>
            External Trigger
          </button>
          <button type="button" onClick={() => setLocked(false)}>
            Unlock
          </button>
          <AlertDialog
            open={isOpen}
            onOpenChange={(next, details) => {
              setIsOpen(next);
              handleOpenChange(next, details);
            }}
          >
            <AlertDialogContent preventEscapeClose={locked}>
              <AlertDialogHeader>
                <AlertDialogTitle>Controlled Modal</AlertDialogTitle>
                <AlertDialogDescription>Explanation</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction>Proceed</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </>
      );
    }

    render(<ControlledTest />);
    expect(screen.queryByRole('alertdialog')).toBeNull();

    await user.click(screen.getByRole('button', { name: 'External Trigger' }));
    const dialog = screen.getByRole('alertdialog');

    // Escape prevented when preventEscapeClose=true
    const lockedCancel = new Event('cancel', { cancelable: true });
    act(() => {
      dialog.dispatchEvent(lockedCancel);
    });
    expect(lockedCancel.defaultPrevented).toBe(true);
    expect(handleOpenChange).not.toHaveBeenCalled();

    // Proceed closes with reason='action'
    await user.click(screen.getByRole('button', { name: 'Proceed' }));
    expect(handleOpenChange).toHaveBeenCalledWith(false, { reason: 'action' });
    expect(screen.queryByRole('alertdialog')).toBeNull();
  });

  it('handles Escape key cancellation with reason="escape" when unlocked', () => {
    const handleOpenChange = vi.fn();

    render(
      <AlertDialog defaultOpen={true} onOpenChange={handleOpenChange}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Escape Test</AlertDialogTitle>
            <AlertDialogDescription>Press escape to dismiss.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction>Confirm</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>,
    );

    const dialog = screen.getByRole('alertdialog');
    const cancelEvent = new Event('cancel', { cancelable: true });
    act(() => {
      dialog.dispatchEvent(cancelEvent);
    });

    expect(handleOpenChange).toHaveBeenCalledWith(false, { reason: 'escape' });
    expect(cancelEvent.defaultPrevented).toBe(true);
  });

  it('suppresses clicks on disabled buttons and adds rel="noopener noreferrer" to _blank anchors', async () => {
    const user = userEvent.setup();
    const handleOpenChange = vi.fn();
    const handleAction = vi.fn();

    render(
      <AlertDialog defaultOpen={true} onOpenChange={handleOpenChange}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Disabled Action</AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel size="lg" touchTarget="comfortable">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction disabled onClick={handleAction}>
              Disabled Confirm
            </AlertDialogAction>
            <AlertDialogAction as="a" href="https://example.com" target="_blank">
              External Policy
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>,
    );

    const cancelBtn = screen.getByRole('button', { name: 'Cancel' });
    expect(cancelBtn.getAttribute('data-size')).toBe('lg');
    expect(cancelBtn.getAttribute('data-touch-target')).toBe('comfortable');

    const disabledAction = screen.getByRole('button', { name: 'Disabled Confirm' });
    await user.click(disabledAction);
    expect(handleAction).not.toHaveBeenCalled();
    expect(handleOpenChange).not.toHaveBeenCalled();

    const externalLink = screen.getByRole('link', { name: 'External Policy' });
    expect(externalLink.getAttribute('rel')).toBe('noopener noreferrer');
  });

  it('throws clear errors when required AlertDialogTrigger or AlertDialogContent are outside AlertDialog', () => {
    expect(() => render(<AlertDialogTrigger>Open</AlertDialogTrigger>)).toThrow(
      '<AlertDialogTrigger> must be used within an <AlertDialog> container.',
    );
    expect(() =>
      render(
        <AlertDialogContent>
          <div>Body</div>
        </AlertDialogContent>,
      ),
    ).toThrow('<AlertDialogContent> must be used within an <AlertDialog> container.');
  });

  it('applies data-size attribute and renders AlertDialogMedia with aria-hidden="true"', () => {
    const ref = createRef<HTMLDialogElement>();

    render(
      <AlertDialog defaultOpen={true}>
        <AlertDialogContent ref={ref} size="sm">
          <AlertDialogHeader align="center" separator={true} data-testid="alert-dialog-header">
            <AlertDialogMedia variant="warning" data-testid="alert-dialog-media">
              <span>Icon</span>
            </AlertDialogMedia>
            <AlertDialogTitle>Destructive Action</AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogBody data-testid="alert-dialog-body">
            Detailed explanation of consequences.
          </AlertDialogBody>
          <AlertDialogFooter
            layout="split"
            background="docked"
            separator={true}
            data-testid="alert-dialog-footer"
          >
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction variant="danger">Confirm</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>,
    );

    expect(ref.current).toBeInstanceOf(HTMLDialogElement);
    expect(ref.current?.getAttribute('data-size')).toBe('sm');

    const header = screen.getByTestId('alert-dialog-header');
    expect(header.getAttribute('data-align')).toBe('center');

    const media = screen.getByTestId('alert-dialog-media');
    expect(media.getAttribute('aria-hidden')).toBe('true');
    expect(media.getAttribute('data-variant')).toBe('warning');

    expect(screen.getByTestId('alert-dialog-body').textContent).toContain(
      'Detailed explanation of consequences.',
    );
    const footer = screen.getByTestId('alert-dialog-footer');
    expect(footer).toBeDefined();
    expect(footer.getAttribute('data-layout')).toBe('split');
    expect(footer.getAttribute('data-background')).toBe('docked');
    expect(footer.getAttribute('data-separator')).toBe('true');
  });

  it('defaults footer separator dynamically from background treatment and allows explicit override', () => {
    const { rerender } = render(
      <AlertDialog defaultOpen={true}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Action</AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogFooter data-testid="footer-target">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction>Confirm</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>,
    );

    const footer = screen.getByTestId('footer-target');
    expect(footer.getAttribute('data-background')).toBe('seamless');
    expect(footer.getAttribute('data-separator')).toBe('false');

    rerender(
      <AlertDialog defaultOpen={true}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Action</AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogFooter background="docked" data-testid="footer-target">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction>Confirm</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>,
    );

    expect(footer.getAttribute('data-background')).toBe('docked');
    expect(footer.getAttribute('data-separator')).toBe('true');

    rerender(
      <AlertDialog defaultOpen={true}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Action</AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogFooter background="seamless" separator={true} data-testid="footer-target">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction>Confirm</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>,
    );

    expect(footer.getAttribute('data-separator')).toBe('true');
  });

  it('locks background body scroll while open and releases it on unmount', () => {
    document.body.style.overflow = '';

    const { unmount } = render(
      <AlertDialog defaultOpen={true}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Repository</AlertDialogTitle>
          </AlertDialogHeader>
        </AlertDialogContent>
      </AlertDialog>,
    );

    expect(document.body.style.overflow).toBe('hidden');

    unmount();

    expect(document.body.style.overflow).toBe('');
  });
});
