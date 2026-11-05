'use client';

import React, {
  cloneElement,
  forwardRef,
  isValidElement,
  useCallback,
  useEffect,
  useId,
  useImperativeHandle,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactElement,
  type ReactNode,
  type Ref,
} from 'react';
import { cn } from '@/lib/cn';
import styles from './tooltip.module.css';

export type TooltipPlacement = 'top' | 'bottom' | 'left' | 'right';
export type TooltipVariant = 'contrast' | 'subtle';

export interface TooltipProps {
  /** The content displayed inside the floating tooltip bubble */
  content: ReactNode;

  /** The single interactive trigger element (Button, Link, Icon, etc.) */
  children: ReactElement;

  /** Preferred placement relative to the trigger. Defaults to 'top' */
  placement?: TooltipPlacement;

  /** Whether to render a directional arrow notch. Defaults to true */
  arrow?: boolean;

  /** Warm-up hover delay in milliseconds before opening. Defaults to 250ms */
  delayDuration?: number;

  /** Grace period in milliseconds for instant opening of adjacent tooltips. Defaults to 200ms */
  skipDelayDuration?: number;

  /** Distance in pixels between trigger and tooltip bubble. Defaults to 6px */
  sideOffset?: number;

  /** Visual variant: 'contrast' (inverted dark bubble) or 'subtle' (raised surface with border). Defaults to 'contrast' */
  variant?: TooltipVariant;

  /** Optional keyboard shortcut string rendered as an accessible <kbd> tag (e.g. '⌘K', 'Esc') */
  shortcut?: string;

  /** Controlled open state */
  open?: boolean;

  /** Default open state for uncontrolled usage */
  defaultOpen?: boolean;

  /** Callback fired when open state changes */
  onOpenChange?: (open: boolean) => void;

  /** Disables the tooltip from showing */
  disabled?: boolean;

  /** Optional className for the tooltip floating bubble */
  className?: string;
}

// Global intent timers to manage grace-period skip-delay across adjacent tooltips
const globalTooltipState: {
  activeTimer: ReturnType<typeof setTimeout> | null;
  lastCloseTime: number;
} = {
  activeTimer: null,
  lastCloseTime: 0,
};

export function _resetGlobalTooltipStateForTesting() {
  if (globalTooltipState.activeTimer) {
    clearTimeout(globalTooltipState.activeTimer);
    globalTooltipState.activeTimer = null;
  }
  globalTooltipState.lastCloseTime = 0;
}

