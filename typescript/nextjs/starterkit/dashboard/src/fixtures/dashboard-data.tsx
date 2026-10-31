import type React from 'react';
import { Icon } from '@/components/icons';
import type { BreadcrumbItem } from '@/components/shell';
import type { TranslationKey, TranslationParams } from '@/i18n';
import type {
  LayoutLogo,
  LayoutUser,
  NavGroup,
  PrimaryRailItem,
  SecondaryNavGroup,
} from '@/layouts/types';

type TranslateFn = (key: TranslationKey, params?: TranslationParams) => string;

export function getDemoLogo(t: TranslateFn, linkAs?: React.ElementType): LayoutLogo {
  return {
    title: t('dashboard.meta.brandName'),
    subtitle: t('dashboard.meta.brandSubtitle'),
    href: '/classic',
    as: linkAs,
  };
}

export const demoUser: LayoutUser = {
  name: 'Sarah Connor',
  email: 'sarah@example.com',
  initials: 'SC',
};

export function getDemoBreadcrumbs(t: TranslateFn, linkAs?: React.ElementType): BreadcrumbItem[] {
  return [
    { label: t('dashboard.shell.platformBreadcrumb'), href: '/classic', as: linkAs },
    { label: t('dashboard.nav.overview') },
  ];
}

export function getDemoNavigation(t: TranslateFn, linkAs?: React.ElementType): NavGroup[] {
  return [
    {
      label: t('dashboard.layouts.groupLabel'),
      items: [
        {
          label: t('dashboard.layouts.classicTitle'),
          href: '/classic',
          icon: <Icon name="home" />,
          as: linkAs,
        },
        {
          label: t('dashboard.layouts.dualSidebarTitle'),
          href: '/dual-sidebar',
          icon: <Icon name="sidebar-left" />,
          as: linkAs,
        },
        {
          label: t('dashboard.layouts.threeColumnTitle'),
          href: '/three-column',
          icon: <Icon name="settings" />,
          as: linkAs,
        },
      ],
    },
    {
      label: t('dashboard.nav.management'),
      items: [
        {
          label: t('dashboard.nav.analytics'),
          href: '/classic#analytics',
          badge: t('dashboard.metrics.liveBadge'),
          icon: <Icon name="inbox" />,
          as: linkAs,
        },
        {
          label: t('dashboard.nav.reports'),
          href: '/classic#reports',
          as: linkAs,
        },
        {
          label: t('dashboard.nav.settings'),
          href: '/classic#settings',
          as: linkAs,
        },
      ],
    },
  ];
}

export function getDemoRailItems(t: TranslateFn): PrimaryRailItem[] {
  return [
    { id: '1', label: t('dashboard.rail.engineering'), initials: 'EN', isActive: true },
    { id: '2', label: t('dashboard.rail.designSystem'), initials: 'DS' },
    { id: '3', label: t('dashboard.rail.marketing'), initials: 'MK' },
  ];
}

export function getDemoSecondaryNav(
  t: TranslateFn,
  linkAs?: React.ElementType,
): SecondaryNavGroup[] {
  return [
    {
      label: t('dashboard.layouts.groupLabel'),
      items: [
        { label: t('dashboard.layouts.dualSidebarTitle'), href: '/dual-sidebar', as: linkAs },
        { label: t('dashboard.layouts.classicTitle'), href: '/classic', as: linkAs },
        { label: t('dashboard.layouts.threeColumnTitle'), href: '/three-column', as: linkAs },
      ],
    },
    {
      label: t('dashboard.rail.channelsGroup'),
      items: [
        {
          label: t('dashboard.rail.announcements'),
          href: '/dual-sidebar#announcements',
          as: linkAs,
        },
        {
          label: t('dashboard.rail.general'),
          href: '/dual-sidebar#general',
          badge: 3,
          as: linkAs,
        },
      ],
    },
  ];
}

export type DemoMetric =
  | {
      id: string;
      titleKey: TranslationKey;
      value: number;
      type: 'number';
      changeFraction: number;
      changeKey: TranslationKey;
      changeType: 'positive';
    }
  | {
      id: string;
      titleKey: TranslationKey;
      value: number;
      type: 'currency';
      currency: string;
      changeKey: TranslationKey;
      changeType: 'neutral';
    };

export const demoMetrics: readonly DemoMetric[] = [
  {
    id: 'users',
    titleKey: 'dashboard.metrics.totalUsers',
    value: 14290,
    type: 'number',
    changeFraction: 0.125,
    changeKey: 'dashboard.metrics.thisMonth',
    changeType: 'positive',
  },
  {
    id: 'sessions',
    titleKey: 'dashboard.metrics.activeSessions',
    value: 3418,
    type: 'number',
    changeFraction: 0.082,
    changeKey: 'dashboard.metrics.peakLoad',
    changeType: 'positive',
  },
  {
    id: 'revenue',
    titleKey: 'dashboard.metrics.monthlyRevenue',
    value: 28450,
    type: 'currency',
    currency: 'USD',
    changeKey: 'dashboard.metrics.updatedToday',
    changeType: 'neutral',
  },
];

export const demoBidiInfo = {
  trackingCode: '#US-8942-BIDI',
  supportPhone: '+1 (800) 555-0199',
  lastUpdated: '2026-10-30T12:00:00Z',
};
