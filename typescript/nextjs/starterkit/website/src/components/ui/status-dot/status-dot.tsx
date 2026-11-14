'use client';

import { type ComponentPropsWithoutRef, type ReactNode, forwardRef } from 'react';
import { cn } from '@/lib/cn';
import styles from './status-dot.module.css';

export type StatusDotStatus = 'online' | 'offline' | 'busy' | 'away' | 'info';
export type StatusDotSize = 'sm' | 'md' | 'lg';

export interface StatusDotProps extends ComponentPropsWithoutRef<'span'> {
  status?: StatusDotStatus;
  size?: StatusDotSize;
  ping?: boolean;
  label?: ReactNode;
  children?: ReactNode;
  statusLabels?: Partial<Record<StatusDotStatus, string>>;
  className?: string;
  'data-testid'?: string;
  'aria-label'?: string;
}

export const StatusDot = forwardRef<HTMLSpanElement, StatusDotProps>(function StatusDot(
  {
    status = 'online',
    size = 'md',
    ping = false,
    label,
    children,
    statusLabels,
    className,
    'data-testid': testId,
    'aria-label': ariaLabel,
    ...rest
  },
  ref,
) {
  const sizeClass = size === 'sm' ? styles.sizeSm : size === 'lg' ? styles.sizeLg : styles.sizeMd;

  const statusClass =
    status === 'busy'
      ? styles.statusBusy
      : status === 'away'
        ? styles.statusAway
        : status === 'offline'
          ? styles.statusOffline
          : status === 'info'
            ? styles.statusInfo
            : styles.statusOnline;

  const displayLabel = label ?? children;
  const fallbackStatusLabel = statusLabels?.[status] ?? status;
  const computedAriaLabel =
    ariaLabel || (typeof displayLabel === 'string' ? displayLabel : fallbackStatusLabel);

  return (
    <span
      ref={ref}
      role="status"
      aria-label={computedAriaLabel}
      data-status={status}
      data-size={size}
      data-ping={ping ? 'true' : undefined}
      className={cn(styles.root, sizeClass, statusClass, className)}
      data-testid={testId}
      {...rest}
    >
      <span className={styles.dotWrapper} aria-hidden="true">
        {ping ? <span className={styles.pingRing} /> : null}
        <span className={styles.dot} />
      </span>

      {displayLabel ? <span className={styles.label}>{displayLabel}</span> : null}
    </span>
  );
});
