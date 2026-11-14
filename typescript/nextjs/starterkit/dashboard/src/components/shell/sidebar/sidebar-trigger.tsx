'use client';

import type React from 'react';
import { Icon } from '@/components/icons';
import { cn } from '@/lib/cn';
import { useLayout } from '../layout-context';
import styles from './sidebar.module.css';

export interface SidebarTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  id?: string;
}

export function SidebarTrigger({
  id,
  className,
  onClick,
  'aria-label': ariaLabel = 'Toggle navigation sidebar',
  'aria-controls': ariaControls,
  ...props
}: SidebarTriggerProps) {
  const {
    sidebarId,
    toggleSidebar,
    toggleSidebarMobile,
    isSidebarOpenMobile,
    isSidebarCollapsed,
    isMobile,
  } = useLayout();
  const isExpanded = isMobile ? isSidebarOpenMobile : !isSidebarCollapsed;

  return (
    <button
      {...props}
      id={id ?? `${sidebarId}-trigger`}
      data-sidebar-trigger=""
      type="button"
      className={cn(styles.trigger, className)}
      onClick={(e) => {
        onClick?.(e);
        if (e.defaultPrevented) return;
        const isMobileEffective =
          isMobile ||
          (typeof window !== 'undefined' &&
            typeof window.matchMedia === 'function' &&
            window.matchMedia('(max-width: 768px)').matches);
        if (isMobileEffective) {
          toggleSidebarMobile();
        } else {
          toggleSidebar();
        }
      }}
      aria-label={ariaLabel}
      aria-controls={ariaControls ?? sidebarId}
      aria-expanded={isExpanded}
    >
      <Icon name="sidebar-left" size={16} aria-hidden="true" />
    </button>
  );
}
