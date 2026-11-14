'use client';

import Link from 'next/link';
import { Icon } from '@/components/icons';
import { Sidebar } from '@/components/shell';
import { Button, Skeleton } from '@/components/ui';
import {
  getSharedPrimaryNavigation,
  getSharedSupportNavigation,
  getSharedUser,
  getSharedWorkspaces,
  getSharedWorkspacesNavigation,
} from '@/fixtures/navigation';
import { Layout01 } from '@/layouts/layout-01';
import { useI18n } from '@/providers';
import styles from './page.module.css';

export default function Layout01DemoPage() {
  const { t } = useI18n();
  const workspaces = getSharedWorkspaces(t);
  const primaryItems = getSharedPrimaryNavigation(t, Link);
  const workspaceItems = getSharedWorkspacesNavigation(t, Link);
  const supportItems = getSharedSupportNavigation(t, Link);
  const user = getSharedUser(t);

  return (
    <Layout01
      sidebarSlot={
        <Layout01.Sidebar aria-label={t('dashboard.shell.sidebarLabel')}>
          {/* 1. Header Role: Sidebar.WorkspaceSwitcher */}
          <Sidebar.WorkspaceSwitcher workspaces={workspaces} />

          {/* 2. Action Role: Sidebar.Search wrapping pure SearchInput */}
          <Sidebar.Search
            placeholder={t('common.search')}
            aria-label={t('common.search')}
            size="sm"
            variant="subtle"
          />

          {/* 3. Navigation Role: Sidebar.Nav with Items, Workspaces, and Support menus */}
          <Sidebar.Nav aria-label={t('dashboard.shell.primaryNavLabel')}>
            {primaryItems.map((item) => (
              <Sidebar.Item
                key={item.label}
                label={item.label}
                href={item.href}
                icon={item.icon}
                badge={item.badge}
                isActive={item.isActive}
                as={item.as}
              />
            ))}

            {/* Workspaces Menu */}
            <Sidebar.WorkspacesMenu label={t('dashboard.nav.workspaces')} items={workspaceItems} />

            {/* Support Menu */}
            <Sidebar.SupportMenu label={t('dashboard.nav.support')} items={supportItems} />
          </Sidebar.Nav>

          {/* 4. Footer Role: Sidebar.Footer hosting Sidebar.AvatarPopover */}
          <Sidebar.Footer>
            <Sidebar.AvatarPopover user={user} linkAs={Link} />
          </Sidebar.Footer>
        </Layout01.Sidebar>
      }
      headerSlot={
        <Layout01.Header>
          <Layout01.Header.Heading title={t('dashboard.nav.leads')} />
          <Layout01.Header.Toolbar>
            {/* 1. Gallery Icon Link Action (accessible anchor with zero button-in-link nesting) */}
            <Link
              href="/gallery"
              className={styles.galleryLink}
              aria-label={t('common.componentGallery')}
              title={t('common.componentGallery')}
            >
              <Icon name="sparkles" size={16} aria-hidden="true" />
            </Link>

            {/* 2. Text-only Action */}
            <Button size="md" variant="secondary">
              {t('dashboard.actions.export')}
            </Button>

            {/* 3. Text + Icon Primary Action */}
            <Button
              size="md"
              variant="primary"
              startIcon={<Icon name="plus" size={16} aria-hidden="true" />}
            >
              {t('dashboard.actions.newLead')}
            </Button>
          </Layout01.Header.Toolbar>
        </Layout01.Header>
      }
    >
      {/* Main Content Area using Skeleton placeholders */}
      <Layout01.Content>
        <Layout01.Content.Body layout="full">
          <div className={styles.contentStack}>
            {/* Top KPI Metrics Skeletons */}
            <div className={styles.statsGrid}>
              <Skeleton variant="rounded" height={120} />
              <Skeleton variant="rounded" height={120} />
              <Skeleton variant="rounded" height={120} />
              <Skeleton variant="rounded" height={120} />
            </div>

            {/* Main Content Area Skeleton */}
            <Skeleton variant="rounded" height={420} />

            {/* Secondary Split Skeletons */}
            <div className={styles.splitGrid}>
              <Skeleton variant="rounded" height={280} />
              <Skeleton variant="rounded" height={280} />
            </div>

            {/* Bottom Activity Skeleton */}
            <Skeleton variant="rounded" height={200} />
          </div>
        </Layout01.Content.Body>
      </Layout01.Content>
    </Layout01>
  );
}
