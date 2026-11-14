import type React from 'react';
import { Icon } from '@/components/icons';
import type {
  SidebarSupportMenuItem,
  SidebarWorkspaceItem,
  WorkspaceOption,
} from '@/components/shell/sidebar';
import type { TranslationKey, TranslationParams } from '@/i18n';
import type { LayoutUser, NavItem } from '@/layouts/types';

export type TranslateFn = (key: TranslationKey, params?: TranslationParams) => string;

/**
 * Shared Workspace Switcher Options for Dashboard layouts.
 */
export function getSharedWorkspaces(t: TranslateFn): WorkspaceOption[] {
  return [
    {
      id: 'ws-primary',
      name: t('dashboard.workspace.primaryName'),
      plan: t('dashboard.workspace.primaryPlan'),
      initials: t('dashboard.workspace.primaryName').charAt(0).toUpperCase(),
      tone: 'primary',
    },
    {
      id: 'ws-secondary',
      name: t('dashboard.workspace.secondaryName'),
      plan: t('dashboard.workspace.secondaryPlan'),
      initials: t('dashboard.workspace.secondaryName').charAt(0).toUpperCase(),
      tone: 'info',
    },
    {
      id: 'ws-personal',
      name: t('dashboard.workspace.personalName'),
      plan: t('dashboard.workspace.personalPlan'),
      initials: t('dashboard.workspace.personalName').charAt(0).toUpperCase(),
      tone: 'success',
    },
  ];
}

/**
 * Shared Primary Sidebar Menu Items (Core features only).
 * Multi-language enabled via translation callback.
 */
export function getSharedPrimaryNavigation(t: TranslateFn, linkAs?: React.ElementType): NavItem[] {
  return [
    {
      label: t('dashboard.nav.dashboard'),
      href: '/layout-01',
      icon: <Icon name="dashboard-square-03" size={18} aria-hidden="true" />,
      as: linkAs,
    },
    {
      label: t('dashboard.nav.leads'),
      href: '/layout-01',
      icon: <Icon name="user-03" size={18} aria-hidden="true" />,
      isActive: true,
      as: linkAs,
    },
    {
      label: t('dashboard.nav.orders'),
      href: '/layout-01',
      icon: <Icon name="task-02" size={18} aria-hidden="true" />,
      badge: '99+',
      as: linkAs,
    },
    {
      label: t('dashboard.nav.customers'),
      href: '/layout-01',
      icon: <Icon name="user-group-03" size={18} aria-hidden="true" />,
      as: linkAs,
    },
    {
      label: t('dashboard.nav.messages'),
      href: '/layout-01',
      icon: <Icon name="bubble-chat" size={18} aria-hidden="true" />,
      badge: 4,
      as: linkAs,
    },
  ];
}

/**
 * Shared Workspaces Menu Items.
 * Multi-language enabled, zero inline styles, tokens only.
 */
export function getSharedWorkspacesNavigation(
  t: TranslateFn,
  linkAs?: React.ElementType,
): SidebarWorkspaceItem[] {
  return [
    {
      id: 'ws-sales',
      label: t('dashboard.nav.sales'),
      href: '/layout-01#sales',
      tone: 'primary',
      as: linkAs,
    },
    {
      id: 'ws-accounts',
      label: t('dashboard.nav.accountManagement'),
      href: '/layout-01#accounts',
      tone: 'info',
      as: linkAs,
    },
    {
      id: 'ws-support',
      label: t('dashboard.nav.supportSuccess'),
      href: '/layout-01#support',
      tone: 'success',
      as: linkAs,
    },
  ];
}

/**
 * Shared Support & Utility Menu Items.
 * Multi-language enabled via translation callback.
 */
export function getSharedSupportNavigation(
  t: TranslateFn,
  linkAs?: React.ElementType,
): SidebarSupportMenuItem[] {
  return [
    {
      id: 'support-feedback',
      label: t('dashboard.nav.feedback'),
      href: '/layout-01#feedback',
      icon: <Icon name="thumbs-up-down" size={18} aria-hidden="true" />,
      badge: 1,
      as: linkAs,
    },
    {
      id: 'support-help',
      label: t('dashboard.nav.helpCenter'),
      href: '/layout-01#help',
      icon: <Icon name="help-circle" size={18} aria-hidden="true" />,
      as: linkAs,
    },
    {
      id: 'support-settings',
      label: t('dashboard.nav.settings'),
      href: '/layout-01#settings',
      icon: <Icon name="settings" size={18} aria-hidden="true" />,
      as: linkAs,
    },
  ];
}

/**
 * Shared User Profile for Dashboard layouts.
 * Fully multi-language ready with translated role.
 */
export type SharedUser = LayoutUser;

export function getSharedUser(t: TranslateFn): SharedUser {
  return {
    name: 'Aiden Hudson',
    email: 'ahudson@example.com',
    initials: 'AH',
    role: t('dashboard.user.role'),
    status: 'online',
  };
}
