import React, { useEffect, useId } from 'react';
import { Icon } from '@/components/icons';
import { AppToolbar } from '@/components/patterns';
import { Button } from '@/components/ui/button';
import { BidiText, isSupportedLocale, type SupportedLocale } from '@/i18n';
import { AppProviders, useI18n } from '@/providers';
import styles from './App.module.css';

function readCookieLocale(): SupportedLocale {
  if (typeof document === 'undefined') return 'en';
  const match = document.cookie.match(/(?:^|;\s*)locale=([^;]+)/);
  const raw = match ? decodeURIComponent(match[1]) : undefined;
  return isSupportedLocale(raw) ? raw : 'en';
}

function DashboardOverview() {
  const { t, formatNumber, formatCurrency, formatPercent } = useI18n();
  const overviewHeadingId = useId();
  const bidiHeadingId = useId();

  useEffect(() => {
    document.title = t('dashboard.meta.title');
  }, [t]);

  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <div className={styles.brandGroup}>
          <span className={styles.eyebrow} data-role="eyebrow">
            {t('dashboard.meta.brandName')}
          </span>
          <h1 className={styles.pageTitle}>{t('dashboard.layouts.classicTitle')}</h1>
        </div>
        <AppToolbar />
      </header>

      <main className={styles.main}>
        <section aria-labelledby={overviewHeadingId} className={styles.sectionHeader}>
          <div className={styles.sectionHeadingGroup}>
            <h2 id={overviewHeadingId} className={styles.sectionTitle}>
              {t('dashboard.overview.title')}
            </h2>
            <p className={styles.sectionSubtitle}>{t('dashboard.overview.subtitle')}</p>
          </div>
          <div className={styles.actions}>
            <Button variant="secondary" size="sm" startIcon={<Icon name="search" size={16} />}>
              {t('common.filter')}
            </Button>
            <Button variant="primary" endIcon={<Icon name="chevron-right" size={16} />}>
              {t('common.exportReport')}
            </Button>
          </div>
        </section>

        <section aria-label={t('dashboard.overview.title')} className={styles.metricsGrid}>
          <div className={styles.card}>
            <span className={styles.eyebrow} data-role="eyebrow">
              {t('dashboard.metrics.monthlyRevenue')}
            </span>
            <span className={styles.metricValue}>
              <BidiText dir="ltr">{formatCurrency(128430, 'USD')}</BidiText>
            </span>
            <span className={styles.metricDelta}>
              <BidiText dir="ltr">↑ {formatPercent(0.125, { maximumFractionDigits: 1 })}</BidiText>{' '}
              {t('dashboard.metrics.thisMonth')}
            </span>
          </div>

          <div className={styles.card}>
            <span className={styles.eyebrow} data-role="eyebrow">
              {t('dashboard.metrics.totalUsers')}
            </span>
            <span className={styles.metricValue}>
              <BidiText dir="ltr">{formatNumber(14290)}</BidiText>
            </span>
            <span className={styles.metricDelta}>
              <BidiText dir="ltr">↑ {formatPercent(0.082, { maximumFractionDigits: 1 })}</BidiText>{' '}
              {t('dashboard.metrics.thisMonth')}
            </span>
          </div>
        </section>

        <section aria-labelledby={bidiHeadingId} className={styles.card}>
          <h3 id={bidiHeadingId} className={styles.sectionTitle}>
            {t('dashboard.bidi.title')}
          </h3>
          <p className={styles.bidiMeta}>
            {t('dashboard.bidi.trackingCode')}:{' '}
            <BidiText dir="ltr" className={styles.monoToken}>
              #US-8942-BIDI
            </BidiText>{' '}
            — {t('dashboard.bidi.supportLine')}:{' '}
            <BidiText dir="ltr" className={styles.monoToken}>
              +1 (800) 555-0199
            </BidiText>{' '}
            ({t('dashboard.bidi.description')})
          </p>
        </section>
      </main>
    </div>
  );
}

export function App({ initialLocale }: { initialLocale?: SupportedLocale }) {
  const startLocale = initialLocale ?? readCookieLocale();

  return (
    <AppProviders initialLocale={startLocale}>
      <DashboardOverview />
    </AppProviders>
  );
}
