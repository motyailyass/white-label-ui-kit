'use client';

import React from 'react';
import { cn } from '@/lib/cn';
import styles from './tokyo-hero.module.css';

export interface TokyoHeroProps extends React.HTMLAttributes<HTMLElement> {
  badgeText?: string;
  title: string;
  subtitle: string;
  primaryCtaLabel?: string;
  primaryCtaHref?: string;
  secondaryCtaLabel?: string;
  secondaryCtaHref?: string;
  mockupTitle?: string;
  children?: React.ReactNode;
}

export function TokyoHero({
  badgeText = 'v1.0 Architecture Released',
  title,
  subtitle,
  primaryCtaLabel = 'Start Free Trial',
  primaryCtaHref = '#pricing',
  secondaryCtaLabel = 'Read Docs',
  secondaryCtaHref = '#docs',
  mockupTitle = 'terminal@tokyo:~',
  className,
  children,
  ...props
}: TokyoHeroProps) {
  return (
    <section className={cn(styles.hero, className)} {...props}>
      {badgeText && (
        <div className={styles.badge}>
          <span className={styles.badgeDot} aria-hidden="true" />
          <span>{badgeText}</span>
        </div>
      )}

      <h1 className={styles.title}>{title}</h1>
      <p className={styles.subtitle}>{subtitle}</p>

      <div className={styles.ctaGroup}>
        {primaryCtaLabel && (
          <a href={primaryCtaHref} className={styles.primaryCta}>
            {primaryCtaLabel}
          </a>
        )}
        {secondaryCtaLabel && (
          <a href={secondaryCtaHref} className={styles.secondaryCta}>
            {secondaryCtaLabel}
          </a>
        )}
      </div>

      <div className={styles.mockup}>
        <div className={styles.mockupHeader}>
          <span className={styles.windowDot} style={{ backgroundColor: '#ef4444' }} />
          <span className={styles.windowDot} style={{ backgroundColor: '#f59e0b' }} />
          <span className={styles.windowDot} style={{ backgroundColor: '#10b981' }} />
          <span className={styles.mockupTitle}>{mockupTitle}</span>
        </div>
        <div className={styles.mockupContent}>
          {children || (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: 'var(--space-4)',
              }}
            >
              <div
                style={{
                  padding: 'var(--space-4)',
                  borderRadius: 'var(--radius-card)',
                  border: '1px dashed var(--color-border-strong)',
                }}
              >
                <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
                  LATENCY
                </div>
                <div
                  style={{
                    fontSize: 'var(--font-size-2xl)',
                    fontWeight: 'var(--font-weight-bold)',
                    color: 'var(--color-text-primary)',
                  }}
                >
                  12ms
                </div>
                <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-success)' }}>
                  Global edge delivery
                </div>
              </div>
              <div
                style={{
                  padding: 'var(--space-4)',
                  borderRadius: 'var(--radius-card)',
                  border: '1px dashed var(--color-border-strong)',
                }}
              >
                <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
                  UPTIME
                </div>
                <div
                  style={{
                    fontSize: 'var(--font-size-2xl)',
                    fontWeight: 'var(--font-weight-bold)',
                    color: 'var(--color-text-primary)',
                  }}
                >
                  99.99%
                </div>
                <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-success)' }}>
                  SLA Guaranteed
                </div>
              </div>
              <div
                style={{
                  padding: 'var(--space-4)',
                  borderRadius: 'var(--radius-card)',
                  border: '1px dashed var(--color-border-strong)',
                }}
              >
                <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
                  SECURITY
                </div>
                <div
                  style={{
                    fontSize: 'var(--font-size-2xl)',
                    fontWeight: 'var(--font-weight-bold)',
                    color: 'var(--color-text-primary)',
                  }}
                >
                  Zero-Trust
                </div>
                <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-info)' }}>
                  End-to-end encrypted
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
