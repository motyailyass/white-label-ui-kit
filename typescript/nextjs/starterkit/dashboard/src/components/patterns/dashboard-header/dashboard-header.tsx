'use client';

import type React from 'react';
import {
  type BreadcrumbItem,
  Header,
  HeaderBreadcrumbs,
  HeaderHeading,
  HeaderToolbar,
  SidebarTrigger,
} from '@/components/shell';
import { AppToolbar } from '../app-toolbar';
import styles from './dashboard-header.module.css';

export interface DashboardHeaderProps {
  breadcrumbs?: BreadcrumbItem[];
  pageTitle?: string;
  pageDescription?: string;
  actions?: React.ReactNode;
  sticky?: boolean;
  density?: 'comfortable' | 'compact';
  showSidebarTrigger?: boolean;
  className?: string;
}

export function DashboardHeader({
  breadcrumbs,
  pageTitle,
  pageDescription,
  actions,
  sticky = true,
  density = 'comfortable',
  showSidebarTrigger = true,
  className,
}: DashboardHeaderProps) {
  return (
    <Header sticky={sticky} density={density} className={className}>
      <div className={styles.left}>
        {showSidebarTrigger && <SidebarTrigger />}
        {breadcrumbs && breadcrumbs.length > 0 && <HeaderBreadcrumbs items={breadcrumbs} />}
        {pageTitle && <HeaderHeading title={pageTitle} description={pageDescription} />}
      </div>

      <HeaderToolbar>{actions ?? <AppToolbar />}</HeaderToolbar>
    </Header>
  );
}
