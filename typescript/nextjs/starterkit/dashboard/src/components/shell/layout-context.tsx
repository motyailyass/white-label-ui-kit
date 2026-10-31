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
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
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

  // Track viewport breakpoints in exact parity with CSS @media (max-width: 768px / 1024px)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const applyViewportState = (mobile: boolean, tablet: boolean) => {
      setIsMobile(mobile);
      setIsTablet(tablet);

      // Crossing from mobile (<= 768px) back to desktop (> 768px) must close mobile drawer & unlock scroll
      if (prevMobileRef.current === true && !mobile) {
        setSidebarOpenMobile(false);
      }

      // Crossing from desktop (> 1024px) down to compact/tablet (<= 1024px) closes docked panel
      if (prevTabletRef.current === false && tablet) {
        setPanelOpen(false);
      }

      prevMobileRef.current = mobile;
      prevTabletRef.current = tablet;
    };

    if (typeof window.matchMedia === 'function') {
      const mobileMql = window.matchMedia(MOBILE_MEDIA_QUERY);
      const tabletMql = window.matchMedia(TABLET_MEDIA_QUERY);

      const handleMediaChange = () => {
        applyViewportState(mobileMql.matches, tabletMql.matches);
      };

      handleMediaChange();
      mobileMql.addEventListener('change', handleMediaChange);
      tabletMql.addEventListener('change', handleMediaChange);
      return () => {
        mobileMql.removeEventListener('change', handleMediaChange);
        tabletMql.removeEventListener('change', handleMediaChange);
      };
    }

    // Fallback for test environments without matchMedia (note JSDOM defaults innerWidth to 1024)
    const handleResizeFallback = () => {
      applyViewportState(window.innerWidth <= 768, window.innerWidth < 1024);
    };

    handleResizeFallback();
    window.addEventListener('resize', handleResizeFallback);
    return () => window.removeEventListener('resize', handleResizeFallback);
  }, []);

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

  const toggleSidebarMobile = useCallback(() => {
    setSidebarOpenMobile((prev) => !prev);
  }, []);

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
      setSidebarOpenMobile,
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
