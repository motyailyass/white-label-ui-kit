'use client';

import type React from 'react';
import { useId, useState } from 'react';
import { Icon } from '@/components/icons';
import { cn } from '@/lib/cn';
import { useI18n } from '@/providers';
import styles from './tokyo-faq.module.css';

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

export interface TokyoFaqProps extends React.HTMLAttributes<HTMLElement> {
  tag?: string;
  title?: string;
  items?: FaqItem[];
}

export function TokyoFaq({ tag, title, items, className, ...props }: TokyoFaqProps) {
  const { t } = useI18n();
  const baseId = useId().replace(/:/g, '');
  const [openIds, setOpenIds] = useState<string[]>(['1']);

  const resolvedTag = tag === undefined ? t('website.faq.tag') : tag;
  const resolvedTitle = title ?? t('website.faq.title');

  const resolvedItems: FaqItem[] = items ?? [
    { id: '1', question: t('website.faq.q1'), answer: t('website.faq.a1') },
    { id: '2', question: t('website.faq.q2'), answer: t('website.faq.a2') },
    { id: '3', question: t('website.faq.q3'), answer: t('website.faq.a3') },
    { id: '4', question: t('website.faq.q4'), answer: t('website.faq.a4') },
  ];

  const toggleItem = (id: string) => {
    setOpenIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  };

  return (
    <section className={cn(styles.section, className)} id="faq" {...props}>
      <div className={styles.header}>
        {resolvedTag && (
          <div className={styles.tag} data-role="eyebrow">
            {resolvedTag}
          </div>
        )}
        <h2 className={styles.title}>{resolvedTitle}</h2>
      </div>

      <div className={styles.accordion}>
        {resolvedItems.map((item) => {
          const isOpen = openIds.includes(item.id);
          const triggerId = `faq-trigger-${baseId}-${item.id}`;
          const panelId = `faq-panel-${baseId}-${item.id}`;

          return (
            <div key={item.id} className={styles.item} data-open={isOpen}>
              <h3 className={styles.itemHeading}>
                <button
                  id={triggerId}
                  type="button"
                  className={styles.trigger}
                  onClick={() => toggleItem(item.id)}
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                >
                  <span>{item.question}</span>
                  <Icon name="chevron-down" size={18} className={styles.chevron} />
                </button>
              </h3>

              <div
                id={panelId}
                role="region"
                aria-labelledby={triggerId}
                className={styles.content}
                hidden={!isOpen}
              >
                {item.answer}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
