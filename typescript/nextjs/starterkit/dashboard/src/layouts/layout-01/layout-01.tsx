'use client';

import type React from 'react';
import { AppShell, AppShellMain, Content, Header, Sidebar } from '@/components/shell';
import { cn } from '@/lib/cn';
import styles from './layout-01.module.css';

export interface Layout01Props extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
  sidebarSlot?: React.ReactNode;
  headerSlot?: React.ReactNode;
  sidebarWidth?: number | string;
  density?: 'comfortable' | 'compact';
  enableShortcuts?: boolean;
  className?: string;
}

function Layout01Root({
  children,
  sidebarSlot,
  headerSlot,
  sidebarWidth,
  density,
  enableShortcuts = false,
  className,
  ...props
}: Layout01Props) {
  return (
    <AppShell
      variant="classic"
      sidebarWidth={sidebarWidth}
      density={density}
      enableShortcuts={enableShortcuts}
      className={cn(styles.shell, className)}
      {...props}
    >
      {sidebarSlot}

      <AppShellMain className={styles.main}>
        {headerSlot}
        {children}
      </AppShellMain>
    </AppShell>
  );
}

export interface Layout01Component {
  (props: Layout01Props): React.JSX.Element;
  Sidebar: typeof Sidebar;
  Header: typeof Header;
  Content: typeof Content;
}

// Attach compound subcomponents: Sidebar, Header, and Content shell landmarks
export const Layout01: Layout01Component = Object.assign(Layout01Root, {
  Sidebar,
  Header,
  Content,
});
