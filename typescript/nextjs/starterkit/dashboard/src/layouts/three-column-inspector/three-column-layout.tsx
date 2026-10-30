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
  Panel,
  PanelBody,
  PanelFooter,
  PanelHeader,
  Sidebar,
  SidebarAvatar,
  SidebarGroup,
  SidebarItem,
  SidebarLogo,
  SidebarNav,
  SidebarTrigger,
} from '@/components/shell';
import type { DashboardLayoutConfig, LayoutLogo, LayoutUser, NavGroup } from '../types';

export interface ThreeColumnLayoutProps {
  children: React.ReactNode;
  logo: LayoutLogo;
  navigation: NavGroup[];
  breadcrumbs: BreadcrumbItem[];
  user: LayoutUser;
  inspectorTitle?: string;
  inspectorDescription?: string;
  inspectorContent?: React.ReactNode;
  inspectorFooter?: React.ReactNode;
  isInspectorOpen?: boolean;
  onInspectorClose?: () => void;
  headerActions?: React.ReactNode;
  config?: DashboardLayoutConfig;
}

export function ThreeColumnLayout({
  children,
  logo,
  navigation,
  breadcrumbs,
  user,
  inspectorTitle = 'Properties & Details',
  inspectorDescription = 'Select an item to view metadata',
  inspectorContent,
  inspectorFooter,
  isInspectorOpen,
  onInspectorClose,
  headerActions,
  config = {},
}: ThreeColumnLayoutProps) {
  const { contentLayout = 'full', panelWidth = 340 } = config;

  return (
    <AppShell variant="three-column" defaultPanelOpen={true}>
      {/* Column 1: Left Navigation Sidebar */}
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

      {/* Column 2: Center Main Work Area */}
      <AppShellMain>
        <Header>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
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

      {/* Column 3: Right Inspector Panel */}
      <Panel width={panelWidth} open={isInspectorOpen}>
        <PanelHeader
          title={inspectorTitle}
          description={inspectorDescription}
          onClose={onInspectorClose}
        />
        {inspectorContent && <PanelBody>{inspectorContent}</PanelBody>}
        {inspectorFooter && <PanelFooter>{inspectorFooter}</PanelFooter>}
      </Panel>
    </AppShell>
  );
}
