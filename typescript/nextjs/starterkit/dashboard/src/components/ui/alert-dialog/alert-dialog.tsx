'use client';

import {
  type ComponentPropsWithRef,
  createContext,
  type ElementType,
  forwardRef,
  type MouseEvent,
  type ReactNode,
  type RefObject,
  useCallback,
  useContext,
  useEffect,
  useId,
  useImperativeHandle,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { cn } from '@/lib/cn';
import { getFocusableElements, isElementDisabled, trapTabKey } from '@/lib/focus-trap';
import { acquireBodyScrollLock } from '@/lib/scroll-lock';
import type { ControlSizingProps } from '../control-sizing';
import styles from './alert-dialog.module.css';

/* =============================================================================
   Context & Types
   ============================================================================= */

export type AlertDialogSize = 'sm' | 'md' | 'lg';

export type AlertDialogCloseReason = 'action' | 'cancel' | 'escape' | 'trigger' | 'native-close';

export interface AlertDialogOpenChangeDetails {
  reason: AlertDialogCloseReason;
}

interface AlertDialogContextValue {
  open: boolean;
  onOpenChange: (open: boolean, details: AlertDialogOpenChangeDetails) => void;
  defaultTitleId: string;
  defaultDescriptionId: string;
  activeTitleId: string | undefined;
  activeDescriptionId: string | undefined;
  registerTitle: (id: string) => () => void;
  registerDescription: (id: string) => () => void;
  cancelButtonRef: RefObject<HTMLElement | null>;
  triggerRef: RefObject<HTMLElement | null>;
}

const AlertDialogContext = createContext<AlertDialogContextValue | null>(null);

function useAlertDialogContext(componentName: string): AlertDialogContextValue {
  const context = useContext(AlertDialogContext);
  if (!context) {
    throw new Error(`<${componentName}> must be used within an <AlertDialog> container.`);
  }
  return context;
}

function resolveSafeTargetProps<T extends ElementType>(
  Component: T,
  target: string | undefined,
  rel: string | undefined,
) {
  if (target !== '_blank') {
    return { target, rel };
  }
  const tokens = new Set((rel ?? '').split(/\s+/).filter(Boolean));
  tokens.add('noopener');
  tokens.add('noreferrer');
  if (Component === 'a' || typeof Component === 'string') {
    return { target, rel: Array.from(tokens).join(' ') };
  }
  return { target, rel: Array.from(tokens).join(' ') };
}

/* =============================================================================
   AlertDialog Root Component
   ============================================================================= */

export interface AlertDialogProps {
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
  onOpenChange?: (open: boolean, details: AlertDialogOpenChangeDetails) => void;

  children: ReactNode;
}

export function AlertDialog({
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
  children,
}: AlertDialogProps) {
  const isControlled = controlledOpen !== undefined;
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
  const open = isControlled ? controlledOpen : uncontrolledOpen;

  const baseId = useId();
  const defaultTitleId = `alert-dialog-title-${baseId}`;
  const defaultDescriptionId = `alert-dialog-desc-${baseId}`;

  const [registeredTitles, setRegisteredTitles] = useState<string[]>([]);
  const [registeredDescriptions, setRegisteredDescriptions] = useState<string[]>([]);

  const registerTitle = useCallback((id: string) => {
    setRegisteredTitles((prev) => [...prev, id]);
    return () => {
      setRegisteredTitles((prev) => {
        const index = prev.indexOf(id);
        if (index === -1) return prev;
        return [...prev.slice(0, index), ...prev.slice(index + 1)];
      });
    };
  }, []);

  const registerDescription = useCallback((id: string) => {
    setRegisteredDescriptions((prev) => [...prev, id]);
    return () => {
      setRegisteredDescriptions((prev) => {
        const index = prev.indexOf(id);
        if (index === -1) return prev;
        return [...prev.slice(0, index), ...prev.slice(index + 1)];
      });
    };
  }, []);

  const cancelButtonRef = useRef<HTMLElement | null>(null);
  const triggerRef = useRef<HTMLElement | null>(null);

  const handleOpenChange = useCallback(
    (nextOpen: boolean, details: AlertDialogOpenChangeDetails) => {
      if (!isControlled) {
        setUncontrolledOpen(nextOpen);
      }
      onOpenChange?.(nextOpen, details);
    },
    [isControlled, onOpenChange],
  );

  const contextValue = useMemo<AlertDialogContextValue>(
    () => ({
      open,
      onOpenChange: handleOpenChange,
      defaultTitleId,
      defaultDescriptionId,
      activeTitleId: registeredTitles[0],
      activeDescriptionId: registeredDescriptions[0],
      registerTitle,
      registerDescription,
      cancelButtonRef,
      triggerRef,
    }),
    [
      open,
      handleOpenChange,
      defaultTitleId,
      defaultDescriptionId,
      registeredTitles,
      registeredDescriptions,
      registerTitle,
      registerDescription,
    ],
  );

  return <AlertDialogContext.Provider value={contextValue}>{children}</AlertDialogContext.Provider>;
}

AlertDialog.displayName = 'AlertDialog';

/* =============================================================================
   AlertDialogTrigger Component
   ============================================================================= */

export interface AlertDialogTriggerProps extends ComponentPropsWithRef<'button'> {
  as?: ElementType;
  variant?: string;
  size?: string;
  touchTarget?: ControlSizingProps['touchTarget'];
  href?: string;
  target?: string;
  rel?: string;
}

export const AlertDialogTrigger = forwardRef<HTMLButtonElement, AlertDialogTriggerProps>(
  function AlertDialogTrigger(
    {
      as: Component = 'button',
      type,
      disabled,
      target,
      rel,
      onClick,
      className,
      children,
      ...props
    },
    forwardedRef,
  ) {
    const { open, onOpenChange, triggerRef } = useAlertDialogContext('AlertDialogTrigger');
    const safeTargetProps = resolveSafeTargetProps(Component, target, rel);

    const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
      if (disabled || isElementDisabled(e.currentTarget)) {
        e.preventDefault();
        return;
      }
      onClick?.(e);
      if (!e.defaultPrevented) {
        onOpenChange(!open, { reason: 'trigger' });
      }
    };

    const handleRef = (node: HTMLButtonElement | null) => {
      triggerRef.current = node;
      if (typeof forwardedRef === 'function') {
        forwardedRef(node);
      } else if (forwardedRef) {
        forwardedRef.current = node;
      }
    };

    return (
      <Component
        ref={handleRef}
        type={Component === 'button' ? (type ?? 'button') : type}
        disabled={disabled}
        aria-haspopup="dialog"
        aria-expanded={open}
        className={className}
        onClick={handleClick}
        {...safeTargetProps}
        {...props}
      >
        {children}
      </Component>
    );
  },
);

