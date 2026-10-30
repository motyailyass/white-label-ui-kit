'use client';

import type React from 'react';
import { LanguageSwitcher, ThemeSwitcher } from '@/components/patterns';
import {
  AppShell,
  AppShellMain,
  type BreadcrumbItem,
  Content,
  ContentBody,
  Header,
  HeaderBreadcrumbs,
  HeaderHeading,
  HeaderToolbar,
  Sidebar,
  SidebarGroup,
  SidebarItem,
  SidebarNav,
  SidebarPrimary,
  SidebarSecondary,
  SidebarTrigger,
} from '@/components/shell';
import type {
  DashboardLayoutConfig,
  LayoutUser,
  PrimaryRailItem,
  SecondaryNavGroup,
} from '../types';

export interface DualSidebarLayoutProps {
  children: React.ReactNode;
  railItems: PrimaryRailItem[];
  secondaryTitle: string;
  secondarySubtitle?: string;
  secondaryNavigation: SecondaryNavGroup[];
  breadcrumbs: BreadcrumbItem[];
  pageTitle?: string;
  pageDescription?: string;
  user?: LayoutUser;
  headerActions?: React.ReactNode;
  config?: DashboardLayoutConfig;
}

export function DualSidebarLayout({
  children,
  railItems,
  secondaryTitle,
  secondarySubtitle,
  secondaryNavigation,
  breadcrumbs,
  pageTitle,
  pageDescription,
  user,
  headerActions,
  config = {},
}: DualSidebarLayoutProps) {
  const { contentLayout = 'full' } = config;

  return (
    <AppShell variant="dual-sidebar">
      {/* Wrapped in <Sidebar variant="dual"> to ensure mobile drawer backdrop, Escape key, and focus trap work */}
      <Sidebar variant="dual">
        {/* Tier 1: Primary Icon / Workspace Rail */}
        <SidebarPrimary>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--color-primary)',
              color: 'var(--color-primary-foreground)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 'var(--font-weight-bold)',
              marginBottom: 'var(--space-4)',
            }}
            title="App Home"
          >
            P
          </div>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--space-2)',
              flex: 1,
              width: '100%',
              alignItems: 'center',
            }}
          >
            {railItems.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={item.onClick}
                title={item.label}
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: 'var(--radius-md)',
                  border: item.isActive
                    ? '2px solid var(--color-primary)'
                    : '1px solid var(--color-border-subtle)',
                  backgroundColor: item.isActive
                    ? 'var(--color-surface-active)'
                    : 'var(--color-surface)',
                  color: 'var(--color-text-primary)',
                  fontWeight: 'var(--font-weight-semibold)',
                  fontSize: 'var(--font-size-xs)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'border-color var(--transition-fast)',
                }}
              >
                {item.icon || item.initials || item.label.slice(0, 2).toUpperCase()}
              </button>
            ))}
          </div>

          {user && (
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'var(--color-surface-active)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 'var(--font-size-xs)',
                fontWeight: 'var(--font-weight-semibold)',
                color: 'var(--color-text-secondary)',
              }}
              title={user.name}
            >
              {user.initials || user.name.slice(0, 2).toUpperCase()}
            </div>
          )}
        </SidebarPrimary>

        {/* Tier 2: Sub-Navigation / Channel Tree */}
        <SidebarSecondary>
          <div
            style={{
              padding: 'var(--space-4)',
              height: 'var(--header-height)',
              borderBottom: '1px solid var(--color-border-subtle)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
            }}
          >
            <div
              style={{
                fontSize: 'var(--font-size-sm)',
                fontWeight: 'var(--font-weight-semibold)',
                color: 'var(--color-text-primary)',
              }}
            >
              {secondaryTitle}
            </div>
            {secondarySubtitle && (
              <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
                {secondarySubtitle}
              </div>
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
        <Header>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
            <SidebarTrigger />
            <HeaderBreadcrumbs items={breadcrumbs} />
          </div>

          <HeaderToolbar>
            {headerActions || (
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                {pageTitle && <HeaderHeading title={pageTitle} description={pageDescription} />}
                <LanguageSwitcher />
                <ThemeSwitcher />
              </div>
            )}
          </HeaderToolbar>
        </Header>

        <Content>
          <ContentBody layout={contentLayout}>{children}</ContentBody>
        </Content>
      </AppShellMain>
    </AppShell>
  );
}
