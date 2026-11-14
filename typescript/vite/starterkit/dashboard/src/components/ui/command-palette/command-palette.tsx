'use client';

import {
  type ChangeEvent,
  type ComponentPropsWithRef,
  createContext,
  type KeyboardEvent,
  type MouseEvent,
  type PointerEvent,
  type ReactNode,
  type Ref,
  type RefObject,
  useCallback,
  useContext,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { Icon } from '@/components/icons';
import { cn } from '@/lib/cn';
import { trapTabKey } from '@/lib/focus-trap';
import { acquireBodyScrollLock } from '@/lib/scroll-lock';
import { Button } from '../button';
import { Kbd, type KbdSize, type KbdVariant } from '../kbd';
import { ScrollArea } from '../scroll-area';
import { SearchInput } from '../search-input';
import styles from './command-palette.module.css';

function assignRef<T>(ref: Ref<T> | undefined, node: T | null): void {
  if (!ref) return;
  if (typeof ref === 'function') {
    ref(node);
  } else {
    ref.current = node;
  }
}

interface RegisteredItem {
  id: string;
  value: string;
  onSelect?: () => void;
  disabled?: boolean;
}

interface CommandContextValue {
  query: string;
  setQuery: (q: string) => void;
  activeId: string | null;
  setActiveId: (id: string | null) => void;
  notifyPointerMove: (id: string, x: number, y: number) => void;
  registerItem: (item: RegisteredItem) => () => void;
  registerValueChange: (cb: ((val: string) => void) | undefined) => () => void;
  onClose: () => void;
  listId: string;
  listRef: RefObject<HTMLUListElement | null>;
  inputRef: RefObject<HTMLInputElement | null>;
}

const CommandContext = createContext<CommandContextValue | null>(null);

function useCommandContext(name: string): CommandContextValue {
  const ctx = useContext(CommandContext);
  if (!ctx) {
    throw new Error(`<${name}> must be used within a <CommandDialog> container.`);
  }
  return ctx;
}

/* =============================================================================
   CommandDialog
   ============================================================================= */

export interface CommandDialogBaseProps extends Omit<ComponentPropsWithRef<'dialog'>, 'open'> {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  closeOnBackdropClick?: boolean;
  preventEscapeClose?: boolean;
  initialFocusRef?: RefObject<HTMLElement | null>;
  returnFocusRef?: RefObject<HTMLElement | null>;
  resetQueryOnClose?: boolean;
  children?: ReactNode;
}

/** A command palette modal must expose an accessible name. */
export type CommandDialogProps = CommandDialogBaseProps &
  (
    | { 'aria-label': string; 'aria-labelledby'?: string }
    | { 'aria-labelledby': string; 'aria-label'?: string }
  );

export function CommandDialog({
  open,
  onOpenChange,
  closeOnBackdropClick = true,
  preventEscapeClose = false,
  initialFocusRef,
  returnFocusRef,
  resetQueryOnClose = true,
  className,
  children,
  onClick,
  onKeyDown,
  onCancel,
  onClose,
  ref,
  ...props
}: CommandDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const previousActiveElementRef = useRef<HTMLElement | null>(null);
  const openRef = useRef(open);
  const [query, setQuery] = useState('');
  const [activeId, setActiveId] = useState<string | null>(null);
  const activeIdRef = useRef<string | null>(activeId);
  const itemsRef = useRef<Map<string, RegisteredItem>>(new Map());
  const valueChangeListenersRef = useRef<Set<(val: string) => void>>(new Set());
  const listId = useId();
  const listRef = useRef<HTMLUListElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const lastPointerPosRef = useRef<{ x: number; y: number } | null>(null);

  const notifyPointerMove = useCallback((id: string, x: number, y: number) => {
    const prev = lastPointerPosRef.current;
    if (!prev) {
      lastPointerPosRef.current = { x, y };
      return;
    }
    if (prev.x === x && prev.y === y) return;
    lastPointerPosRef.current = { x, y };
    setActiveId(id);
  }, []);

  useLayoutEffect(() => {
    openRef.current = open;
    activeIdRef.current = activeId;
  });

  const resetPaletteState = useCallback(() => {
    lastPointerPosRef.current = null;
    setActiveId(null);
    if (resetQueryOnClose) {
      setQuery('');
      valueChangeListenersRef.current.forEach((cb) => cb(''));
    }
  }, [resetQueryOnClose]);

  const registerValueChange = useCallback((cb: ((val: string) => void) | undefined) => {
    if (!cb) return () => {};
    valueChangeListenersRef.current.add(cb);
    return () => {
      valueChangeListenersRef.current.delete(cb);
    };
  }, []);

  const registerItem = useCallback((item: RegisteredItem) => {
    itemsRef.current.set(item.id, item);
    return () => {
      itemsRef.current.delete(item.id);
      if (activeIdRef.current === item.id) {
        queueMicrotask(() => {
          if (!itemsRef.current.has(item.id) && activeIdRef.current === item.id) {
            setActiveId(null);
          }
        });
      }
    };
  }, []);

  const handleClose = useCallback(() => {
    onOpenChange(false);
    resetPaletteState();
  }, [onOpenChange, resetPaletteState]);

  // Synchronize native <dialog> showModal()/close() and capture/restore trigger focus
  useLayoutEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open) {
      if (!dialog.open) {
        if (!returnFocusRef) {
          previousActiveElementRef.current = document.activeElement as HTMLElement | null;
        }
        dialog.showModal();
        const target = initialFocusRef?.current ?? inputRef.current;
        target?.focus();
      }
    } else if (dialog.open) {
      dialog.close();
      const target = returnFocusRef?.current ?? previousActiveElementRef.current;
      if (
        target &&
        document.body.contains(target) &&
        !('disabled' in target && (target as HTMLButtonElement).disabled)
      ) {
        target.focus();
      }
    }
  }, [open, initialFocusRef, returnFocusRef]);

  // Clean unmount guarantee
  useEffect(() => {
    return () => {
      const dialog = dialogRef.current;
      if (dialog?.open) {
        dialog.close();
      }
    };
  }, []);

  // Lock background body scroll while the palette modal is open
  useEffect(() => {
    if (!open) return;
    const releaseScrollLock = acquireBodyScrollLock();
    return () => {
      releaseScrollLock();
    };
  }, [open]);

  const getOrderedEnabledItems = useCallback((): RegisteredItem[] => {
    const listEl = listRef.current;
    if (listEl) {
      const domOptions = Array.from(listEl.querySelectorAll<HTMLElement>('[role="option"][id]'));
      const ordered: RegisteredItem[] = [];
      for (const el of domOptions) {
        const reg = itemsRef.current.get(el.id);
        if (reg && !reg.disabled) {
          ordered.push(reg);
        }
      }
      if (ordered.length > 0 || domOptions.length === 0) {
        return ordered;
      }
    }
    return Array.from(itemsRef.current.values()).filter((i) => !i.disabled);
  }, []);

  const setActiveAndScroll = useCallback((id: string | null) => {
    setActiveId(id);
    if (id) {
      const el = document.getElementById(id);
      el?.scrollIntoView?.({ block: 'nearest' });
    }
  }, []);

  const handleCancel = (e: React.SyntheticEvent<HTMLDialogElement>) => {
    e.preventDefault();
    onCancel?.(e);
    if (!preventEscapeClose) {
      handleClose();
    }
  };

  const handleNativeClose = (e: React.SyntheticEvent<HTMLDialogElement>) => {
    onClose?.(e);
    if (open) {
      handleClose();
      queueMicrotask(() => {
        const dialog = dialogRef.current;
        if (dialog && openRef.current && !dialog.open) {
          dialog.showModal();
        }
      });
    }
  };

  const handleDialogClick = (e: MouseEvent<HTMLDialogElement>) => {
    onClick?.(e);
    if (e.defaultPrevented || !closeOnBackdropClick) return;
    const dialog = dialogRef.current;
    if (!dialog || e.target !== dialog) return;
    if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
      handleClose();
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLDialogElement>) => {
    onKeyDown?.(e);
    if (e.defaultPrevented) return;

    if (e.key === 'Tab') {
      const dialog = dialogRef.current;
      if (dialog) trapTabKey(e, dialog);
      return;
    }

    const items = getOrderedEnabledItems();
    if (items.length === 0) return;

    const currentIndex = items.findIndex((i) => i.id === activeId);

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      const nextIndex = currentIndex < items.length - 1 ? currentIndex + 1 : 0;
      setActiveAndScroll(items[nextIndex].id);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const prevIndex = currentIndex > 0 ? currentIndex - 1 : items.length - 1;
      setActiveAndScroll(items[prevIndex].id);
    } else if (e.key === 'Home') {
      e.preventDefault();
      setActiveAndScroll(items[0].id);
    } else if (e.key === 'End') {
      e.preventDefault();
      setActiveAndScroll(items[items.length - 1].id);
    } else if (e.key === 'Enter') {
      if (e.nativeEvent.isComposing) return;
      e.preventDefault();
      const selectedItem = activeId ? (items.find((i) => i.id === activeId) ?? items[0]) : items[0];
      if (selectedItem && !selectedItem.disabled) {
        selectedItem.onSelect?.();
        handleClose();
      }
    }
  };

  return (
    <CommandContext.Provider
      value={{
        query,
        setQuery,
        activeId,
        setActiveId,
        notifyPointerMove,
        registerItem,
        registerValueChange,
        onClose: handleClose,
        listId,
        listRef,
        inputRef,
      }}
    >
      <dialog
        {...props}
        ref={(node) => {
          dialogRef.current = node;
          assignRef(ref, node);
        }}
        className={cn(styles.dialog, className)}
        onCancel={handleCancel}
        onClose={handleNativeClose}
        onClick={handleDialogClick}
        onKeyDown={handleKeyDown}
      >
        {open ? (
          <div ref={panelRef} className={styles.panel}>
            {children}
          </div>
        ) : null}
      </dialog>
    </CommandContext.Provider>
  );
}

