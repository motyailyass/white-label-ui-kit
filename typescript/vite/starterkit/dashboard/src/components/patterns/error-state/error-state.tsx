'use client';

import type React from 'react';
import { Icon } from '@/components/icons';
import { Button } from '@/components/ui';
import { cn } from '@/lib/cn';
import { useI18n } from '@/providers';
import styles from './error-state.module.css';

export interface ErrorStateProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  description?: string;
  headingAs?: 'h1' | 'h2';
  error?: Error;
  onRetry?: () => void;
  showHome?: boolean;
  homeHref?: string;
  as?: React.ElementType;
}

export function ErrorState({
  title,
  description,
  headingAs: HeadingTag = 'h1',
  error: _error,
  onRetry,
  showHome = true,
  homeHref = '/',
  as: LinkComponent = 'a',
  className,
  ...props
}: ErrorStateProps) {
  const { t } = useI18n();

  const displayTitle = title ?? t('errors.genericTitle');
  const displayDescription = description ?? t('errors.genericDescription');

  return (
    <div role="alert" className={cn(styles.container, className)} {...props}>
      <div className={styles.iconWrapper} aria-hidden="true">
        <Icon name="error" size={24} />
      </div>

      <HeadingTag className={styles.title}>{displayTitle}</HeadingTag>
      <p className={styles.description}>{displayDescription}</p>

      <div className={styles.actions}>
        {onRetry && (
          <Button variant="primary" onClick={onRetry}>
            {t('errors.retryAction')}
          </Button>
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
