import { type ComponentPropsWithoutRef, type ReactNode, forwardRef } from 'react';
import { cn } from '@/lib/cn';
import type { ControlSizingProps } from '../control-sizing';
import styles from './button.module.css';

export type ButtonVariant = 'primary' | 'secondary' | 'subtle' | 'ghost' | 'danger';

export interface ButtonProps extends ComponentPropsWithoutRef<'button'>, ControlSizingProps {
  variant?: ButtonVariant;
  loading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    size,
    touchTarget,
    variant = 'secondary',
    loading = false,
    disabled = false,
    leftIcon,
    rightIcon,
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
      disabled={isDisabled}
      data-size={size}
      data-touch-target={touchTarget}
      data-variant={variant}
      data-loading={loading ? 'true' : undefined}
      className={cn(styles.button, className)}
    >
      {loading ? (
        <span className={styles.spinner} aria-hidden="true" />
      ) : (
        leftIcon && <span className={styles.icon}>{leftIcon}</span>
      )}
      {children}
      {!loading && rightIcon && <span className={styles.icon}>{rightIcon}</span>}
    </button>
  );
});

Button.displayName = 'Button';
