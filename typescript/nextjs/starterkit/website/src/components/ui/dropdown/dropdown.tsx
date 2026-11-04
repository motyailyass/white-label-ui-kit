'use client';

import React, {
  Children,
  cloneElement,
  createContext,
  forwardRef,
  isValidElement,
  useCallback,
  useContext,
  useEffect,
  useId,
  useImperativeHandle,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ComponentPropsWithoutRef,
  type KeyboardEvent,
  type MouseEvent,
  type ReactElement,
  type ReactNode,
  type Ref,
  type SyntheticEvent,
} from 'react';
import { cn } from '@/lib/cn';
import styles from './dropdown.module.css';

/**
 * Utility to compose multiple refs onto a single DOM node.
 */
function composeRefs<T>(...refs: Array<Ref<T> | undefined | null>) {
  return (node: T | null) => {
    for (const ref of refs) {
      if (!ref) continue;
      if (typeof ref === 'function') {
        ref(node);
      } else if (typeof ref === 'object' && 'current' in ref) {
        (ref as React.MutableRefObject<T | null>).current = node;
      }
    }
  };
}

/**
 * Safely extracts ref from a React element across React 18 and React 19.
 */
function getElementRef<T>(element: ReactElement): Ref<T> | undefined {
  const props = element.props as Record<string, unknown> | undefined;
  if (props && 'ref' in props) {
    return props.ref as Ref<T>;
  }
  return undefined;
}

/**
 * Determines whether an element is visible in the layout tree.
 */
function isElementVisible(element: HTMLElement): boolean {
  if (element.hasAttribute('hidden')) return false;
  if (element.getAttribute('aria-hidden') === 'true') return false;

  const style = typeof window !== 'undefined' && window.getComputedStyle ? window.getComputedStyle(element) : null;
  if (style) {
    if (style.visibility === 'hidden' || style.visibility === 'collapse') return false;
    if (style.display === 'none') return false;
  }

  const isJsdom =
    typeof navigator !== 'undefined' &&
    (/jsdom/i.test(navigator.userAgent) || typeof (window as unknown as { render?: unknown }).render !== 'undefined');

  if (!isJsdom && element.offsetParent === null && style?.position !== 'fixed') {
    return false;
  }

  return true;
}

export interface DropdownContextValue {
  open: boolean;
  isDomOpen: boolean;
  setIsDomOpen: (isOpen: boolean) => void;
  setOpen: (open: boolean) => void;
  isControlled: boolean;
  controlledOpen: boolean | undefined;
  triggerRef: React.MutableRefObject<HTMLElement | null>;
  contentRef: React.MutableRefObject<HTMLDivElement | null>;
  surfaceRef: React.MutableRefObject<HTMLDivElement | null>;
  dropdownId: string;
  triggerId: string;
  placement:
    | 'bottom-start'
    | 'bottom-end'
    | 'bottom-center'
    | 'top-start'
    | 'top-end'
    | 'top-center'
    | 'inline-start'
    | 'inline-end';
  offset: number;
  autoFlip: boolean;
  dir?: 'ltr' | 'rtl';
  updatePosition: () => void;
  focusedIndex: number;
  setFocusedIndex: (index: number) => void;
  openDirectionRef: React.MutableRefObject<'first' | 'last'>;
}

const DropdownContext = createContext<DropdownContextValue | null>(null);

export function useDropdownContext(): DropdownContextValue {
  const context = useContext(DropdownContext);
  if (!context) {
    throw new Error('Dropdown compound components must be rendered inside a <Dropdown> root.');
  }
  return context;
}

export interface DropdownProps {
  /**
   * Controlled open state.
   */
  open?: boolean;
  /**
   * Default open state for uncontrolled usage.
   */
  defaultOpen?: boolean;
  /**
   * Event callback fired when open state changes.
   */
  onOpenChange?: (open: boolean) => void;
  /**
   * Preferred placement relative to the trigger.
   * Start and end horizontally mirror when rendered in RTL direction.
   */
  placement?:
    | 'bottom-start'
    | 'bottom-end'
    | 'bottom-center'
    | 'top-start'
    | 'top-end'
    | 'top-center'
    | 'inline-start'
    | 'inline-end';
  /**
   * Distance in pixels between the trigger and dropdown surface.
   */
  offset?: number;
  /**
   * Automatically flip to opposite side on viewport boundary collision.
   */
  autoFlip?: boolean;
  /**
   * Explicit direction override ('ltr' | 'rtl').
   */
  dir?: 'ltr' | 'rtl';
  /**
   * Dropdown compound elements.
   */
  children: ReactNode;
}