AlertDialogTrigger.displayName = 'AlertDialogTrigger';

/* =============================================================================
   AlertDialogContent Component
   ============================================================================= */

export interface AlertDialogContentProps extends Omit<ComponentPropsWithRef<'dialog'>, 'open'> {
  /**
   * Maximum inline size scale.
   * @default 'md'
   */
  size?: AlertDialogSize;

  /**
   * Explicit element to receive initial focus when dialog opens.
   * If omitted, focus automatically targets the safe <AlertDialogCancel> button,
   * then falls back to the first focusable control inside the dialog.
   */
  initialFocusRef?: RefObject<HTMLElement | null>;

  /**
   * Optional element to restore focus to when dialog closes.
   * If omitted, restores to AlertDialogTrigger or the previously active element.
   */
  returnFocusRef?: RefObject<HTMLElement | null>;

  /**
   * Prevents Escape dismissal while a critical asynchronous action is in flight.
   * @default false
   */
  preventEscapeClose?: boolean;

  children: ReactNode;
}

export const AlertDialogContent = forwardRef<HTMLDialogElement, AlertDialogContentProps>(
  function AlertDialogContent(
    {
      size = 'md',
      initialFocusRef,
      returnFocusRef,
      preventEscapeClose = false,
      className,
      children,
      onKeyDown,
      onCancel,
      onClose,
      'aria-label': ariaLabel,
      'aria-labelledby': ariaLabelledByProp,
      'aria-describedby': ariaDescribedByProp,
      ...props
    },
    forwardedRef,
  ) {
    const { open, onOpenChange, activeTitleId, activeDescriptionId, cancelButtonRef, triggerRef } =
      useAlertDialogContext('AlertDialogContent');

    const internalRef = useRef<HTMLDialogElement>(null);
    useImperativeHandle(forwardedRef, () => internalRef.current as HTMLDialogElement);

    const previousActiveElementRef = useRef<HTMLElement | null>(null);
    const openRef = useRef(open);

    useLayoutEffect(() => {
      openRef.current = open;
    });

    // Synchronize native <dialog> with React controlled/uncontrolled state
    useLayoutEffect(() => {
      const dialog = internalRef.current;
      if (!dialog) return;

      if (open) {
        if (!dialog.open) {
          if (!returnFocusRef) {
            previousActiveElementRef.current = document.activeElement as HTMLElement | null;
          }
          dialog.showModal();

          // Safe Initial Focus Allocation Rule:
          // Focus goes to explicit initialFocusRef, then cancelButtonRef, then first interactive element.
          queueMicrotask(() => {
            if (!dialog.open) return;
            const candidate =
              initialFocusRef?.current ??
              cancelButtonRef.current ??
              getFocusableElements(dialog)[0];
            if (candidate && dialog.contains(candidate) && !isElementDisabled(candidate)) {
              candidate.focus();
            }
          });
        }
      } else if (dialog.open) {
        dialog.close();

        // Restore focus to returnFocusRef, triggerRef, or previous active element
        const target =
          returnFocusRef?.current ?? triggerRef.current ?? previousActiveElementRef.current;
        if (target && document.body.contains(target) && !isElementDisabled(target)) {
          target.focus();
        }
      }
    }, [open, initialFocusRef, returnFocusRef, cancelButtonRef, triggerRef]);

    // Lock background body scroll while the modal is open
    useEffect(() => {
      if (!open) return;
      const releaseScrollLock = acquireBodyScrollLock();
      return () => {
        releaseScrollLock();
      };
    }, [open]);

    // Safety unmount cleanup
    useEffect(() => {
      return () => {
        const dialog = internalRef.current;
        if (dialog?.open) {
          dialog.close();
        }
      };
    }, []);

    // Safe Escape key handling
    const handleCancel = (e: React.SyntheticEvent<HTMLDialogElement>) => {
      e.preventDefault();
      onCancel?.(e);
      if (preventEscapeClose) {
        return;
      }
      onOpenChange(false, { reason: 'escape' });
    };

    const handleClose = (e: React.SyntheticEvent<HTMLDialogElement>) => {
      onClose?.(e);
      if (open) {
        onOpenChange(false, { reason: 'native-close' });
        queueMicrotask(() => {
          const dialog = internalRef.current;
          if (dialog && openRef.current && !dialog.open) {
            dialog.showModal();
          }
        });
      }
    };

    // WAI-ARIA modal Tab loop guarantee across all browser engines
    const handleKeyDown = (e: React.KeyboardEvent<HTMLDialogElement>) => {
      onKeyDown?.(e);
      if (e.defaultPrevented) return;

      if (e.key === 'Tab') {
        const dialog = internalRef.current;
        if (dialog) trapTabKey(e, dialog);
      }
    };

    const computedLabelledBy = ariaLabelledByProp ?? (ariaLabel ? undefined : activeTitleId);
    const computedDescribedBy = ariaDescribedByProp ?? activeDescriptionId;

    return (
      <dialog
        ref={internalRef}
        role="alertdialog"
        aria-modal="true"
        aria-label={ariaLabel}
        aria-labelledby={computedLabelledBy}
        aria-describedby={computedDescribedBy}
        data-size={size}
        className={cn(styles.dialog, className)}
        onCancel={handleCancel}
        onClose={handleClose}
        onKeyDown={handleKeyDown}
        {...props}
      >
        <div className={styles.innerContainer}>{children}</div>
      </dialog>
    );
  },
);

