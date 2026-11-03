'use client';

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

/**
 * Utility to compose multiple refs (callback or object refs) onto a single DOM node.
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
 * Checks whether an interactive candidate is disabled natively or through a disabled <fieldset> ancestor.
 */
function isElementDisabled(el: HTMLElement): boolean {
  if ('disabled' in el && (el as HTMLButtonElement).disabled) return true;
  if (typeof el.matches === 'function' && el.matches(':disabled')) return true;

  const fieldset = el.closest('fieldset[disabled]');
  if (fieldset) {
    const firstLegend = fieldset.querySelector(':scope > legend');
    if (!firstLegend || !firstLegend.contains(el)) {
      return true;
    }
  }

  return false;
}

/**
 * Finds the first focusable, enabled, and visible element inside a container.
 */
function findFirstFocusableElement(container: HTMLElement): HTMLElement | null {
  const candidates = container.querySelectorAll<HTMLElement>(
    'a[href], button, textarea, input:not([type="hidden"]), select, [tabindex]',
  );

  for (let i = 0; i < candidates.length; i++) {
    const el = candidates[i];
    if (el.getAttribute('tabindex') === '-1') continue;
    if (isElementDisabled(el)) continue;
    if (el.getAttribute('aria-hidden') === 'true') continue;

    const isVisible =
      el.offsetParent !== null ||
      el.offsetWidth > 0 ||
      el.offsetHeight > 0 ||
      (typeof window !== 'undefined' &&
        window.getComputedStyle(el).display !== 'none' &&
        window.getComputedStyle(el).visibility !== 'hidden');

    if (isVisible) {
      return el;
    }
  }

  return null;
}

export type PopoverPlacement =
  | 'top'
  | 'top-start'
  | 'top-end'
  | 'bottom'
  | 'bottom-start'
  | 'bottom-end'
  | 'left'
  | 'left-start'
  | 'left-end'
  | 'right'
  | 'right-start'
  | 'right-end'
  | 'inline-start'
  | 'inline-end';

export interface PopoverContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
  isControlled: boolean;
  controlledOpen?: boolean;
  triggerRef: RefObject<HTMLElement | null>;
  contentRef: RefObject<HTMLDivElement | null>;
  surfaceRef: RefObject<HTMLDivElement | null>;
  placement: PopoverPlacement;
  offset: number;
  autoFlip: boolean;
  popoverId: string;
  role: 'dialog' | 'region' | 'none' | undefined;
  popoverRole: 'dialog' | 'region' | 'none' | undefined;
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
   * Controlled open state. Single source of truth when supplied.
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

    // Accurately determine resolved CSS direction on the trigger element itself
    const computedDir =
      typeof window !== 'undefined'
        ? window.getComputedStyle(trigger).direction
        : 'ltr';
    const isRtl = computedDir === 'rtl';

    // Resolve logical to physical orientation
    // inline-start: in LTR is left (side), in RTL is right (side)
    // inline-end: in LTR is right (side), in RTL is left (side)
    let physicalPlacement: string = placement;
    if (placement === 'inline-start') {
      physicalPlacement = isRtl ? 'right' : 'left';
    } else if (placement === 'inline-end') {
      physicalPlacement = isRtl ? 'left' : 'right';
    }

    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const padding = 16; // 16px lateral gutter per UI kit spacing token

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
        left = triggerRect.right - surfaceRect.width;
      } else {
        left = triggerRect.left;
      }
    } else {
      // bottom
      top = triggerRect.bottom + offset;
      if (physicalPlacement.endsWith('center')) {
        left = triggerRect.left + (triggerRect.width - surfaceRect.width) / 2;
      } else if (physicalPlacement.endsWith('end')) {
        left = triggerRect.right - surfaceRect.width;
      } else {
        left = triggerRect.left;
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
  }, [placement, offset, autoFlip]);

  const contextValue = useMemo(
    () => ({
      open,
      setOpen,
      isControlled,
      controlledOpen,
      triggerRef,
      contentRef,
      surfaceRef,
      placement,
      offset,
      autoFlip,
      popoverId,
      role,
      popoverRole: initialRole,
      setRole,
      updatePosition,
      onOpenChange,
    }),
    [
      open,
      setOpen,
      isControlled,
      controlledOpen,
      placement,
      offset,
      autoFlip,
      popoverId,
      role,
      initialRole,
      updatePosition,
      onOpenChange,
    ],
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
    },
    [triggerRef],
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
      type="button"
      {...props}
      {...triggerAttributes}
      ref={composedRef}
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
}

