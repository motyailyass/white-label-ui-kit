import type React from 'react';
import { cn } from '@/lib/cn';
import { Icon } from '@/components/icons';
import styles from './theme-toggle.module.css';

export interface ThemeToggleProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
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
 * Receives current theme, labels, and onToggle callback via native props with zero context lock-in.
 */
export function ThemeToggle({
  theme = 'system',
  resolvedTheme = 'light',
  onToggle,
  showLabel = true,
  lightLabel = 'Light',
  darkLabel = 'Dark',
  ariaLabel,
  className,
  ...props
}: ThemeToggleProps) {
  const isDark = resolvedTheme === 'dark';
  const currentLabel = isDark ? lightLabel : darkLabel;
  const computedAriaLabel = ariaLabel || `Switch to ${isDark ? 'light' : 'dark'} mode`;

  return (
    <button
      type="button"
      className={cn(styles.toggle, className)}
      onClick={onToggle}
      aria-label={computedAriaLabel}
      title={`Current: ${theme} (${resolvedTheme})`}
      {...props}
    >
      <Icon name={isDark ? 'sun' : 'moon'} size={14} className={styles.icon} aria-hidden="true" />
      {showLabel && <span>{currentLabel}</span>}
    </button>
  );
}
