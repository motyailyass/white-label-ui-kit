'use client';

import type React from 'react';
import { cn } from '@/lib/cn';
import styles from './sidebar.module.css';

export interface SecondarySidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

/**
 * SecondarySidebar renders the sub-navigation panel in multi-column sidebar layouts.
 * Renders a <div> to avoid duplicate <aside> landmark regions within the root sidebar.
 */
export function SecondarySidebar({ className, children, ...props }: SecondarySidebarProps) {
  return (
    <div className={cn(styles.secondary, className)} {...props}>
      {children}
    </div>
  );
}

// Alias for backwards compatibility
export { SecondarySidebar as SidebarSecondary };
export type { SecondarySidebarProps as SidebarSecondaryProps };
