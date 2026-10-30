'use client';

import type React from 'react';
import { demoLayoutConfig } from '@/fixtures/config/site';
import {
  demoBreadcrumbs,
  demoRailItems,
  demoSecondaryNav,
  demoUser,
} from '@/fixtures/dashboard-data';
import { DualSidebarLayout } from '@/layouts';
import { useActiveSecondaryNav } from '../../use-active-navigation';

export default function DualSidebarDashboardLayout({ children }: { children: React.ReactNode }) {
  const activeSecondaryNav = useActiveSecondaryNav(demoSecondaryNav);

  return (
    <DualSidebarLayout
      railItems={demoRailItems}
      secondaryTitle={demoLayoutConfig.dualSidebar.secondaryTitle}
      secondarySubtitle={demoLayoutConfig.dualSidebar.secondarySubtitle}
      secondaryNavigation={activeSecondaryNav}
      breadcrumbs={demoBreadcrumbs}
      pageTitle={demoLayoutConfig.dualSidebar.pageTitle}
      pageDescription={demoLayoutConfig.dualSidebar.pageDescription}
      user={demoUser}
    >
      {children}
    </DualSidebarLayout>
  );
}
