'use client';

import type React from 'react';
import { useI18n } from '@/providers';
import { TokyoFooter, TokyoHero, TokyoNavbar } from '../sections';
import styles from './tokyo-templates.module.css';

export interface WaitlistTemplateProps {
  brandName?: string;
  headline?: string;
  subheadline?: string;
  linkAs?: React.ElementType;
}

export function WaitlistTemplate({
  brandName,
  headline,
  subheadline,
  linkAs,
}: WaitlistTemplateProps) {
  const { t } = useI18n();

  return (
    <div className={styles.waitlistPage}>
      <TokyoNavbar
        brandName={brandName}
        ctaLabel={t('website.waitlist.joinCta')}
        ctaHref="#join"
        linkAs={linkAs}
      />

      <main className={styles.waitlistMain}>
        <TokyoHero
          title={headline ?? t('website.waitlist.headline')}
          subtitle={subheadline ?? t('website.waitlist.subheadline')}
          badgeText={t('website.waitlist.badge')}
          primaryCtaLabel={t('website.waitlist.requestAccessCta')}
          primaryCtaHref="#join"
          secondaryCtaLabel={t('website.waitlist.roadmapCta')}
          secondaryCtaHref="#roadmap"
          linkAs={linkAs}
        />
      </main>

      <TokyoFooter brandName={brandName} linkAs={linkAs} />
    </div>
  );
}
