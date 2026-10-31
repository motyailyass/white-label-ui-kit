'use client';

import Link from 'next/link';
import type React from 'react';
import {
  demoUser,
  getDemoBreadcrumbs,
  getDemoLogo,
  getDemoRailItems,
  getDemoSecondaryNav,
} from '@/fixtures/dashboard-data';
import { DualSidebarLayout } from '@/layouts';
import { useI18n } from '@/providers';
import { useActiveSecondaryNav } from '../../use-active-navigation';

export default function DualSidebarDashboardLayout({ children }: { children: React.ReactNode }) {
  const { t } = useI18n();
  const logo = getDemoLogo(t, Link);
  const railItems = getDemoRailItems(t);
  const breadcrumbs = getDemoBreadcrumbs(t, Link);
  const activeSecondaryNav = useActiveSecondaryNav(getDemoSecondaryNav(t, Link));

  return (
    <DualSidebarLayout
      logo={logo}
      railItems={railItems}
      secondaryTitle={t('dashboard.layouts.workspaceTitle')}
      secondarySubtitle={t('dashboard.layouts.workspaceSubtitle')}
      secondaryNavigation={activeSecondaryNav}
      breadcrumbs={breadcrumbs}
      pageTitle={t('dashboard.layouts.dualSidebarTitle')}
      pageDescription={t('dashboard.layouts.dualSidebarDescription')}
      user={demoUser}
      sidebarAriaLabel={t('dashboard.shell.sidebarLabel')}
      secondaryNavAriaLabel={t('dashboard.shell.secondaryNavLabel')}
    >
      {children}
    </DualSidebarLayout>
  );
}
