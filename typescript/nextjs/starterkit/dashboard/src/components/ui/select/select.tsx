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
   *
   * Note: The primary `className` prop applies to the control root wrapper, which owns
   * the outer layout box (width, margin, flex). `selectClassName` is an escape hatch
   * for inner text properties (e.g. text color, text alignment). Geometry changes must
   * be applied to the root wrapper to prevent detaching the custom indicator.
   */
  selectClassName?: string;

  /**
   * Optional inline styles applied directly to the inner native select element.
   *
   * Note: The primary `style` prop applies to the control root wrapper, which owns
   * the outer layout box (width, margin, flex). `selectStyle` is an escape hatch
   * for inner text properties (e.g. text color). Outer box geometry is enforced at 100%
   * to ensure indicator alignment and pointer hit-testing remain unified. Any geometry
   * passed here (width, inlineSize) is synchronized to the root wrapper box.
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
    const resolvedWrapperStyle: CSSProperties | undefined =
      selectStyle?.width != null || selectStyle?.inlineSize != null
        ? {
            ...(selectStyle.width != null && style?.width == null
              ? { width: selectStyle.width }
              : {}),
            ...(selectStyle.inlineSize != null && style?.inlineSize == null
              ? { inlineSize: selectStyle.inlineSize }
              : {}),
            ...style,
          }
        : style;

    return (
      <span
        className={cn(styles.root, className)}
        style={resolvedWrapperStyle}
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
