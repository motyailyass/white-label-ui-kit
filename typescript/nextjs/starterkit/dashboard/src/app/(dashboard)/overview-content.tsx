'use client';

import React from 'react';
import { BidiText } from '@/i18n';
import { useI18n } from '@/providers/i18n-provider';
import { demoBidiInfo, demoMetrics } from '@/fixtures/dashboard-data';
import styles from './dashboard.module.css';

export function OverviewContent() {
  const { t, formatNumber, formatCurrency, formatDate, locale } = useI18n();

  const currency = locale === 'ar' ? 'SAR' : locale === 'fr' ? 'EUR' : 'USD';

  return (
    <div className={styles.pageContainer}>
      <div className={styles.headerSection}>
        <h2 className={styles.title}>{t('dashboard.overview.title')}</h2>
        <p className={styles.subtitle}>{t('dashboard.overview.subtitle')}</p>
      </div>

      <div className={styles.metricsGrid}>
        {demoMetrics.map((metric) => (
          <div key={metric.id} className={styles.metricCard}>
            <span className={styles.metricLabel}>{t(metric.titleKey)}</span>
            <span className={styles.metricValue}>
              {metric.type === 'currency'
                ? formatCurrency(metric.value, currency)
                : formatNumber(metric.value)}
            </span>
            {metric.changeType === 'positive' ? (
              <span className={styles.metricChangePositive}>
                {metric.changeText} {t(metric.changeKey)}
              </span>
            ) : (
              <span className={styles.metricChangeNeutral}>
                {t(metric.changeKey)}: <BidiText dir="auto">{formatDate(new Date())}</BidiText>
              </span>
            )}
          </div>
        ))}
      </div>

      <div className={styles.bidiCard}>
        <h3 className={styles.bidiTitle}>{t('dashboard.bidi.title')}</h3>
        <p className={styles.bidiText}>
          {t('dashboard.bidi.trackingCode')}:{' '}
          <BidiText dir="ltr" className={styles.bidiValue}>
            {demoBidiInfo.trackingCode}
          </BidiText>{' '}
          — {t('dashboard.bidi.supportLine')}:{' '}
          <BidiText dir="ltr" className={styles.bidiValue}>
            {demoBidiInfo.supportPhone}
          </BidiText>{' '}
          ({t('dashboard.bidi.description')})
        </p>
      </div>
    </div>
  );
}