/**
 * Utility to compose refs safely.
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

export const Tooltip = forwardRef<HTMLDivElement, TooltipProps>(function Tooltip(
  {
    content,
    children,
    placement = 'top',
    arrow = true,
    delayDuration = 250,
    skipDelayDuration = 200,
    sideOffset = 6,
    variant = 'contrast',
    shortcut,
    open: controlledOpen,
    defaultOpen = false,
    onOpenChange,
    disabled = false,
    className,
  },
  forwardedRef,
) {
  const isControlled = controlledOpen !== undefined;
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
  const isOpen = isControlled ? controlledOpen : uncontrolledOpen;

  const [resolvedPlacement, setResolvedPlacement] = useState<TooltipPlacement>(placement);

  const generatedId = useId();
  const tooltipId = `tooltip-${generatedId}`;

  const triggerRef = useRef<HTMLElement | null>(null);
  const tooltipRef = useRef<HTMLDivElement | null>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout>>(null);

  useImperativeHandle(forwardedRef, () => tooltipRef.current as HTMLDivElement);

  const setOpen = useCallback(
    (nextOpen: boolean) => {
      if (!isControlled) {
        setUncontrolledOpen(nextOpen);
      }
      onOpenChange?.(nextOpen);
    },
    [isControlled, onOpenChange],
  );

  // Viewport-aware collision detection & positioning
  const updatePosition = useCallback(() => {
    const trigger = triggerRef.current;
    const tooltip = tooltipRef.current;
    if (!trigger || !tooltip) return;

    const triggerRect = trigger.getBoundingClientRect();
    const tooltipRect = tooltip.getBoundingClientRect();

    const isRtl =
      typeof window !== 'undefined'
        ? window.getComputedStyle(trigger).direction === 'rtl'
        : false;

    let effectivePlacement: TooltipPlacement = placement;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const gutter = 8;
    const offset = sideOffset;

    // Viewport boundary collision check & flip
    if (effectivePlacement === 'top') {
      if (
        triggerRect.top - tooltipRect.height - offset < gutter &&
        viewportHeight - triggerRect.bottom - tooltipRect.height - offset >= gutter
      ) {
        effectivePlacement = 'bottom';
      }
    } else if (effectivePlacement === 'bottom') {
      if (
        viewportHeight - triggerRect.bottom - tooltipRect.height - offset < gutter &&
        triggerRect.top - tooltipRect.height - offset >= gutter
      ) {
        effectivePlacement = 'top';
      }
    } else if (effectivePlacement === 'left') {
      const spaceLeft = isRtl ? viewportWidth - triggerRect.right : triggerRect.left;
      if (spaceLeft - tooltipRect.width - offset < gutter) {
        effectivePlacement = 'right';
      }
    } else if (effectivePlacement === 'right') {
      const spaceRight = isRtl ? triggerRect.left : viewportWidth - triggerRect.right;
      if (spaceRight - tooltipRect.width - offset < gutter) {
        effectivePlacement = 'left';
      }
    }

    let top = 0;
    let left = 0;

    if (effectivePlacement === 'top') {
      top = triggerRect.top - tooltipRect.height - offset;
      left = triggerRect.left + (triggerRect.width - tooltipRect.width) / 2;
    } else if (effectivePlacement === 'bottom') {
      top = triggerRect.bottom + offset;
      left = triggerRect.left + (triggerRect.width - tooltipRect.width) / 2;
    } else if (effectivePlacement === 'left') {
      top = triggerRect.top + (triggerRect.height - tooltipRect.height) / 2;
      left = isRtl
        ? triggerRect.right + offset
        : triggerRect.left - tooltipRect.width - offset;
    } else if (effectivePlacement === 'right') {
      top = triggerRect.top + (triggerRect.height - tooltipRect.height) / 2;
      left = isRtl
        ? triggerRect.left - tooltipRect.width - offset
        : triggerRect.right + offset;
    }

    // Gutter clamping within viewport
    left = Math.max(gutter, Math.min(left, viewportWidth - tooltipRect.width - gutter));
    top = Math.max(gutter, Math.min(top, viewportHeight - tooltipRect.height - gutter));

    setResolvedPlacement(effectivePlacement);
    tooltip.style.top = `${Math.round(top)}px`;
    tooltip.style.left = `${Math.round(left)}px`;
  }, [placement, sideOffset]);

  // Recalculate on scroll, resize, or open
  useEffect(() => {
    if (!isOpen) return;

    updatePosition();
    const handleScrollOrResize = () => updatePosition();

    window.addEventListener('scroll', handleScrollOrResize, { capture: true, passive: true });
    window.addEventListener('resize', handleScrollOrResize, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScrollOrResize, { capture: true });
      window.removeEventListener('resize', handleScrollOrResize);
    };
  }, [isOpen, updatePosition]);

  // Escape keydown dismissal (WCAG 1.4.13 Dismissible)
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: globalThis.KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        setOpen(false);
        globalTooltipState.lastCloseTime = Date.now();
      }
    };

    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [isOpen, setOpen]);

  // Pointer event handlers with grace-period skip delay
  const handlePointerEnter = useCallback(() => {
    if (disabled) return;
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }

    const now = Date.now();
    const isWithinGracePeriod = now - globalTooltipState.lastCloseTime < skipDelayDuration;
    const delay = isWithinGracePeriod ? 0 : delayDuration;

    if (globalTooltipState.activeTimer) {
      clearTimeout(globalTooltipState.activeTimer);
    }

    if (delay === 0) {
      setOpen(true);
    } else {
      globalTooltipState.activeTimer = setTimeout(() => {
        setOpen(true);
      }, delay);
    }
  }, [disabled, delayDuration, skipDelayDuration, setOpen]);

  const handlePointerLeave = useCallback(() => {
    if (globalTooltipState.activeTimer) {
      clearTimeout(globalTooltipState.activeTimer);
      globalTooltipState.activeTimer = null;
    }

    // 100ms tolerance allows pointer to cross into the tooltip bubble (WCAG 1.4.13 Hoverable)
    closeTimerRef.current = setTimeout(() => {
      setOpen(false);
      globalTooltipState.lastCloseTime = Date.now();
    }, 100);
  }, [setOpen]);

  // Keyboard focus: shows immediately with zero delay
  const handleFocus = useCallback(() => {
    if (disabled) return;
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    setOpen(true);
  }, [disabled, setOpen]);

  const handleBlur = useCallback(() => {
    setOpen(false);
    globalTooltipState.lastCloseTime = Date.now();
  }, [setOpen]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
      if (globalTooltipState.activeTimer) clearTimeout(globalTooltipState.activeTimer);
    };
  }, []);

  if (!isValidElement(children)) {
    return children;
  }

  // Clone trigger element and inject accessibility attributes and event listeners
  const childProps = (children.props ?? {}) as Record<string, any>;
  const existingAriaDescribedBy = childProps['aria-describedby'];
  const mergedAriaDescribedBy = isOpen
    ? existingAriaDescribedBy
      ? `${existingAriaDescribedBy} ${tooltipId}`
      : tooltipId
    : existingAriaDescribedBy;

  const childRef = (children as any).ref;
  const triggerElement = cloneElement(children as ReactElement<any>, {
    ref: composeRefs(triggerRef, childRef),
    'aria-describedby': mergedAriaDescribedBy,
    onPointerEnter: (e: any) => {
      childProps.onPointerEnter?.(e);
      handlePointerEnter();
    },
    onPointerLeave: (e: any) => {
      childProps.onPointerLeave?.(e);
      handlePointerLeave();
    },
    onFocus: (e: any) => {
      childProps.onFocus?.(e);
      handleFocus();
    },
    onBlur: (e: any) => {
      childProps.onBlur?.(e);
      handleBlur();
    },
    onKeyDown: (e: KeyboardEvent<any>) => {
      childProps.onKeyDown?.(e);
      if (e.key === 'Escape' && isOpen) {
        e.stopPropagation();
        setOpen(false);
      }
    },
  });

  return (
    <>
      {triggerElement}
      {isOpen && !disabled && (
        <div
          ref={tooltipRef}
          id={tooltipId}
          role="tooltip"
          data-placement={resolvedPlacement}
          data-variant={variant}
          className={cn(
            styles.tooltip,
            variant === 'subtle' ? styles.variantSubtle : styles.variantContrast,
            className,
          )}
          onPointerEnter={() => {
            if (closeTimerRef.current) {
              clearTimeout(closeTimerRef.current);
              closeTimerRef.current = null;
            }
          }}
          onPointerLeave={handlePointerLeave}
        >
          <span className={styles.content}>{content}</span>
          {shortcut && <kbd className={styles.shortcut}>{shortcut}</kbd>}
          {arrow && <span className={styles.arrow} aria-hidden="true" />}
        </div>
      )}
    </>
  );
});

Tooltip.displayName = 'Tooltip';
