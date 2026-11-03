import {
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
  type ComponentPropsWithRef,
  type KeyboardEvent,
  type MouseEvent,
  type ReactElement,
  type ReactNode,
  type Ref,
  type RefObject,
} from 'react';
import { Icon } from '@/components/icons';
import { cn } from '@/lib/cn';
import styles from './popover.module.css';

export type PopoverPlacement =
  | 'top'
  | 'top-start'
  | 'top-end'
  | 'bottom'
  | 'bottom-start'
  | 'bottom-end'
  | 'inline-start'
  | 'inline-end';

export interface PopoverContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
  triggerRef: RefObject<HTMLElement | null>;
  contentRef: RefObject<HTMLDivElement | null>;
  surfaceRef: RefObject<HTMLDivElement | null>;
  placement: PopoverPlacement;
  offset: number;
  autoFlip: boolean;
  popoverId: string;
  role: 'dialog' | 'region' | 'none' | undefined;
  setRole: (role: 'dialog' | 'region' | 'none' | undefined) => void;
  updatePosition: () => void;
  onOpenChange?: (open: boolean) => void;
}

const PopoverContext = createContext<PopoverContextValue | null>(null);

function usePopoverContext(): PopoverContextValue {
  const context = useContext(PopoverContext);
  if (!context) {
    throw new Error('Popover compound components must be rendered within a <Popover> parent.');
  }
  return context;
}

export interface PopoverProps {
  /**
   * Controlled open state.
   */
  open?: boolean;

  /**
   * Initial open state for uncontrolled usage.
   * @default false
   */
  defaultOpen?: boolean;

  /**
   * Callback fired when open state changes.
   */
  onOpenChange?: (open: boolean) => void;

  /**
   * Preferred placement relative to the trigger element.
   * @default 'bottom-start'
   */
  placement?: PopoverPlacement;

  /**
   * Distance in pixels between the trigger and the popover surface.
   * @default 8
   */
  offset?: number;

  /**
   * Whether to flip placement when colliding with viewport boundaries.
   * @default true
   */
  autoFlip?: boolean;

  /**
   * Semantic role for the floating surface (e.g. 'dialog', 'region', or 'none').
   */
  role?: 'dialog' | 'region' | 'none';

  /**
   * Popover children (typically PopoverTrigger and PopoverContent).
   */
  children: ReactNode;
}

