import type { MessageShape } from '../../types';

export const dashboard = {
  meta: {
    title: 'Control Hub - Dashboard Starter Kit',
    description: 'Production System Dashboard Starter Kit',
    brandName: 'Control Hub',
    brandSubtitle: 'Production System',
  },
  shell: {
    sidebarLabel: 'Sidebar navigation',
    primaryNavLabel: 'Primary navigation',
    secondaryNavLabel: 'Workspace navigation',
    toggleSidebar: 'Toggle navigation sidebar',
    togglePanel: 'Toggle inspector panel',
    inspectorLabel: 'Contextual panel',
    closePanel: 'Close panel',
    platformBreadcrumb: 'Platform',
  },
  layouts: {
    groupLabel: 'Layouts',
    classicTitle: 'Classic Layout',
    classicDescription: 'Single-tier primary navigation with collapsible sidebar',
    dualSidebarTitle: 'Dual Sidebar',
    dualSidebarDescription: 'Two-tiered primary icon rail and nested sub-tree navigation',
    workspaceTitle: 'Workspace',
    workspaceSubtitle: 'Engineering Team',
    threeColumnTitle: 'Three Column',
    threeColumnDescription: 'Layout with persistent contextual inspector panel',
    inspectorTitle: 'Properties & Details',
    inspectorDescription: 'Selected object attributes',
  },
  rail: {
    engineering: 'Engineering',
    designSystem: 'Design System',
    marketing: 'Marketing',
    channelsGroup: 'Channels',
    announcements: '# announcements',
    general: '# general',
  },
  overview: {
    title: 'System Overview',
    subtitle:
      'Welcome to the non-branded dashboard starter kit layout engine with native RTL & LTR support.',
  },
  metrics: {
    totalUsers: 'Total Users',
    activeSessions: 'Active Sessions',
    monthlyRevenue: 'Monthly Revenue',
    thisMonth: 'this month',
    peakLoad: 'peak load',
    updatedToday: 'Updated today',
    liveBadge: 'Live',
  },
  bidi: {
    title: 'Bi-directional Text Handling (Bidi)',
    trackingCode: 'Account tracking code',
    supportLine: 'Support direct line',
    description: 'Isolated with <bdi> to guarantee flawless punctuation in any reading direction.',
  },
  nav: {
    overview: 'Overview',
    dashboard: 'Dashboard',
    analytics: 'Analytics',
    reports: 'Reports',
    management: 'Management',
    customers: 'Customers',
    orders: 'Orders',
    products: 'Products',
    preferences: 'Preferences',
    team: 'Team',
    settings: 'Settings',
  },
} as const;

export type DashboardMessages = MessageShape<typeof dashboard>;
