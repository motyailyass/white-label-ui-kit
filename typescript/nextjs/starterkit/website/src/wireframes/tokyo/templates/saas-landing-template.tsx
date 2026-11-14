'use client';

import type React from 'react';
import {
  TokyoBentoGrid,
  TokyoCta,
  TokyoFaq,
  TokyoFooter,
  TokyoHero,
  TokyoNavbar,
  TokyoPricing,
  TokyoProcess,
} from '../sections';
import styles from './tokyo-templates.module.css';

export interface SaasLandingTemplateProps {
  brandName?: string;
  heroTitle?: string;
  heroSubtitle?: string;
  onCtaClick?: () => void;
  linkAs?: React.ElementType;
}

export function SaasLandingTemplate({
  brandName,
  heroTitle,
  heroSubtitle,
  onCtaClick,
  linkAs,
}: SaasLandingTemplateProps) {
  return (
    <div className={styles.landingPage}>
      {/* 1. Floating Pill Navigation */}
      <TokyoNavbar brandName={brandName} onCtaClick={onCtaClick} linkAs={linkAs} />

      <main>
        {/* 2. Hero Section with 2-Column Wireframe & Filter Bar */}
        <TokyoHero title={heroTitle} subtitle={heroSubtitle} linkAs={linkAs} />

        {/* 3. 3-Step Process Flow (Image 1 Blueprint) */}
        <TokyoProcess />

        {/* 4. Tokyo Bento Grid Features */}
        <TokyoBentoGrid />

        {/* 4. Predictable Pricing Plans */}
        <TokyoPricing linkAs={linkAs} />

        {/* 5. Frequently Asked Questions */}
        <TokyoFaq />

        {/* 6. High-Conversion Final CTA */}
        <TokyoCta />
      </main>

      {/* 7. Comprehensive Sitemap Footer */}
      <TokyoFooter brandName={brandName} linkAs={linkAs} />
    </div>
  );
}