export function Popover({
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
  placement = 'bottom-start',
  offset = 8,
  autoFlip = true,
  role: initialRole,
  children,
}: PopoverProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : uncontrolledOpen;

  const [role, setRole] = useState<'dialog' | 'region' | 'none' | undefined>(initialRole);

  const triggerRef = useRef<HTMLElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const surfaceRef = useRef<HTMLDivElement | null>(null);

  const generatedId = useId();
  const popoverId = `popover-${generatedId.replace(/:/g, '')}`;

  const setOpen = useCallback(
    (nextOpen: boolean) => {
      if (!isControlled) {
        setUncontrolledOpen(nextOpen);
      }
      onOpenChange?.(nextOpen);
    },
    [isControlled, onOpenChange],
  );

  const updatePosition = useCallback(() => {
    const trigger = triggerRef.current;
    const surface = surfaceRef.current;
    if (!trigger || !surface) return;

    const triggerRect = trigger.getBoundingClientRect();
    const surfaceRect = surface.getBoundingClientRect();
    const isRtl = document.documentElement.dir === 'rtl' || trigger.closest('[dir="rtl"]') !== null;

    // Resolve logical to physical orientation
    let physicalPlacement = placement;
    if (placement === 'inline-start') {
      physicalPlacement = isRtl ? 'bottom-end' : 'bottom-start';
    } else if (placement === 'inline-end') {
      physicalPlacement = isRtl ? 'bottom-start' : 'bottom-end';
    }

    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const padding = 16; // 16px lateral gutter per UI kit spacing token

    let top = 0;
    let left = 0;

    // Vertical base calculation
    const spaceBelow = viewportHeight - triggerRect.bottom - offset;
    const spaceAbove = triggerRect.top - offset;

    let effectiveSide: 'top' | 'bottom' = physicalPlacement.startsWith('top') ? 'top' : 'bottom';
    if (autoFlip) {
      if (effectiveSide === 'bottom' && spaceBelow < surfaceRect.height && spaceAbove > spaceBelow) {
        effectiveSide = 'top';
      } else if (effectiveSide === 'top' && spaceAbove < surfaceRect.height && spaceBelow > spaceAbove) {
        effectiveSide = 'bottom';
      }
    }

    if (effectiveSide === 'bottom') {
      top = triggerRect.bottom + offset;
    } else {
      top = triggerRect.top - surfaceRect.height - offset;
    }

    // Horizontal base calculation
    if (physicalPlacement.endsWith('center')) {
      left = triggerRect.left + (triggerRect.width - surfaceRect.width) / 2;
    } else if (physicalPlacement.endsWith('end')) {
      left = triggerRect.right - surfaceRect.width;
    } else {
      left = triggerRect.left;
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
  }, [placement, offset, autoFlip]);

  const contextValue = useMemo(
    () => ({
      open,
      setOpen,
      triggerRef,
      contentRef,
      surfaceRef,
      placement,
      offset,
      autoFlip,
      popoverId,
      role,
      setRole,
      updatePosition,
      onOpenChange,
    }),
    [open, setOpen, placement, offset, autoFlip, popoverId, role, updatePosition, onOpenChange],
  );

  return <PopoverContext.Provider value={contextValue}>{children}</PopoverContext.Provider>;
}

export interface PopoverTriggerProps extends ComponentPropsWithoutRef<'button'> {
  /**
   * When true, PopoverTrigger clones its direct child and passes trigger attributes to it.
   */
  asChild?: boolean;
}

export const PopoverTrigger = forwardRef<HTMLElement, PopoverTriggerProps>(function PopoverTrigger(
  { asChild = false, children, onClick, onKeyDown, className, ...props },
  forwardedRef,
) {
  const { open, setOpen, triggerRef, popoverId, role } = usePopoverContext();

  const handleRef = useCallback(
    (node: HTMLElement | null) => {
      triggerRef.current = node;
      if (typeof forwardedRef === 'function') {
        forwardedRef(node);
      } else if (forwardedRef) {
        (forwardedRef as { current: HTMLElement | null }).current = node;
      }
    },
    [triggerRef, forwardedRef],
  );

  const handleClick = (e: MouseEvent<HTMLElement>) => {
    onClick?.(e as MouseEvent<HTMLButtonElement>);
    if (e.defaultPrevented) return;
    setOpen(!open);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLElement>) => {
    onKeyDown?.(e as KeyboardEvent<HTMLButtonElement>);
    if (e.defaultPrevented) return;

    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      setOpen(!open);
    }
  };

  const triggerAttributes = {
    ref: handleRef,
    'aria-expanded': open,
    'aria-haspopup': role === 'dialog' ? ('dialog' as const) : undefined,
    'aria-controls': open ? popoverId : undefined,
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
    return cloneElement(child, {
      ...triggerAttributes,
      ...childProps,
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

  return (
    <button
      type="button"
      {...props}
      {...triggerAttributes}
      className={className}
    >
      {children}
    </button>
  );
});

PopoverTrigger.displayName = 'PopoverTrigger';

export interface PopoverContentBaseProps extends ComponentPropsWithRef<'div'> {
  /**
   * Optional ref to element that should receive focus when opened.
   */
  initialFocusRef?: RefObject<HTMLElement | null>;

  /**
   * Maximum inline size override.
   * @default 340px
   */
  maxWidth?: number | string;

  /**
   * Accessible name when role="dialog".
   */
  'aria-label'?: string;

  /**
   * Element ID for accessible name when role="dialog".
   */
  'aria-labelledby'?: string;
}

export type PopoverContentProps = PopoverContentBaseProps & {
  /**
   * Semantic role for the floating surface.
   * - `'dialog'`: Non-modal dialog surface for interactive forms and settings. Requires accessible name.
   * - `'region'`: Named landmark region.
   * - `'none'` / `undefined`: Generic floating disclosure (default).
   */
  role?: 'dialog' | 'region' | 'none';
};

export const PopoverContent = forwardRef<HTMLDivElement, PopoverContentProps>(function PopoverContent(
  {
    role,
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledby,
    initialFocusRef,
    maxWidth = 340,
    className,
    style,
    children,
    ...props
  },
  forwardedRef,
) {
  const {
    open,
    setOpen,
    triggerRef,
    contentRef,
    surfaceRef,
    popoverId,
    role: contextRole,
    setRole,
    updatePosition,
  } = usePopoverContext();

  const internalSurfaceRef = useRef<HTMLDivElement>(null);
  useImperativeHandle(forwardedRef, () => internalSurfaceRef.current as HTMLDivElement);

  const effectiveRole = role ?? contextRole;

  // Sync role to context so PopoverTrigger can conditionally attach aria-haspopup="dialog"
  useLayoutEffect(() => {
    if (role !== undefined) {
      setRole(role);
    }
  }, [role, setRole]);

  // Synchronize native HTML Popover API with open state
  useLayoutEffect(() => {
    const content = contentRef.current;
    if (!content) return;

    const hasNativePopover = typeof content.showPopover === 'function';

    if (open) {
      if (hasNativePopover) {
        try {
          if (!content.matches(':popover-open')) {
            content.showPopover();
          }
        } catch {
          // Native popover throw guard
        }
      }

      updatePosition();

      // Focus management: If initialFocusRef or role="dialog", focus the first interactive element
      if (initialFocusRef?.current) {
        initialFocusRef.current.focus();
      } else if (effectiveRole === 'dialog') {
        const surface = internalSurfaceRef.current;
        if (surface) {
          const firstInteractive = surface.querySelector<HTMLElement>(
            'button, [href], input:not([type="hidden"]), select, textarea, [tabindex]:not([tabindex="-1"])',
          );
          firstInteractive?.focus();
        }
      }
    } else {
      if (hasNativePopover) {
        try {
          if (content.matches(':popover-open')) {
            content.hidePopover();
          }
        } catch {
          // Native popover throw guard
        }
      }
    }
  }, [open, effectiveRole, initialFocusRef, contentRef, updatePosition]);

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
      window.removeEventListener('scroll', handleScrollAndResize, { capture: true });
    };
  }, [open, updatePosition]);

  // Outside click & Escape fallback handling
  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (e: globalThis.PointerEvent) => {
      const surface = internalSurfaceRef.current;
      const trigger = triggerRef.current;
      const target = e.target as Node | null;

      if (!target) return;

      // Click is inside surface or trigger -> do not close
      if (surface?.contains(target) || trigger?.contains(target)) {
        return;
      }

      // Outside click: dismiss popover.
      // Crucial: Do NOT call e.preventDefault() or focus trigger; allow clicked control to receive focus naturally.
      setOpen(false);
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

    // Native toggle event support
    const content = contentRef.current;
    const handleNativeToggle = (e: Event) => {
      const toggleEvent = e as unknown as { newState?: string };
      if (toggleEvent.newState === 'closed' && open) {
        setOpen(false);
      }
    };

    const supportsNativePopover =
      typeof HTMLElement !== 'undefined' &&
      typeof HTMLElement.prototype.showPopover === 'function';

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
  }, [open, setOpen, triggerRef, contentRef]);

  // Assign combined surface ref
  const setCombinedSurfaceRef = useCallback(
    (node: HTMLDivElement | null) => {
      internalSurfaceRef.current = node;
      surfaceRef.current = node;
    },
    [surfaceRef],
  );

  return (
    <div
      ref={contentRef as Ref<HTMLDivElement>}
      id={popoverId}
      popover="auto"
      data-state={open ? 'open' : 'closed'}
      className={styles.popover}
    >
      <div
        {...props}
        ref={setCombinedSurfaceRef}
        role={effectiveRole === 'none' ? undefined : effectiveRole}
        aria-modal={effectiveRole === 'dialog' ? 'false' : undefined}
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledby}
        data-state={open ? 'open' : 'closed'}
        className={cn(styles.surface, className)}
        style={{
          ...style,
          ['--_popover-max-width' as string]: typeof maxWidth === 'number' ? `${maxWidth}px` : maxWidth,
        }}
      >
        {children}
      </div>
    </div>
  );
});

