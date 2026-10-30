export interface DashboardLayoutConfig {
  contentLayout?: 'boxed' | 'compact' | 'full';
  sidebarWidth?: number;
  panelWidth?: number;
  density?: 'comfortable' | 'compact';
  headerSticky?: boolean;
}

export interface NavItem {
  label: string;
  href?: string;
  icon?: React.ReactNode;
  badge?: string | number;
  isActive?: boolean;
}

export interface NavGroup {
  label?: string;
  items: NavItem[];
}

export interface PrimaryRailItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  initials?: string;
  isActive?: boolean;
  onClick?: () => void;
}

export interface SecondaryNavGroup {
  label?: string;
  items: {
    label: string;
    href?: string;
    icon?: React.ReactNode;
    badge?: string | number;
    isActive?: boolean;
  }[];
}

export interface LayoutUser {
  name: string;
  email?: string;
  avatarUrl?: string;
  initials?: string;
}

export interface LayoutLogo {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  href?: string;
}
