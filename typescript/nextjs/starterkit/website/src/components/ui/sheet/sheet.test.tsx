import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef, useRef, useState } from 'react';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import { Sheet, SheetBody, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from './sheet';

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

describe('Sheet Primitive', () => {
  it('renders open sheet with compound compartments, accessible labels, and close button action', async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();

    render(
      <Sheet
        open={true}
        onOpenChange={onOpenChange}
        showCloseButton={true}
        closeLabel="Close panel"
      >
        <SheetHeader>
          <SheetTitle>Navigation Menu</SheetTitle>
          <SheetDescription>Explore site sections</SheetDescription>
        </SheetHeader>
        <SheetBody>
          <p>Body Content</p>
        </SheetBody>
        <SheetFooter>
          <button type="button">Action</button>
        </SheetFooter>
      </Sheet>,
    );

    const dialog = screen.getByRole('dialog', { name: 'Navigation Menu' });
    expect(dialog).toBeTruthy();
    expect(document.body.style.overflow).toBe('hidden');
    expect(screen.getByText('Explore site sections')).toBeTruthy();
    expect(screen.getByText('Body Content')).toBeTruthy();

    const closeBtn = screen.getByRole('button', { name: 'Close panel' });
    await user.click(closeBtn);
    expect(onOpenChange).toHaveBeenCalledWith(false, { reason: 'close-button' });
  });

  it('does not render into DOM or lock scroll when open is false', () => {
    render(
      <Sheet open={false} onOpenChange={vi.fn()}>
        <SheetBody>Hidden</SheetBody>
      </Sheet>,
    );

    expect(screen.queryByRole('dialog')).toBeNull();
    expect(document.body.style.overflow).toBe('');
  });

  it('restores focus to invoking trigger and releases scroll lock when closing', async () => {
    const user = userEvent.setup();

    function ControlledSheet() {
      const [open, setOpen] = useState(false);
      const inputRef = useRef<HTMLInputElement>(null);

      return (
        <div>
          <button type="button" onClick={() => setOpen(true)}>
            Open Drawer
          </button>
          <Sheet
            open={open}
            onOpenChange={setOpen}
            initialFocusRef={inputRef}
            showCloseButton={true}
            closeLabel="Dismiss"
          >
            <SheetHeader>
              <SheetTitle>Edit Item</SheetTitle>
            </SheetHeader>
            <SheetBody>
              <input ref={inputRef} aria-label="Item Name" />
            </SheetBody>
            <SheetFooter>
              <button type="button" onClick={() => setOpen(false)}>
                Done
              </button>
            </SheetFooter>
          </Sheet>
        </div>
      );
    }

    render(<ControlledSheet />);
    const trigger = screen.getByRole('button', { name: 'Open Drawer' });
    await user.click(trigger);

    const input = screen.getByRole('textbox', { name: 'Item Name' });
    expect(document.activeElement).toBe(input);
    expect(document.body.style.overflow).toBe('hidden');

    await user.click(screen.getByRole('button', { name: 'Done' }));
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(document.body.style.overflow).toBe('');
    expect(document.activeElement).toBe(trigger);
  });

  it('applies side and size attributes and traps Tab focus within panel', async () => {
    const user = userEvent.setup();

    const { container } = render(
      <Sheet
        open={true}
        onOpenChange={vi.fn()}
        side="inline-start"
        size="lg"
        showCloseButton={true}
        closeLabel="Close"
      >
        <SheetBody>
          <button type="button">First Control</button>
        </SheetBody>
        <SheetFooter>
          <button type="button">Last Control</button>
        </SheetFooter>
      </Sheet>,
    );

    const panel = container.querySelector('[role="document"]');
    expect(panel?.getAttribute('data-side')).toBe('inline-start');
    expect(panel?.getAttribute('data-size')).toBe('lg');

    const closeBtn = screen.getByRole('button', { name: 'Close' });
    const firstBtn = screen.getByRole('button', { name: 'First Control' });
    const lastBtn = screen.getByRole('button', { name: 'Last Control' });

    lastBtn.focus();
    await user.tab();
    expect(document.activeElement).toBe(closeBtn);

    await user.tab({ shift: true });
    expect(document.activeElement).toBe(lastBtn);

    await user.tab();
    await user.tab();
    expect(document.activeElement).toBe(firstBtn);
  });

  it('handles escape cancel, backdrop click safely, and forwards refs to all subcomponents', () => {
    const onOpenChange = vi.fn();
    const dialogRef = createRef<HTMLDialogElement>();
    const headerRef = createRef<HTMLElement>();
    const titleRef = createRef<HTMLHeadingElement>();
    const descRef = createRef<HTMLParagraphElement>();
    const bodyRef = createRef<HTMLDivElement>();
    const footerRef = createRef<HTMLElement>();

    const { rerender } = render(
      <Sheet
        ref={dialogRef}
        open={true}
        onOpenChange={onOpenChange}
        closeOnBackdropClick={true}
        preventEscapeClose={false}
      >
        <SheetHeader ref={headerRef}>
          <SheetTitle ref={titleRef}>Title</SheetTitle>
          <SheetDescription ref={descRef}>Description</SheetDescription>
        </SheetHeader>
        <SheetBody ref={bodyRef}>Body</SheetBody>
        <SheetFooter ref={footerRef}>Footer</SheetFooter>
      </Sheet>,
    );

    const dialog = screen.getByRole('dialog');
    fireEvent(dialog, new Event('cancel', { cancelable: true }));
    expect(onOpenChange).toHaveBeenCalledWith(false, { reason: 'escape' });

    fireEvent.click(dialog);
    expect(onOpenChange).toHaveBeenCalledWith(false, { reason: 'backdrop' });

    expect(dialogRef.current).toBeInstanceOf(HTMLDialogElement);
    expect(headerRef.current).toBeInstanceOf(HTMLElement);
    expect(titleRef.current).toBeInstanceOf(HTMLHeadingElement);
    expect(descRef.current).toBeInstanceOf(HTMLParagraphElement);
    expect(bodyRef.current).toBeInstanceOf(HTMLDivElement);
    expect(footerRef.current).toBeInstanceOf(HTMLElement);

    onOpenChange.mockClear();
    rerender(
      <Sheet
        open={true}
        onOpenChange={onOpenChange}
        closeOnBackdropClick={false}
        preventEscapeClose={true}
      >
        <SheetBody>Locked</SheetBody>
      </Sheet>,
    );

    fireEvent(screen.getByRole('dialog'), new Event('cancel', { cancelable: true }));
    fireEvent.click(screen.getByRole('dialog'));
    expect(onOpenChange).not.toHaveBeenCalled();
  });
});
