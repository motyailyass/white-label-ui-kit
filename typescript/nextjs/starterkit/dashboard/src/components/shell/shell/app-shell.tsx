'use client';

import type React from 'react';
import { cn } from '@/lib/cn';
import { LayoutProvider, type LayoutVariant, useLayout } from '../layout-context';
import styles from './app-shell.module.css';

export interface AppShellProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: LayoutVariant;
  defaultSidebarCollapsed?: boolean;
  defaultPanelOpen?: boolean;
  enableShortcuts?: boolean;
  children: React.ReactNode;
}

function AppShellInner({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  const { layoutVariant } = useLayout();

  return (
    <div className={cn(styles.shell, className)} data-variant={layoutVariant} {...props}>
      {children}
    </div>
  );
}

export function AppShell({
  variant = 'classic',
  defaultSidebarCollapsed = false,
  defaultPanelOpen = false,
  enableShortcuts = true,
  children,
  ...props
}: AppShellProps) {
  return (
    <LayoutProvider
      defaultVariant={variant}
      defaultSidebarCollapsed={defaultSidebarCollapsed}
      defaultPanelOpen={defaultPanelOpen}
      enableShortcuts={enableShortcuts}
    >
      <AppShellInner {...props}>{children}</AppShellInner>
    </LayoutProvider>
  );
}

export interface AppShellMainProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode;
}

export function AppShellMain({ className, children, ...props }: AppShellMainProps) {
  return (
    <main className={cn(styles.main, className)} {...props}>
      {children}
    </main>
  );
}