PopoverContent.displayName = 'PopoverContent';

export interface PopoverHeaderProps extends ComponentPropsWithRef<'div'> {}

export const PopoverHeader = forwardRef<HTMLDivElement, PopoverHeaderProps>(function PopoverHeader(
  { className, children, ...props },
  ref,
) {
  return (
    <div ref={ref} className={cn(styles.header, className)} {...props}>
      {children}
    </div>
  );
});

PopoverHeader.displayName = 'PopoverHeader';

export interface PopoverTitleProps extends ComponentPropsWithRef<'h3'> {
  as?: 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
}

export const PopoverTitle = forwardRef<HTMLHeadingElement, PopoverTitleProps>(function PopoverTitle(
  { as: Component = 'h3', className, children, ...props },
  ref,
) {
  return (
    <Component ref={ref} className={cn(styles.title, className)} {...props}>
      {children}
    </Component>
  );
});

PopoverTitle.displayName = 'PopoverTitle';

export interface PopoverDescriptionProps extends ComponentPropsWithRef<'p'> {}

export const PopoverDescription = forwardRef<HTMLParagraphElement, PopoverDescriptionProps>(
  function PopoverDescription({ className, children, ...props }, ref) {
    return (
      <p ref={ref} className={cn(styles.description, className)} {...props}>
        {children}
      </p>
    );
  },
);

