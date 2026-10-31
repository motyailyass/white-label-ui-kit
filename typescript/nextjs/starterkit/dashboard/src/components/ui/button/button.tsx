import { type ComponentPropsWithoutRef, type ReactNode, forwardRef } from 'react';
import { cn } from '@/lib/cn';
import type { ControlSizingProps } from '../control-sizing';
import styles from './button.module.css';

export type ButtonVariant = 'primary' | 'secondary' | 'subtle' | 'ghost' | 'danger';

export interface ButtonProps extends ComponentPropsWithoutRef<'button'>, ControlSizingProps {
  variant?: ButtonVariant;
  loading?: boolean;
  startIcon?: ReactNode;
  endIcon?: ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    size,
    touchTarget = 'auto',
    variant = 'secondary',
    loading = false,
    disabled = false,
    startIcon,
    endIcon,
    type = 'button',
    className,
    children,
    ...props
  },
  ref,
) {
  const isDisabled = disabled || loading;

  return (
    <button
      {...props}
      ref={ref}
      type={type}
      disabled={isDisabled}
      aria-busy={loading || undefined}
      data-size={size}
      data-touch-target={touchTarget}
      data-variant={variant}
      data-loading={loading ? 'true' : undefined}
      className={cn(styles.button, className)}
    >
      <span className={cn(styles.content, loading && styles.hiddenContent)}>
        {startIcon && <span className={styles.icon}>{startIcon}</span>}
        {children}
        {endIcon && <span className={styles.icon}>{endIcon}</span>}
      </span>
      {loading && (
        <span className={styles.spinnerWrapper} aria-hidden="true">
          <span className={styles.spinner} />
        </span>
      )}
    </button>
  );
});

Button.displayName = 'Button';
