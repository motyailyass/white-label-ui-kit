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
import { Button } from '@/components/ui/button';
import type {
  BaseLayoutProps,
  LayoutLogo,
  LayoutUser,
  PrimaryRailItem,
  SecondaryNavGroup,
} from '../types';
import styles from './dual-sidebar-layout.module.css';

export interface DualSidebarLayoutProps extends BaseLayoutProps {
  logo?: LayoutLogo;
  railItems: PrimaryRailItem[];
  secondaryTitle: string;
  secondarySubtitle?: string;
  secondaryNavigation: SecondaryNavGroup[];
  user?: LayoutUser;
  sidebarAriaLabel?: string;
  secondaryNavAriaLabel?: string;
}

export function DualSidebarLayout({
  children,
  logo,
  railItems,
  secondaryTitle,
  secondarySubtitle,
  secondaryNavigation,
  breadcrumbs = [],
  pageTitle,
  pageDescription,
  user,
  sidebarAriaLabel,
  secondaryNavAriaLabel,
  headerActions,
  config = {},
}: DualSidebarLayoutProps) {
  const { contentLayout = 'full', sidebarWidth, density, headerSticky } = config;
  const LogoComponent = logo?.as ?? 'a';

  return (
    <AppShell variant="dual-sidebar" sidebarWidth={sidebarWidth} density={density}>
      {/* Wrapped in <Sidebar variant="dual"> to ensure mobile drawer backdrop, Escape key, and focus trap work */}
      <Sidebar variant="dual" aria-label={sidebarAriaLabel}>
        {/* Tier 1: Primary Icon / Workspace Rail */}
        <SidebarPrimary>
          {logo && (
            <LogoComponent
              href={logo.href ?? '/'}
              className={styles.railHome}
              aria-label={logo.title}
              title={logo.title}
            >
              {logo.icon || logo.title.charAt(0).toUpperCase()}
            </LogoComponent>
          )}

          <div className={styles.railList}>
            {railItems.map((item) => (
              <Button
                key={item.id}
                type="button"
                variant={item.isActive ? 'primary' : 'subtle'}
                size="lg"
                onClick={item.onClick}
                aria-label={item.label}
                aria-current={item.isActive ? 'page' : undefined}
                title={item.label}
                data-active={item.isActive}
                className={styles.railButton}
              >
                {item.icon || item.initials || item.label.slice(0, 2).toUpperCase()}
              </Button>
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

          <SidebarNav aria-label={secondaryNavAriaLabel ?? secondaryTitle}>
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
                    as={item.as}
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
