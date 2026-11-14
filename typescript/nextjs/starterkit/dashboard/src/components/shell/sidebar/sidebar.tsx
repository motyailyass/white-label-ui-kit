'use client';

import type React from 'react';
import { useEffect, useRef } from 'react';
import { cn } from '@/lib/cn';
import { acquireBodyScrollLock } from '@/lib/scroll-lock';
import { useLayout } from '../layout-context';
import { isTopmostModal, pushModal } from '../modal-stack';
import { PrimarySidebarMenu, SidebarGroup, SidebarItem } from './primary-sidebar-menu';
import { SidebarAvatar } from './sidebar-avatar';
import { SidebarAvatarPopover } from './sidebar-avatar-popover';
import { SidebarFooter } from './sidebar-footer';
import { SidebarLogo } from './sidebar-logo';
import { SidebarSearch } from './sidebar-search';
import { SidebarSupportMenu } from './sidebar-support-menu';
import { SidebarTrigger } from './sidebar-trigger';
import { SidebarWorkspacesMenu } from './sidebar-workspaces-menu';
import { SidebarWorkspaceSwitcher } from './sidebar-workspace-switcher';
import styles from './sidebar.module.css';

/* -------------------------------------------------------------------------- */
/*                                   Sidebar                                  */
/* -------------------------------------------------------------------------- */

export interface SidebarProps extends React.HTMLAttributes<HTMLElement> {
  collapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
  children: React.ReactNode;
  variant?: 'single' | 'dual';
}

export interface SidebarComponent {
  (props: SidebarProps): React.JSX.Element;
  Logo: typeof SidebarLogo;
  WorkspaceSwitcher: typeof SidebarWorkspaceSwitcher;
  Search: typeof SidebarSearch;
  Nav: typeof PrimarySidebarMenu;
  Menu: typeof PrimarySidebarMenu;
  Group: typeof SidebarGroup;
  Item: typeof SidebarItem;
  WorkspacesMenu: typeof SidebarWorkspacesMenu;
  SupportMenu: typeof SidebarSupportMenu;
  Footer: typeof SidebarFooter;
  Avatar: typeof SidebarAvatar;
  AvatarPopover: typeof SidebarAvatarPopover;
  Trigger: typeof SidebarTrigger;
}

