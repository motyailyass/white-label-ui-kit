'use client';

import type React from 'react';
import { cn } from '@/lib/cn';
import styles from './sidebar.module.css';

export interface SidebarFooterProps extends React.HTMLAttributes<HTMLElement> {
  children?: React.ReactNode;
}

/**
 * SidebarFooter is the structural shell container pinned to the bottom of the sidebar.
 * Renders an honest semantic <footer> landmark that can host a user profile (SidebarAvatar),
 * promotional/upgrade cards, or quick actions.
 */
export function SidebarFooter({ className, children, ...props }: SidebarFooterProps) {
  return (
    <footer className={cn(styles.footer, className)} {...props}>
      {children}
    </footer>
  );
}
