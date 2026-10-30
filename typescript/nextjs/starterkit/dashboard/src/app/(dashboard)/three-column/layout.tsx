'use client';

import type React from 'react';
import { demoLayoutConfig } from '@/fixtures/config/site';
import {
  demoBreadcrumbs,
  demoLogo,
  demoNavigation,
  demoUser,
} from '@/fixtures/dashboard-data';
import { ThreeColumnLayout } from '@/layouts';
import { useActiveNavigation } from '../../use-active-navigation';

export default function ThreeColumnDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const activeNavigation = useActiveNavigation(demoNavigation);

  return (
    <ThreeColumnLayout
      logo={demoLogo}
      navigation={activeNavigation}
      breadcrumbs={demoBreadcrumbs}
      pageTitle={demoLayoutConfig.threeColumn.pageTitle}
      pageDescription={demoLayoutConfig.threeColumn.pageDescription}
      user={demoUser}
      inspectorTitle={demoLayoutConfig.threeColumn.inspectorTitle}
      inspectorDescription={demoLayoutConfig.threeColumn.inspectorDescription}
    >
      {children}
    </ThreeColumnLayout>
  );
}