function SidebarRoot({
  id,
  collapsed,
  onCollapsedChange,
  variant = 'single',
  className,
  children,
  'aria-label': ariaLabel = 'Sidebar navigation',
  ...props
}: SidebarProps) {
  const {
    sidebarId,
    isSidebarCollapsed,
    isSidebarOpenMobile,
    setSidebarOpenMobile,
    isMobile,
    isPanelOverlayModal,
    registerSidebarController,
  } = useLayout();

  const resolvedId = id ?? sidebarId;
  const isControlled = collapsed !== undefined;

  // Register controlled sidebar state & callback with LayoutContext so triggers/shortcuts share one source of truth
  useEffect(() => {
    if (isControlled) {
      registerSidebarController({
        collapsed,
        onCollapsedChange,
      });
      return () => registerSidebarController(null);
    }
  }, [isControlled, collapsed, onCollapsedChange, registerSidebarController]);

  const isCollapsed = isControlled ? collapsed : isSidebarCollapsed;
  const sidebarRef = useRef<HTMLElement | null>(null);

  // Exclusive modal ownership: close sidebar mobile drawer if panel overlay opens
  useEffect(() => {
    if (isPanelOverlayModal && isSidebarOpenMobile) {
      setSidebarOpenMobile(false);
    }
  }, [isPanelOverlayModal, isSidebarOpenMobile, setSidebarOpenMobile]);

  // Mobile drawer Escape key handler, focus trap, and ref-counted body scroll lock
  useEffect(() => {
    if (!isSidebarOpenMobile) return;

    const releaseScrollLock = acquireBodyScrollLock();
    const previousActiveElement = document.activeElement as HTMLElement | null;
    const unregisterModal = pushModal('sidebar-mobile', () => setSidebarOpenMobile(false));

    const focusableSelector =
      'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

    const isVisible = (el: HTMLElement): boolean => {
      if (el.hasAttribute('hidden') || el.getAttribute('aria-hidden') === 'true') {
        return false;
      }
      if (typeof window !== 'undefined') {
        const style = window.getComputedStyle(el);
        if (style.display === 'none' || style.visibility === 'hidden') {
          return false;
        }
      }
      if (typeof navigator !== 'undefined' && /jsdom/i.test(navigator.userAgent)) {
        return true;
      }
      return el.offsetWidth > 0 || el.offsetHeight > 0 || el.getClientRects().length > 0;
    };

    const getFocusables = (): HTMLElement[] => {
      if (!sidebarRef.current) return [];
      return Array.from(sidebarRef.current.querySelectorAll<HTMLElement>(focusableSelector)).filter(
        isVisible,
      );
    };

    const initialFocusFrame = requestAnimationFrame(() => {
      const focusables = getFocusables();
      if (focusables.length > 0) {
        focusables[0].focus();
      } else {
        sidebarRef.current?.focus();
      }
    });

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isTopmostModal('sidebar-mobile')) {
          e.preventDefault();
          e.stopPropagation();
          setSidebarOpenMobile(false);
        }
        return;
      }

      if (e.key === 'Tab') {
        const currentFocusables = getFocusables();
        if (currentFocusables.length === 0) {
          e.preventDefault();
          sidebarRef.current?.focus();
          return;
        }

        const first = currentFocusables[0];
        const last = currentFocusables[currentFocusables.length - 1];

        // If focus is currently outside the sidebar container, recover focus immediately
        if (!sidebarRef.current?.contains(document.activeElement)) {
          e.preventDefault();
          if (e.shiftKey) {
            last.focus();
          } else {
            first.focus();
          }
          return;
        }

        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      cancelAnimationFrame(initialFocusFrame);
      unregisterModal();
      releaseScrollLock();
      window.removeEventListener('keydown', handleKeyDown);
      requestAnimationFrame(() => {
        if (
          previousActiveElement &&
          typeof previousActiveElement.focus === 'function' &&
          document.contains(previousActiveElement)
        ) {
          previousActiveElement.focus();
        }
      });
    };
  }, [isSidebarOpenMobile, setSidebarOpenMobile]);

  return (
    <>
      <div
        id={`${resolvedId}-backdrop`}
        data-sidebar-backdrop=""
        className={styles.backdrop}
        data-open={isSidebarOpenMobile}
        onClick={() => setSidebarOpenMobile(false)}
        aria-hidden="true"
      />
      <aside
        {...props}
        ref={sidebarRef}
        id={resolvedId}
        data-sidebar=""
        className={cn(styles.sidebar, className)}
        data-variant={variant}
        data-collapsed={isCollapsed}
        data-mobile-open={isSidebarOpenMobile}
        aria-label={ariaLabel}
        role={isSidebarOpenMobile ? 'dialog' : undefined}
        aria-modal={isSidebarOpenMobile ? 'true' : undefined}
        inert={(isMobile && !isSidebarOpenMobile) || isPanelOverlayModal ? true : undefined}
      >
        {children}
      </aside>
    </>
  );
}

export const Sidebar: SidebarComponent = Object.assign(SidebarRoot, {
  Logo: SidebarLogo,
  WorkspaceSwitcher: SidebarWorkspaceSwitcher,
  Search: SidebarSearch,
  Nav: PrimarySidebarMenu,
  Menu: PrimarySidebarMenu,
  Group: SidebarGroup,
  Item: SidebarItem,
  WorkspacesMenu: SidebarWorkspacesMenu,
  SupportMenu: SidebarSupportMenu,
  Footer: SidebarFooter,
  Avatar: SidebarAvatar,
  AvatarPopover: SidebarAvatarPopover,
  Trigger: SidebarTrigger,
});

// Re-export modular components for convenience
export * from './primary-sidebar';
export * from './secondary-sidebar';
export * from './sidebar-logo';
export * from './sidebar-workspace-switcher';
export * from './primary-sidebar-menu';
export * from './sidebar-workspaces-menu';
export * from './sidebar-support-menu';
export * from './sidebar-search';
export * from './sidebar-footer';
export * from './sidebar-avatar';
export * from './sidebar-avatar-popover';
export * from './sidebar-trigger';
