'use client';

import type React from 'react';
import { cn } from '@/lib/cn';
import { LayoutProvider, type LayoutVariant, useLayout } from '../layout-context';
import styles from './app-shell.module.css';

export interface AppShellProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: LayoutVariant;
  defaultVariant?: LayoutVariant;
  onVariantChange?: (variant: LayoutVariant) => void;
  defaultSidebarCollapsed?: boolean;
  defaultPanelOpen?: boolean;
  enableShortcuts?: boolean;
  sidebarWidth?: number | string;
  panelWidth?: number | string;
  density?: 'comfortable' | 'compact';
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
  variant,
  defaultVariant = 'classic',
  onVariantChange,
  defaultSidebarCollapsed = false,
  defaultPanelOpen = false,
  enableShortcuts = true,
  sidebarWidth,
  panelWidth,
  density,
  style,
  children,
  ...props
}: AppShellProps) {
  const customStyles: React.CSSProperties | undefined =
    style || sidebarWidth !== undefined || panelWidth !== undefined
      ? ({
          ...style,
          ...(sidebarWidth !== undefined
            ? {
                '--sidebar-width':
                  typeof sidebarWidth === 'number' ? `${sidebarWidth}px` : sidebarWidth,
              }
            : {}),
          ...(panelWidth !== undefined
            ? {
                '--panel-width': typeof panelWidth === 'number' ? `${panelWidth}px` : panelWidth,
              }
            : {}),
        } as React.CSSProperties)
      : undefined;

  return (
    <LayoutProvider
      variant={variant}
      defaultVariant={defaultVariant}
      onVariantChange={onVariantChange}
      defaultSidebarCollapsed={defaultSidebarCollapsed}
      defaultPanelOpen={defaultPanelOpen}
      enableShortcuts={enableShortcuts}
    >
      <AppShellInner data-density={density} style={customStyles} {...props}>
        {children}
      </AppShellInner>
    </LayoutProvider>
  );
}

export interface AppShellMainProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode;
}

export function AppShellMain({ className, children, ...props }: AppShellMainProps) {
  const { isSidebarOpenMobile } = useLayout();
  return (
    <main
      className={cn(styles.main, className)}
      inert={isSidebarOpenMobile ? true : undefined}
      {...props}
    >
      {children}
    </main>
  );
}
