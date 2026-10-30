'use client';

import type React from 'react';
import { createContext, useCallback, useContext, useEffect, useState } from 'react';

export type LayoutVariant = 'classic' | 'dual-sidebar' | 'three-column' | 'horizontal' | 'compact';

export interface LayoutContextValue {
  layoutVariant: LayoutVariant;
  setLayoutVariant: (variant: LayoutVariant) => void;
  isSidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleSidebar: () => void;
  isSidebarOpenMobile: boolean;
  setSidebarOpenMobile: (open: boolean) => void;
  toggleSidebarMobile: () => void;
  isPanelOpen: boolean;
  setPanelOpen: (open: boolean) => void;
  togglePanel: () => void;
}

const LayoutContext = createContext<LayoutContextValue | undefined>(undefined);

export interface LayoutProviderProps {
  children: React.ReactNode;
  defaultVariant?: LayoutVariant;
  defaultSidebarCollapsed?: boolean;
  defaultPanelOpen?: boolean;
  enableShortcuts?: boolean;
}

export function LayoutProvider({
  children,
  defaultVariant = 'classic',
  defaultSidebarCollapsed = false,
  defaultPanelOpen = false,
  enableShortcuts = true,
}: LayoutProviderProps) {
  const [layoutVariant, setLayoutVariant] = useState<LayoutVariant>(defaultVariant);
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(defaultSidebarCollapsed);
  const [isSidebarOpenMobile, setSidebarOpenMobile] = useState(false);
  const [isPanelOpen, setPanelOpen] = useState(defaultPanelOpen);

  const toggleSidebar = useCallback(() => {
    setSidebarCollapsed((prev) => !prev);
  }, []);

  const toggleSidebarMobile = useCallback(() => {
    setSidebarOpenMobile((prev) => !prev);
  }, []);

  const togglePanel = useCallback(() => {
    setPanelOpen((prev) => !prev);
  }, []);

  // Keyboard shortcuts (Cmd+B for sidebar, Cmd+. for panel)
  useEffect(() => {
    if (!enableShortcuts) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const isModifier = e.metaKey || e.ctrlKey;
      if (!isModifier) return;

      // Do not hijack typing inside form fields, textareas, or rich text editors
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.isContentEditable ||
          target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT')
      ) {
        return;
      }

      if (e.key === 'b' || e.key === 'B') {
        e.preventDefault();
        toggleSidebar();
      } else if (e.key === '.') {
        e.preventDefault();
        togglePanel();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [enableShortcuts, toggleSidebar, togglePanel]);

  return (
    <LayoutContext.Provider
      value={{
        layoutVariant,
        setLayoutVariant,
        isSidebarCollapsed,
        setSidebarCollapsed,
        toggleSidebar,
        isSidebarOpenMobile,
        setSidebarOpenMobile,
        toggleSidebarMobile,
        isPanelOpen,
        setPanelOpen,
        togglePanel,
      }}
    >
      {children}
    </LayoutContext.Provider>
  );
}

export function useLayout(): LayoutContextValue {
  const context = useContext(LayoutContext);
  if (!context) {
    throw new Error('useLayout must be used within a <LayoutProvider>');
  }
  return context;
}
