'use client';

import {
  type ComponentPropsWithoutRef,
  type KeyboardEvent,
  type MouseEvent as ReactMouseEvent,
  type ReactNode,
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
} from 'react';
import { cn } from '@/lib/cn';
import styles from './context-menu.module.css';

interface ContextMenuContextValue {
  open: boolean;
  coords: { x: number; y: number };
  openMenu: (coords: { x: number; y: number }) => void;
  closeMenu: () => void;
  activeIndex: number;
  setActiveIndex: (index: number) => void;
  itemsRef: React.MutableRefObject<Array<HTMLButtonElement | null>>;
  menuId: string;
}

const ContextMenuContext = createContext<ContextMenuContextValue | null>(null);

function useContextMenuContext() {
  const ctx = useContext(ContextMenuContext);
  if (!ctx) {
    throw new Error('ContextMenu compound components must be rendered inside <ContextMenu>');
  }
  return ctx;
}

export interface ContextMenuProps {
  children: ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function ContextMenu({ children, open: controlledOpen, onOpenChange }: ContextMenuProps) {
  const isControlled = controlledOpen !== undefined;
  const [uncontrolledOpen, setUncontrolledOpen] = useState<boolean>(false);
  const isOpen = isControlled ? controlledOpen : uncontrolledOpen;

  const [coords, setCoords] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [activeIndex, setActiveIndex] = useState<number>(-1);
  const itemsRef = useRef<Array<HTMLButtonElement | null>>([]);
  const menuId = useId();

  const setOpenState = useCallback(
    (nextOpen: boolean) => {
      if (!isControlled) {
        setUncontrolledOpen(nextOpen);
      }
      onOpenChange?.(nextOpen);
    },
    [isControlled, onOpenChange],
  );

  const openMenu = useCallback(
    (newCoords: { x: number; y: number }) => {
      setCoords(newCoords);
      setActiveIndex(-1);
      setOpenState(true);
    },
    [setOpenState],
  );

  const closeMenu = useCallback(() => {
    setActiveIndex(-1);
    setOpenState(false);
  }, [setOpenState]);

  return (
    <ContextMenuContext.Provider
      value={{
        open: isOpen,
        coords,
        openMenu,
        closeMenu,
        activeIndex,
        setActiveIndex,
        itemsRef,
        menuId,
      }}
    >
      {children}
    </ContextMenuContext.Provider>
  );
}

export interface ContextMenuTriggerProps extends ComponentPropsWithoutRef<'div'> {
  children: ReactNode;
  disabled?: boolean;
  className?: string;
  'data-testid'?: string;
}

export const ContextMenuTrigger = forwardRef<HTMLDivElement, ContextMenuTriggerProps>(
  function ContextMenuTrigger(
    { children, disabled = false, className, onContextMenu, 'data-testid': testId, ...rest },
    ref,
  ) {
    const { openMenu } = useContextMenuContext();

    const handleContextMenu = (e: ReactMouseEvent<HTMLDivElement>) => {
      if (disabled) return;
      e.preventDefault();
      e.stopPropagation();
      openMenu({ x: e.clientX, y: e.clientY });
      onContextMenu?.(e);
    };

    return (
      <div
        ref={ref}
        className={cn(styles.trigger, className)}
        onContextMenu={handleContextMenu}
        data-testid={testId}
        {...rest}
      >
        {children}
      </div>
    );
  },
);

ContextMenuTrigger.displayName = 'ContextMenuTrigger';

export interface ContextMenuContentProps extends ComponentPropsWithoutRef<'div'> {
  children: ReactNode;
  className?: string;
  'data-testid'?: string;
}

export const ContextMenuContent = forwardRef<HTMLDivElement, ContextMenuContentProps>(
  function ContextMenuContent(
    { children, className, onKeyDown, style, 'data-testid': testId, ...rest },
    forwardedRef,
  ) {
    const { open, coords, closeMenu, activeIndex, setActiveIndex, itemsRef, menuId } =
      useContextMenuContext();

    const internalRef = useRef<HTMLDivElement | null>(null);

    // Click outside listener
    useEffect(() => {
      if (!open) return;

      const handlePointerDown = (e: PointerEvent) => {
        if (internalRef.current && !internalRef.current.contains(e.target as Node)) {
          closeMenu();
        }
      };

      const handleWindowContextMenu = (e: MouseEvent) => {
        if (internalRef.current && !internalRef.current.contains(e.target as Node)) {
          closeMenu();
        }
      };

      const timer = setTimeout(() => {
        window.addEventListener('pointerdown', handlePointerDown);
        window.addEventListener('contextmenu', handleWindowContextMenu);
      }, 0);

      return () => {
        clearTimeout(timer);
        window.removeEventListener('pointerdown', handlePointerDown);
        window.removeEventListener('contextmenu', handleWindowContextMenu);
      };
    }, [open, closeMenu]);

    // Position clamping
    const [clampedCoords, setClampedCoords] = useState<{ x: number; y: number }>(coords);

    useEffect(() => {
      if (!open) return;

      const contentEl = internalRef.current;
      if (!contentEl) {
        setClampedCoords(coords);
        return;
      }

      contentEl.focus();

      const rect = contentEl.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      const safeX = Math.min(Math.max(8, coords.x), viewportWidth - rect.width - 8);
      const safeY = Math.min(Math.max(8, coords.y), viewportHeight - rect.height - 8);

      setClampedCoords({ x: safeX, y: safeY });
    }, [open, coords]);

    // Focus active item
    useEffect(() => {
      if (!open) return;
      if (activeIndex >= 0 && itemsRef.current[activeIndex]) {
        itemsRef.current[activeIndex]?.focus();
      }
    }, [open, activeIndex, itemsRef]);

    const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
      const enabledItems = itemsRef.current.filter(
        (item): item is HTMLButtonElement => item !== null && !item.disabled,
      );

      if (enabledItems.length === 0) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        const currentPos = enabledItems.findIndex((item) => item === itemsRef.current[activeIndex]);
        const nextPos = currentPos < enabledItems.length - 1 ? currentPos + 1 : 0;
        const nextIndex = itemsRef.current.indexOf(enabledItems[nextPos]);
        setActiveIndex(nextIndex);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        const currentPos = enabledItems.findIndex((item) => item === itemsRef.current[activeIndex]);
        const prevPos = currentPos > 0 ? currentPos - 1 : enabledItems.length - 1;
        const prevIndex = itemsRef.current.indexOf(enabledItems[prevPos]);
        setActiveIndex(prevIndex);
      } else if (e.key === 'Escape') {
        e.preventDefault();
        closeMenu();
      } else if (e.key === 'Home') {
        e.preventDefault();
        const firstIndex = itemsRef.current.indexOf(enabledItems[0]);
        setActiveIndex(firstIndex);
      } else if (e.key === 'End') {
        e.preventDefault();
        const lastIndex = itemsRef.current.indexOf(enabledItems[enabledItems.length - 1]);
        setActiveIndex(lastIndex);
      }

      onKeyDown?.(e);
    };