export function Dropdown({
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
  placement = 'bottom-start',
  offset = 4,
  autoFlip = true,
  dir,
  children,
}: DropdownProps) {
  const isControlled = controlledOpen !== undefined;
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
  const open = isControlled ? controlledOpen : uncontrolledOpen;

  const [isDomOpen, setIsDomOpen] = useState(defaultOpen || (controlledOpen ?? false));

  // Sync isDomOpen when controlledOpen updates
  useEffect(() => {
    if (isControlled) {
      setIsDomOpen(controlledOpen);
    }
  }, [isControlled, controlledOpen]);

  const [focusedIndex, setFocusedIndex] = useState(-1);
  const openDirectionRef = useRef<'first' | 'last'>('first');

  const triggerRef = useRef<HTMLElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const surfaceRef = useRef<HTMLDivElement | null>(null);

  const generatedId = useId();
  const dropdownId = `dropdown-${generatedId.replace(/:/g, '')}`;
  const triggerId = `dropdown-trigger-${generatedId.replace(/:/g, '')}`;

  const updatePosition = useCallback(() => {
    const trigger = triggerRef.current;
    const surface = surfaceRef.current;
    if (!trigger || !surface) return;

    const triggerRect = trigger.getBoundingClientRect();
    const surfaceRect = surface.getBoundingClientRect();

    // Accurately determine resolved CSS direction
    const computedDir =
      dir ||
      (typeof window !== 'undefined'
        ? (window.getComputedStyle(trigger).direction as 'ltr' | 'rtl')
        : 'ltr');
    const isRtl = computedDir === 'rtl';

    let physicalPlacement: string = placement;
    if (placement === 'inline-start') {
      physicalPlacement = isRtl ? 'right' : 'left';
    } else if (placement === 'inline-end') {
      physicalPlacement = isRtl ? 'left' : 'right';
    }

    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const padding = 16; // 16px lateral safety gutter

    let top = 0;
    let left = 0;

    const spaceBelow = viewportHeight - triggerRect.bottom - offset;
    const spaceAbove = triggerRect.top - offset;
    const spaceRight = viewportWidth - triggerRect.right - offset;
    const spaceLeft = triggerRect.left - offset;

    let effectiveSide: 'top' | 'bottom' | 'left' | 'right';
    if (physicalPlacement.startsWith('left')) {
      effectiveSide = 'left';
    } else if (physicalPlacement.startsWith('right')) {
      effectiveSide = 'right';
    } else if (physicalPlacement.startsWith('top')) {
      effectiveSide = 'top';
    } else {
      effectiveSide = 'bottom';
    }

    if (autoFlip) {
      if (effectiveSide === 'bottom' && spaceBelow < surfaceRect.height && spaceAbove > spaceBelow) {
        effectiveSide = 'top';
      } else if (effectiveSide === 'top' && spaceAbove < surfaceRect.height && spaceBelow > spaceAbove) {
        effectiveSide = 'bottom';
      } else if (effectiveSide === 'left' && spaceLeft < surfaceRect.width && spaceRight > spaceLeft) {
        effectiveSide = 'right';
      } else if (effectiveSide === 'right' && spaceRight < surfaceRect.width && spaceLeft > spaceRight) {
        effectiveSide = 'left';
      }
    }

    if (effectiveSide === 'left') {
      left = triggerRect.left - surfaceRect.width - offset;
      if (physicalPlacement.endsWith('start')) {
        top = triggerRect.top;
      } else if (physicalPlacement.endsWith('end')) {
        top = triggerRect.bottom - surfaceRect.height;
      } else {
        top = triggerRect.top + (triggerRect.height - surfaceRect.height) / 2;
      }
    } else if (effectiveSide === 'right') {
      left = triggerRect.right + offset;
      if (physicalPlacement.endsWith('start')) {
        top = triggerRect.top;
      } else if (physicalPlacement.endsWith('end')) {
        top = triggerRect.bottom - surfaceRect.height;
      } else {
        top = triggerRect.top + (triggerRect.height - surfaceRect.height) / 2;
      }
    } else if (effectiveSide === 'top') {
      top = triggerRect.top - surfaceRect.height - offset;
      if (physicalPlacement.endsWith('center')) {
        left = triggerRect.left + (triggerRect.width - surfaceRect.width) / 2;
      } else if (physicalPlacement.endsWith('end')) {
        // In LTR: end is right edge. In RTL: end is left edge.
        left = isRtl ? triggerRect.left : triggerRect.right - surfaceRect.width;
      } else {
        // In LTR: start is left edge. In RTL: start is right edge.
        left = isRtl ? triggerRect.right - surfaceRect.width : triggerRect.left;
      }
    } else {
      // bottom
      top = triggerRect.bottom + offset;
      if (physicalPlacement.endsWith('center')) {
        left = triggerRect.left + (triggerRect.width - surfaceRect.width) / 2;
      } else if (physicalPlacement.endsWith('end')) {
        // In LTR: end is right edge. In RTL: end is left edge.
        left = isRtl ? triggerRect.left : triggerRect.right - surfaceRect.width;
      } else {
        // In LTR: start is left edge. In RTL: start is right edge.
        left = isRtl ? triggerRect.right - surfaceRect.width : triggerRect.left;
      }
    }

    // Clamp coordinates within safe viewport boundaries
    const maxLeft = viewportWidth - surfaceRect.width - padding;
    const minLeft = padding;
    left = Math.max(minLeft, Math.min(left, maxLeft));

    const maxTop = viewportHeight - surfaceRect.height - padding;
    const minTop = padding;
    top = Math.max(minTop, Math.min(top, maxTop));

    surface.style.top = `${Math.round(top)}px`;
    surface.style.left = `${Math.round(left)}px`;
  }, [placement, offset, autoFlip, dir]);

  const setOpen = useCallback(
    (nextOpen: boolean) => {
      if (!isControlled) {
        setUncontrolledOpen(nextOpen);
        setIsDomOpen(nextOpen);
      } else {
        if (controlledOpen === true && nextOpen && !isDomOpen) {
          // Re-assert top-layer state when reopening a yielded controlled dropdown
          const content = contentRef.current;
          if (content) {
            const hasNative = typeof content.showPopover === 'function';
            if (hasNative) {
              try {
                if (!content.matches(':popover-open')) {
                  content.showPopover();
                }
              } catch {
                // Native popover throw guard
              }
            }
          }
          setIsDomOpen(true);
          updatePosition();
        }
      }
      onOpenChange?.(nextOpen);
    },
    [isControlled, controlledOpen, isDomOpen, updatePosition, onOpenChange],
  );

  const contextValue = useMemo<DropdownContextValue>(
    () => ({
      open,
      isDomOpen,
      setIsDomOpen,
      setOpen,
      isControlled,
      controlledOpen,
      triggerRef,
      contentRef,
      surfaceRef,
      dropdownId,
      triggerId,
      placement,
      offset,
      autoFlip,
      dir,
      updatePosition,
      focusedIndex,
      setFocusedIndex,
      openDirectionRef,
    }),
    [
      open,
      isDomOpen,
      setIsDomOpen,
      setOpen,
      isControlled,
      controlledOpen,
      dropdownId,
      triggerId,
      placement,
      offset,
      autoFlip,
      dir,
      updatePosition,
      focusedIndex,
    ],
  );

  return <DropdownContext.Provider value={contextValue}>{children}</DropdownContext.Provider>;
}

