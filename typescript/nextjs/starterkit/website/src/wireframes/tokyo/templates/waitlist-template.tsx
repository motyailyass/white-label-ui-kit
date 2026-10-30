'use client';

import React from 'react';
import { TokyoNavbar, TokyoHero, TokyoFooter } from '../sections';

export interface WaitlistTemplateProps {
  brandName?: string;
  headline?: string;
  subheadline?: string;
}

export function WaitlistTemplate({
  brandName = 'Tokyo.dev',
  headline = 'High-Velocity Infrastructure is Coming Soon',
  subheadline = 'We are onboarding private beta teams every week. Join over 4,000 developers already on the waitlist.',
}: WaitlistTemplateProps) {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'var(--color-bg-base)',
      }}
    >
      <TokyoNavbar brandName={brandName} ctaLabel="Join Beta" ctaHref="#join" />

      <main style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
        <TokyoHero
          title={headline}
          subtitle={subheadline}
          badgeText="Private Beta Access"
          primaryCtaLabel="Request Early Access"
          primaryCtaHref="#join"
          secondaryCtaLabel="View Roadmap"
          secondaryCtaHref="#roadmap"
        />
      </main>

      <TokyoFooter brandName={brandName} />
    </div>
  );
}
