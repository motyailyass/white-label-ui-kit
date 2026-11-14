'use client';

import type React from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionHeader,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
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

  const resolvedTag = tag === undefined ? t('website.faq.tag') : tag;
  const resolvedTitle = title ?? t('website.faq.title');

  const resolvedItems: FaqItem[] = items ?? [
    { id: '1', question: t('website.faq.q1'), answer: t('website.faq.a1') },
    { id: '2', question: t('website.faq.q2'), answer: t('website.faq.a2') },
    { id: '3', question: t('website.faq.q3'), answer: t('website.faq.a3') },
    { id: '4', question: t('website.faq.q4'), answer: t('website.faq.a4') },
  ];

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

      <Accordion
        type="multiple"
        defaultValue={['1']}
        variant="default"
        size="lg"
        className={styles.accordion}
      >
        {resolvedItems.map((item) => (
          <AccordionItem key={item.id} value={item.id} className={styles.item}>
            <AccordionHeader as="h3" className={styles.itemHeading}>
              <AccordionTrigger className={styles.trigger}>{item.question}</AccordionTrigger>
            </AccordionHeader>
            <AccordionContent className={styles.content}>{item.answer}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
}
