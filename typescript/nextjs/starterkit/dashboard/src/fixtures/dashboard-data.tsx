import type { BreadcrumbItem } from '@/components/shell';
import { Icon } from '@/components/icons';
import type {
  LayoutLogo,
  LayoutUser,
  NavGroup,
  PrimaryRailItem,
  SecondaryNavGroup,
} from '@/layouts/types';

export const demoLogo: LayoutLogo = {
  title: 'Control Hub',
  subtitle: 'Production System',
  href: '/classic',
};

export const demoUser: LayoutUser = {
  name: 'Sarah Connor',
  email: 'sarah@example.com',
  initials: 'SC',
};

export const demoBreadcrumbs: BreadcrumbItem[] = [
  { label: 'Platform', href: '/classic' },
  { label: 'Overview' },
];

export const demoNavigation: NavGroup[] = [
  {
    label: 'Layouts',
    items: [
      { label: 'Classic Layout', href: '/classic', icon: <Icon name="home" /> },
      { label: 'Dual Sidebar', href: '/dual-sidebar', icon: <Icon name="sidebar-left" /> },
      { label: 'Three Column', href: '/three-column', icon: <Icon name="settings" /> },
    ],
  },
  {
    label: 'Management',
    items: [
      { label: 'Analytics', href: '/classic/analytics', badge: 'Live', icon: <Icon name="inbox" /> },
      { label: 'Reports', href: '/classic/reports' },
      { label: 'Settings', href: '/classic/settings' },
    ],
  },
];

export const demoRailItems: PrimaryRailItem[] = [
  { id: '1', label: 'Engineering', initials: 'EN', isActive: true },
  { id: '2', label: 'Design System', initials: 'DS' },
  { id: '3', label: 'Marketing', initials: 'MK' },
];

export const demoSecondaryNav: SecondaryNavGroup[] = [
  {
    label: 'Layouts',
    items: [
      { label: 'Dual Sidebar', href: '/dual-sidebar', isActive: true },
      { label: 'Classic Layout', href: '/classic' },
      { label: 'Three Column', href: '/three-column' },
    ],
  },
  {
    label: 'Channels',
    items: [
      { label: '# announcements', href: '/dual-sidebar' },
      { label: '# general', href: '/dual-sidebar', badge: 3 },
    ],
  },
];

export const demoMetrics = [
  {
    id: 'users',
    titleKey: 'dashboard.metrics.totalUsers' as const,
    value: 14290,
    type: 'number' as const,
    changeText: '↑ 12.5%',
    changeKey: 'dashboard.metrics.thisMonth' as const,
    changeType: 'positive' as const,
  },
  {
    id: 'sessions',
    titleKey: 'dashboard.metrics.activeSessions' as const,
    value: 3418,
    type: 'number' as const,
    changeText: '↑ 8.2%',
    changeKey: 'dashboard.metrics.peakLoad' as const,
    changeType: 'positive' as const,
  },
  {
    id: 'revenue',
    titleKey: 'dashboard.metrics.monthlyRevenue' as const,
    value: 28450,
    type: 'currency' as const,
    changeText: '',
    changeKey: 'dashboard.metrics.updatedToday' as const,
    changeType: 'neutral' as const,
  },
];

export const demoBidiInfo = {
  trackingCode: '#US-8942-BIDI',
  supportPhone: '+1 (800) 555-0199',
};
