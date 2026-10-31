'use client';

import Link from 'next/link';
import type React from 'react';
import {
  demoUser,
  getDemoBreadcrumbs,
  getDemoLogo,
  getDemoNavigation,
} from '@/fixtures/dashboard-data';
import { ThreeColumnLayout } from '@/layouts';
import { useI18n } from '@/providers';
import { useActiveNavigation } from '../../use-active-navigation';

export default function ThreeColumnDashboardLayout({ children }: { children: React.ReactNode }) {
  const { t } = useI18n();
  const logo = getDemoLogo(t, Link);
  const breadcrumbs = getDemoBreadcrumbs(t, Link);
  const activeNavigation = useActiveNavigation(getDemoNavigation(t, Link));

  return (
    <ThreeColumnLayout
      logo={logo}
      navigation={activeNavigation}
      breadcrumbs={breadcrumbs}
      pageTitle={t('dashboard.layouts.threeColumnTitle')}
      pageDescription={t('dashboard.layouts.threeColumnDescription')}
      user={demoUser}
      inspectorTitle={t('dashboard.layouts.inspectorTitle')}
      inspectorDescription={t('dashboard.layouts.inspectorDescription')}
      inspectorCloseLabel={t('dashboard.shell.closePanel')}
      inspectorAriaLabel={t('dashboard.shell.inspectorLabel')}
      sidebarAriaLabel={t('dashboard.shell.sidebarLabel')}
      sidebarNavAriaLabel={t('dashboard.shell.primaryNavLabel')}
    >
      {children}
    </ThreeColumnLayout>
  );
}
