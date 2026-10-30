'use client';

import type React from 'react';
import { demoBreadcrumbs, demoLogo, demoNavigation, demoUser } from '@/fixtures/dashboard-data';
import { ClassicLayout } from '@/layouts';
import { useActiveNavigation } from '../../use-active-navigation';

export default function ClassicDashboardLayout({ children }: { children: React.ReactNode }) {
  const activeNavigation = useActiveNavigation(demoNavigation);

  return (
    <ClassicLayout
      logo={demoLogo}
      navigation={activeNavigation}
      breadcrumbs={demoBreadcrumbs}
      user={demoUser}
    >
      {children}
    </ClassicLayout>
  );
}
