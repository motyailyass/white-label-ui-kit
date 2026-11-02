import { type ComponentPropsWithoutRef, forwardRef } from 'react';
import { cn } from '@/lib/cn';
import type { ControlSizingProps } from '../control-sizing';
import styles from './select.module.css';

export interface SelectProps
  extends Omit<
      ComponentPropsWithoutRef<'select'>,
      'size' | 'multiple' | 'value' | 'defaultValue' | 'readOnly'
    >,
    ControlSizingProps {
  /**
   * Controlled scalar value.
   */
  value?: string | number;

  /**
   * Initial scalar value for uncontrolled selection.
   */
  defaultValue?: string | number;

  /**
   * Explicitly forbidden. Multi-select listbox is handled by specialized primitives.
   */
  multiple?: never;

  /**
   * Native select elements do not support read-only behavior.
   */
  readOnly?: never;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  function Select(
    {
      size,
      touchTarget = 'auto',
      className,
      // Filter unsupported / forbidden attributes before runtime spread
      multiple: _ignoredMultiple,
      readOnly: _ignoredReadOnly,
      ...props
    },
    ref,
  ) {
    return (
      <select
        {...props}
        ref={ref}
        data-size={size}
        data-touch-target={touchTarget}
        className={cn(styles.select, className)}
      />
    );
  },
);

Select.displayName = 'Select';
