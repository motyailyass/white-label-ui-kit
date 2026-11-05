'use client';

import React, { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { Icon } from '@/components/icons';
import { cn } from '@/lib/cn';
import styles from './badge.module.css';

export type BadgeVariant =
  | 'default'
  | 'primary'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'outline';

export type BadgeSize = 'sm' | 'md' | 'lg';
export type BadgeShape = 'pill' | 'rounded';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  /** The content of the badge (label, count, or composite elements) */
  children: ReactNode;

  /** Semantic color variant. Defaults to 'default' */
  variant?: BadgeVariant;

  /** Sizing density step. Defaults to 'md' */
  size?: BadgeSize;

  /** Corner geometry: 'pill' (radius-full) or 'rounded' (radius-control). Defaults to 'pill' */
  shape?: BadgeShape;

  /** Optional leading icon element */
  startIcon?: ReactNode;

  /** Whether to show a colored semantic status dot indicator */
  dot?: boolean;

  /** Whether the dot indicator animates with a subtle pulse */
  dotPulse?: boolean;

  /** Callback fired when the dismissible remove button is clicked */
  onRemove?: () => void;

  /** Accessible label for the remove button. Required when onRemove is passed */
  removeAriaLabel?: string;

  /** Additional CSS class names */
  className?: string;
}

const variantClassMap: Record<BadgeVariant, string> = {
  default: styles.variantDefault,
  primary: styles.variantPrimary,
  success: styles.variantSuccess,
  warning: styles.variantWarning,
  danger: styles.variantDanger,
  info: styles.variantInfo,
  outline: styles.variantOutline,
};

const sizeClassMap: Record<BadgeSize, string> = {
  sm: styles.sizeSm,
  md: styles.sizeMd,
  lg: styles.sizeLg,
};

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(function Badge(
  {
    children,
    variant = 'default',
    size = 'md',
    shape = 'pill',
    startIcon,
    dot = false,
    dotPulse = false,
    onRemove,
    removeAriaLabel,
    className,
    ...props
  },
  ref,
) {
  return (
    <span
      ref={ref}
      data-variant={variant}
      data-size={size}
      data-shape={shape}
      className={cn(
        styles.badge,
        variantClassMap[variant],
        sizeClassMap[size],
        shape === 'pill' ? styles.shapePill : styles.shapeRounded,
        className,
      )}
      {...props}
    >
      {dot && (
        <span
          className={cn(styles.dot, dotPulse && styles.dotPulse)}
          aria-hidden="true"
        />
      )}

      {startIcon && <span className={styles.startIcon}>{startIcon}</span>}

      <span>{children}</span>

      {onRemove && (
        <button
          type="button"
          aria-label={removeAriaLabel || 'Remove'}
          className={styles.removeButton}
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
        >
          <Icon name="cancel" />
        </button>
      )}
    </span>
  );
});

Badge.displayName = 'Badge';
