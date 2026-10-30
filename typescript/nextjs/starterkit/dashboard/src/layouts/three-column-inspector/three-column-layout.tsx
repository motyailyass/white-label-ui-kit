'use client';

import type React from 'react';
import { DashboardHeader } from '@/components/patterns';
import {
  AppShell,
  AppShellMain,
  Content,
  ContentBody,
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
} from '@/components/shell';
import type { BaseLayoutProps, LayoutLogo, LayoutUser, NavGroup } from '../types';

export interface ThreeColumnLayoutProps extends BaseLayoutProps {
  logo: LayoutLogo;
  navigation: NavGroup[];
  user: LayoutUser;
  inspectorTitle?: string;
  inspectorDescription?: string;
  inspectorContent?: React.ReactNode;
  inspectorFooter?: React.ReactNode;
  isInspectorOpen?: boolean;
  onInspectorClose?: () => void;
}

export function ThreeColumnLayout({
  children,
  logo,
  navigation,
  breadcrumbs = [],
  pageTitle,
  pageDescription,
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
  const { contentLayout = 'full', sidebarWidth, panelWidth = 340, density, headerSticky } = config;

  return (
    <AppShell
      variant="three-column"
      defaultPanelOpen={true}
      sidebarWidth={sidebarWidth}
      panelWidth={panelWidth}
      density={density}
    >
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