AlertDialogContent.displayName = 'AlertDialogContent';

/* =============================================================================
   AlertDialogHeader Component
   ============================================================================= */

export interface AlertDialogHeaderProps extends ComponentPropsWithRef<'div'> {
  /**
   * Header and text horizontal alignment.
   * @default 'start'
   */
  align?: 'start' | 'center';

  /**
   * Whether to display a bottom separator rule dividing the header from the content/body.
   * @default false
   */
  separator?: boolean;
}

export const AlertDialogHeader = forwardRef<HTMLDivElement, AlertDialogHeaderProps>(
  function AlertDialogHeader(
    { align = 'start', separator = false, className, children, ...props },
    ref,
  ) {
    return (
      <div
        ref={ref}
        data-align={align}
        className={cn(
          styles.header,
          separator ? styles.headerWithSeparator : styles.headerNoSeparator,
          className,
        )}
        {...props}
      >
        {children}
      </div>
    );
  },
);

AlertDialogHeader.displayName = 'AlertDialogHeader';

/* =============================================================================
   AlertDialogMedia Component (Status Icon Badge)
   ============================================================================= */

export type AlertDialogMediaVariant = 'danger' | 'warning' | 'info' | 'default';

export interface AlertDialogMediaProps extends ComponentPropsWithRef<'div'> {
  variant?: AlertDialogMediaVariant;
}

