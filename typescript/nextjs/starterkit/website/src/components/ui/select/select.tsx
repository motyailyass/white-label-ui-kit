import { type ComponentPropsWithoutRef, type CSSProperties, forwardRef } from 'react';
import { Icon } from '@/components/icons';
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
   * Whether to display the decorative dropdown indicator chevron icon.
   * When false, the arrow is omitted and end padding matches start padding.
   * @default true
   */
  showIcon?: boolean;

  /**
   * Optional className applied directly to the inner native select element.
   * (The standard `className` prop applies to the control root wrapper).
   */
  selectClassName?: string;

  /**
   * Optional inline styles applied directly to the inner native select element.
   * (The standard `style` prop applies to the control root wrapper).
   */
  selectStyle?: CSSProperties;

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
      showIcon = true,
      className,
      style,
      selectClassName,
      selectStyle,
      disabled = false,
      dir,
      children,
      // Filter unsupported / forbidden attributes before runtime spread
      multiple: _ignoredMultiple,
      readOnly: _ignoredReadOnly,
      ...props
    },
    ref,
  ) {
    return (
      <span
        className={cn(styles.root, className)}
        style={style}
        data-size={size}
        data-touch-target={touchTarget}
        data-disabled={disabled ? 'true' : undefined}
        data-show-icon={showIcon ? 'true' : 'false'}
        dir={dir}
      >
        <select
          {...props}
          ref={ref}
          dir={dir}
          disabled={disabled}
          data-size={size}
          data-touch-target={touchTarget}
          data-show-icon={showIcon ? 'true' : 'false'}
          className={cn(styles.select, selectClassName)}
          style={selectStyle}
        >
          {children}
        </select>
        {showIcon && (
          <span className={styles.arrow} aria-hidden="true">
            <Icon name="chevron-down" />
          </span>
        )}
      </span>
    );
  },
);

Select.displayName = 'Select';
