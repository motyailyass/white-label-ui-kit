'use client';

import type React from 'react';
import { BidiText } from '@/i18n';
import { cn } from '@/lib/cn';
import { useI18n } from '@/providers';
import styles from './tokyo-hero.module.css';

export interface TokyoHeroProps extends React.HTMLAttributes<HTMLElement> {
  badgeText?: string;
  title?: string;
  subtitle?: string;
  primaryCtaLabel?: string;
  primaryCtaHref?: string;
  secondaryCtaLabel?: string;
  secondaryCtaHref?: string;
  mockupTitle?: string;
  linkAs?: React.ElementType;
  children?: React.ReactNode;
}

export function TokyoHero({
  badgeText,
  title,
  subtitle,
  primaryCtaLabel,
  primaryCtaHref = '#pricing',
  secondaryCtaLabel,
  secondaryCtaHref = '#docs',
  mockupTitle,
  linkAs,
  className,
  children,
  ...props
}: TokyoHeroProps) {
  const { t } = useI18n();

  const resolvedBadge = badgeText === undefined ? t('website.hero.badge') : badgeText;
  const resolvedTitle = title ?? t('website.hero.title');
  const resolvedSubtitle = subtitle ?? t('website.hero.subtitle');
  const resolvedPrimaryCta =
    primaryCtaLabel === undefined ? t('website.hero.primaryCta') : primaryCtaLabel;
  const resolvedSecondaryCta =
    secondaryCtaLabel === undefined ? t('website.hero.secondaryCta') : secondaryCtaLabel;
  const resolvedMockupTitle = mockupTitle ?? t('website.hero.mockupTitle');
  const ActionLink = linkAs ?? 'a';

  return (
    <section className={cn(styles.hero, className)} id="architecture" {...props}>
      {resolvedBadge && (
        <div className={styles.badge}>
          <span className={styles.badgeDot} aria-hidden="true" />
          <span>{resolvedBadge}</span>
        </div>
      )}

      <h1 className={styles.title}>{resolvedTitle}</h1>
      <p className={styles.subtitle}>{resolvedSubtitle}</p>

      <div className={styles.ctaGroup}>
        {resolvedPrimaryCta && (
          <ActionLink href={primaryCtaHref} className={styles.primaryCta}>
            {resolvedPrimaryCta}
          </ActionLink>
        )}
        {resolvedSecondaryCta && (
          <ActionLink href={secondaryCtaHref} className={styles.secondaryCta}>
            {resolvedSecondaryCta}
          </ActionLink>
        )}
      </div>

      <div className={styles.mockup}>
        <div className={styles.mockupHeader}>
          <span className={cn(styles.windowDot, styles.windowDotDanger)} aria-hidden="true" />
          <span className={cn(styles.windowDot, styles.windowDotWarning)} aria-hidden="true" />
          <span className={cn(styles.windowDot, styles.windowDotSuccess)} aria-hidden="true" />
          <BidiText dir="ltr" className={styles.mockupTitle}>
            {resolvedMockupTitle}
          </BidiText>
        </div>
        <div className={styles.mockupContent}>
          {children || (
            <div className={styles.metricsGrid}>
              <div className={styles.metricBox}>
                <div className={styles.metricLabel} data-role="eyebrow">
                  {t('website.hero.latencyLabel')}
                </div>
                <div className={styles.metricValue}>
                  <BidiText dir="ltr">{t('website.hero.latencyValue')}</BidiText>
                </div>
                <div className={styles.metricNoteSuccess}>{t('website.hero.latencyNote')}</div>
              </div>
              <div className={styles.metricBox}>
                <div className={styles.metricLabel} data-role="eyebrow">
                  {t('website.hero.uptimeLabel')}
                </div>
                <div className={styles.metricValue}>
                  <BidiText dir="ltr">{t('website.hero.uptimeValue')}</BidiText>
                </div>
                <div className={styles.metricNoteSuccess}>{t('website.hero.uptimeNote')}</div>
              </div>
              <div className={styles.metricBox}>
                <div className={styles.metricLabel} data-role="eyebrow">
                  {t('website.hero.securityLabel')}
                </div>
                <div className={styles.metricValue}>{t('website.hero.securityValue')}</div>
                <div className={styles.metricNoteInfo}>{t('website.hero.securityNote')}</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