/* =============================================================================
   CommandInput
   ============================================================================= */

export interface CommandInputProps
  extends Omit<ComponentPropsWithRef<'input'>, 'value' | 'onChange' | 'size' | 'prefix'> {
  value?: string;
  onValueChange?: (val: string) => void;
  placeholder?: string;
  /** Accessible label for optional clear button shown when input has text */
  clearLabel?: string;
  /** Optional trailing content rendered in the SearchInput suffix slot */
  suffix?: ReactNode;
  /** Optional class applied to the outer SearchInput bar wrapper */
  wrapperClassName?: string;
}

export function CommandInput({
  value,
  onValueChange,
  placeholder,
  clearLabel,
  suffix,
  wrapperClassName,
  className,
  ref,
  ...props
}: CommandInputProps) {
  const { query, setQuery, setActiveId, registerValueChange, listId, activeId, inputRef } =
    useCommandContext('CommandInput');

  useEffect(() => registerValueChange(onValueChange), [onValueChange, registerValueChange]);

  const controlledValue = value !== undefined ? value : query;

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const next = e.target.value;
    setActiveId(null);
    setQuery(next);
    onValueChange?.(next);
  };

  const handleClear = () => {
    setActiveId(null);
    setQuery('');
    onValueChange?.('');
    inputRef.current?.focus();
  };

  const resolvedSuffix =
    suffix ??
    (clearLabel && controlledValue.length > 0 ? (
      <Button
        variant="ghost"
        size="xs"
        iconOnly
        aria-label={clearLabel}
        onClick={handleClear}
        className={styles.clearButton}
      >
        <Icon name="close" size={14} />
      </Button>
    ) : undefined);

  return (
    <SearchInput
      {...props}
      ref={(node) => {
        inputRef.current = node;
        assignRef(ref, node);
      }}
      variant="flush"
      size="xl"
      type="text"
      role="combobox"
      aria-autocomplete="list"
      aria-expanded="true"
      aria-controls={listId}
      aria-activedescendant={activeId ?? undefined}
      icon={<Icon name="search" size={18} />}
      suffix={resolvedSuffix}
      value={controlledValue}
      onChange={handleChange}
      placeholder={placeholder}
      className={cn(styles.inputWrapper, wrapperClassName)}
      inputClassName={className}
    />
  );
}