export interface DropdownTriggerProps extends ComponentPropsWithoutRef<'button'> {
  /**
   * When true, DropdownTrigger clones its direct child and passes trigger attributes to it.
   */
  asChild?: boolean;
}

export const DropdownTrigger = forwardRef<HTMLElement, DropdownTriggerProps>(function DropdownTrigger(
  { asChild = false, children, onClick, onKeyDown, className, ...props },
  forwardedRef,
) {
  const { open, isDomOpen, setOpen, triggerRef, dropdownId, triggerId, openDirectionRef } = useDropdownContext();

  const handleRef = useCallback(
    (node: HTMLElement | null) => {
      triggerRef.current = node;
    },
    [triggerRef],
  );

  const isExpanded = Boolean(open && isDomOpen);

  const handleClick = (e: MouseEvent<HTMLElement>) => {
    onClick?.(e as MouseEvent<HTMLButtonElement>);
    if (e.defaultPrevented) return;
    openDirectionRef.current = 'first';
    setOpen(!isExpanded);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLElement>) => {
    onKeyDown?.(e as KeyboardEvent<HTMLButtonElement>);
    if (e.defaultPrevented) return;

    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      openDirectionRef.current = 'first';
      setOpen(!isExpanded);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      openDirectionRef.current = 'first';
      setOpen(true);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      openDirectionRef.current = 'last';
      setOpen(true);
    }
  };

  const triggerAttributes = {
    id: triggerId,
    'aria-haspopup': 'menu' as const,
    'aria-expanded': isExpanded,
    'aria-controls': isExpanded ? dropdownId : undefined,
    onClick: handleClick,
    onKeyDown: handleKeyDown,
  };

  if (asChild && isValidElement(children)) {
    const child = Children.only(children) as ReactElement<Record<string, unknown>>;
    const childProps = child.props as {
      className?: string;
      onClick?: (e: React.MouseEvent<HTMLElement>) => void;
      onKeyDown?: (e: React.KeyboardEvent<HTMLElement>) => void;
    };
    const childRef = getElementRef<HTMLElement>(child);
    const composedRef = composeRefs(handleRef, forwardedRef, childRef);

    return cloneElement(child, {
      ...props,
      ...triggerAttributes,
      ...childProps,
      ref: composedRef,
      className: cn(childProps.className, className),
      onClick: (e: React.MouseEvent<HTMLElement>) => {
        childProps.onClick?.(e);
        if (!e.defaultPrevented) {
          handleClick(e);
        }
      },
      onKeyDown: (e: React.KeyboardEvent<HTMLElement>) => {
        childProps.onKeyDown?.(e);
        if (!e.defaultPrevented) {
          handleKeyDown(e);
        }
      },
    } as Record<string, unknown>);
  }

  const composedRef = composeRefs(handleRef, forwardedRef);

  return (
    <button
      ref={composedRef}
      type="button"
      className={className}
      {...triggerAttributes}
      {...props}
    >
      {children}
    </button>
  );
});

