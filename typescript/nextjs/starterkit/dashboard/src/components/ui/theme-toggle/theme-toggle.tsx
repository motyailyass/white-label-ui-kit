import type React from 'react';
import { cn } from '@/lib/cn';
import { Icon } from '@/components/icons';
import styles from './theme-toggle.module.css';

export interface ThemeToggleProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  theme?: 'light' | 'dark' | 'system';
  resolvedTheme?: 'light' | 'dark';
  onToggle?: () => void;
  showLabel?: boolean;
}

/**
 * Pure ThemeToggle UI primitive.
 * Receives current theme and onToggle callback via native props with zero context lock-in.
 */
export function ThemeToggle({
  theme = 'system',
  resolvedTheme = 'light',
  onToggle,
  showLabel = true,
  className,
  ...props
}: ThemeToggleProps) {
  const isDark = resolvedTheme === 'dark';

  return (
    <button
      type="button"
      className={cn(styles.toggle, className)}
      onClick={onToggle}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      title={`Current: ${theme} (${resolvedTheme}). Click to toggle`}
      {...props}
    >
      <Icon
        name={isDark ? 'sun' : 'moon'}
        size={14}
        className={styles.icon}
        aria-hidden="true"
      />
      {showLabel && <span>{isDark ? 'Light' : 'Dark'}</span>}
    </button>
  );
}
