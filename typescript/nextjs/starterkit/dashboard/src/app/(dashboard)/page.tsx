'use client';

import { BidiText } from '@/i18n';
import { useI18n } from '@/providers/i18n-provider';

export default function DashboardHomePage() {
  const { t, formatNumber, formatCurrency, formatDate, locale } = useI18n();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      <div>
        <h2
          style={{
            fontSize: 'var(--font-size-2xl)',
            fontWeight: 'var(--font-weight-bold)',
            marginBlockEnd: 'var(--space-1)',
          }}
        >
          {t('dashboard.overview.title', 'System Overview')}
        </h2>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)' }}>
          {t(
            'dashboard.overview.subtitle',
            'Welcome to the non-branded dashboard starter kit layout engine with native RTL & LTR support.',
          )}
        </p>
      </div>

      {/* Metric Cards Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: 'var(--space-4)',
        }}
      >
        <div
          style={{
            padding: 'var(--space-5)',
            borderRadius: 'var(--radius-lg)',
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-border-subtle)',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <div
            style={{
              fontSize: 'var(--font-size-xs)',
              color: 'var(--color-text-muted)',
              fontWeight: 'var(--font-weight-semibold)',
              textTransform: 'uppercase',
            }}
          >
            {t('dashboard.metrics.totalUsers', 'Total Users')}
          </div>
          <div
            style={{
              fontSize: 'var(--font-size-2xl)',
              fontWeight: 'var(--font-weight-bold)',
              marginBlock: 'var(--space-2)',
            }}
          >
            {formatNumber(14290)}
          </div>
          <div
            style={{
              fontSize: 'var(--font-size-xs)',
              color: 'var(--color-success)',
              fontWeight: 'var(--font-weight-medium)',
            }}
          >
            ↑ 12.5% {t('dashboard.metrics.thisMonth', 'this month')}
          </div>
        </div>

        <div
          style={{
            padding: 'var(--space-5)',
            borderRadius: 'var(--radius-lg)',
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-border-subtle)',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <div
            style={{
              fontSize: 'var(--font-size-xs)',
              color: 'var(--color-text-muted)',
              fontWeight: 'var(--font-weight-semibold)',
              textTransform: 'uppercase',
            }}
          >
            {t('dashboard.metrics.activeSessions', 'Active Sessions')}
          </div>
          <div
            style={{
              fontSize: 'var(--font-size-2xl)',
              fontWeight: 'var(--font-weight-bold)',
              marginBlock: 'var(--space-2)',
            }}
          >
            {formatNumber(3418)}
          </div>
          <div
            style={{
              fontSize: 'var(--font-size-xs)',
              color: 'var(--color-success)',
              fontWeight: 'var(--font-weight-medium)',
            }}
          >
            ↑ 8.2% {t('dashboard.metrics.peakLoad', 'peak load')}
          </div>
        </div>

        <div
          style={{
            padding: 'var(--space-5)',
            borderRadius: 'var(--radius-lg)',
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-border-subtle)',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <div
            style={{
              fontSize: 'var(--font-size-xs)',
              color: 'var(--color-text-muted)',
              fontWeight: 'var(--font-weight-semibold)',
              textTransform: 'uppercase',
            }}
          >
            {t('dashboard.metrics.monthlyRevenue', 'Monthly Revenue')}
          </div>
          <div
            style={{
              fontSize: 'var(--font-size-2xl)',
              fontWeight: 'var(--font-weight-bold)',
              marginBlock: 'var(--space-2)',
            }}
          >
            {formatCurrency(28450, locale === 'ar' ? 'SAR' : locale === 'fr' ? 'EUR' : 'USD')}
          </div>
          <div
            style={{
              fontSize: 'var(--font-size-xs)',
              color: 'var(--color-info)',
              fontWeight: 'var(--font-weight-medium)',
            }}
          >
            {t('dashboard.metrics.updatedToday', 'Updated today')}:{' '}
            <BidiText dir="auto">{formatDate(new Date())}</BidiText>
          </div>
        </div>
      </div>

      {/* Bidi Demonstration Section */}
      <div
        style={{
          padding: 'var(--space-5)',
          borderRadius: 'var(--radius-lg)',
          backgroundColor: 'var(--color-surface)',
          border: '1px solid var(--color-border-subtle)',
        }}
      >
        <h3
          style={{
            fontSize: 'var(--font-size-base)',
            fontWeight: 'var(--font-weight-semibold)',
            marginBlockEnd: 'var(--space-2)',
          }}
        >
          {t('dashboard.bidi.title', 'Bi-directional Text Handling (Bidi)')}
        </h3>
        <p
          style={{
            fontSize: 'var(--font-size-sm)',
            color: 'var(--color-text-secondary)',
            lineHeight: 'var(--line-height-normal)',
          }}
        >
          {t('dashboard.bidi.trackingCode', 'Account tracking code')}:{' '}
          <BidiText
            dir="ltr"
            style={{
              fontWeight: 'var(--font-weight-semibold)',
              color: 'var(--color-primary)',
            }}
          >
            #US-8942-BIDI
          </BidiText>{' '}
          — {t('dashboard.bidi.supportLine', 'Support direct line')}:{' '}
          <BidiText
            dir="ltr"
            style={{
              fontWeight: 'var(--font-weight-semibold)',
              color: 'var(--color-primary)',
            }}
          >
            +1 (800) 555-0199
          </BidiText>{' '}
          (
          {t(
            'dashboard.bidi.description',
            'Isolated with <bdi> to guarantee flawless punctuation in any reading direction.',
          )}
          )
        </p>
      </div>
    </div>
  );
}
