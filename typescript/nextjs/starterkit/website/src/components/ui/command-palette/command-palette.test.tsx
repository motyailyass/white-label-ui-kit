import { createRef, useState } from 'react';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  CommandDialog,
  CommandEmpty,
  CommandFooter,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandShortcut,
} from './command-palette';

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

describe('CommandPalette Primitive', () => {
  it('renders combobox, listbox, options, shortcut slot, and localized footer tips when open', () => {
    const onOpenChange = vi.fn();
    render(
      <CommandDialog open={true} onOpenChange={onOpenChange} aria-label="Commands">
        <CommandInput placeholder="Search actions..." aria-label="Search commands" />
        <CommandList>
          <CommandGroup heading="Navigation">
            <CommandItem value="dashboard" shortcut={<CommandShortcut>⌘D</CommandShortcut>}>
              Dashboard Overview
            </CommandItem>
            <CommandItem value="settings">Settings</CommandItem>
          </CommandGroup>
        </CommandList>
        <CommandFooter tips={[{ shortcut: 'esc', label: 'Close palette' }]} />
      </CommandDialog>,
    );

    const combobox = screen.getByRole('combobox', { name: 'Search commands' });
    expect(combobox).toBeTruthy();
    expect(combobox.getAttribute('placeholder')).toBe('Search actions...');

    expect(screen.getByRole('dialog', { name: 'Commands' })).toBeTruthy();

    const listbox = screen.getByRole('listbox');
    expect(listbox).toBeTruthy();

    const options = screen.getAllByRole('option');
    expect(options).toHaveLength(2);

    expect(screen.getByText('Navigation')).toBeTruthy();
    expect(screen.getByText('⌘D')).toBeTruthy();
    expect(screen.getByText('Close palette')).toBeTruthy();
  });

  it('handles userEvent item click, skips disabled items, and closes dialog', async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    const onSelect = vi.fn();
    const onDisabled = vi.fn();

    render(
      <CommandDialog open={true} onOpenChange={onOpenChange} aria-label="Commands">
        <CommandInput />
        <CommandList>
          <CommandItem value="disabled" disabled onSelect={onDisabled}>
            Disabled Action
          </CommandItem>
          <CommandItem value="profile" onSelect={onSelect}>
            View Profile
          </CommandItem>
        </CommandList>
      </CommandDialog>,
    );

    const disabledItem = screen.getByRole('option', { name: /Disabled Action/ });
    expect(disabledItem.getAttribute('aria-disabled')).toBe('true');
    await user.click(disabledItem);
    expect(onDisabled).not.toHaveBeenCalled();

    const item = screen.getByRole('option', { name: /View Profile/ });
    await user.click(item);

    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('navigates enabled options in DOM order (ArrowDown/ArrowUp/Home/End), skips disabled, and guards IME Enter', async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    const onFirst = vi.fn();
    const onThird = vi.fn();

    render(
      <CommandDialog open={true} onOpenChange={onOpenChange} aria-label="Commands">
        <CommandInput aria-label="Search" />
        <CommandList>
          <CommandItem value="item-1" onSelect={onFirst}>
            Item 1
          </CommandItem>
          <CommandItem value="item-2" disabled>
            Item 2 (disabled)
          </CommandItem>
          <CommandItem value="item-3" onSelect={onThird}>
            Item 3
          </CommandItem>
        </CommandList>
      </CommandDialog>,
    );

    const combobox = screen.getByRole('combobox');
    expect(document.activeElement).toBe(combobox);

    // ArrowDown twice skips Item 2 (disabled) -> highlights Item 3
    await user.keyboard('{ArrowDown}{ArrowDown}');
    const thirdOption = screen.getByRole('option', { name: 'Item 3' });
    expect(thirdOption.getAttribute('aria-selected')).toBe('true');

    // Home jumps back to Item 1, End jumps to Item 3
    await user.keyboard('{Home}');
    expect(screen.getByRole('option', { name: 'Item 1' }).getAttribute('aria-selected')).toBe(
      'true',
    );

    await user.keyboard('{End}');
    expect(thirdOption.getAttribute('aria-selected')).toBe('true');

    // IME composition Enter must not trigger execution
    fireEvent.keyDown(combobox, { key: 'Enter', isComposing: true, keyCode: 229 });
    expect(onThird).not.toHaveBeenCalled();

    // Standard Enter executes Item 3 and closes
    await user.keyboard('{Enter}');
    expect(onThird).toHaveBeenCalledTimes(1);
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('restores focus to invoking trigger on close and respects preventEscapeClose & closeOnBackdropClick', async () => {
    const user = userEvent.setup();

    function Harness() {
      const [open, setOpen] = useState(false);
      return (
        <>
          <button type="button" onClick={() => setOpen(true)}>
            Open Trigger
          </button>
          <CommandDialog
            open={open}
            onOpenChange={setOpen}
            closeOnBackdropClick={false}
            preventEscapeClose={true}
            aria-label="Commands"
          >
            <CommandInput aria-label="Command query" />
            <CommandList>
              <CommandItem value="ok" onSelect={() => setOpen(false)}>
                Confirm Action
              </CommandItem>
            </CommandList>
          </CommandDialog>
        </>
      );
    }

    render(<Harness />);
    const trigger = screen.getByRole('button', { name: 'Open Trigger' });
    await user.click(trigger);

    const dialog = screen.getByRole('dialog');
    expect(dialog.hasAttribute('open')).toBe(true);

    // Cancel and backdrop click are blocked when disabled
    fireEvent(dialog, new Event('cancel', { cancelable: true }));
    expect(dialog.hasAttribute('open')).toBe(true);
    fireEvent.click(dialog);
    expect(dialog.hasAttribute('open')).toBe(true);

    // Selecting an item closes palette and restores focus synchronously to trigger
    await user.click(screen.getByRole('option', { name: 'Confirm Action' }));
    expect(document.activeElement).toBe(trigger);
  });

  it('renders caller-supplied empty fallback without hardcoded English copy', () => {
    render(
      <CommandDialog open={true} onOpenChange={() => {}} aria-label="Commands">
        <CommandInput />
        <CommandList>
          <CommandEmpty>لا توجد نتائج مطابقة.</CommandEmpty>
        </CommandList>
      </CommandDialog>,
    );

    expect(screen.getByText('لا توجد نتائج مطابقة.')).toBeTruthy();
  });

  it('supports React 19 native ref prop forwarding and dir="rtl"', () => {
    const ref = createRef<HTMLDialogElement>();
    render(
      <CommandDialog
        ref={ref}
        dir="rtl"
        open={true}
        onOpenChange={() => {}}
        aria-label="لوحة الأوامر"
      >
        <CommandInput />
      </CommandDialog>,
    );

    expect(ref.current instanceof HTMLDialogElement).toBe(true);
    expect(ref.current?.getAttribute('dir')).toBe('rtl');
  });

  it('composes flush SearchInput with clear button, ScrollArea listbox viewport, and Kbd shortcuts', async () => {
    const user = userEvent.setup();
    render(
      <CommandDialog open={true} onOpenChange={() => {}} aria-label="Commands">
        <CommandInput aria-label="Commands" clearLabel="Clear query" />
        <CommandList>
          <CommandItem value="open" shortcut={<CommandShortcut>⌘O</CommandShortcut>}>
            Open File
          </CommandItem>
        </CommandList>
      </CommandDialog>,
    );

    const combobox = screen.getByRole('combobox', { name: 'Commands' });
    const searchWrapper = combobox.closest('[data-variant]');
    expect(searchWrapper?.getAttribute('data-variant')).toBe('flush');

    // Clear button only renders once query is non-empty
    expect(screen.queryByRole('button', { name: 'Clear query' })).toBeNull();
    await user.type(combobox, 'inv');
    const clearBtn = screen.getByRole('button', { name: 'Clear query' });
    await user.click(clearBtn);
    expect((combobox as HTMLInputElement).value).toBe('');
    expect(document.activeElement).toBe(combobox);

    // CommandList renders inside ScrollArea viewport without extra region landmark/tab stop
    const listbox = screen.getByRole('listbox');
    const viewport = listbox.parentElement as HTMLElement;
    expect(viewport.getAttribute('data-orientation')).toBe('vertical');
    expect(viewport.getAttribute('tabindex')).toBe('-1');
    expect(viewport.getAttribute('role')).toBe('presentation');

    // CommandShortcut uses <kbd>
    const shortcut = screen.getByText('⌘O');
    expect(shortcut.tagName).toBe('KBD');
  });

  it('locks background body scroll while open, releases on unmount, and traps Tab focus', () => {
    document.body.style.overflow = '';

    const { unmount } = render(
      <CommandDialog open={true} onOpenChange={() => {}} aria-label="Commands">
        <CommandInput aria-label="Search commands" />
        <button type="button">Trailing action</button>
      </CommandDialog>,
    );

    const dialog = screen.getByRole('dialog', { name: 'Commands' });
    expect(dialog).toBeTruthy();
    expect(document.body.style.overflow).toBe('hidden');

    const input = screen.getByRole('combobox', { name: 'Search commands' });
    const trailing = screen.getByRole('button', { name: 'Trailing action' });

    trailing.focus();
    fireEvent.keyDown(trailing, { key: 'Tab' });
    expect(document.activeElement).toBe(input);

    input.focus();
    fireEvent.keyDown(input, { key: 'Tab', shiftKey: true });
    expect(document.activeElement).toBe(trailing);

    unmount();
    expect(document.body.style.overflow).toBe('');
  });
});
