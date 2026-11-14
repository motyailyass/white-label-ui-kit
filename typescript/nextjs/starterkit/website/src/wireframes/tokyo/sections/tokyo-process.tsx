'use client';

import type React from 'react';
import { Icon, type IconName } from '@/components/icons';
import { cn } from '@/lib/cn';
import { useI18n } from '@/providers';
import styles from './tokyo-process.module.css';

export interface ProcessStep {
  id: string;
  icon: IconName;
  title: string;
  description: string;
}

export interface TokyoProcessProps extends React.HTMLAttributes<HTMLElement> {
  title?: string;
  subtitle?: string;
  steps?: ProcessStep[];
}

export function TokyoProcess({
  title,
  subtitle,
  steps,
  className,
  ...props
}: TokyoProcessProps) {
  const { t } = useI18n();

  const resolvedTitle = title ?? t('website.process.title');
  const resolvedSubtitle = subtitle ?? t('website.process.subtitle');

  const resolvedSteps: ProcessStep[] = steps ?? [
    {
      id: 'step-1',
      icon: 'location',
      title: t('website.process.step1Title'),
      description: t('website.process.step1Desc'),
    },
    {
      id: 'step-2',
      icon: 'calendar',
      title: t('website.process.step2Title'),
      description: t('website.process.step2Desc'),
    },
    {
      id: 'step-3',
      icon: 'car',
      title: t('website.process.step3Title'),
      description: t('website.process.step3Desc'),
    },
  ];

  return (
    <section className={cn(styles.processSection, className)} id="how-it-works" {...props}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h2 className={styles.title}>{resolvedTitle}</h2>
          <p className={styles.subtitle}>{resolvedSubtitle}</p>
        </div>

        <div className={styles.stepsWrapper}>
          <ol className={styles.stepsList}>
            {resolvedSteps.map((step, index) => {
              const isLast = index === resolvedSteps.length - 1;
              return (
                <li key={step.id} className={styles.stepItem}>
                  <div className={styles.iconNode}>
                    <div className={styles.iconCircle}>
                      <Icon name={step.icon} size={28} className={styles.stepIcon} />
                    </div>
                  </div>

                  {!isLast && (
                    <div className={styles.connector} aria-hidden="true">
                      <svg
                        className={styles.connectorSvg}
                        viewBox="0 0 160 40"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        preserveAspectRatio="none"
                      >
                        <path
                          d="M 10 20 C 50 5, 110 35, 150 20"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                        />
                      </svg>
                    </div>
                  )}

                  <div className={styles.stepContent}>
                    <h3 className={styles.stepTitle}>{step.title}</h3>
                    <p className={styles.stepDescription}>{step.description}</p>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
}
