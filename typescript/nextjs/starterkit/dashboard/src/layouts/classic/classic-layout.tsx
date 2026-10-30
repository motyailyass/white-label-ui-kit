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
  HeaderToolbar,
  Sidebar,
  SidebarAvatar,
  SidebarGroup,
  SidebarItem,
  SidebarLogo,
  SidebarNav,
  SidebarTrigger,
} from '@/components/shell';
import type { DashboardLayoutConfig, LayoutLogo, LayoutUser, NavGroup } from '../types';

export interface ClassicLayoutProps {
  children: React.ReactNode;
  logo: LayoutLogo;
  navigation: NavGroup[];
  breadcrumbs: BreadcrumbItem[];
  user: LayoutUser;
  headerActions?: React.ReactNode;
  config?: DashboardLayoutConfig;
}

export function ClassicLayout({
  children,
  logo,
  navigation,
  breadcrumbs,
  user,
  headerActions,
  config = {},
}: ClassicLayoutProps) {
  const { contentLayout = 'full' } = config;

  return (
    <AppShell variant="classic">
      <Sidebar>
        <SidebarLogo
          title={logo.title}
          subtitle={logo.subtitle}
          icon={logo.icon}
          href={logo.href}
        />
        <SidebarNav>
          {navigation.map((group, groupIdx) => (
            <SidebarGroup key={group.label || groupIdx} label={group.label}>
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
        <SidebarAvatar
          name={user.name}
          email={user.email}
          avatarUrl={user.avatarUrl}
          initials={user.initials}
        />
      </Sidebar>

      <AppShellMain>
        <Header>
          <div
            style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', minWidth: 0 }}
          >
            <SidebarTrigger />
            <HeaderBreadcrumbs items={breadcrumbs} />
          </div>

          <HeaderToolbar>
            {headerActions || (
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
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
