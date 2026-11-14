'use client';

import { type ComponentPropsWithoutRef, type ReactNode, forwardRef } from 'react';
import { cn } from '@/lib/cn';
import styles from './kbd.module.css';

export type KbdSize = 'sm' | 'md' | 'lg';
export type KbdVariant = 'outline' | 'subtle' | 'ghost';

export interface KbdProps extends ComponentPropsWithoutRef<'kbd'> {
  size?: KbdSize;
  variant?: KbdVariant;
  children: ReactNode;
  className?: string;
  'data-testid'?: string;
}

export const Kbd = forwardRef<HTMLElement, KbdProps>(function Kbd(
  { size = 'md', variant = 'outline', children, className, 'data-testid': testId, ...rest },
  ref,
) {
  const sizeClass = size === 'sm' ? styles.sizeSm : size === 'lg' ? styles.sizeLg : styles.sizeMd;

  const variantClass =
    variant === 'subtle'
      ? styles.variantSubtle
      : variant === 'ghost'
        ? styles.variantGhost
        : styles.variantOutline;

  return (
    <kbd
      ref={ref}
      data-size={size}
      data-variant={variant}
      className={cn(styles.root, sizeClass, variantClass, className)}
      data-testid={testId}
      {...rest}
    >
      {children}
    </kbd>
  );
});

export interface KbdGroupProps extends ComponentPropsWithoutRef<'span'> {
  children: ReactNode;
  className?: string;
  'data-testid'?: string;
}

export const KbdGroup = forwardRef<HTMLSpanElement, KbdGroupProps>(function KbdGroup(
  { children, className, 'data-testid': testId, ...rest },
  ref,
) {
  return (
    <span ref={ref} className={cn(styles.group, className)} data-testid={testId} {...rest}>
      {children}
    </span>
  );
});

export interface KbdSeparatorProps extends ComponentPropsWithoutRef<'span'> {
  children?: ReactNode;
  className?: string;
  'data-testid'?: string;
}

export const KbdSeparator = forwardRef<HTMLSpanElement, KbdSeparatorProps>(function KbdSeparator(
  { children = '+', className, 'data-testid': testId, 'aria-hidden': ariaHidden = true, ...rest },
  ref,
) {
  return (
    <span
      ref={ref}
      aria-hidden={ariaHidden}
      className={cn(styles.separator, className)}
      data-testid={testId}
      {...rest}
    >
      {children}
    </span>
  );
});