    if (!open) return null;

    return (
      <div
        ref={(node) => {
          internalRef.current = node;
          if (typeof forwardedRef === 'function') {
            forwardedRef(node);
          } else if (forwardedRef) {
            forwardedRef.current = node;
          }
        }}
        id={menuId}
        role="menu"
        aria-orientation="vertical"
        tabIndex={-1}
        className={cn(styles.content, className)}
        style={
          {
            '--context-menu-x': `${clampedCoords.x}px`,
            '--context-menu-y': `${clampedCoords.y}px`,
            ...style,
          } as React.CSSProperties
        }
        onKeyDown={handleKeyDown}
        data-testid={testId}
        {...rest}
      >
        {children}
      </div>
    );
  },
);

ContextMenuContent.displayName = 'ContextMenuContent';

export type ContextMenuItemVariant = 'default' | 'danger';

export interface ContextMenuItemProps extends ComponentPropsWithoutRef<'button'> {
  variant?: ContextMenuItemVariant;
  onSelect?: () => void;
  children: ReactNode;
  className?: string;
  'data-testid'?: string;
}

export const ContextMenuItem = forwardRef<HTMLButtonElement, ContextMenuItemProps>(
  function ContextMenuItem(
    {
      variant = 'default',
      onSelect,
      children,
      className,
      onClick,
      disabled,
      'data-testid': testId,
      ...rest
    },
    ref,
  ) {
    const { closeMenu, itemsRef, activeIndex } = useContextMenuContext();
    const itemRef = useRef<HTMLButtonElement | null>(null);

    useEffect(() => {
      const el = itemRef.current;
      if (!el) return;
      if (!itemsRef.current.includes(el)) {
        itemsRef.current.push(el);
      }
      return () => {
        itemsRef.current = itemsRef.current.filter((item) => item !== el);
      };
    }, [itemsRef]);

    const isHighlighted =
      itemRef.current !== null && itemsRef.current[activeIndex] === itemRef.current;

    const handleClick = (e: ReactMouseEvent<HTMLButtonElement>) => {
      if (disabled) return;
      onSelect?.();
      closeMenu();
      onClick?.(e);
    };

    return (
      <button
        ref={(node) => {
          itemRef.current = node;
          if (typeof ref === 'function') {
            ref(node);
          } else if (ref) {
            ref.current = node;
          }
        }}
        type="button"
        role="menuitem"
        tabIndex={-1}
        disabled={disabled}
        data-highlighted={isHighlighted ? 'true' : undefined}
        className={cn(styles.item, variant === 'danger' && styles.item_danger, className)}
        onClick={handleClick}
        data-testid={testId}
        {...rest}
      >
        {children}
      </button>
    );
  },
);

ContextMenuItem.displayName = 'ContextMenuItem';

export interface ContextMenuSeparatorProps extends ComponentPropsWithoutRef<'div'> {
  className?: string;
}

export const ContextMenuSeparator = forwardRef<HTMLDivElement, ContextMenuSeparatorProps>(
  function ContextMenuSeparator({ className, ...rest }, ref) {
    return (
      <div
        ref={ref}
        role="separator"
        aria-orientation="horizontal"
        className={cn(styles.separator, className)}
        {...rest}
      />
    );
  },
);

ContextMenuSeparator.displayName = 'ContextMenuSeparator';

export interface ContextMenuLabelProps extends ComponentPropsWithoutRef<'div'> {
  children: ReactNode;
  className?: string;
}

export const ContextMenuLabel = forwardRef<HTMLDivElement, ContextMenuLabelProps>(
  function ContextMenuLabel({ children, className, ...rest }, ref) {
    return (
      <div ref={ref} className={cn(styles.label, className)} {...rest}>
        {children}
      </div>
    );
  },
);

ContextMenuLabel.displayName = 'ContextMenuLabel';

export interface ContextMenuShortcutProps extends ComponentPropsWithoutRef<'span'> {
  children: ReactNode;
  className?: string;
}

export const ContextMenuShortcut = forwardRef<HTMLSpanElement, ContextMenuShortcutProps>(
  function ContextMenuShortcut({ children, className, ...rest }, ref) {
    return (
      <span ref={ref} className={cn(styles.itemShortcut, className)} {...rest}>
        {children}
      </span>
    );
  },
);

ContextMenuShortcut.displayName = 'ContextMenuShortcut';
