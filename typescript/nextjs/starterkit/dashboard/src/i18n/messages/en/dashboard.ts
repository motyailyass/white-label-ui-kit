import type { MessageShape } from '../../types';

export const dashboard = {
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
