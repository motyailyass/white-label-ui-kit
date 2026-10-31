'use client';

import type React from 'react';
import { useState } from 'react';
import { Icon } from '@/components/icons';
import { BidiText } from '@/i18n';
import { cn } from '@/lib/cn';
import { useI18n } from '@/providers';
import styles from './tokyo-pricing.module.css';

export interface PricingTier {
  id: string;
  name: string;
  description: string;
  monthlyPrice: number | string;
  annualPrice: number | string;
  currency: string;
  isPopular?: boolean;
  ctaLabel?: string;
  ctaHref?: string;
  features: string[];
}

export interface TokyoPricingProps extends React.HTMLAttributes<HTMLElement> {
  tag?: string;
  title?: string;
  tiers?: PricingTier[];
  linkAs?: React.ElementType;
}

export function TokyoPricing({
  tag,
  title,
  tiers,
  linkAs,
  className,
  ...props
}: TokyoPricingProps) {
  const { t, formatCurrency } = useI18n();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('annual');

  const resolvedTag = tag === undefined ? t('website.pricing.tag') : tag;
  const resolvedTitle = title ?? t('website.pricing.title');
  const ActionLink = linkAs ?? 'a';

  const resolvedTiers: PricingTier[] = tiers ?? [
    {
      id: 'starter',
      name: t('website.pricing.starter.name'),
      description: t('website.pricing.starter.description'),
      monthlyPrice: 0,
      annualPrice: 0,
      currency: 'USD',
      ctaLabel: t('website.pricing.starter.cta'),
      ctaHref: '#start',
      features: [
        t('website.pricing.starter.f1'),
        t('website.pricing.starter.f2'),
        t('website.pricing.starter.f3'),
        t('website.pricing.starter.f4'),
      ],
    },
    {
      id: 'pro',
      name: t('website.pricing.pro.name'),
      description: t('website.pricing.pro.description'),
      monthlyPrice: 39,
      annualPrice: 29,
      currency: 'USD',
      isPopular: true,
      ctaLabel: t('website.pricing.pro.cta'),
      ctaHref: '#trial',
      features: [
        t('website.pricing.pro.f1'),
        t('website.pricing.pro.f2'),
        t('website.pricing.pro.f3'),
        t('website.pricing.pro.f4'),
        t('website.pricing.pro.f5'),
      ],
    },
    {
      id: 'enterprise',
      name: t('website.pricing.enterprise.name'),
      description: t('website.pricing.enterprise.description'),
      monthlyPrice: 199,
      annualPrice: 159,
      currency: 'USD',
      ctaLabel: t('website.pricing.enterprise.cta'),
      ctaHref: '#contact',
      features: [
        t('website.pricing.enterprise.f1'),
        t('website.pricing.enterprise.f2'),
        t('website.pricing.enterprise.f3'),
        t('website.pricing.enterprise.f4'),
        t('website.pricing.enterprise.f5'),
      ],
    },
  ];

  return (
    <section className={cn(styles.section, className)} id="pricing" {...props}>
      <div className={styles.header}>
        {resolvedTag && (
          <div className={styles.tag} data-role="eyebrow">
            {resolvedTag}
          </div>
        )}
        <h2 className={styles.title}>{resolvedTitle}</h2>

        <div className={styles.toggleContainer}>
          <div
            className={styles.toggleSwitch}
            role="group"
            aria-label={t('website.pricing.billingGroupLabel')}
          >
            <button
              type="button"
              className={styles.toggleOption}
              data-active={billingCycle === 'monthly'}
              data-touch-target="auto"
              aria-pressed={billingCycle === 'monthly'}
              onClick={() => setBillingCycle('monthly')}
            >
              {t('website.pricing.monthly')}
            </button>
            <button
              type="button"
              className={styles.toggleOption}
              data-active={billingCycle === 'annual'}
              data-touch-target="auto"
              aria-pressed={billingCycle === 'annual'}
              onClick={() => setBillingCycle('annual')}
            >
              {t('website.pricing.annual')}
            </button>
          </div>
          <span className={styles.saveBadge} data-role="badge">
            {t('website.pricing.saveBadge')}
          </span>
        </div>
      </div>

      <div className={styles.grid}>
        {resolvedTiers.map((tier) => {
          const rawPrice = billingCycle === 'annual' ? tier.annualPrice : tier.monthlyPrice;
          const formattedPrice =
            typeof rawPrice === 'number'
              ? formatCurrency(rawPrice, tier.currency, { maximumFractionDigits: 0 })
              : rawPrice;

          return (
            <div key={tier.id} className={styles.card} data-popular={tier.isPopular}>
              {tier.isPopular && (
                <span className={styles.popularBadge} data-role="badge">
                  {t('website.pricing.popularBadge')}
                </span>
              )}

              <div>
                <h3 className={styles.tierName}>{tier.name}</h3>
                <p className={styles.tierDescription}>{tier.description}</p>

                <div className={styles.priceWrapper}>
                  <BidiText dir="ltr" className={styles.price}>
                    {formattedPrice}
                  </BidiText>
                  <span className={styles.interval}>{t('website.pricing.perUserMonth')}</span>
                </div>

                <ul className={styles.featuresList}>
                  {tier.features.map((feature) => (
                    <li key={feature} className={styles.featureItem}>
                      <Icon name="check" size={16} className={styles.checkIcon} />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <ActionLink href={tier.ctaHref || '#'} className={styles.ctaButton}>
                {tier.ctaLabel || t('website.nav.getStarted')}
              </ActionLink>
            </div>
          );
        })}
      </div>
    </section>
  );
}
