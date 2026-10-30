'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/cn';
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

const defaultFaqs: FaqItem[] = [
  {
    id: '1',
    question: 'How does the Tokyo wireframe differ from standard templates?',
    answer:
      'The Tokyo wireframe provides a high-tech structural blueprint without hardcoding decorative graphics or proprietary branding. It lets you test layout balance, conversion hierarchy, and typography immediately.',
  },
  {
    id: '2',
    question: 'Can I swap sections with other city wireframes?',
    answer:
      'Yes! All city wireframes (Tokyo, Oslo, Berlin, London) share the exact same CSS variable tokens and zero-dependency contracts, allowing you to mix and match any section.',
  },
  {
    id: '3',
    question: 'Are there any third-party UI dependencies in these sections?',
    answer:
      'Zero. All accordions, drawers, and layouts are built natively with pure React and CSS Modules, guaranteeing complete ownership and zero bundle bloat.',
  },
  {
    id: '4',
    question: 'Is dark mode supported out of the box?',
    answer:
      'Yes. All components consume native CSS Custom Properties that automatically adapt when the data-theme="dark" attribute is toggled.',
  },
];

export function TokyoFaq({
  tag = 'Got Questions?',
  title = 'Frequently Asked Questions',
  items = defaultFaqs,
  className,
  ...props
}: TokyoFaqProps) {
  const [openIds, setOpenIds] = useState<string[]>(['1']);

  const toggleItem = (id: string) => {
    setOpenIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  };

  return (
    <section className={cn(styles.section, className)} id="faq" {...props}>
      <div className={styles.header}>
        {tag && <div className={styles.tag}>{tag}</div>}
        <h2 className={styles.title}>{title}</h2>
      </div>

      <div className={styles.accordion}>
        {items.map((item) => {
          const isOpen = openIds.includes(item.id);

          return (
            <div key={item.id} className={styles.item} data-open={isOpen}>
              <button
                type="button"
                className={styles.trigger}
                onClick={() => toggleItem(item.id)}
                aria-expanded={isOpen}
              >
                <span>{item.question}</span>
                <svg
                  className={styles.chevron}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>

              {isOpen && <div className={styles.content}>{item.answer}</div>}
            </div>
          );
        })}
      </div>
    </section>
  );
}
