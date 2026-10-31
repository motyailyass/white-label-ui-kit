'use client';

import Link from 'next/link';
import { SaasLandingTemplate } from '@/wireframes/tokyo';

export function HomeContent() {
  return <SaasLandingTemplate linkAs={Link} />;
}
