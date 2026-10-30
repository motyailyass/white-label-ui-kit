import type React from 'react';
import { cn } from '@/lib/cn';
import styles from './direction-toggle.module.css';

export interface DirectionToggleProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  direction?: 'ltr' | 'rtl';
  isRtl?: boolean;
  onToggle?: () => void;
  showLabel?: boolean;
  label?: string;
}

/**
 * Pure DirectionToggle UI primitive.
 * Accepts direction state and onToggle callback via native props with zero context lock-in.
 */
export function DirectionToggle({
  direction = 'ltr',
  isRtl = direction === 'rtl',
  onToggle,
  showLabel = true,
  label,
  className,
  ...props
}: DirectionToggleProps) {
  const displayLabel = label || (isRtl ? 'العربية (RTL)' : 'English (LTR)');

  return (
    <button
      type="button"
      className={cn(styles.toggle, className)}
      onClick={onToggle}
      aria-label={`Switch to ${isRtl ? 'Left-to-Right' : 'Right-to-Left'} layout`}
      title={`Current: ${direction.toUpperCase()}. Click to switch to ${isRtl ? 'LTR' : 'RTL'}`}
      {...props}
    >
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
        <path d="M4 12h16" />
        <path d="m14 6 6 6-6 6" />
        <path d="m10 18-6-6 6-6" />
      </svg>
      {showLabel && <span>{displayLabel}</span>}
      <span className={styles.badge}>{direction.toUpperCase()}</span>
    </button>
  );
}
