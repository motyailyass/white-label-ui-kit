'use client';

import type React from 'react';
import { useEffect, useRef } from 'react';
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
  useLayout,
} from '@/components/shell';
import type { BaseLayoutProps, LayoutLogo, LayoutUser, NavGroup } from '../types';

function CompactInspectorGuard({ enabled }: { enabled: boolean }) {
  const { isTablet, setPanelOpen } = useLayout();
  const initializedRef = useRef(false);

  useEffect(() => {
    if (!enabled || initializedRef.current) return;
    if (isTablet) {
      initializedRef.current = true;
      setPanelOpen(false);
    }
  }, [enabled, isTablet, setPanelOpen]);

  return null;
}

export interface ThreeColumnLayoutProps extends BaseLayoutProps {
  logo: LayoutLogo;
  navigation: NavGroup[];
  user: LayoutUser;
  inspectorTitle?: string;
  inspectorDescription?: string;
  inspectorContent?: React.ReactNode;
  inspectorFooter?: React.ReactNode;
  isInspectorOpen?: boolean;
  defaultInspectorOpen?: boolean;
  onInspectorOpenChange?: (open: boolean) => void;
  onInspectorClose?: () => void;
  inspectorCloseLabel?: string;
  inspectorAriaLabel?: string;
  sidebarAriaLabel?: string;
  sidebarNavAriaLabel?: string;
}

export function ThreeColumnLayout({
  children,
  logo,
  navigation,
  breadcrumbs = [],
  pageTitle,
  pageDescription,
  user,
  inspectorTitle,
  inspectorDescription,
  inspectorContent,
  inspectorFooter,
  isInspectorOpen,
  defaultInspectorOpen,
  onInspectorOpenChange,
  onInspectorClose,
  inspectorCloseLabel,
  inspectorAriaLabel,
  sidebarAriaLabel,
  sidebarNavAriaLabel,
  headerActions,
  config = {},
}: ThreeColumnLayoutProps) {
  const { contentLayout = 'full', sidebarWidth, panelWidth = 340, density, headerSticky } = config;

  const handleInspectorOpenChange = (nextOpen: boolean) => {
    onInspectorOpenChange?.(nextOpen);
    if (!nextOpen) {
      onInspectorClose?.();
    }
  };

  return (
    <AppShell
      variant="three-column"
      defaultPanelOpen={defaultInspectorOpen ?? true}
      sidebarWidth={sidebarWidth}
      panelWidth={panelWidth}
      density={density}
    >
      <CompactInspectorGuard
        enabled={isInspectorOpen === undefined && defaultInspectorOpen === undefined}
      />
      {/* Column 1: Start Navigation Sidebar */}
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

      {/* Column 3: End Inspector Panel */}
      <Panel
        width={panelWidth}
        open={isInspectorOpen}
        onOpenChange={handleInspectorOpenChange}
        aria-label={inspectorAriaLabel}
      >
        {inspectorTitle && (
          <PanelHeader
            title={inspectorTitle}
            description={inspectorDescription}
            closeLabel={inspectorCloseLabel}
          />
        )}
        {inspectorContent && <PanelBody>{inspectorContent}</PanelBody>}
        {inspectorFooter && <PanelFooter>{inspectorFooter}</PanelFooter>}
      </Panel>
    </AppShell>
  );
}
