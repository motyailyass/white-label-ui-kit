import {
  type ComponentPropsWithoutRef,
  forwardRef,
  useId,
  useImperativeHandle,
  useRef,
} from 'react';
import { cn } from '@/lib/cn';
import type { ControlSizingProps } from '../control-sizing';
import styles from './radio.module.css';

export interface RadioProps
  extends Omit<
      ComponentPropsWithoutRef<'input'>,
      'type' | 'size' | 'children' | 'readOnly'
    >,
    ControlSizingProps {}

export const Radio = forwardRef<HTMLInputElement, RadioProps>(function Radio(
  {
    size,
    touchTarget = 'auto',
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
        type="radio"
        disabled={disabled}
        className={styles.input}
      />
      <span className={styles.indicator} aria-hidden="true">
        <span className={styles.dot} />
      </span>
    </span>
  );
});

Radio.displayName = 'Radio';
