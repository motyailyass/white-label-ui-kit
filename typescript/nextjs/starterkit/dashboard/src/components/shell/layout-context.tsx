'use client';

import type React from 'react';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react';

export type LayoutVariant = 'classic' | 'dual-sidebar' | 'three-column' | 'horizontal' | 'compact';

export interface SidebarController {
  collapsed: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
}

export interface PanelController {
  open: boolean;
  onOpenChange?: (open: boolean) => void;
}

export interface LayoutContextValue {
  layoutVariant: LayoutVariant;
  setLayoutVariant: (variant: LayoutVariant) => void;
  sidebarId: string;
  panelId: string;
  isSidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleSidebar: () => void;
  isSidebarOpenMobile: boolean;
  setSidebarOpenMobile: (open: boolean) => void;
  toggleSidebarMobile: () => void;
  isPanelOpen: boolean;
  setPanelOpen: (open: boolean) => void;
  togglePanel: () => void;
  isMobile: boolean;
  isTablet: boolean;
  registerSidebarController: (controller: SidebarController | null) => void;
  registerPanelController: (controller: PanelController | null) => void;
}

const LayoutContext = createContext<LayoutContextValue | undefined>(undefined);

export interface LayoutProviderProps {
  children: React.ReactNode;
  variant?: LayoutVariant;
  defaultVariant?: LayoutVariant;
  onVariantChange?: (variant: LayoutVariant) => void;
  defaultSidebarCollapsed?: boolean;
  defaultPanelOpen?: boolean;
  enableShortcuts?: boolean;
  sidebarId?: string;
  panelId?: string;
}

const MOBILE_MEDIA_QUERY = '(max-width: 768px)';
const TABLET_MEDIA_QUERY = '(max-width: 1024px)';

function subscribeMediaQuery(query: string, callback: () => void) {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return () => {};
  }
  const mql = window.matchMedia(query);
  mql.addEventListener('change', callback);
  return () => mql.removeEventListener('change', callback);
}

function getMediaQuerySnapshot(query: string): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return false;
  }
  return window.matchMedia(query).matches;
}

function getMediaQueryServerSnapshot(): boolean {
  return false;
}

function useMediaQuery(query: string): boolean {
  const subscribe = useCallback((cb: () => void) => subscribeMediaQuery(query, cb), [query]);
  const getSnapshot = useCallback(() => getMediaQuerySnapshot(query), [query]);
  return useSyncExternalStore(subscribe, getSnapshot, getMediaQueryServerSnapshot);
}

