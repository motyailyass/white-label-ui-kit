import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuTrigger,
} from './context-menu';

describe('ContextMenu Primitive', () => {
  it('renders closed by default and opens on right-click within trigger', () => {
    render(
      <ContextMenu>
        <ContextMenuTrigger data-testid="trigger">Right click zone</ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem>Item 1</ContextMenuItem>
          <ContextMenuItem>Item 2</ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>,
    );

    expect(screen.queryByRole('menu')).toBeNull();

    const trigger = screen.getByTestId('trigger');
    fireEvent.contextMenu(trigger, { clientX: 120, clientY: 240 });

    const menu = screen.getByRole('menu');
    expect(menu).toBeTruthy();
    expect(screen.getByRole('menuitem', { name: /item 1/i })).toBeTruthy();
    expect(screen.getByRole('menuitem', { name: /item 2/i })).toBeTruthy();
  });

  it('selects item and closes menu on click', () => {
    const handleSelect = vi.fn();

    render(
      <ContextMenu>
        <ContextMenuTrigger data-testid="trigger">Right click zone</ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem onSelect={handleSelect}>Copy link</ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>,
    );

    const trigger = screen.getByTestId('trigger');
    fireEvent.contextMenu(trigger, { clientX: 50, clientY: 50 });

    const item = screen.getByRole('menuitem', { name: /copy link/i });
    fireEvent.click(item);

    expect(handleSelect).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('menu')).toBeNull();
  });

  it('dismisses immediately on Escape key', () => {
    render(
      <ContextMenu>
        <ContextMenuTrigger data-testid="trigger">Right click zone</ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuLabel>Actions</ContextMenuLabel>
          <ContextMenuSeparator />
          <ContextMenuItem>Action</ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>,
    );

    const trigger = screen.getByTestId('trigger');
    fireEvent.contextMenu(trigger, { clientX: 50, clientY: 50 });

    const menu = screen.getByRole('menu');
    fireEvent.keyDown(menu, { key: 'Escape' });

    expect(screen.queryByRole('menu')).toBeNull();
  });

  it('does not trigger onSelect when item is disabled', () => {
    const handleSelect = vi.fn();

    render(
      <ContextMenu>
        <ContextMenuTrigger data-testid="trigger">Right click zone</ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem disabled onSelect={handleSelect}>
            Disabled action
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>,
    );

    const trigger = screen.getByTestId('trigger');
    fireEvent.contextMenu(trigger, { clientX: 50, clientY: 50 });

    const item = screen.getByRole('menuitem', { name: /disabled action/i });
    expect((item as HTMLButtonElement).disabled).toBe(true);

    fireEvent.click(item);
    expect(handleSelect).not.toHaveBeenCalled();
    expect(screen.getByRole('menu')).toBeTruthy();
  });

  it('navigates with ArrowDown and ArrowUp wrapping around enabled items', () => {
    render(
      <ContextMenu>
        <ContextMenuTrigger data-testid="trigger">Right click zone</ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem data-testid="item-1">Item 1</ContextMenuItem>
          <ContextMenuItem disabled data-testid="item-disabled">
            Item Disabled
          </ContextMenuItem>
          <ContextMenuItem data-testid="item-2">Item 2</ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>,
    );

    const trigger = screen.getByTestId('trigger');
    fireEvent.contextMenu(trigger, { clientX: 50, clientY: 50 });

    const menu = screen.getByRole('menu');
    const item1 = screen.getByTestId('item-1');
    const item2 = screen.getByTestId('item-2');

    // First ArrowDown highlights first enabled item
    fireEvent.keyDown(menu, { key: 'ArrowDown' });
    expect(item1.getAttribute('data-highlighted')).toBe('true');

    // Next ArrowDown skips disabled item and selects Item 2
    fireEvent.keyDown(menu, { key: 'ArrowDown' });
    expect(item2.getAttribute('data-highlighted')).toBe('true');

    // Next ArrowDown wraps to Item 1
    fireEvent.keyDown(menu, { key: 'ArrowDown' });
    expect(item1.getAttribute('data-highlighted')).toBe('true');

    // ArrowUp wraps to Item 2
    fireEvent.keyDown(menu, { key: 'ArrowUp' });
    expect(item2.getAttribute('data-highlighted')).toBe('true');
  });

  it('navigates to first item on Home and last item on End', () => {
    render(
      <ContextMenu>
        <ContextMenuTrigger data-testid="trigger">Right click zone</ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem data-testid="item-first">First</ContextMenuItem>
          <ContextMenuItem data-testid="item-mid">Mid</ContextMenuItem>
          <ContextMenuItem data-testid="item-last">Last</ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>,
    );

    const trigger = screen.getByTestId('trigger');
    fireEvent.contextMenu(trigger, { clientX: 50, clientY: 50 });

    const menu = screen.getByRole('menu');
    const first = screen.getByTestId('item-first');
    const last = screen.getByTestId('item-last');

    fireEvent.keyDown(menu, { key: 'End' });
    expect(last.getAttribute('data-highlighted')).toBe('true');

    fireEvent.keyDown(menu, { key: 'Home' });
    expect(first.getAttribute('data-highlighted')).toBe('true');
  });

  it('supports controlled open prop', () => {
    const handleOpenChange = vi.fn();
    const { rerender } = render(
      <ContextMenu open={false} onOpenChange={handleOpenChange}>
        <ContextMenuTrigger data-testid="trigger">Trigger</ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem>Controlled item</ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>,
    );

    expect(screen.queryByRole('menu')).toBeNull();

    rerender(
      <ContextMenu open={true} onOpenChange={handleOpenChange}>
        <ContextMenuTrigger data-testid="trigger">Trigger</ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem>Controlled item</ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>,
    );

    expect(screen.getByRole('menu')).toBeTruthy();
  });

  it('renders shortcut and danger variant cleanly', () => {
    render(
      <ContextMenu>
        <ContextMenuTrigger data-testid="trigger">Trigger</ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem variant="danger" data-testid="danger-item">
            Delete
            <ContextMenuShortcut>⌘⌫</ContextMenuShortcut>
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>,
    );

    const trigger = screen.getByTestId('trigger');
    fireEvent.contextMenu(trigger, { clientX: 50, clientY: 50 });

    const dangerItem = screen.getByTestId('danger-item');
    expect(dangerItem.className).toContain('item_danger');
    expect(screen.getByText('⌘⌫')).toBeTruthy();
  });

  it('throws when subcomponents are rendered outside ContextMenu', () => {
    expect(() => {
      render(<ContextMenuTrigger>Orphan Trigger</ContextMenuTrigger>);
    }).toThrow('ContextMenu compound components must be rendered inside <ContextMenu>');
  });
});
