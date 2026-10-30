'use client';

import React from 'react';
import {
  TokyoNavbar,
  TokyoHero,
  TokyoBentoGrid,
  TokyoPricing,
  TokyoFaq,
  TokyoCta,
  TokyoFooter,
} from '../sections';

export interface SaasLandingTemplateProps {
  brandName?: string;
  heroTitle?: string;
  heroSubtitle?: string;
  onCtaClick?: () => void;
}

export function SaasLandingTemplate({
  brandName = 'Tokyo.dev',
  heroTitle = 'The Next-Gen Edge Platform for Developers',
  heroSubtitle = 'Deploy globally in milliseconds. Zero runtime lock-in, native standards, and autonomous scalability out of the box.',
  onCtaClick,
}: SaasLandingTemplateProps) {
  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--color-bg-base)',
        color: 'var(--color-text-primary)',
      }}
    >
      {/* 1. Floating Pill Navigation */}
      <TokyoNavbar brandName={brandName} onCtaClick={onCtaClick} />

      <main>
        {/* 2. Hero Section with Interactive Mockup */}
        <TokyoHero
          title={heroTitle}
          subtitle={heroSubtitle}
          badgeText="v1.0 Production Architecture"
        />

        {/* 3. Tokyo Bento Grid Features */}
        <TokyoBentoGrid />

        {/* 4. Predictable Pricing Plans */}
        <TokyoPricing />

        {/* 5. Frequently Asked Questions */}
        <TokyoFaq />

        {/* 6. High-Conversion Final CTA */}
        <TokyoCta />
      </main>

      {/* 7. Comprehensive Sitemap Footer */}
      <TokyoFooter brandName={brandName} />
    </div>
  );
}
