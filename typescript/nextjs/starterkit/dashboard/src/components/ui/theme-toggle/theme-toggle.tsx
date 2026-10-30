import type React from 'react';
import { cn } from '@/lib/cn';
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
      {isDark ? (
        <svg
          className={styles.icon}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2" />
          <path d="M12 20v2" />
          <path d="m4.93 4.93 1.41 1.41" />
          <path d="m17.66 17.66 1.41 1.41" />
          <path d="M2 12h2" />
          <path d="M20 12h2" />
          <path d="m6.34 17.66-1.41 1.41" />
          <path d="m19.07 4.93-1.41 1.41" />
        </svg>
      ) : (
        <svg
          className={styles.icon}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
        </svg>
      )}
      {showLabel && <span>{isDark ? 'Light' : 'Dark'}</span>}
    </button>
  );
}
