'use client';

import type React from 'react';
import { cn } from '@/lib/cn';
import styles from './sidebar.module.css';

export interface PrimarySidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

/**
 * PrimarySidebar renders the primary icon rail or primary sidebar container.
 * Renders a <div> to avoid duplicate <aside> landmark regions within the root sidebar.
 */
export function PrimarySidebar({ className, children, ...props }: PrimarySidebarProps) {
  return (
    <div className={cn(styles.primary, className)} {...props}>
      {children}
    </div>
  );
}

// Alias for backwards compatibility
export { PrimarySidebar as SidebarPrimary };
export type { PrimarySidebarProps as SidebarPrimaryProps };
