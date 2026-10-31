'use client';

import type React from 'react';
import { BidiText } from '@/i18n';
import { cn } from '@/lib/cn';
import { useI18n } from '@/providers';
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

  const displayTitle = title ?? t('errors.notFoundTitle');
  const displayDescription = description ?? t('errors.notFoundDescription');
  const displayAction = homeLabel ?? t('errors.goHomeAction');

  return (
    <div className={cn(styles.container, className)} {...props}>
      <span className={styles.badge} data-role="badge">
        <BidiText dir="ltr">{code}</BidiText>
      </span>
      <h1 className={styles.title}>{displayTitle}</h1>
      <p className={styles.description}>{displayDescription}</p>

      <LinkComponent href={homeHref} className={styles.homeButton}>
        {displayAction}
      </LinkComponent>
    </div>
  );
}
