'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/cn';
import styles from './tokyo-pricing.module.css';

export interface PricingTier {
  id: string;
  name: string;
  description: string;
  monthlyPrice: string;
  annualPrice: string;
  isPopular?: boolean;
  ctaLabel?: string;
  ctaHref?: string;
  features: string[];
}

export interface TokyoPricingProps extends React.HTMLAttributes<HTMLElement> {
  tag?: string;
  title?: string;
  tiers?: PricingTier[];
}

const defaultTiers: PricingTier[] = [
  {
    id: 'starter',
    name: 'Developer',
    description: 'Perfect for side projects and individual builders.',
    monthlyPrice: '$0',
    annualPrice: '$0',
    ctaLabel: 'Start for Free',
    ctaHref: '#start',
    features: ['Up to 3 projects', 'Community support', 'Basic analytics', '1GB storage'],
  },
  {
    id: 'pro',
    name: 'Team',
    description: 'For growing teams requiring fast edge deployments.',
    monthlyPrice: '$39',
    annualPrice: '$29',
    isPopular: true,
    ctaLabel: 'Start 14-Day Trial',
    ctaHref: '#trial',
    features: [
      'Unlimited projects',
      'Priority SLA support',
      'Custom domains & SSL',
      'Advanced analytics',
      '50GB storage',
    ],
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'Custom infrastructure with dedicated isolation.',
    monthlyPrice: '$199',
    annualPrice: '$159',
    ctaLabel: 'Contact Sales',
    ctaHref: '#contact',
    features: [
      'Dedicated isolated VPC',
      '99.99% uptime guarantee',
      'Audit logs & SSO/SAML',
      '24/7 Phone support',
      'Custom contracts',
    ],
  },
];

export function TokyoPricing({
  tag = 'Transparent Pricing',
  title = 'Predictable plans that scale with you',
  tiers = defaultTiers,
  className,
  ...props
}: TokyoPricingProps) {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('annual');

  return (
    <section className={cn(styles.section, className)} id="pricing" {...props}>
      <div className={styles.header}>
        {tag && <div className={styles.tag}>{tag}</div>}
        <h2 className={styles.title}>{title}</h2>

        <div className={styles.toggleContainer}>
          <div className={styles.toggleSwitch}>
            <button
              type="button"
              className={styles.toggleOption}
              data-active={billingCycle === 'monthly'}
              onClick={() => setBillingCycle('monthly')}
            >
              Monthly
            </button>
            <button
              type="button"
              className={styles.toggleOption}
              data-active={billingCycle === 'annual'}
              onClick={() => setBillingCycle('annual')}
            >
              Annually
            </button>
          </div>
          <span className={styles.saveBadge}>Save 20%</span>
        </div>
      </div>

      <div className={styles.grid}>
        {tiers.map((tier) => {
          const price = billingCycle === 'annual' ? tier.annualPrice : tier.monthlyPrice;

          return (
            <div key={tier.id} className={styles.card} data-popular={tier.isPopular}>
              {tier.isPopular && <span className={styles.popularBadge}>Most Popular</span>}

              <div>
                <h3 className={styles.tierName}>{tier.name}</h3>
                <p className={styles.tierDescription}>{tier.description}</p>

                <div className={styles.priceWrapper}>
                  <span className={styles.price}>{price}</span>
                  <span className={styles.interval}>/ user / month</span>
                </div>

                <ul className={styles.featuresList}>
                  {tier.features.map((feature) => (
                    <li key={feature} className={styles.featureItem}>
                      <svg
                        className={styles.checkIcon}
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <a href={tier.ctaHref || '#'} className={styles.ctaButton}>
                {tier.ctaLabel || 'Get Started'}
              </a>
            </div>
          );
        })}
      </div>
    </section>
  );
}