PopoverDescription.displayName = 'PopoverDescription';

export interface PopoverBodyProps extends ComponentPropsWithRef<'div'> {}

export const PopoverBody = forwardRef<HTMLDivElement, PopoverBodyProps>(function PopoverBody(
  { className, children, ...props },
  ref,
) {
  return (
    <div ref={ref} className={cn(styles.body, className)} {...props}>
      {children}
    </div>
  );
});

PopoverBody.displayName = 'PopoverBody';

export interface PopoverFooterProps extends ComponentPropsWithRef<'div'> {}

export const PopoverFooter = forwardRef<HTMLDivElement, PopoverFooterProps>(function PopoverFooter(
  { className, children, ...props },
  ref,
) {
  return (
    <div ref={ref} className={cn(styles.footer, className)} {...props}>
      {children}
    </div>
  );
});

PopoverFooter.displayName = 'PopoverFooter';

export interface PopoverCloseProps extends ComponentPropsWithRef<'button'> {
  /**
   * Accessible label for close button when icon-only.
   */
  closeLabel?: string;

  /**
   * Whether to delegate rendering to the immediate child element.
   */
  asChild?: boolean;
}

export const PopoverClose = forwardRef<HTMLButtonElement, PopoverCloseProps>(function PopoverClose(
  { asChild, closeLabel, className, children, onClick, ...props },
  ref,
) {
  const { setOpen, triggerRef } = usePopoverContext();

  const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
    onClick?.(e);
    if (e.defaultPrevented) return;
    setOpen(false);
    triggerRef.current?.focus();
  };

  if (asChild && isValidElement(children)) {
    const child = Children.only(children) as ReactElement<Record<string, unknown>>;
    const childProps = child.props as {
      className?: string;
      onClick?: (e: MouseEvent<HTMLButtonElement>) => void;
    };
    return cloneElement(child, {
      ...props,
      ...childProps,
      className: cn(childProps.className, className),
      onClick: (e: MouseEvent<HTMLButtonElement>) => {
        childProps.onClick?.(e);
        if (!e.defaultPrevented) {
          handleClick(e);
        }
      },
    } as Record<string, unknown>);
  }

  return (
    <button
      type="button"
      data-testid="popover-close-button"
      {...props}
      ref={ref}
      className={cn(styles.closeButton, className)}
      onClick={handleClick}
      aria-label={closeLabel}
    >
      {children || <Icon name="close" />}
    </button>
  );
});

PopoverClose.displayName = 'PopoverClose';
