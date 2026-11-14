'use client';

import {
  type ComponentPropsWithoutRef,
  type MouseEvent,
  type ReactNode,
  forwardRef,
  useState,
} from 'react';
import { cn } from '@/lib/cn';
import type { ControlSize } from '../control-sizing';
import styles from './toggle.module.css';

export type ToggleVariant = 'default' | 'outline' | 'subtle';

export interface ToggleProps extends Omit<ComponentPropsWithoutRef<'button'>, 'onChange'> {
  pressed?: boolean;
  defaultPressed?: boolean;
  onPressedChange?: (pressed: boolean) => void;
  variant?: ToggleVariant;
  size?: ControlSize;
  children?: ReactNode;
  className?: string;
  'data-testid'?: string;
}

export const Toggle = forwardRef<HTMLButtonElement, ToggleProps>(function Toggle(
  {
    pressed: controlledPressed,
    defaultPressed = false,
    onPressedChange,
    variant = 'default',
    size = 'md',
    disabled = false,
    children,
    className,
    onClick,
    'data-testid': testId,
    ...rest
  },
  ref,
) {
  const isControlled = controlledPressed !== undefined;
  const [uncontrolledPressed, setUncontrolledPressed] = useState<boolean>(defaultPressed);

  const isPressed = isControlled ? controlledPressed : uncontrolledPressed;

  const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
    if (disabled) return;
    const nextPressed = !isPressed;

    if (!isControlled) {
      setUncontrolledPressed(nextPressed);
    }

    onPressedChange?.(nextPressed);
    onClick?.(e);
  };

  return (
    <button
      ref={ref}
      type="button"
      aria-pressed={isPressed}
      disabled={disabled}
      data-state={isPressed ? 'on' : 'off'}
      data-size={size}
      data-variant={variant}
      data-disabled={disabled ? '' : undefined}
      className={cn(styles.root, className)}
      onClick={handleClick}
      data-testid={testId}
      {...rest}
    >
      {children}
    </button>
  );
});
