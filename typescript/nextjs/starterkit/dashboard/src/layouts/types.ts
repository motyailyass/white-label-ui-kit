import type React from 'react';
import type { BreadcrumbItem } from '@/components/shell';

export interface DashboardLayoutConfig {
  contentLayout?: 'boxed' | 'compact' | 'full';
  sidebarWidth?: number | string;
  panelWidth?: number | string;
  density?: 'comfortable' | 'compact';
  headerSticky?: boolean;
}

export interface BaseLayoutProps {
  children: React.ReactNode;
  breadcrumbs?: BreadcrumbItem[];
  pageTitle?: string;
  pageDescription?: string;
  headerActions?: React.ReactNode;
  config?: DashboardLayoutConfig;
}

export interface NavItem {
  label: string;
  href?: string;
  icon?: React.ReactNode;
  badge?: string | number;
  isActive?: boolean;
  as?: React.ElementType;
}

export interface NavGroup {
  label?: string;
  items: NavItem[];
}

export type SecondaryNavGroup = NavGroup;

export interface PrimaryRailItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  initials?: string;
  isActive?: boolean;
  href?: string;
  as?: React.ElementType;
  onClick?: () => void;
}

export interface LayoutUser {
  name: string;
  email?: string;
  avatarUrl?: string;
  initials?: string;
  imageComponent?: React.ElementType;
}

export interface LayoutLogo {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  href?: string;
  as?: React.ElementType;
}
