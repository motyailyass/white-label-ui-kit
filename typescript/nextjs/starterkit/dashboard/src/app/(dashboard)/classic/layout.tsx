import type React from 'react';
import { demoBreadcrumbs, demoLogo, demoNavigation, demoUser } from '@/fixtures/dashboard-data';
import { ClassicLayout } from '@/layouts';

export default function ClassicDashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClassicLayout
      logo={demoLogo}
      navigation={demoNavigation}
      breadcrumbs={demoBreadcrumbs}
      user={demoUser}
    >
      {children}
    </ClassicLayout>
  );
}

