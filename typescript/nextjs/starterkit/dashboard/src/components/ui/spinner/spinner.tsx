'use client';

import type { ComponentPropsWithRef } from 'react';
import { cn } from '@/lib/cn';
import styles from './spinner.module.css';

export type SpinnerSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type SpinnerVariant = 'default' | 'primary' | 'current' | 'inverse';

export interface SpinnerProps extends ComponentPropsWithRef<'span'> {
  /** Sizing scale for the spinner. Defaults to 'md' */
  size?: SpinnerSize;

  /** Semantic color variant. Defaults to 'default' */
  variant?: SpinnerVariant;

  /** Accessible label for assistive technology. When provided, exposes role="status" */
  label?: string;

  /** Renders `label` visibly beside the spinner instead of visually hidden. Defaults to false */
  showLabel?: boolean;

  /** Stroke width of the circular path. Defaults to 2.5 */
  strokeWidth?: number;

  /** Additional CSS class names */
  className?: string;
}

const variantClassMap: Record<SpinnerVariant, string> = {
  default: styles.variantDefault,
  primary: styles.variantPrimary,
  current: styles.variantCurrent,
  inverse: styles.variantInverse,
};

/**
 * Indeterminate circular loading indicator primitive.
 * Exposed as role="status" with aria-live="polite" when labeled, or hidden from AT when decorative.
 */
export function Spinner({
  size = 'md',
  variant = 'default',
  label,
  showLabel = false,
  strokeWidth = 2.5,
  className,
  role,
  'aria-live': ariaLive,
  'aria-hidden': ariaHidden,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
  ref,
  ...props
}: SpinnerProps) {
  const normalizedLabel = label?.trim() ? label : undefined;
  const hasAccessibleName = Boolean(normalizedLabel || ariaLabel?.trim() || ariaLabelledBy?.trim());

  return (
    <span
      ref={ref}
      role={role ?? (hasAccessibleName ? 'status' : undefined)}
      aria-live={ariaLive ?? (hasAccessibleName ? 'polite' : undefined)}
      aria-hidden={ariaHidden ?? (hasAccessibleName ? undefined : 'true')}
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledBy}
      data-size={size}
      data-variant={variant}
      className={cn(styles.spinner, variantClassMap[variant], className)}
      {...props}
    >
      <svg
        className={styles.svg}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        focusable="false"
      >
        <circle className={styles.track} cx="12" cy="12" r="9.5" strokeWidth={strokeWidth} />
        <path
          className={styles.indicator}
          d="M12 2.5C17.2467 2.5 21.5 6.75329 21.5 12"
          strokeWidth={strokeWidth}
        />
      </svg>
      {normalizedLabel && (
        <span className={showLabel ? styles.label : styles.visuallyHidden}>{normalizedLabel}</span>
      )}
    </span>
  );
}
