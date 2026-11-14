'use client';

import React, {
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useState,
  type ButtonHTMLAttributes,
  type ElementType,
  type HTMLAttributes,
  type ReactNode,
} from 'react';
import { Icon, type IconName } from '@/components/icons';
import { cn } from '@/lib/cn';
import styles from './alert.module.css';

export type AlertStatus = 'info' | 'success' | 'warning' | 'danger';
export type AlertVariant = 'subtle' | 'bordered' | 'solid';
export type AlertSize = 'sm' | 'md' | 'lg';

/* =============================================================================
   Alert Context
   ============================================================================= */

interface AlertContextValue {
  status: AlertStatus;
  variant: AlertVariant;
  size: AlertSize;
  titleId: string;
  descriptionId: string;
  registerTitle: () => () => void;
  registerDescription: () => () => void;
  closeAlert: () => void;
}

const AlertContext = createContext<AlertContextValue | null>(null);

function useAlertContext(componentName: string): AlertContextValue {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error(`<${componentName}> must be used within an <Alert> container.`);
  }
  return context;
}

/* =============================================================================
   Alert Root Component
   ============================================================================= */

export interface AlertProps extends HTMLAttributes<HTMLDivElement> {
  /** Semantic feedback category governing default colors, icons, and live regions */
  status?: AlertStatus;

  /** Visual surface treatment */
  variant?: AlertVariant;

  /** Control sizing and padding density scale */
  size?: AlertSize;

  /** Controlled open visibility state */
  open?: boolean;

  /** Initial open visibility state when uncontrolled */
  defaultOpen?: boolean;

  /** Whether the alert renders an accessible close button and can be dismissed */
  dismissible?: boolean;

  /** Localized accessible label for the built-in close button when dismissible is true */
  closeLabel?: string;

  /** Callback fired when visibility changes */
  onOpenChange?: (open: boolean) => void;

  /** Callback fired when the user dismisses the alert */
  onClose?: () => void;

  /** Polymorphic HTML element tag */
  as?: ElementType;
}

export const Alert = forwardRef<HTMLDivElement, AlertProps>(function Alert(
  {
    status = 'info',
    variant = 'subtle',
    size = 'md',
    open,
    defaultOpen = true,
    dismissible = false,
    closeLabel,
    onOpenChange,
    onClose,
    as: Component = 'div',
    className,
    children,
    role,
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledByProp,
    'aria-describedby': ariaDescribedByProp,
    'aria-live': ariaLiveProp,
    'aria-atomic': ariaAtomicProp,
    ...props
  },
  ref,
) {
  const baseId = useId();
  const titleId = `alert-${baseId}-title`;
  const descriptionId = `alert-${baseId}-desc`;

  const isControlled = open !== undefined;
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
  const isOpen = isControlled ? open : uncontrolledOpen;
  const isDismissed = !isOpen;

  const [titleCount, setTitleCount] = useState(0);
  const [descriptionCount, setDescriptionCount] = useState(0);

  const registerTitle = useCallback(() => {
    setTitleCount((count) => count + 1);
    return () => {
      setTitleCount((count) => Math.max(0, count - 1));
    };
  }, []);

  const registerDescription = useCallback(() => {
    setDescriptionCount((count) => count + 1);
    return () => {
      setDescriptionCount((count) => Math.max(0, count - 1));
    };
  }, []);

  const handleClose = useCallback(() => {
    if (!isControlled) {
      setUncontrolledOpen(false);
    }
    onOpenChange?.(false);
    onClose?.();
  }, [isControlled, onOpenChange, onClose]);

  const contextValue = useMemo<AlertContextValue>(
    () => ({
      status,
      variant,
      size,
      titleId,
      descriptionId,
      registerTitle,
      registerDescription,
      closeAlert: handleClose,
    }),
    [
      status,
      variant,
      size,
      titleId,
      descriptionId,
      registerTitle,
      registerDescription,
      handleClose,
    ],
  );

  // Default live roles: danger is assertive alert; info/success/warning are polite status.
  // Respect explicit static roles (e.g. role="region") without forcing unsolicited aria-live.
  const computedRole = role ?? (status === 'danger' ? 'alert' : 'status');
  const defaultLive =
    computedRole === 'alert' ? 'assertive' : computedRole === 'status' ? 'polite' : undefined;
  const computedLive = ariaLiveProp ?? defaultLive;
  const computedAtomic = ariaAtomicProp ?? (computedLive !== undefined ? 'true' : undefined);

  const computedLabelledBy =
    ariaLabelledByProp ?? (ariaLabel || titleCount === 0 ? undefined : titleId);
  const computedDescribedBy =
    ariaDescribedByProp ?? (descriptionCount === 0 ? undefined : descriptionId);

  return (
    <AlertContext.Provider value={contextValue}>
      <div
        className={cn(
          styles.wrapper,
          isDismissed ? styles.wrapperDismissed : styles.wrapperVisible,
        )}
        data-state={isDismissed ? 'closed' : 'open'}
        aria-hidden={isDismissed ? true : undefined}
        inert={isDismissed ? true : undefined}
      >
        <Component
          ref={ref}
          role={computedRole}
          aria-live={computedLive}
          aria-atomic={computedAtomic}
          aria-label={ariaLabel}
          aria-labelledby={computedLabelledBy}
          aria-describedby={computedDescribedBy}
          data-status={status}
          data-variant={variant}
          data-size={size}
          data-dismissible={dismissible ? 'true' : undefined}
          className={cn(
            styles.alert,
            styles[`status_${status}`],
            styles[`variant_${variant}`],
            styles[`size_${size}`],
            className,
          )}
          {...props}
        >
          <div className={styles.contentGrid}>
            {children}
            {dismissible && <AlertCloseButton aria-label={closeLabel} />}
          </div>
        </Component>
      </div>
    </AlertContext.Provider>
  );
});