export const AlertDialogMedia = forwardRef<HTMLDivElement, AlertDialogMediaProps>(
  function AlertDialogMedia(
    { variant = 'danger', 'aria-hidden': ariaHidden = true, className, children, ...props },
    ref,
  ) {
    return (
      <div
        ref={ref}
        data-variant={variant}
        aria-hidden={ariaHidden}
        className={cn(styles.media, className)}
        {...props}
      >
        {children}
      </div>
    );
  },
);

AlertDialogMedia.displayName = 'AlertDialogMedia';

/* =============================================================================
   AlertDialogBody Component (Optional Content Area)
   ============================================================================= */

export interface AlertDialogBodyProps extends ComponentPropsWithRef<'div'> {}

export const AlertDialogBody = forwardRef<HTMLDivElement, AlertDialogBodyProps>(
  function AlertDialogBody({ className, children, ...props }, ref) {
    return (
      <div ref={ref} className={cn(styles.body, className)} {...props}>
        {children}
      </div>
    );
  },
);

AlertDialogBody.displayName = 'AlertDialogBody';

/* =============================================================================
   AlertDialogTitle Component
   ============================================================================= */

export interface AlertDialogTitleProps extends ComponentPropsWithRef<'h2'> {
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
}

export const AlertDialogTitle = forwardRef<HTMLHeadingElement, AlertDialogTitleProps>(
  function AlertDialogTitle(
    { as: Component = 'h2', id: explicitId, className, children, ...props },
    ref,
  ) {
    const context = useContext(AlertDialogContext);
    const fallbackId = useId();
    const id = explicitId ?? context?.defaultTitleId ?? `alert-dialog-title-${fallbackId}`;
    const registerTitle = context?.registerTitle;

    useEffect(() => {
      return registerTitle?.(id);
    }, [registerTitle, id]);

    return (
      <Component ref={ref} id={id} className={cn(styles.title, className)} {...props}>
        {children}
      </Component>
    );
  },
);

AlertDialogTitle.displayName = 'AlertDialogTitle';

/* =============================================================================
   AlertDialogDescription Component
   ============================================================================= */

export interface AlertDialogDescriptionProps extends ComponentPropsWithRef<'p'> {
  as?: ElementType;
}

export const AlertDialogDescription = forwardRef<HTMLParagraphElement, AlertDialogDescriptionProps>(
  function AlertDialogDescription(
    { as: Component = 'p', id: explicitId, className, children, ...props },
    ref,
  ) {
    const context = useContext(AlertDialogContext);
    const fallbackId = useId();
    const id = explicitId ?? context?.defaultDescriptionId ?? `alert-dialog-desc-${fallbackId}`;
    const registerDescription = context?.registerDescription;

    useEffect(() => {
      return registerDescription?.(id);
    }, [registerDescription, id]);

    return (
      <Component ref={ref} id={id} className={cn(styles.description, className)} {...props}>
        {children}
      </Component>
    );
  },
);

AlertDialogDescription.displayName = 'AlertDialogDescription';

/* =============================================================================
   AlertDialogFooter Component
   ============================================================================= */

export type AlertDialogFooterLayout = 'end' | 'split' | 'stacked' | 'between' | 'center';
export type AlertDialogFooterBackground = 'seamless' | 'docked';

export interface AlertDialogFooterProps extends ComponentPropsWithRef<'div'> {
  /**
   * Action button layout configuration.
   * 'split' creates equal 50/50 full-width buttons.
   * @default 'end'
   */
  layout?: AlertDialogFooterLayout;

  /**
   * Footer background treatment.
   * 'seamless': continuous transparent surface with dialog body (no two-tone block).
   * 'docked': distinct surface step for pinned trays.
   * @default 'seamless'
   */
  background?: AlertDialogFooterBackground;

  /**
   * Whether to display a top separator rule dividing the footer from adjacent content.
   * Defaults to `false` when `background="seamless"` and `true` when `background="docked"`.
   */
  separator?: boolean;
}

