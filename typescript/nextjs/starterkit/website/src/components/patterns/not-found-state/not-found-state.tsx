'use client';

import type React from 'react';
import { cn } from '@/lib/cn';
import { useI18n } from '@/providers/i18n-provider';
import styles from './not-found-state.module.css';

export interface NotFoundStateProps extends React.HTMLAttributes<HTMLDivElement> {
  code?: string;
  title?: string;
  description?: string;
  homeHref?: string;
  homeLabel?: string;
  as?: React.ElementType;
}

export function NotFoundState({
  code = '404',
  title,
  description,
  homeHref = '/',
  homeLabel,
  as: LinkComponent = 'a',
  className,
  ...props
}: NotFoundStateProps) {
  const { t } = useI18n();

  const displayTitle = title || t('errors.notFoundTitle');
  const displayDescription = description || t('errors.notFoundDescription');
  const displayAction = homeLabel || t('errors.goHomeAction');

  return (
    <div className={cn(styles.container, className)} {...props}>
      <span className={styles.badge}>{code}</span>
      <h1 className={styles.title}>{displayTitle}</h1>
      <p className={styles.description}>{displayDescription}</p>

      <LinkComponent href={homeHref} className={styles.homeButton}>
        {displayAction}
      </LinkComponent>
    </div>
  );
}