export function LayoutProvider({
  children,
  variant,
  defaultVariant = 'classic',
  onVariantChange,
  defaultSidebarCollapsed = false,
  defaultPanelOpen = false,
  enableShortcuts = true,
  sidebarId: sidebarIdProp,
  panelId: panelIdProp,
}: LayoutProviderProps) {
  const rawId = useId().replace(/:/g, '');
  const sidebarId = sidebarIdProp ?? `sidebar-${rawId}`;
  const panelId = panelIdProp ?? `panel-${rawId}`;

  const [uncontrolledVariant, setUncontrolledVariant] = useState<LayoutVariant>(defaultVariant);
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(defaultSidebarCollapsed);
  const [isSidebarOpenMobile, setSidebarOpenMobile] = useState(false);
  const [uncontrolledPanelOpen, setPanelOpen] = useState(defaultPanelOpen);
  const isMobile = useMediaQuery(MOBILE_MEDIA_QUERY);
  const isTablet = useMediaQuery(TABLET_MEDIA_QUERY);
  const [sidebarController, setSidebarController] = useState<SidebarController | null>(null);
  const [panelController, setPanelController] = useState<PanelController | null>(null);

  const prevMobileRef = useRef<boolean | null>(null);
  const prevTabletRef = useRef<boolean | null>(null);

  const layoutVariant = variant ?? uncontrolledVariant;

  const setLayoutVariant = useCallback(
    (nextVariant: LayoutVariant) => {
      if (variant === undefined) {
        setUncontrolledVariant(nextVariant);
      }
      onVariantChange?.(nextVariant);
    },
    [variant, onVariantChange],
  );

  // Viewport breakpoint transitions
  useEffect(() => {
    // Crossing from mobile (<= 768px) back to desktop (> 768px) must close mobile drawer
    if (prevMobileRef.current === true && !isMobile) {
      setSidebarOpenMobile(false);
    }

    // Crossing from desktop (> 1024px) down to compact/tablet (<= 1024px) closes docked panel
    if (prevTabletRef.current === false && isTablet) {
      setPanelOpen(false);
    }

    prevMobileRef.current = isMobile;
    prevTabletRef.current = isTablet;
  }, [isMobile, isTablet]);

  const effectiveSidebarCollapsed =
    sidebarController !== null ? sidebarController.collapsed : isSidebarCollapsed;

  const effectivePanelOpen =
    panelController !== null ? panelController.open : uncontrolledPanelOpen;

  const toggleSidebar = useCallback(() => {
    if (sidebarController?.onCollapsedChange) {
      sidebarController.onCollapsedChange(!sidebarController.collapsed);
    } else if (sidebarController === null) {
      setSidebarCollapsed((prev) => !prev);
    }
  }, [sidebarController]);

  const handleSetSidebarOpenMobile = useCallback(
    (open: boolean | ((prev: boolean) => boolean)) => {
      setSidebarOpenMobile((prev) => {
        const next = typeof open === 'function' ? open(prev) : open;
        if (next && isMobile) {
          setPanelOpen(false);
        }
        return next;
      });
    },
    [isMobile],
  );

  const toggleSidebarMobile = useCallback(() => {
    handleSetSidebarOpenMobile((prev) => !prev);
  }, [handleSetSidebarOpenMobile]);

  const togglePanel = useCallback(() => {
    if (panelController) {
      panelController.onOpenChange?.(!panelController.open);
    } else {
      setPanelOpen((prev) => !prev);
    }
  }, [panelController]);

  const registerSidebarController = useCallback((controller: SidebarController | null) => {
    setSidebarController(controller);
  }, []);

  const registerPanelController = useCallback((controller: PanelController | null) => {
    setPanelController(controller);
  }, []);

  // Keyboard shortcuts (Cmd+B for sidebar, Cmd+. for panel)
  useEffect(() => {
    if (!enableShortcuts) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const isModifier = e.metaKey || e.ctrlKey;
      if (!isModifier) return;

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
        if (isMobile) {
          toggleSidebarMobile();
        } else {
          toggleSidebar();
        }
      } else if (e.key === '.') {
        e.preventDefault();
        togglePanel();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [enableShortcuts, isMobile, toggleSidebar, toggleSidebarMobile, togglePanel]);

  const contextValue = useMemo<LayoutContextValue>(
    () => ({
      layoutVariant,
      setLayoutVariant,
      sidebarId,
      panelId,
      isSidebarCollapsed: effectiveSidebarCollapsed,
      setSidebarCollapsed,
      toggleSidebar,
      isSidebarOpenMobile,
      setSidebarOpenMobile: handleSetSidebarOpenMobile,
      toggleSidebarMobile,
      isPanelOpen: effectivePanelOpen,
      setPanelOpen,
      togglePanel,
      isMobile,
      isTablet,
      registerSidebarController,
      registerPanelController,
    }),
    [
      layoutVariant,
      setLayoutVariant,
      sidebarId,
      panelId,
      effectiveSidebarCollapsed,
      toggleSidebar,
      isSidebarOpenMobile,
      handleSetSidebarOpenMobile,
      toggleSidebarMobile,
      effectivePanelOpen,
      togglePanel,
      isMobile,
      isTablet,
      registerSidebarController,
      registerPanelController,
    ],
  );

  return <LayoutContext.Provider value={contextValue}>{children}</LayoutContext.Provider>;
}

export function useLayout(): LayoutContextValue {
  const context = useContext(LayoutContext);
  if (!context) {
    throw new Error('useLayout must be used within a <LayoutProvider>');
  }
  return context;
}
