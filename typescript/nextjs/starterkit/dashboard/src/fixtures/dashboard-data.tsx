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
  href: '/',
};

export const demoUser: LayoutUser = {
  name: 'Sarah Connor',
  email: 'sarah@example.com',
  initials: 'SC',
};

export const demoBreadcrumbs: BreadcrumbItem[] = [
  { label: 'Platform', href: '/' },
  { label: 'Overview' },
];

export const demoNavigation: NavGroup[] = [
  {
    label: 'Overview',
    items: [
      { label: 'Dashboard', href: '/', isActive: true, icon: <Icon name="home" /> },
      { label: 'Analytics', href: '/analytics', badge: 'Live', icon: <Icon name="inbox" /> },
      { label: 'Reports', href: '/reports' },
    ],
  },
  {
    label: 'Management',
    items: [
      { label: 'Customers', href: '/customers' },
      { label: 'Orders', href: '/orders', badge: 12 },
      { label: 'Products', href: '/products' },
    ],
  },
  {
    label: 'Preferences',
    items: [
      { label: 'Team', href: '/settings/team' },
      { label: 'Settings', href: '/settings' },
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
    label: 'Channels',
    items: [
      { label: '# announcements', href: '/channels/announcements' },
      { label: '# general', href: '/channels/general', isActive: true },
      { label: '# feedback', href: '/channels/feedback', badge: 3 },
    ],
  },
  {
    label: 'Projects',
    items: [
      { label: 'Platform v2', href: '/projects/v2' },
      { label: 'Mobile App', href: '/projects/mobile' },
      { label: 'Docs Redesign', href: '/projects/docs' },
    ],
  },
];
