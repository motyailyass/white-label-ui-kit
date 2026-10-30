import type React from 'react';
import {
  demoBreadcrumbs,
  demoRailItems,
  demoSecondaryNav,
  demoUser,
} from '@/fixtures/dashboard-data';
import { DualSidebarLayout } from '@/layouts';

export default function DualSidebarDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DualSidebarLayout
      railItems={demoRailItems}
      secondaryTitle="Workspace"
      secondarySubtitle="Engineering Team"
      secondaryNavigation={demoSecondaryNav}
      breadcrumbs={demoBreadcrumbs}
      pageTitle="Dual Sidebar"
      pageDescription="Two-tiered primary icon rail and nested sub-tree navigation"
      user={demoUser}
    >
      {children}
    </DualSidebarLayout>
  );
}
