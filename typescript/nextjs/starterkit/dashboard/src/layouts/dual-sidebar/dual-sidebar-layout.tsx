'use client';

import { DashboardHeader } from '@/components/patterns';
import {
  AppShell,
  AppShellMain,
  Content,
  ContentBody,
  Sidebar,
  SidebarGroup,
  SidebarItem,
  SidebarNav,
  SidebarPrimary,
  SidebarSecondary,
} from '@/components/shell';
import type { BaseLayoutProps, LayoutUser, PrimaryRailItem, SecondaryNavGroup } from '../types';
import styles from './dual-sidebar-layout.module.css';

export interface DualSidebarLayoutProps extends BaseLayoutProps {
  railItems: PrimaryRailItem[];
  secondaryTitle: string;
  secondarySubtitle?: string;
  secondaryNavigation: SecondaryNavGroup[];
  user?: LayoutUser;
}

export function DualSidebarLayout({
  children,
  railItems,
  secondaryTitle,
  secondarySubtitle,
  secondaryNavigation,
  breadcrumbs = [],
  pageTitle,
  pageDescription,
  user,
  headerActions,
  config = {},
}: DualSidebarLayoutProps) {
  const { contentLayout = 'full', sidebarWidth, density, headerSticky } = config;

  return (
    <AppShell variant="dual-sidebar" sidebarWidth={sidebarWidth} density={density}>
      {/* Wrapped in <Sidebar variant="dual"> to ensure mobile drawer backdrop, Escape key, and focus trap work */}
      <Sidebar variant="dual">
        {/* Tier 1: Primary Icon / Workspace Rail */}
        <SidebarPrimary>
          <div className={styles.railHome} title="App Home">
            P
          </div>

          <div className={styles.railList}>
            {railItems.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={item.onClick}
                title={item.label}
                data-active={item.isActive}
                className={styles.railButton}
              >
                {item.icon || item.initials || item.label.slice(0, 2).toUpperCase()}
              </button>
            ))}
          </div>

          {user && (
            <div className={styles.railAvatar} title={user.name}>
              {user.initials || user.name.slice(0, 2).toUpperCase()}
            </div>
          )}
        </SidebarPrimary>

        {/* Tier 2: Sub-Navigation / Channel Tree */}
        <SidebarSecondary>
          <div className={styles.secondaryHeader}>
            <div className={styles.secondaryTitle}>{secondaryTitle}</div>
            {secondarySubtitle && (
              <div className={styles.secondarySubtitle}>{secondarySubtitle}</div>
            )}
          </div>

          <SidebarNav>
            {secondaryNavigation.map((group, idx) => (
              <SidebarGroup key={group.label || idx} label={group.label}>
                {group.items.map((item) => (
                  <SidebarItem
                    key={item.label}
                    label={item.label}
                    href={item.href}
                    icon={item.icon}
                    badge={item.badge}
                    isActive={item.isActive}
                  />
                ))}
              </SidebarGroup>
            ))}
          </SidebarNav>
        </SidebarSecondary>
      </Sidebar>

      <AppShellMain>
        <DashboardHeader
          breadcrumbs={breadcrumbs}
          pageTitle={pageTitle}
          pageDescription={pageDescription}
          actions={headerActions}
          sticky={headerSticky}
          density={density}
        />

        <Content>
          <ContentBody layout={contentLayout}>{children}</ContentBody>
        </Content>
      </AppShellMain>
    </AppShell>
  );
}
