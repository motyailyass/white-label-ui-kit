'use client';

import type React from 'react';
import { cn } from '@/lib/cn';
import { useI18n } from '@/providers/i18n-provider';
import { Icon } from '@/components/icons';
import styles from './error-state.module.css';

export interface ErrorStateProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  description?: string;
  error?: Error;
  onRetry?: () => void;
  showHome?: boolean;
  homeHref?: string;
  as?: React.ElementType;
}

export function ErrorState({
  title,
  description,
  error: _error,
  onRetry,
  showHome = true,
  homeHref = '/',
  as: LinkComponent = 'a',
  className,
  ...props
}: ErrorStateProps) {
  const { t } = useI18n();

  const displayTitle = title || t('errors.genericTitle');
  const displayDescription = description || t('errors.genericDescription');

  return (
    <div className={cn(styles.container, className)} {...props}>
      <div className={styles.iconWrapper} aria-hidden="true">
        <Icon name="error" size={24} />
      </div>

      <h2 className={styles.title}>{displayTitle}</h2>
      <p className={styles.description}>{displayDescription}</p>

      <div className={styles.actions}>
        {onRetry && (
          <button type="button" onClick={onRetry} className={styles.retryButton}>
            {t('errors.retryAction')}
          </button>
        )}
        {showHome && (
          <LinkComponent href={homeHref} className={styles.secondaryButton}>
            {t('errors.goHomeAction')}
          </LinkComponent>
        )}
      </div>
    </div>
  );
}
