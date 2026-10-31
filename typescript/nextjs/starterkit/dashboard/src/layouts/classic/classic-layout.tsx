'use client';

import { DashboardHeader } from '@/components/patterns';
import {
  AppShell,
  AppShellMain,
  Content,
  ContentBody,
  Sidebar,
  SidebarAvatar,
  SidebarGroup,
  SidebarItem,
  SidebarLogo,
  SidebarNav,
} from '@/components/shell';
import type { BaseLayoutProps, LayoutLogo, LayoutUser, NavGroup } from '../types';

export interface ClassicLayoutProps extends BaseLayoutProps {
  logo: LayoutLogo;
  navigation: NavGroup[];
  user: LayoutUser;
  sidebarAriaLabel?: string;
  sidebarNavAriaLabel?: string;
}

export function ClassicLayout({
  children,
  logo,
  navigation,
  breadcrumbs = [],
  pageTitle,
  pageDescription,
  user,
  sidebarAriaLabel,
  sidebarNavAriaLabel,
  headerActions,
  config = {},
}: ClassicLayoutProps) {
  const { contentLayout = 'full', sidebarWidth, density, headerSticky } = config;

  return (
    <AppShell variant="classic" sidebarWidth={sidebarWidth} density={density}>
      <Sidebar aria-label={sidebarAriaLabel}>
        <SidebarLogo
          title={logo.title}
          subtitle={logo.subtitle}
          icon={logo.icon}
          href={logo.href}
          as={logo.as}
        />
        <SidebarNav aria-label={sidebarNavAriaLabel}>
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
                  as={item.as}
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
          imageComponent={user.imageComponent}
        />
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
