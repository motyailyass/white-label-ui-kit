'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { demoBidiInfo, demoMetrics } from '@/fixtures/dashboard-data';
import { BidiText } from '@/i18n';
import { useI18n } from '@/providers';
import styles from './dashboard.module.css';

export function OverviewContent() {
  const { t, formatNumber, formatCurrency, formatPercent, formatDate } = useI18n();

  return (
    <div className={styles.pageContainer}>
      <div className={styles.headerRow}>
        <div className={styles.headerSection}>
          <h2 className={styles.title}>{t('dashboard.overview.title')}</h2>
          <p className={styles.subtitle}>{t('dashboard.overview.subtitle')}</p>
        </div>
        <div className={styles.actionRow}>
          <Button variant="secondary" size="sm">
            {t('common.filter')}
          </Button>
          <Button variant="primary">{t('common.exportReport')}</Button>
        </div>
      </div>

      <div className={styles.metricsGrid}>
        {demoMetrics.map((metric) => (
          <div key={metric.id} className={styles.metricCard}>
            <span className={styles.metricLabel} data-role="eyebrow">
              {t(metric.titleKey)}
            </span>
            <span className={styles.metricValue}>
              {metric.type === 'currency' ? (
                <BidiText dir="ltr">{formatCurrency(metric.value, metric.currency)}</BidiText>
              ) : (
                <BidiText dir="ltr">{formatNumber(metric.value)}</BidiText>
              )}
            </span>
            {metric.changeType === 'positive' ? (
              <span className={styles.metricChangePositive}>
                <BidiText dir="ltr">
                  ↑ {formatPercent(metric.changeFraction, { maximumFractionDigits: 1 })}
                </BidiText>{' '}
                {t(metric.changeKey)}
              </span>
            ) : (
              <span className={styles.metricChangeNeutral}>
                {t(metric.changeKey)}:{' '}
                <BidiText dir="auto">{formatDate(demoBidiInfo.lastUpdated)}</BidiText>
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
