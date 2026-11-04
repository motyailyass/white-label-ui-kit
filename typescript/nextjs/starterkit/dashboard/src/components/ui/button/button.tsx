import { type ComponentPropsWithoutRef, type ReactNode, forwardRef } from 'react';
import { Icon } from '@/components/icons';
import { cn } from '@/lib/cn';
import type { ControlSizingProps } from '../control-sizing';
import styles from './button.module.css';

export type ButtonVariant = 'primary' | 'secondary' | 'subtle' | 'ghost' | 'danger';

export interface ButtonProps extends ComponentPropsWithoutRef<'button'>, ControlSizingProps {
  variant?: ButtonVariant;
  loading?: boolean;
  startIcon?: ReactNode;
  endIcon?: ReactNode;
  /**
   * Enforces an equilateral square (1:1 aspect ratio) geometry for icon-only buttons.
   * When true, width is clamped to match control height, padding is equalized to 0,
   * and callers MUST provide an `aria-label` or `aria-labelledby` for accessibility.
   * @default false
   */
  iconOnly?: boolean;
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
    iconOnly = false,
    type = 'button',
    className,
    children,
    ...props
  },
  ref,
) {
  const isDisabled = disabled || loading;
  const computedAriaLabel =
    props['aria-label'] ?? (loading && typeof children === 'string' ? children : undefined);

  return (
    <button
      {...props}
      ref={ref}
      type={type}
      disabled={isDisabled}
      aria-busy={loading || undefined}
      aria-label={computedAriaLabel}
      data-size={size}
      data-touch-target={touchTarget}
      data-variant={variant}
      data-icon-only={iconOnly ? 'true' : undefined}
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
          <Icon name="loader" className={styles.spinner} />
        </span>
      )}
    </button>
  );
});

Button.displayName = 'Button';
