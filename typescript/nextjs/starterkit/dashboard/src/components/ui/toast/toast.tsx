'use client';

import {
  type ComponentPropsWithRef,
  createContext,
  type FocusEvent,
  type MouseEvent,
  type ReactNode,
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
import styles from './toast.module.css';

export type ToastVariant = 'info' | 'success' | 'warning' | 'danger';
export type ToastPosition =
  | 'top-end'
  | 'top-start'
  | 'bottom-end'
  | 'bottom-start'
  | 'top-center'
  | 'bottom-center';

/* =============================================================================
   Toast Viewport
   ============================================================================= */

export interface ToastViewportProps extends ComponentPropsWithRef<'ol'> {
  position?: ToastPosition;
  /** Accessible landmark name applied to aria-label on the notifications region */
  label?: string;
}

const POSITION_CLASS: Record<ToastPosition, string> = {
  'top-start': styles.pos_top_start,
  'top-center': styles.pos_top_center,
  'top-end': styles.pos_top_end,
  'bottom-start': styles.pos_bottom_start,
  'bottom-center': styles.pos_bottom_center,
  'bottom-end': styles.pos_bottom_end,
};

export function ToastViewport({
  position = 'bottom-end',
  label,
  className,
  children,
  role,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
  ref,
  ...props
}: ToastViewportProps) {
  const accessibleLabel = label ?? ariaLabel;
  const resolvedRole = role ?? (accessibleLabel || ariaLabelledBy ? 'region' : undefined);

  return (
    <ol
      {...props}
      ref={ref}
      tabIndex={-1}
      role={resolvedRole}
      aria-label={accessibleLabel}
      aria-labelledby={ariaLabelledBy}
      data-position={position}
      className={cn(styles.viewport, POSITION_CLASS[position], className)}
    >
      {children}
    </ol>
  );
}

/* =============================================================================
   Toast Context
   ============================================================================= */

interface ToastContextValue {
  titleId: string;
  descriptionId: string;
  variant: ToastVariant;
  onDismiss?: () => void;
  registerTitle: (customId?: string) => () => void;
  registerDescription: (customId?: string) => () => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

function useToastContext(componentName: string): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error(`<${componentName}> must be used within a <Toast> component.`);
  }
  return context;
}

/* =============================================================================
   Toast Root
   ============================================================================= */

export interface ToastBaseProps extends Omit<ComponentPropsWithRef<'li'>, 'children'> {
  variant?: ToastVariant;
  duration?: number;
  onDismiss?: () => void;
  icon?: ReactNode | boolean;
  children?: ReactNode;
}

export type ToastCloseControlProps =
  | { showCloseButton: true; closeLabel: string }
  | { showCloseButton?: false; closeLabel?: string };

export type ToastProps = ToastBaseProps & ToastCloseControlProps;

