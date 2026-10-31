import { type ComponentPropsWithoutRef, forwardRef } from 'react';
import { Icon } from '@/components/icons';
import { cn } from '@/lib/cn';
import type { ControlSizingProps } from '../control-sizing';
import styles from './theme-toggle.module.css';

export interface ThemeToggleProps
  extends Omit<ComponentPropsWithoutRef<'button'>, 'children'>,
    ControlSizingProps {
  theme?: 'light' | 'dark' | 'system';
  resolvedTheme?: 'light' | 'dark';
  onToggle?: () => void;
  showLabel?: boolean;
  lightLabel?: string;
  darkLabel?: string;
  ariaLabel?: string;
}

/**
 * Pure ThemeToggle UI primitive.
 * Receives current theme, localized labels, sizing, and onToggle callback via props with zero context lock-in.
 */
export const ThemeToggle = forwardRef<HTMLButtonElement, ThemeToggleProps>(function ThemeToggle(
  {
    size,
    touchTarget = 'auto',
    theme: _theme = 'system',
    resolvedTheme = 'light',
    onToggle,
    showLabel = true,
    lightLabel,
    darkLabel,
    ariaLabel,
    type = 'button',
    className,
    onClick,
    'aria-label': nativeAriaLabel,
    ...props
  },
  ref,
) {
  const isDark = resolvedTheme === 'dark';
  const currentLabel = isDark ? lightLabel : darkLabel;
  const computedAriaLabel = ariaLabel ?? nativeAriaLabel;

  return (
    <button
      {...props}
      ref={ref}
      type={type}
      data-size={size}
      data-touch-target={touchTarget}
      aria-pressed={isDark}
      aria-label={computedAriaLabel}
      className={cn(styles.toggle, className)}
      onClick={(e) => {
        onClick?.(e);
        if (!e.defaultPrevented) {
          onToggle?.();
        }
      }}
    >
      <Icon name={isDark ? 'sun' : 'moon'} className={styles.icon} aria-hidden="true" />
      {showLabel && currentLabel && <span>{currentLabel}</span>}
    </button>
  );
});

ThemeToggle.displayName = 'ThemeToggle';