export interface DropdownContentProps extends ComponentPropsWithoutRef<'div'> {
  /**
   * Accessible name for the menu if not labelled by the trigger.
   */
  'aria-label'?: string;
  /**
   * ID of element that labels the menu.
   */
  'aria-labelledby'?: string;
  /**
   * Minimum width for the floating menu container.
   */
  minWidth?: number | string;
  /**
   * Maximum block size / height before scrolling occurs.
   */
  maxHeight?: number | string;
  /**
   * Whether keyboard arrow navigation wraps around edges (defaults to true).
   */
  loop?: boolean;
}

export const DropdownContent = forwardRef<HTMLDivElement, DropdownContentProps>(function DropdownContent(
  {
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledby,
    minWidth = 160,
    maxHeight = 360,
    loop = true,
    className,
    style,
    children,
    ...props
  },
  forwardedRef,
) {
  const {
    open,
    setIsDomOpen,
    setOpen,
    isControlled,
    controlledOpen,
    triggerRef,
    contentRef,
    surfaceRef,
    dropdownId,
    triggerId,
    updatePosition,
    setFocusedIndex,
    openDirectionRef,
  } = useDropdownContext();

  const internalSurfaceRef = useRef<HTMLDivElement>(null);
  useImperativeHandle(forwardedRef, () => internalSurfaceRef.current as HTMLDivElement);

  const controlledOpenRef = useRef(controlledOpen);
  controlledOpenRef.current = controlledOpen;
  const isClosingRef = useRef(false);

  const supportsNativePopover =
    typeof HTMLElement !== 'undefined' &&
    typeof HTMLElement.prototype.showPopover === 'function' &&
    typeof CSS !== 'undefined' &&
    typeof CSS.supports === 'function' &&
    CSS.supports('selector(:popover-open)');

  const [isFallback, setIsFallback] = useState(false);

  useEffect(() => {
    setIsFallback(!supportsNativePopover);
  }, [supportsNativePopover]);

  // Synchronize native HTML Popover API with open state
  useLayoutEffect(() => {
    const content = contentRef.current;
    if (!content) return;

    if (open) {
      isClosingRef.current = false;
      if (supportsNativePopover) {
        try {
          if (!content.matches(':popover-open')) {
            content.showPopover();
            setIsDomOpen(true);
          }
        } catch {
          // Native popover throw guard
        }
      } else {
        setIsDomOpen(true);
      }

      updatePosition();

      // Focus management: Query visible items and set initial focus
      const surface = internalSurfaceRef.current;
      if (surface) {
        const items = Array.from(
          surface.querySelectorAll<HTMLElement>('[role="menuitem"]'),
        ).filter(isElementVisible);

        if (items.length > 0) {
          const targetIndex = openDirectionRef.current === 'last' ? items.length - 1 : 0;
          setFocusedIndex(targetIndex);
          items[targetIndex]?.focus();
        } else {
          surface.focus();
        }
      }
    } else {
      isClosingRef.current = false;
      if (supportsNativePopover) {
        try {
          if (content.matches(':popover-open')) {
            content.hidePopover();
          }
        } catch {
          // Native popover throw guard
        }
      }
      setIsDomOpen(false);
      setFocusedIndex(-1);
    }
  }, [
    open,
    contentRef,
    updatePosition,
    supportsNativePopover,
    setIsDomOpen,
    setFocusedIndex,
    openDirectionRef,
  ]);

  // Continuous coordinate tracking during scroll and resize
  useEffect(() => {
    if (!open) return;

    updatePosition();

    const handleScrollAndResize = () => {
      updatePosition();
    };

    window.addEventListener('resize', handleScrollAndResize, { passive: true });
    window.addEventListener('scroll', handleScrollAndResize, { passive: true, capture: true });

    return () => {
      window.removeEventListener('resize', handleScrollAndResize);
      window.removeEventListener('scroll', handleScrollAndResize, true);
    };
  }, [open, updatePosition]);

  // Outside click dismiss & Escape listener
  useEffect(() => {
    if (!open) return;

    const content = contentRef.current;
    const surface = surfaceRef.current;

    const handlePointerDown = (e: PointerEvent) => {
      const target = e.target as Node | null;
      if (!target) return;

      const isInsideSurface = surface?.contains(target);
      const isInsideTrigger = triggerRef.current?.contains(target);

      if (!isInsideSurface && !isInsideTrigger) {
        setOpen(false);
      }
    };

    const handleKeyDown = (e: globalThis.KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        setOpen(false);
        // Restore focus to trigger on keyboard Escape
        triggerRef.current?.focus();
      }
    };

    // Native toggle event support with controlled-state reconciliation
    const handleNativeToggle = (e: Event) => {
      const toggleEvent = e as unknown as { newState?: string };
      if (toggleEvent.newState === 'open') {
        setIsDomOpen(true);
      } else if (toggleEvent.newState === 'closed') {
        setIsDomOpen(false);

        if (open) {
          if (!isClosingRef.current) {
            isClosingRef.current = true;
            setOpen(false);
            queueMicrotask(() => {
              isClosingRef.current = false;
            });
          }

          if (isControlled) {
            queueMicrotask(() => {
              const currentContent = contentRef.current;
              if (!currentContent) return;

              // If another popover took the top layer, yield cleanly
              const activePopover =
                typeof document !== 'undefined'
                  ? document.querySelector('[popover]:popover-open')
                  : null;

              if (activePopover && activePopover !== currentContent) {
                setIsDomOpen(false);
                return;
              }

              // If parent insisted on open={true} and top layer isn't contested, re-assert
              if (controlledOpenRef.current) {
                if (supportsNativePopover && !currentContent.matches(':popover-open')) {
                  try {
                    currentContent.showPopover();
                    setIsDomOpen(true);
                    updatePosition();
                  } catch {
                    setIsDomOpen(false);
                  }
                }
              }
            });
          }
        }
      }
    };

    if (!supportsNativePopover) {
      document.addEventListener('pointerdown', handlePointerDown);
    }
    document.addEventListener('keydown', handleKeyDown, true);
    if (content) {
      content.addEventListener('toggle', handleNativeToggle);
    }

    return () => {
      if (!supportsNativePopover) {
        document.removeEventListener('pointerdown', handlePointerDown);
      }
      document.removeEventListener('keydown', handleKeyDown, true);
      if (content) {
        content.removeEventListener('toggle', handleNativeToggle);
      }
    };
  }, [
    open,
    isControlled,
    setOpen,
    triggerRef,
    contentRef,
    surfaceRef,
    updatePosition,
    supportsNativePopover,
    setIsDomOpen,
  ]);

  // Menu roving keyboard navigation
  const handleMenuKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const surface = internalSurfaceRef.current;
    if (!surface) return;

    const items = Array.from(
      surface.querySelectorAll<HTMLElement>('[role="menuitem"]'),
    ).filter(isElementVisible);

    if (items.length === 0) return;

    const currentIndex = items.findIndex((item) => item === document.activeElement);

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      let nextIndex = currentIndex + 1;
      if (nextIndex >= items.length) {
        nextIndex = loop ? 0 : items.length - 1;
      }
      setFocusedIndex(nextIndex);
      items[nextIndex]?.focus();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      let prevIndex = currentIndex - 1;
      if (prevIndex < 0) {
        prevIndex = loop ? items.length - 1 : 0;
      }
      setFocusedIndex(prevIndex);
      items[prevIndex]?.focus();
    } else if (e.key === 'Home') {
      e.preventDefault();
      setFocusedIndex(0);
      items[0]?.focus();
    } else if (e.key === 'End') {
      e.preventDefault();
      const lastIndex = items.length - 1;
      setFocusedIndex(lastIndex);
      items[lastIndex]?.focus();
    } else if (e.key === 'Tab') {
      // Per WAI-ARIA Menu: Tab exits the menu immediately and resumes normal tab flow
      setOpen(false);
    }
  };

  const dynamicStyle = {
    ...style,
    '--_dropdown-min-width': typeof minWidth === 'number' ? `${minWidth}px` : minWidth,
    '--_dropdown-max-height': typeof maxHeight === 'number' ? `${maxHeight}px` : maxHeight,
  } as React.CSSProperties;

  return (
    <div
      ref={contentRef}
      popover="auto"
      id={dropdownId}
      className={styles.dropdown}
      data-fallback={isFallback ? 'true' : undefined}
      data-state={open ? 'open' : 'closed'}
    >
      <div
        ref={composeRefs(internalSurfaceRef, surfaceRef)}
        role="menu"
        tabIndex={-1}
        aria-labelledby={ariaLabelledby ?? triggerId}
        aria-label={ariaLabel}
        data-state={open ? 'open' : 'closed'}
        className={cn(styles.surface, className)}
        style={dynamicStyle}
        onKeyDown={handleMenuKeyDown}
        {...props}
      >
        {children}
      </div>
    </div>
  );
});

