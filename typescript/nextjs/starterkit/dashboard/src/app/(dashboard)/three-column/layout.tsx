import type React from 'react';
import {
  demoBreadcrumbs,
  demoLogo,
  demoNavigation,
  demoUser,
} from '@/fixtures/dashboard-data';
import { ThreeColumnLayout } from '@/layouts';

export default function ThreeColumnDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThreeColumnLayout
      logo={demoLogo}
      navigation={demoNavigation}
      breadcrumbs={demoBreadcrumbs}
      pageTitle="Three Column"
      pageDescription="Layout with persistent contextual inspector panel"
      user={demoUser}
      inspectorTitle="Properties & Details"
      inspectorDescription="Selected object attributes"
    >
      {children}
    </ThreeColumnLayout>
  );
}

