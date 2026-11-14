'use client';

import {
  type ComponentPropsWithoutRef,
  type KeyboardEvent,
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
import styles from './hover-card.module.css';

export type HoverCardPlacement = 'top' | 'bottom' | 'start' | 'end';
export type HoverCardAlign = 'start' | 'center' | 'end';

interface HoverCardContextValue {
  open: boolean;
  contentId: string;
  triggerId: string;
  placement: HoverCardPlacement;
  align: HoverCardAlign;
  handleTriggerEnter: () => void;
  handleTriggerLeave: () => void;
  handleContentEnter: () => void;
  handleContentLeave: () => void;
  closeImmediately: () => void;
}

const HoverCardContext = createContext<HoverCardContextValue | null>(null);

function useHoverCardContext() {
  const ctx = useContext(HoverCardContext);
  if (!ctx) {
    throw new Error('HoverCard compound components must be rendered inside <HoverCard>');
  }
  return ctx;
}

export interface HoverCardProps extends ComponentPropsWithoutRef<'div'> {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  openDelay?: number;
  closeDelay?: number;
  placement?: HoverCardPlacement;
  align?: HoverCardAlign;
  children: ReactNode;
  className?: string;
  'data-testid'?: string;
}

export const HoverCard = forwardRef<HTMLDivElement, HoverCardProps>(function HoverCard(
  {
    open: controlledOpen,
    defaultOpen = false,
    onOpenChange,
    openDelay = 200,
    closeDelay = 200,
    placement = 'bottom',
    align = 'center',
    children,
    className,
    'data-testid': testId,
    ...rest
  },
  ref,
) {
  const isControlled = controlledOpen !== undefined;
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
  const isOpen = isControlled ? controlledOpen : uncontrolledOpen;

  const contentId = useId();
  const triggerId = useId();
  const openTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimers = useCallback(() => {
    if (openTimerRef.current) {
      clearTimeout(openTimerRef.current);
      openTimerRef.current = null;
    }
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  }, []);

  const setOpenState = useCallback(
    (nextOpen: boolean) => {
      if (!isControlled) {
        setUncontrolledOpen(nextOpen);
      }
      onOpenChange?.(nextOpen);
    },
    [isControlled, onOpenChange],
  );

  const handleTriggerEnter = useCallback(() => {
    clearTimers();
    if (isOpen) return;

    if (openDelay <= 0) {
      setOpenState(true);
    } else {
      openTimerRef.current = setTimeout(() => {
        setOpenState(true);
      }, openDelay);
    }
  }, [clearTimers, isOpen, openDelay, setOpenState]);

  const handleTriggerLeave = useCallback(() => {
    clearTimers();
    if (!isOpen) return;

    if (closeDelay <= 0) {
      setOpenState(false);
    } else {
      closeTimerRef.current = setTimeout(() => {
        setOpenState(false);
      }, closeDelay);
    }
  }, [clearTimers, closeDelay, isOpen, setOpenState]);

  const handleContentEnter = useCallback(() => {
    clearTimers();
  }, [clearTimers]);

  const handleContentLeave = useCallback(() => {
    handleTriggerLeave();
  }, [handleTriggerLeave]);

  const closeImmediately = useCallback(() => {
    clearTimers();
    setOpenState(false);
  }, [clearTimers, setOpenState]);

  useEffect(() => {
    return () => {
      clearTimers();
    };
  }, [clearTimers]);

  return (
    <HoverCardContext.Provider
      value={{
        open: isOpen,
        contentId,
        triggerId,
        placement,
        align,
        handleTriggerEnter,
        handleTriggerLeave,
        handleContentEnter,
        handleContentLeave,
        closeImmediately,
      }}
    >
      <div
        ref={ref}
        data-state={isOpen ? 'open' : 'closed'}
        className={cn(styles.root, className)}
        data-testid={testId}
        {...rest}
      >
        {children}
      </div>
    </HoverCardContext.Provider>
  );
});

HoverCard.displayName = 'HoverCard';

export interface HoverCardTriggerProps extends ComponentPropsWithoutRef<'button'> {
  children: ReactNode;
  className?: string;
  'data-testid'?: string;
}

export const HoverCardTrigger = forwardRef<HTMLButtonElement, HoverCardTriggerProps>(
  function HoverCardTrigger(
    {
      children,
      className,
      onPointerEnter,
      onPointerLeave,
      onFocus,
      onBlur,
      onKeyDown,
      'data-testid': testId,
      ...rest
    },
    ref,
  ) {
    const { open, contentId, triggerId, handleTriggerEnter, handleTriggerLeave, closeImmediately } =
      useHoverCardContext();

    const handleKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
      if (e.key === 'Escape' && open) {
        e.preventDefault();
        closeImmediately();
      }
      onKeyDown?.(e);
    };

    return (
      <button
        ref={ref}
        id={rest.id ?? triggerId}
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={contentId}
        data-state={open ? 'open' : 'closed'}
        className={cn(styles.trigger, className)}
        onPointerEnter={(e) => {
          handleTriggerEnter();
          onPointerEnter?.(e);
        }}
        onPointerLeave={(e) => {
          handleTriggerLeave();
          onPointerLeave?.(e);
        }}
        onFocus={(e) => {
          handleTriggerEnter();
          onFocus?.(e);
        }}
        onBlur={(e) => {
          handleTriggerLeave();
          onBlur?.(e);
        }}
        onKeyDown={handleKeyDown}
        data-testid={testId}
        {...rest}
      >
        {children}
      </button>
    );
  },
);

HoverCardTrigger.displayName = 'HoverCardTrigger';

export interface HoverCardContentProps extends ComponentPropsWithoutRef<'div'> {
  children: ReactNode;
  className?: string;
  'data-testid'?: string;
  'aria-label'?: string;
  'aria-labelledby'?: string;
}

export const HoverCardContent = forwardRef<HTMLDivElement, HoverCardContentProps>(
  function HoverCardContent(
    {
      children,
      className,
      onPointerEnter,
      onPointerLeave,
      'data-testid': testId,
      'aria-label': ariaLabel,
      'aria-labelledby': ariaLabelledByProp,
      ...rest
    },
    ref,
  ) {
    const { open, contentId, triggerId, placement, align, handleContentEnter, handleContentLeave } =
      useHoverCardContext();

    const computedLabelledBy = ariaLabel ? undefined : (ariaLabelledByProp ?? triggerId);

    return (
      <div
        ref={ref}
        id={contentId}
        role="dialog"
        aria-modal="false"
        aria-label={ariaLabel}
        aria-labelledby={computedLabelledBy}
        data-state={open ? 'open' : 'closed'}
        className={cn(
          styles.content,
          styles[`placement_${placement}`],
          styles[`align_${align}`],
          className,
        )}
        onPointerEnter={(e) => {
          handleContentEnter();
          onPointerEnter?.(e);
        }}
        onPointerLeave={(e) => {
          handleContentLeave();
          onPointerLeave?.(e);
        }}
        data-testid={testId}
        {...rest}
      >
        {children}
      </div>
    );
  },
);

HoverCardContent.displayName = 'HoverCardContent';