Alert.displayName = 'Alert';

/* =============================================================================
   AlertIcon Component
   ============================================================================= */

export interface AlertIconProps extends HTMLAttributes<HTMLSpanElement> {
  /** Optional custom icon override */
  children?: ReactNode;
}

const defaultStatusIcons: Record<AlertStatus, IconName> = {
  info: 'info-circle',
  success: 'check-circle',
  warning: 'warning',
  danger: 'danger',
};

export const AlertIcon = forwardRef<HTMLSpanElement, AlertIconProps>(function AlertIcon(
  { children, className, ...props },
  ref,
) {
  const { status, size } = useAlertContext('AlertIcon');
  const iconName = defaultStatusIcons[status];

  return (
    <span
      ref={ref}
      aria-hidden="true"
      data-size={size}
      className={cn(styles.iconSlot, styles[`icon_${size}`], className)}
      {...props}
    >
      {children ?? <Icon name={iconName} aria-hidden="true" />}
    </span>
  );
});

AlertIcon.displayName = 'AlertIcon';

/* =============================================================================
   AlertTitle Component
   ============================================================================= */

export interface AlertTitleProps extends HTMLAttributes<HTMLHeadingElement> {
  /** Semantic heading tag. Defaults to 'h5' */
  as?: 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'div';
}

export const AlertTitle = forwardRef<HTMLHeadingElement, AlertTitleProps>(function AlertTitle(
  { as: Component = 'h5', id, className, children, ...props },
  ref,
) {
  const { titleId, registerTitle } = useAlertContext('AlertTitle');

  useEffect(() => registerTitle(), [registerTitle]);

  return (
    <Component ref={ref} id={id ?? titleId} className={cn(styles.title, className)} {...props}>
      {children}
    </Component>
  );
});

AlertTitle.displayName = 'AlertTitle';

/* =============================================================================
   AlertDescription Component
   ============================================================================= */

export interface AlertDescriptionProps extends HTMLAttributes<HTMLDivElement> {}

export const AlertDescription = forwardRef<HTMLDivElement, AlertDescriptionProps>(
  function AlertDescription({ id, className, children, ...props }, ref) {
    const { descriptionId, registerDescription } = useAlertContext('AlertDescription');

    useEffect(() => registerDescription(), [registerDescription]);

    return (
      <div
        ref={ref}
        id={id ?? descriptionId}
        className={cn(styles.description, className)}
        {...props}
      >
        {children}
      </div>
    );
  },
);

AlertDescription.displayName = 'AlertDescription';

/* =============================================================================
   AlertAction Component
   ============================================================================= */

export interface AlertActionProps extends HTMLAttributes<HTMLDivElement> {}

export const AlertAction = forwardRef<HTMLDivElement, AlertActionProps>(function AlertAction(
  { className, children, ...props },
  ref,
) {
  return (
    <div ref={ref} className={cn(styles.action, className)} {...props}>
      {children}
    </div>
  );
});

AlertAction.displayName = 'AlertAction';

/* =============================================================================
   AlertCloseButton Component
   ============================================================================= */

export interface AlertCloseButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Localized accessible label for assistive technologies */
  'aria-label'?: string;
}

export const AlertCloseButton = forwardRef<HTMLButtonElement, AlertCloseButtonProps>(
  function AlertCloseButton(
    { 'aria-label': ariaLabel, type = 'button', className, onClick, ...props },
    ref,
  ) {
    const { closeAlert, size } = useAlertContext('AlertCloseButton');

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      onClick?.(e);
      if (!e.defaultPrevented) {
        closeAlert();
      }
    };

    return (
      <button
        ref={ref}
        type={type}
        aria-label={ariaLabel}
        onClick={handleClick}
        data-size={size}
        className={cn(styles.closeButton, styles[`close_${size}`], className)}
        {...props}
      >
        <Icon name="close" aria-hidden="true" />
      </button>
    );
  },
);

AlertCloseButton.displayName = 'AlertCloseButton';
