import { type ComponentPropsWithoutRef, forwardRef } from 'react';
import { cn } from '@/lib/cn';
import type { ControlSizingProps } from '../control-sizing';
import styles from './input.module.css';

export type InputType = 'text' | 'email' | 'tel' | 'url' | 'search' | 'password';

export interface InputProps
  extends Omit<ComponentPropsWithoutRef<'input'>, 'size' | 'type' | 'children'>,
    ControlSizingProps {
  type?: InputType;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { type = 'text', size, touchTarget = 'auto', className, ...props },
  ref,
) {
  return (
    <input
      {...props}
      ref={ref}
      type={type}
      data-size={size}
      data-touch-target={touchTarget}
      className={cn(styles.input, className)}
    />
  );
});

Input.displayName = 'Input';