export type PopoverContentRoleDialogProps = PopoverContentBaseProps & {
  /**
   * Non-modal dialog surface for interactive forms and settings.
   * Requires an accessible name via `aria-label` or `aria-labelledby`.
   */
  role: 'dialog';
} & (
  | { 'aria-label': string; 'aria-labelledby'?: string }
  | { 'aria-labelledby': string; 'aria-label'?: string }
);

export type PopoverContentGenericProps = PopoverContentBaseProps & {
  /**
   * Semantic role for the floating surface.
   * - `'region'`: Named landmark region.
   * - `'none'` / `undefined`: Generic floating disclosure (default).
   */
  role?: 'region' | 'none';
  'aria-label'?: string;
  'aria-labelledby'?: string;
};

export type PopoverContentProps =
  | PopoverContentRoleDialogProps
  | PopoverContentGenericProps;

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
    isControlled,
    controlledOpen,
    triggerRef,
    contentRef,
    surfaceRef,
    popoverId,
    popoverRole,
    setRole,
    updatePosition,
  } = usePopoverContext();

  const internalSurfaceRef = useRef<HTMLDivElement>(null);
  useImperativeHandle(forwardedRef, () => internalSurfaceRef.current as HTMLDivElement);

  const effectiveRole = role !== undefined ? role : popoverRole;

  // Validate accessible name for role="dialog"
  if (effectiveRole === 'dialog') {
    const hasAccessibleName =
      Boolean(ariaLabel?.trim()) ||
      Boolean(ariaLabelledby?.trim()) ||
      Boolean((props as Record<string, unknown>)['aria-label']) ||
      Boolean((props as Record<string, unknown>)['aria-labelledby']);

    if (!hasAccessibleName) {
      throw new Error(
        'PopoverContent: When role="dialog" is specified, a non-empty accessible name is required via `aria-label` or `aria-labelledby`.',
      );
    }
  }

  // Ref tracking controlled open prop and loop guard for async reconciliation
  const controlledOpenRef = useRef(controlledOpen);
  controlledOpenRef.current = controlledOpen;
  const reconcileAttemptsRef = useRef(0);
  const lastReconcileTimeRef = useRef(0);
  const isClosingRef = useRef(false);

  // Sync role to context so PopoverTrigger can conditionally attach aria-haspopup="dialog"
  useLayoutEffect(() => {
    setRole(effectiveRole);
  }, [effectiveRole, setRole]);

  const supportsNativePopover =
    typeof HTMLElement !== 'undefined' &&
    typeof HTMLElement.prototype.showPopover === 'function' &&
    typeof CSS !== 'undefined' &&
    typeof CSS.supports === 'function' &&
    CSS.supports('selector(:popover-open)');

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
          }
        } catch {
          // Native popover throw guard
        }
      }

      updatePosition();

      // Focus management: If initialFocusRef or role="dialog", focus the first interactive, enabled element
      if (initialFocusRef?.current && !isElementDisabled(initialFocusRef.current)) {
        initialFocusRef.current.focus();
      } else if (effectiveRole === 'dialog') {
        const surface = internalSurfaceRef.current;
        if (surface) {
          const focusTarget = findFirstFocusableElement(surface);
          if (focusTarget) {
            focusTarget.focus();
          } else {
            // Safe fallback when no focusable control exists: focus the dialog surface itself
            if (!surface.hasAttribute('tabindex')) {
              surface.setAttribute('tabindex', '-1');
            }
            surface.focus();
          }
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
    }
  }, [open, effectiveRole, initialFocusRef, contentRef, updatePosition, supportsNativePopover]);

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

    const content = contentRef.current;

    const handlePointerDown = (e: globalThis.PointerEvent) => {
      const surface = internalSurfaceRef.current;
      const trigger = triggerRef.current;
      const target = e.target as Node | null;

      if (!target) return;

      // Click is inside surface or trigger -> do not close
      if (surface?.contains(target) || trigger?.contains(target)) {
        return;
      }

      // If clicked element is a designated external toggle, let its click handler toggle state
      if (
        target instanceof Element &&
        (target.closest('[data-popover-toggle]') || target.closest('[data-popover-trigger]'))
      ) {
        return;
      }

      // Outside click: dismiss popover without stealing focus (prevent duplicate close notifications)
      if (isClosingRef.current) return;
      isClosingRef.current = true;
      setOpen(false);
    };

    const handleKeyDown = (e: globalThis.KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        if (!isClosingRef.current) {
          isClosingRef.current = true;
          setOpen(false);
        }
        // Restore focus to trigger on keyboard Escape
        triggerRef.current?.focus();
      }
    };

    // Native toggle event support with controlled-state reconciliation
    const handleNativeToggle = (e: Event) => {
      const toggleEvent = e as unknown as { newState?: string };
      if (toggleEvent.newState === 'closed') {
        if (open) {
          if (!isClosingRef.current) {
            isClosingRef.current = true;
            setOpen(false);
          }

          if (isControlled) {
            // Reconcile: If parent component rejects dismissal and still supplies open={true},
            // authoritatively re-assert open state in the top layer.
            queueMicrotask(() => {
              const currentContent = contentRef.current;
              if (!currentContent) return;

              // If parent kept controlled open={true}, reconcile top layer
              if (controlledOpenRef.current) {
                isClosingRef.current = false;
                const now = Date.now();
                if (now - lastReconcileTimeRef.current > 300) {
                  reconcileAttemptsRef.current = 0;
                }
                lastReconcileTimeRef.current = now;

                if (reconcileAttemptsRef.current >= 3) {
                  // Circuit breaker against ping-pong infinite loop when competing controlled popovers both reject closure
                  return;
                }
                reconcileAttemptsRef.current += 1;

                if (supportsNativePopover && !currentContent.matches(':popover-open')) {
                  try {
                    currentContent.showPopover();
                    updatePosition();
                  } catch {
                    // Safe guard against invocation errors
                  }
                }
              }
            });
          }
        }
      }
    };

    // Only attach manual pointerdown dismiss when native Popover light dismiss is not supported
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
  }, [open, setOpen, isControlled, triggerRef, contentRef, updatePosition, supportsNativePopover]);

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
      data-fallback={!supportsNativePopover ? 'true' : undefined}
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
  /**
   * Heading level element.
   * @default 'h3'
   */
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
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