export const AlertDialogFooter = forwardRef<HTMLDivElement, AlertDialogFooterProps>(
  function AlertDialogFooter(
    { layout = 'end', background = 'seamless', separator, className, children, ...props },
    ref,
  ) {
    const resolvedSeparator = separator ?? background === 'docked';
    const layoutClass =
      layout === 'split'
        ? styles.footerLayoutSplit
        : layout === 'stacked'
          ? styles.footerLayoutStacked
          : layout === 'between'
            ? styles.footerLayoutBetween
            : layout === 'center'
              ? styles.footerLayoutCenter
              : styles.footerLayoutEnd;

    const bgClass = background === 'docked' ? styles.footerDocked : styles.footerSeamless;

    return (
      <div
        ref={ref}
        className={cn(
          styles.footer,
          bgClass,
          resolvedSeparator ? styles.footerWithSeparator : styles.footerNoSeparator,
          layoutClass,
          className,
        )}
        data-layout={layout}
        data-background={background}
        data-separator={resolvedSeparator ? 'true' : 'false'}
        {...props}
      >
        {children}
      </div>
    );
  },
);

AlertDialogFooter.displayName = 'AlertDialogFooter';

/* =============================================================================
   AlertDialogAction Component
   ============================================================================= */

export interface AlertDialogActionProps
  extends Omit<ComponentPropsWithRef<'button'>, 'size'>,
    ControlSizingProps {
  as?: ElementType;
  /**
   * Action visual presentation style.
   * @default 'danger'
   */
  variant?: 'danger' | 'primary' | 'secondary';
  href?: string;
  target?: string;
  rel?: string;
}

export const AlertDialogAction = forwardRef<HTMLButtonElement, AlertDialogActionProps>(
  function AlertDialogAction(
    {
      as: Component = 'button',
      variant = 'danger',
      size,
      touchTarget = 'auto',
      type,
      disabled,
      target,
      rel,
      onClick,
      className,
      children,
      ...props
    },
    ref,
  ) {
    const context = useContext(AlertDialogContext);
    const safeTargetProps = resolveSafeTargetProps(Component, target, rel);

    const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
      if (disabled || isElementDisabled(e.currentTarget)) {
        e.preventDefault();
        return;
      }
      onClick?.(e);
      if (!e.defaultPrevented) {
        context?.onOpenChange(false, { reason: 'action' });
      }
    };

    return (
      <Component
        ref={ref}
        type={Component === 'button' ? (type ?? 'button') : type}
        disabled={disabled}
        data-variant={variant}
        data-size={size}
        data-touch-target={touchTarget}
        className={cn(styles.actionButton, styles[`action_${variant}`], className)}
        onClick={handleClick}
        {...safeTargetProps}
        {...props}
      >
        {children}
      </Component>
    );
  },
);

AlertDialogAction.displayName = 'AlertDialogAction';

/* =============================================================================
   AlertDialogCancel Component
   ============================================================================= */

export interface AlertDialogCancelProps
  extends Omit<ComponentPropsWithRef<'button'>, 'size'>,
    ControlSizingProps {
  as?: ElementType;
  href?: string;
  target?: string;
  rel?: string;
}

export const AlertDialogCancel = forwardRef<HTMLButtonElement, AlertDialogCancelProps>(
  function AlertDialogCancel(
    {
      as: Component = 'button',
      size,
      touchTarget = 'auto',
      type,
      disabled,
      target,
      rel,
      onClick,
      className,
      children,
      ...props
    },
    forwardedRef,
  ) {
    const context = useContext(AlertDialogContext);
    const safeTargetProps = resolveSafeTargetProps(Component, target, rel);

    const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
      if (disabled || isElementDisabled(e.currentTarget)) {
        e.preventDefault();
        return;
      }
      onClick?.(e);
      if (!e.defaultPrevented) {
        context?.onOpenChange(false, { reason: 'cancel' });
      }
    };

    const handleRef = (node: HTMLButtonElement | null) => {
      if (context) {
        context.cancelButtonRef.current = node;
      }
      if (typeof forwardedRef === 'function') {
        forwardedRef(node);
      } else if (forwardedRef) {
        forwardedRef.current = node;
      }
    };

    return (
      <Component
        ref={handleRef}
        type={Component === 'button' ? (type ?? 'button') : type}
        disabled={disabled}
        data-size={size}
        data-touch-target={touchTarget}
        className={cn(styles.cancelButton, className)}
        onClick={handleClick}
        {...safeTargetProps}
        {...props}
      >
        {children}
      </Component>
    );
  },
);

AlertDialogCancel.displayName = 'AlertDialogCancel';
