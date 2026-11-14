'use client';

import type React from 'react';
import { Icon } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { WireframePlaceholder } from '@/components/website';
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
  layout?: 'two-column' | 'centered';
  showFilterBar?: boolean;
  filterBar?: React.ReactNode;
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
  layout = 'two-column',
  showFilterBar = true,
  filterBar,
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
  const ActionLink = linkAs ?? 'a';

  return (
    <section
      className={cn(styles.heroSection, className)}
      data-layout={layout}
      id="architecture"
      {...props}
    >
      <div className={styles.container}>
        {layout === 'two-column' ? (
          <div className={styles.twoColumnGrid}>
            <div className={styles.contentCol}>
              {resolvedBadge && (
                <div className={styles.badge} data-role="eyebrow">
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
            </div>

            <div className={styles.mediaCol}>
              {children || (
                <WireframePlaceholder
                  aspectRatio="4 / 3"
                  rounded="2xl"
                  className={styles.heroPlaceholder}
                />
              )}
            </div>
          </div>
        ) : (
          <div className={styles.centeredLayout}>
            {resolvedBadge && (
              <div className={styles.badge} data-role="eyebrow">
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

            <div className={styles.centeredMedia}>
              {children || (
                <WireframePlaceholder
                  aspectRatio="16 / 9"
                  rounded="2xl"
                  className={styles.heroPlaceholder}
                />
              )}
            </div>
          </div>
        )}

        {/* Floating Overlapping Wireframe Filter Bar */}
        {showFilterBar && (
          <div className={styles.filterBarWrapper}>
            {filterBar || (
              <div className={styles.filterCard} role="search" aria-label={t('website.filter.search')}>
                <div className={styles.filterSection}>
                  <div className={styles.filterSectionHeader}>
                    <span className={styles.radioDot} aria-hidden="true" />
                    <span className={styles.filterSectionTitle}>{t('website.filter.pickupLabel')}</span>
                  </div>
                  <div className={styles.filterFields}>
                    <div className={styles.filterField}>
                      <span className={styles.filterFieldLabel}>{t('website.filter.locations')}</span>
                      <div className={styles.filterFieldControl}>
                        <span>{t('website.filter.selectCity')}</span>
                        <Icon name="chevron-down" size={14} />
                      </div>
                    </div>
                    <div className={styles.filterField}>
                      <span className={styles.filterFieldLabel}>{t('website.filter.date')}</span>
                      <div className={styles.filterFieldControl}>
                        <span>{t('website.filter.selectDate')}</span>
                        <Icon name="chevron-down" size={14} />
                      </div>
                    </div>
                    <div className={styles.filterField}>
                      <span className={styles.filterFieldLabel}>{t('website.filter.time')}</span>
                      <div className={styles.filterFieldControl}>
                        <span>{t('website.filter.selectTime')}</span>
                        <Icon name="chevron-down" size={14} />
                      </div>
                    </div>
                  </div>
                </div>

                <div className={styles.filterSectionDivider} aria-hidden="true" />

                <div className={styles.filterSection}>
                  <div className={styles.filterSectionHeader}>
                    <span className={styles.radioDot} aria-hidden="true" />
                    <span className={styles.filterSectionTitle}>{t('website.filter.dropoffLabel')}</span>
                  </div>
                  <div className={styles.filterFields}>
                    <div className={styles.filterField}>
                      <span className={styles.filterFieldLabel}>{t('website.filter.locations')}</span>
                      <div className={styles.filterFieldControl}>
                        <span>{t('website.filter.selectCity')}</span>
                        <Icon name="chevron-down" size={14} />
                      </div>
                    </div>
                    <div className={styles.filterField}>
                      <span className={styles.filterFieldLabel}>{t('website.filter.date')}</span>
                      <div className={styles.filterFieldControl}>
                        <span>{t('website.filter.selectDate')}</span>
                        <Icon name="chevron-down" size={14} />
                      </div>
                    </div>
                    <div className={styles.filterField}>
                      <span className={styles.filterFieldLabel}>{t('website.filter.time')}</span>
                      <div className={styles.filterFieldControl}>
                        <span>{t('website.filter.selectTime')}</span>
                        <Icon name="chevron-down" size={14} />
                      </div>
                    </div>
                  </div>
                </div>

                <div className={styles.filterAction}>
                  <Button type="button" variant="primary" size="lg" className={styles.searchButton}>
                    <Icon name="search" size={18} />
                    <span>{t('website.filter.search')}</span>
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