export type DropdownItemBaseProps = {
  /**
   * Destructive variant styling.
   */
  variant?: 'default' | 'danger';
  /**
   * Disabled state: item remains focusable for discovery, but blocked from activation.
   */
  disabled?: boolean;
  /**
   * Leading icon slot.
   */
  startIcon?: ReactNode;
  /**
   * Trailing icon or chevron slot.
   */
  endIcon?: ReactNode;
  /**
   * Keyboard shortcut indicator string (e.g. "⌘E").
   */
  shortcut?: string;
  /**
   * Whether activating the item closes the dropdown (defaults to true).
   */
  closeOnSelect?: boolean;
  /**
   * Selection event callback.
   */
  onSelect?: (event: Event | SyntheticEvent) => void;
  children: ReactNode;
  className?: string;
};

export type DropdownItemButtonProps = DropdownItemBaseProps &
  Omit<ComponentPropsWithoutRef<'button'>, keyof DropdownItemBaseProps> & {
    href?: undefined;
  };

export type DropdownItemLinkProps = DropdownItemBaseProps &
  Omit<ComponentPropsWithoutRef<'a'>, keyof DropdownItemBaseProps> & {
    href: string;
  };

export type DropdownItemProps = DropdownItemButtonProps | DropdownItemLinkProps;

