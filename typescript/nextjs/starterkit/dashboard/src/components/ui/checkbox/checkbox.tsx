import {
  type ComponentPropsWithoutRef,
  forwardRef,
  useId,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
} from 'react';
import { Icon } from '@/components/icons';
import { cn } from '@/lib/cn';
import type { ControlSizingProps } from '../control-sizing';
import styles from './checkbox.module.css';

export interface CheckboxProps
  extends Omit<
      ComponentPropsWithoutRef<'input'>,
      'type' | 'size' | 'children' | 'readOnly'
    >,
    ControlSizingProps {
  /**
   * Displays the native mixed/indeterminate state.
   * Synchronizes directly with HTMLInputElement.indeterminate.
   * Does not replace checked / defaultChecked.
   * @default false
   */
  indeterminate?: boolean;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(
  {
    size,
    touchTarget = 'auto',
    indeterminate = false,
    disabled = false,
    className,
    style,
    id: callerId,
    ...props
  },
  forwardedRef,
) {
  const generatedId = useId();
  const inputId = callerId ?? generatedId;
  const inputRef = useRef<HTMLInputElement>(null);

  useImperativeHandle(forwardedRef, () => inputRef.current as HTMLInputElement);

  // Synchronize native indeterminate DOM property
  useLayoutEffect(() => {
    if (inputRef.current) {
      inputRef.current.indeterminate = Boolean(indeterminate);
    }
  }, [indeterminate]);

  return (
    <span
      className={cn(styles.root, className)}
      style={style}
      data-size={size}
      data-touch-target={touchTarget}
      data-disabled={disabled ? 'true' : undefined}
    >
      <input
        {...props}
        ref={inputRef}
        id={inputId}
        type="checkbox"
        disabled={disabled}
        className={styles.input}
      />
      <span className={styles.indicator} aria-hidden="true">
        <span className={styles.iconCheck}>
          <Icon name="check" strokeWidth={2} />
        </span>
        <span className={styles.iconMinus}>
          <Icon name="minus" strokeWidth={2} />
        </span>
      </span>
    </span>
  );
});

Checkbox.displayName = 'Checkbox';
