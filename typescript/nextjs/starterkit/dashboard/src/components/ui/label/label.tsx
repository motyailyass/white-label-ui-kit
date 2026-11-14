'use client';

import React, {
  type ComponentPropsWithRef,
  type ElementType,
  forwardRef,
  type ReactNode,
} from 'react';
import { cn } from '@/lib/cn';
import styles from './label.module.css';

export type LabelSize = 'sm' | 'md' | 'lg';

export interface LabelProps extends ComponentPropsWithRef<'label'> {
  /**
   * Explicit typography density override.
   * When omitted, inherits product-owned `--typography-label-*` tokens
   * (14px Dashboard compact / 16px Website comfortable, plus Arabic line-height clearance).
   */
  size?: LabelSize;

  /** Whether the associated form field is required */
  required?: boolean;

  /** Custom indicator node to display when required. Defaults to '*' */
  requiredIndicator?: ReactNode;

  /** Whether the field is disabled, applying disabled typography styles */
  disabled?: boolean;

  /** Polymorphic element tag. Defaults to 'label' */
  as?: ElementType;

  /** Children nodes (label text, optional badges, icons) */
  children?: ReactNode;

  /** Additional CSS class names */
  className?: string;
}

export const Label = forwardRef<HTMLLabelElement, LabelProps>(function Label(
  {
    size,
    required = false,
    requiredIndicator = '*',
    disabled = false,
    as: Component = 'label',
    htmlFor,
    className,
    children,
    ...props
  },
  ref,
) {
  return (
    <Component
      ref={ref}
      htmlFor={Component === 'label' ? htmlFor : undefined}
      data-size={size}
      data-disabled={disabled ? 'true' : undefined}
      className={cn(styles.label, className)}
      {...props}
    >
      {children}
      {required && (
        <span aria-hidden="true" className={styles.requiredIndicator}>
          {requiredIndicator}
        </span>
      )}
    </Component>
  );
});

Label.displayName = 'Label';