export const DropdownItem = forwardRef<HTMLElement, DropdownItemProps>(function DropdownItem(
  {
    variant = 'default',
    disabled = false,
    startIcon,
    endIcon,
    shortcut,
    closeOnSelect = true,
    onSelect,
    onClick,
    onKeyDown,
    className,
    children,
    ...props
  },
  forwardedRef,
) {
  const { setOpen, triggerRef } = useDropdownContext();

  const handleClick = (e: MouseEvent<HTMLElement>) => {
    if (disabled) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }

    onSelect?.(e);
    onClick?.(e as MouseEvent<HTMLButtonElement & HTMLAnchorElement>);

    if (!e.defaultPrevented && closeOnSelect) {
      setOpen(false);
      // If action did not navigate away or shift focus, restore focus to trigger
      triggerRef.current?.focus();
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLElement>) => {
    if (disabled) {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        e.stopPropagation();
      }
      return;
    }

    onKeyDown?.(e as KeyboardEvent<HTMLButtonElement & HTMLAnchorElement>);

    if (e.key === ' ' || e.key === 'Enter') {
      const wasPrevented = e.defaultPrevented;
      e.preventDefault();
      if (!wasPrevented) {
        onSelect?.(e);
        onClick?.(e as unknown as MouseEvent<HTMLButtonElement & HTMLAnchorElement>);
        if (closeOnSelect) {
          setOpen(false);
          triggerRef.current?.focus();
        }
      }
    }
  };

  const itemContent = (
    <>
      {startIcon && <span className={styles.startIcon} aria-hidden="true">{startIcon}</span>}
      <span className={styles.itemLabel}>{children}</span>
      {shortcut && <kbd className={styles.shortcut}>{shortcut}</kbd>}
      {endIcon && <span className={styles.endIcon} aria-hidden="true">{endIcon}</span>}
    </>
  );

  const sharedProps = {
    role: 'menuitem' as const,
    tabIndex: -1, // Roving tabindex managed dynamically by DropdownContent
    'aria-disabled': disabled ? ('true' as const) : undefined,
    'data-variant': variant !== 'default' ? variant : undefined,
    className: cn(styles.item, className),
    onClick: handleClick,
    onKeyDown: handleKeyDown,
  };

  // Discriminated navigation link vs button action
  if ('href' in props && typeof props.href === 'string') {
    const { href, target, rel, ...linkProps } = props as DropdownItemLinkProps;
    const resolvedRel = rel !== undefined ? rel : (target === '_blank' ? 'noopener noreferrer' : undefined);

    return (
      <a
        ref={forwardedRef as Ref<HTMLAnchorElement>}
        href={disabled ? undefined : href}
        target={target}
        rel={resolvedRel}
        {...sharedProps}
        {...linkProps}
      >
        {itemContent}
      </a>
    );
  }

  const buttonProps = props as DropdownItemButtonProps;

  return (
    <button
      ref={forwardedRef as Ref<HTMLButtonElement>}
      type="button"
      {...sharedProps}
      {...buttonProps}
    >
      {itemContent}
    </button>
  );
});

export interface DropdownSeparatorProps extends ComponentPropsWithoutRef<'div'> {}

export const DropdownSeparator = forwardRef<HTMLDivElement, DropdownSeparatorProps>(function DropdownSeparator(
  { className, ...props },
  ref,
) {
  return (
    <div
      ref={ref}
      role="separator"
      aria-orientation="horizontal"
      className={cn(styles.separator, className)}
      {...props}
    />
  );
});

export interface DropdownGroupProps extends ComponentPropsWithoutRef<'div'> {}

export const DropdownGroup = forwardRef<HTMLDivElement, DropdownGroupProps>(function DropdownGroup(
  { className, ...props },
  ref,
) {
  return <div ref={ref} role="group" className={cn(styles.group, className)} {...props} />;
});

export interface DropdownLabelProps extends ComponentPropsWithoutRef<'div'> {}

export const DropdownLabel = forwardRef<HTMLDivElement, DropdownLabelProps>(function DropdownLabel(
  { className, ...props },
  ref,
) {
  return <div ref={ref} className={cn(styles.label, className)} {...props} />;
});
