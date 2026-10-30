import React from 'react';
import { SaasLandingTemplate } from '@/wireframes/tokyo';

export default function HomePage() {
  return (
    <SaasLandingTemplate
      brandName="Tokyo.dev"
      heroTitle="The Next-Gen Edge Platform for Developers"
      heroSubtitle="Deploy globally in milliseconds. Zero runtime lock-in, native standards, and autonomous scalability out of the box."
    />
  );
}