export function Toast({
  variant = 'info',
  duration = 5000,
  onDismiss,
  showCloseButton,
  closeLabel,
  icon = true,
  className,
  children,
  onMouseEnter,
  onMouseLeave,
  onFocus,
  onBlur,
  role: roleProp,
  'aria-live': ariaLiveProp,
  ref,
  ...props
}: ToastProps) {
  const generatedTitleId = useId();
  const generatedDescriptionId = useId();

  const [registeredTitleId, setRegisteredTitleId] = useState<string | null>(null);
  const [registeredDescriptionId, setRegisteredDescriptionId] = useState<string | null>(null);

  const registerTitle = useCallback(
    (customId?: string) => {
      const resolvedId = customId ?? generatedTitleId;
      setRegisteredTitleId(resolvedId);
      return () => {
        setRegisteredTitleId((current) => (current === resolvedId ? null : current));
      };
    },
    [generatedTitleId],
  );

  const registerDescription = useCallback(
    (customId?: string) => {
      const resolvedId = customId ?? generatedDescriptionId;
      setRegisteredDescriptionId(resolvedId);
      return () => {
        setRegisteredDescriptionId((current) => (current === resolvedId ? null : current));
      };
    },
    [generatedDescriptionId],
  );

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const remainingTimeRef = useRef(duration);
  const startTimeRef = useRef<number>(Date.now());
  const isPausedRef = useRef(false);
  const latestOnDismissRef = useRef(onDismiss);
  latestOnDismissRef.current = onDismiss;

  const hasDismissHandler = Boolean(onDismiss);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const startTimer = useCallback(() => {
    clearTimer();
    if (duration <= 0 || !hasDismissHandler || remainingTimeRef.current <= 0) {
      return;
    }
    startTimeRef.current = Date.now();
    timerRef.current = setTimeout(() => {
      timerRef.current = null;
      remainingTimeRef.current = 0;
      latestOnDismissRef.current?.();
    }, remainingTimeRef.current);
  }, [clearTimer, duration, hasDismissHandler]);

  const pauseTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimer();
      const elapsed = Date.now() - startTimeRef.current;
      remainingTimeRef.current = Math.max(0, remainingTimeRef.current - elapsed);
      isPausedRef.current = true;
    }
  }, [clearTimer]);

  const resumeTimer = useCallback(() => {
    if (isPausedRef.current && remainingTimeRef.current > 0) {
      isPausedRef.current = false;
      startTimer();
    }
  }, [startTimer]);

  useEffect(() => {
    isPausedRef.current = false;
    remainingTimeRef.current = duration;
    startTimer();
    return clearTimer;
  }, [clearTimer, duration, startTimer]);

  const handleMouseEnter = (e: MouseEvent<HTMLLIElement>) => {
    pauseTimer();
    onMouseEnter?.(e);
  };

  const handleMouseLeave = (e: MouseEvent<HTMLLIElement>) => {
    resumeTimer();
    onMouseLeave?.(e);
  };

  const handleFocus = (e: FocusEvent<HTMLLIElement>) => {
    pauseTimer();
    onFocus?.(e);
  };

  const handleBlur = (e: FocusEvent<HTMLLIElement>) => {
    onBlur?.(e);
    if (!e.currentTarget.contains(e.relatedTarget)) {
      resumeTimer();
    }
  };

  const isAlert = variant === 'danger' || variant === 'warning';
  const role = roleProp ?? (isAlert ? 'alert' : 'status');
  const ariaLive = ariaLiveProp ?? (isAlert ? 'assertive' : 'polite');

  const shouldRenderCloseButton =
    showCloseButton === false ? false : Boolean(closeLabel && closeLabel.trim().length > 0);

  const defaultIcon =
    variant === 'success' ? (
      <Icon name="success" size={18} />
    ) : variant === 'warning' ? (
      <Icon name="warning" size={18} />
    ) : variant === 'danger' ? (
      <Icon name="danger" size={18} />
    ) : (
      <Icon name="info" size={18} />
    );

  return (
    <ToastContext.Provider
      value={{
        titleId: generatedTitleId,
        descriptionId: generatedDescriptionId,
        variant,
        onDismiss,
        registerTitle,
        registerDescription,
      }}
    >
      <li
        {...props}
        ref={ref}
        role={role}
        aria-live={ariaLive}
        aria-atomic="true"
        aria-labelledby={props['aria-labelledby'] ?? registeredTitleId ?? undefined}
        aria-describedby={props['aria-describedby'] ?? registeredDescriptionId ?? undefined}
        data-variant={variant}
        className={cn(styles.toast, styles[`variant_${variant}`], className)}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onFocus={handleFocus}
        onBlur={handleBlur}
      >
        {icon !== false && (
          <div className={cn(styles.iconWrapper, styles[`icon_${variant}`])} aria-hidden="true">
            {typeof icon === 'boolean' ? defaultIcon : icon}
          </div>
        )}

        <div className={styles.content}>{children}</div>

        {shouldRenderCloseButton && closeLabel && <ToastCloseButton aria-label={closeLabel} />}
      </li>
    </ToastContext.Provider>
  );
}

/* =============================================================================
   Toast Compartments
   ============================================================================= */

export interface ToastTitleProps extends ComponentPropsWithRef<'p'> {
  as?: 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'div';
}

export function ToastTitle({
  as: Component = 'p',
  id,
  className,
  children,
  ref,
  ...props
}: ToastTitleProps) {
  const { titleId, registerTitle } = useToastContext('ToastTitle');

  useLayoutEffect(() => registerTitle(id), [id, registerTitle]);

  return (
    <Component
      {...props}
      ref={ref as never}
      id={id ?? titleId}
      className={cn(styles.title, className)}
    >
      {children}
    </Component>
  );
}

export type ToastDescriptionProps = ComponentPropsWithRef<'p'>;

export function ToastDescription({
  id,
  className,
  children,
  ref,
  ...props
}: ToastDescriptionProps) {
  const { descriptionId, registerDescription } = useToastContext('ToastDescription');

  useLayoutEffect(() => registerDescription(id), [id, registerDescription]);

  return (
    <p {...props} ref={ref} id={id ?? descriptionId} className={cn(styles.description, className)}>
      {children}
    </p>
  );
}

export interface ToastActionProps extends ComponentPropsWithRef<'button'> {
  children: ReactNode;
}

export function ToastAction({
  className,
  children,
  type = 'button',
  ref,
  ...props
}: ToastActionProps) {
  return (
    <div className={styles.actionArea}>
      <button {...props} ref={ref} type={type} className={cn(styles.actionButton, className)}>
        {children}
      </button>
    </div>
  );
}

export interface ToastCloseButtonProps extends ComponentPropsWithRef<'button'> {
  'aria-label': string;
}

export function ToastCloseButton({
  className,
  type = 'button',
  onClick,
  ref,
  ...props
}: ToastCloseButtonProps) {
  const { onDismiss } = useToastContext('ToastCloseButton');

  return (
    <button
      {...props}
      ref={ref}
      type={type}
      className={cn(styles.closeButton, className)}
      onClick={(e) => {
        onClick?.(e);
        if (!e.defaultPrevented) {
          onDismiss?.();
        }
      }}
    >
      <Icon name="close" size={14} />
    </button>
  );
}
