'use client';

import React from 'react';
import { cn } from '@/lib/cn';
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

const defaultItems: BentoItem[] = [
  {
    id: '1',
    title: 'Distributed Real-Time Sync',
    description:
      'Sub-millisecond data sync across 35 edge regions with automatic CRDT conflict resolution.',
    span: 2,
    visualPlaceholder: '// auto-replicated edge data nodes\ncluster.sync({ timeoutMs: 15 });',
  },
  {
    id: '2',
    title: 'Zero Cold Starts',
    description: 'Instant worker execution with pre-warmed isolate runtimes worldwide.',
    span: 1,
    visualPlaceholder: '0.0ms cold start SLA',
  },
  {
    id: '3',
    title: 'Type-Safe API Contracts',
    description:
      'End-to-end type generation directly from your database schemas and edge handlers.',
    span: 1,
    visualPlaceholder: 'export type UserSession = ...',
  },
  {
    id: '4',
    title: 'Autonomous Scalability & Health Checks',
    description:
      'Scale smoothly from zero to ten million requests per second without configuration changes.',
    span: 2,
    visualPlaceholder: 'CPU: 12% | RAM: 180MB | REQ: 42,000/s',
  },
];

export function TokyoBentoGrid({
  tag = 'Engineering Features',
  title = 'Engineered for Performance and Scale',
  description = 'Every architectural layer was built with zero third-party lock-in and native web standards.',
  items = defaultItems,
  className,
  ...props
}: TokyoBentoGridProps) {
  return (
    <section className={cn(styles.section, className)} id="features" {...props}>
      <div className={styles.header}>
        {tag && <div className={styles.tag}>{tag}</div>}
        <h2 className={styles.title}>{title}</h2>
        {description && <p className={styles.description}>{description}</p>}
      </div>

      <div className={styles.grid}>
        {items.map((item) => {
          const spanClass = item.span === 2 ? styles.span2 : item.span === 3 ? styles.span3 : '';

          return (
            <div key={item.id} className={cn(styles.card, spanClass)}>
              <div>
                <div className={styles.cardIcon}>
                  {item.icon || (
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <rect width="18" height="18" x="3" y="3" rx="2" />
                      <path d="m9 12 2 2 4-4" />
                    </svg>
                  )}
                </div>
                <h3 className={styles.cardTitle}>{item.title}</h3>
                <p className={styles.cardText}>{item.description}</p>
              </div>

              {item.visualPlaceholder && (
                <div className={styles.cardVisual}>
                  <pre style={{ margin: 0 }}>{item.visualPlaceholder}</pre>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