/* =============================================================================
   CommandList
   ============================================================================= */

export interface CommandListProps extends ComponentPropsWithRef<'ul'> {
  children?: ReactNode;
}

export function CommandList({ className, children, ref, ...props }: CommandListProps) {
  const { listId, listRef } = useCommandContext('CommandList');

  return (
    <ScrollArea
      orientation="vertical"
      viewportTabIndex={-1}
      viewportRole="presentation"
      className={styles.scrollArea}
      viewportClassName={styles.scrollViewport}
    >
      <ul
        {...props}
        ref={(node) => {
          listRef.current = node;
          assignRef(ref, node);
        }}
        id={listId}
        role="listbox"
        className={cn(styles.list, className)}
      >
        {children}
      </ul>
    </ScrollArea>
  );
}

/* =============================================================================
   CommandGroup
   ============================================================================= */

export interface CommandGroupProps extends ComponentPropsWithRef<'li'> {
  heading?: ReactNode;
  children?: ReactNode;
}

export function CommandGroup({ heading, className, children, ref, ...props }: CommandGroupProps) {
  const headingId = useId();

  return (
    <li {...props} ref={ref} role="presentation" className={cn(styles.group, className)}>
      {heading && (
        <span id={headingId} className={styles.groupHeading} aria-hidden="true">
          {heading}
        </span>
      )}
      <ul
        role="group"
        aria-labelledby={heading ? headingId : undefined}
        className={styles.groupList}
      >
        {children}
      </ul>
    </li>
  );
}

