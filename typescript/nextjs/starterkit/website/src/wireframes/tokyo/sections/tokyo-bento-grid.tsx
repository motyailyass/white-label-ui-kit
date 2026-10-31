'use client';

import type React from 'react';
import { Icon } from '@/components/icons';
import { WebsiteCard } from '@/components/website';
import { cn } from '@/lib/cn';
import { useI18n } from '@/providers';
import styles from './tokyo-bento-grid.module.css';

export interface BentoItem {
  id: string;
  title: string;
  description: string;
  span?: 1 | 2 | 3;
  icon?: React.ReactNode;
  visualPlaceholder?: string;
}

export interface TokyoBentoGridProps extends React.HTMLAttributes<HTMLElement> {
  tag?: string;
  title?: string;
  description?: string;
  items?: BentoItem[];
}

export function TokyoBentoGrid({
  tag,
  title,
  description,
  items,
  className,
  ...props
}: TokyoBentoGridProps) {
  const { t } = useI18n();

  const resolvedTag = tag === undefined ? t('website.bento.tag') : tag;
  const resolvedTitle = title ?? t('website.bento.title');
  const resolvedDescription =
    description === undefined ? t('website.bento.description') : description;

  const resolvedItems: BentoItem[] = items ?? [
    {
      id: '1',
      title: t('website.bento.item1Title'),
      description: t('website.bento.item1Desc'),
      span: 2,
      visualPlaceholder: '// auto-replicated edge data nodes\ncluster.sync({ timeoutMs: 15 });',
    },
    {
      id: '2',
      title: t('website.bento.item2Title'),
      description: t('website.bento.item2Desc'),
      span: 1,
      visualPlaceholder: '0.0ms cold start SLA',
    },
    {
      id: '3',
      title: t('website.bento.item3Title'),
      description: t('website.bento.item3Desc'),
      span: 1,
      visualPlaceholder: 'export type UserSession = ...',
    },
    {
      id: '4',
      title: t('website.bento.item4Title'),
      description: t('website.bento.item4Desc'),
      span: 2,
      visualPlaceholder: 'CPU: 12% | RAM: 180MB | REQ: 42,000/s',
    },
  ];

  return (
    <section className={cn(styles.section, className)} id="features" {...props}>
      <div className={styles.header}>
        {resolvedTag && (
          <div className={styles.tag} data-role="eyebrow">
            {resolvedTag}
          </div>
        )}
        <h2 className={styles.title}>{resolvedTitle}</h2>
        {resolvedDescription && <p className={styles.description}>{resolvedDescription}</p>}
      </div>

      <div className={styles.grid}>
        {resolvedItems.map((item) => {
          const spanClass = item.span === 2 ? styles.span2 : item.span === 3 ? styles.span3 : '';

          return (
            <WebsiteCard
              key={item.id}
              as="div"
              elevation="raised"
              className={cn(styles.card, spanClass)}
            >
              <div>
                <div className={styles.cardIcon}>
                  {item.icon || <Icon name="feature" size={20} />}
                </div>
                <h3 className={styles.cardTitle}>{item.title}</h3>
                <p className={styles.cardText}>{item.description}</p>
              </div>

              {item.visualPlaceholder && (
                <div className={styles.cardVisual}>
                  <pre className={styles.codeBlock} lang="en" dir="ltr">
                    <code>{item.visualPlaceholder}</code>
                  </pre>
                </div>
              )}
            </WebsiteCard>
          );
        })}
      </div>
    </section>
  );
}