export type PopoverCloseProps = ComponentPropsWithRef<'button'> & {
  /**
   * Accessible label for close button. Required when icon-only (no children).
   */
  closeLabel?: string;

  /**
   * Whether to delegate rendering to the immediate child element.
   */
  asChild?: boolean;
};

export const PopoverClose = forwardRef<HTMLButtonElement, PopoverCloseProps>(function PopoverClose(
  { asChild, closeLabel, className, children, onClick, ...props },
  forwardedRef,
) {
  const { setOpen, triggerRef } = usePopoverContext();

  // Enforce accessible name for icon-only close button
  if (!asChild && !children) {
    const hasAccessibleName =
      Boolean(closeLabel?.trim()) ||
      Boolean((props['aria-label'] as string | undefined)?.trim()) ||
      Boolean((props['aria-labelledby'] as string | undefined)?.trim());

    if (!hasAccessibleName) {
      throw new Error(
        'PopoverClose: Icon-only close button requires a valid caller-supplied accessible name via `closeLabel`, `aria-label`, or `aria-labelledby`.',
      );
    }
  }

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
    const childRef = getElementRef<HTMLButtonElement>(child);
    const composedRef = composeRefs(forwardedRef, childRef);

    return cloneElement(child, {
      ...props,
      ...childProps,
      ref: composedRef,
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
      ref={forwardedRef}
      className={cn(styles.closeButton, className)}
      onClick={handleClick}
      aria-label={closeLabel || (props['aria-label'] as string)}
    >
      {children || <Icon name="close" />}
    </button>
  );
});

PopoverClose.displayName = 'PopoverClose';