/* =============================================================================
   CommandItem
   ============================================================================= */

export interface CommandItemProps extends ComponentPropsWithRef<'li'> {
  value: string;
  onSelect?: () => void;
  disabled?: boolean;
  icon?: ReactNode;
  shortcut?: ReactNode;
  children?: ReactNode;
}

export function CommandItem({
  value,
  onSelect,
  disabled = false,
  icon,
  shortcut,
  className,
  children,
  onClick,
  onPointerMove,
  ref,
  ...props
}: CommandItemProps) {
  const { activeId, notifyPointerMove, registerItem, onClose } = useCommandContext('CommandItem');
  const id = useId();
  const isActive = activeId === id;

  useEffect(() => {
    return registerItem({
      id,
      value,
      onSelect,
      disabled,
    });
  }, [id, value, onSelect, disabled, registerItem]);

  const handleClick = (e: MouseEvent<HTMLLIElement>) => {
    onClick?.(e);
    if (e.defaultPrevented || disabled) return;
    onSelect?.();
    onClose();
  };

  const handlePointerMove = (e: PointerEvent<HTMLLIElement>) => {
    onPointerMove?.(e);
    if (e.defaultPrevented || disabled) return;
    notifyPointerMove(id, e.clientX, e.clientY);
  };

  return (
    <li
      {...props}
      ref={ref}
      id={id}
      role="option"
      aria-selected={isActive}
      aria-disabled={disabled ? 'true' : undefined}
      data-active={isActive ? 'true' : undefined}
      data-disabled={disabled ? 'true' : undefined}
      className={cn(
        styles.item,
        isActive && styles.item_active,
        disabled && styles.item_disabled,
        className,
      )}
      onClick={handleClick}
      onPointerMove={handlePointerMove}
    >
      <div className={styles.itemContent}>
        {icon && (
          <span className={styles.itemIcon} aria-hidden="true">
            {icon}
          </span>
        )}
        <span className={styles.itemBody}>{children}</span>
      </div>
      {shortcut && <span className={styles.itemShortcut}>{shortcut}</span>}
    </li>
  );
}

/* =============================================================================
   CommandShortcut
   ============================================================================= */

export interface CommandShortcutProps extends ComponentPropsWithRef<'kbd'> {
  size?: KbdSize;
  variant?: KbdVariant;
  children?: ReactNode;
}

export function CommandShortcut({
  size = 'md',
  variant = 'outline',
  className,
  children,
  ref,
  ...props
}: CommandShortcutProps) {
  return (
    <Kbd {...props} ref={ref} size={size} variant={variant} dir="ltr" className={className}>
      {children}
    </Kbd>
  );
}

/* =============================================================================
   CommandEmpty
   ============================================================================= */

export interface CommandEmptyProps extends ComponentPropsWithRef<'li'> {
  children?: ReactNode;
}

export function CommandEmpty({ className, children, ref, ...props }: CommandEmptyProps) {
  return (
    <li {...props} ref={ref} role="presentation" className={cn(styles.empty, className)}>
      {children ?? null}
    </li>
  );
}

/* =============================================================================
   CommandSeparator
   ============================================================================= */

export interface CommandSeparatorProps extends ComponentPropsWithRef<'li'> {}

export function CommandSeparator({ className, ref, ...props }: CommandSeparatorProps) {
  return (
    <li {...props} ref={ref} role="presentation" className={className}>
      <hr className={styles.separator} />
    </li>
  );
}

/* =============================================================================
   CommandFooter
   ============================================================================= */

export interface CommandFooterTip {
  shortcut: ReactNode;
  label: string;
}

export interface CommandFooterProps extends ComponentPropsWithRef<'div'> {
  tips?: readonly CommandFooterTip[];
  children?: ReactNode;
}

export function CommandFooter({ tips, className, children, ref, ...props }: CommandFooterProps) {
  return (
    <div {...props} ref={ref} className={cn(styles.footer, className)}>
      {children ??
        (tips && tips.length > 0 ? (
          <div className={styles.footerTips}>
            {tips.map((tip, index) => (
              <span key={index} className={styles.tipItem}>
                <CommandShortcut>{tip.shortcut}</CommandShortcut>
                <span>{tip.label}</span>
              </span>
            ))}
          </div>
        ) : null)}
    </div>
  );
}
