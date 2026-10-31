'use client';

import Link from 'next/link';
import type React from 'react';
import {
  demoUser,
  getDemoBreadcrumbs,
  getDemoLogo,
  getDemoNavigation,
} from '@/fixtures/dashboard-data';
import { ClassicLayout } from '@/layouts';
import { useI18n } from '@/providers';
import { useActiveNavigation } from '../../use-active-navigation';

export default function ClassicDashboardLayout({ children }: { children: React.ReactNode }) {
  const { t } = useI18n();
  const logo = getDemoLogo(t, Link);
  const breadcrumbs = getDemoBreadcrumbs(t, Link);
  const activeNavigation = useActiveNavigation(getDemoNavigation(t, Link));

  return (
    <ClassicLayout
      logo={logo}
      navigation={activeNavigation}
      breadcrumbs={breadcrumbs}
      pageTitle={t('dashboard.layouts.classicTitle')}
      pageDescription={t('dashboard.layouts.classicDescription')}
      user={demoUser}
      sidebarAriaLabel={t('dashboard.shell.sidebarLabel')}
      sidebarNavAriaLabel={t('dashboard.shell.primaryNavLabel')}
    >
      {children}
    </ClassicLayout>
  );
}
