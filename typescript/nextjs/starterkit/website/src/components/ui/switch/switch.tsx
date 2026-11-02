import { type ComponentPropsWithoutRef, forwardRef } from 'react';
import { cn } from '@/lib/cn';
import type { ControlSizingProps } from '../control-sizing';
import styles from './switch.module.css';

export interface SwitchProps
  extends Omit<
      ComponentPropsWithoutRef<'input'>,
      'type' | 'size' | 'children' | 'readOnly' | 'role' | 'aria-checked' | 'aria-readonly'
    >,
    ControlSizingProps {
  /**
   * Explicitly forbidden to enforce native checked authority.
   * Native `checked` or `defaultChecked` is the sole source of truth.
   */
  'aria-checked'?: never;
  'aria-readonly'?: never;
  role?: never;
  readOnly?: never;
}

export const Switch = forwardRef<HTMLInputElement, SwitchProps>(function Switch(
  {
    size,
    touchTarget = 'auto',
    className,
    style,
    // Filter unsupported / forbidden attributes before runtime spread
    'aria-checked': _ignoredAriaChecked,
    'aria-readonly': _ignoredAriaReadonly,
    role: _ignoredRole,
    readOnly: _ignoredReadOnly,
    ...inputProps
  },
  forwardedRef,
) {
  return (
    <span
      className={cn(styles.root, className)}
      style={style}
      data-size={size}
      data-touch-target={touchTarget}
    >
      <input
        {...inputProps}
        ref={forwardedRef}
        type="checkbox"
        role="switch"
        className={styles.input}
      />
      <span className={styles.track} aria-hidden="true">
        <span className={styles.thumb} />
      </span>
    </span>
  );
});

Switch.displayName = 'Switch';
