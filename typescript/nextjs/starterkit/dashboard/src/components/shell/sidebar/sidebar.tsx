'use client';

import type React from 'react';
import { useEffect, useRef } from 'react';
import { Icon } from '@/components/icons';
import { cn } from '@/lib/cn';
import { acquireBodyScrollLock } from '@/lib/scroll-lock';
import { useLayout } from '../layout-context';
import { isTopmostModal, pushModal } from '../modal-stack';
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

export function Sidebar({
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

/* -------------------------------------------------------------------------- */
/*                               SidebarPrimary                               */
/* -------------------------------------------------------------------------- */

export interface SidebarPrimaryProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

/**
 * SidebarPrimary renders the primary icon rail in multi-column sidebar layouts.
 * Renders a <div> to avoid duplicate <aside> landmark regions within the root sidebar.
 */
export function SidebarPrimary({ className, children, ...props }: SidebarPrimaryProps) {
  return (
    <div className={cn(styles.primary, className)} {...props}>
      {children}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                              SidebarSecondary                              */
/* -------------------------------------------------------------------------- */

export interface SidebarSecondaryProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

/**
 * SidebarSecondary renders the sub-navigation panel in multi-column sidebar layouts.
 * Renders a <div> to avoid duplicate <aside> landmark regions within the root sidebar.
 */
export function SidebarSecondary({ className, children, ...props }: SidebarSecondaryProps) {
  return (
    <div className={cn(styles.secondary, className)} {...props}>
      {children}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                                 SidebarLogo                                */
/* -------------------------------------------------------------------------- */

export interface SidebarLogoProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  icon?: React.ReactNode;
  title: string;
  subtitle?: string;
  href?: string;
  /**
   * Host-agnostic Link slot (e.g. Next.js Link, TanStack Router Link, Vite <a>).
   */
  as?: React.ElementType;
}

export function SidebarLogo({
  icon,
  title,
  subtitle,
  href = '/',
  as: Component = 'a',
  className,
  ...props
}: SidebarLogoProps) {
  return (
    <Component href={href} className={cn(styles.logo, className)} {...props}>
      <span className={styles.logoIcon}>{icon || title.charAt(0).toUpperCase()}</span>
      <div className={styles.logoText}>
        <div>{title}</div>
        {subtitle && <div className={styles.logoSubtitle}>{subtitle}</div>}
      </div>
    </Component>
  );
}

/* -------------------------------------------------------------------------- */
/*                            Navigation Components                           */
/* -------------------------------------------------------------------------- */

export function SidebarNav({ className, children, ...props }: React.HTMLAttributes<HTMLElement>) {
  return (
    <nav className={cn(styles.nav, className)} {...props}>
      {children}
    </nav>
  );
}

export interface SidebarGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  label?: string;
  children: React.ReactNode;
}

export function SidebarGroup({ label, className, children, ...props }: SidebarGroupProps) {
  return (
    <div className={cn(styles.group, className)} {...props}>
      {label && (
        <div className={styles.groupLabel} data-role="eyebrow">
          {label}
        </div>
      )}
      {children}
    </div>
  );
}

export interface SidebarItemBaseProps {
  icon?: React.ReactNode;
  label: string;
  badge?: string | number;
  isActive?: boolean;
  /**
   * Host-agnostic custom Link/router component slot (e.g. Next.js Link, TanStack Router Link).
   */
  as?: React.ElementType;
}

export type SidebarItemProps =
  | (SidebarItemBaseProps & { href: string } & React.AnchorHTMLAttributes<HTMLAnchorElement>)
  | (SidebarItemBaseProps & { href?: undefined } & React.ButtonHTMLAttributes<HTMLButtonElement>);

export function SidebarItem(props: SidebarItemProps) {
  const { icon, label, badge, isActive = false, as: CustomComponent, className } = props;

  const content = (
    <>
      {icon && <span className={styles.itemIcon}>{icon}</span>}
      <span className={styles.itemLabel}>{label}</span>
      {badge !== undefined && (
        <span className={styles.badge} data-role="badge">
          {badge}
        </span>
      )}
    </>
  );

  const sharedClassName = cn(styles.item, className);
  const ariaCurrent = isActive ? ('page' as const) : undefined;

  if (CustomComponent) {
    const {
      icon: _icon,
      label: _label,
      badge: _badge,
      isActive: _active,
      as: _as,
      className: _cls,
      ...customProps
    } = props;
    return (
      <CustomComponent
        data-active={isActive}
        aria-current={ariaCurrent}
        title={label}
        className={sharedClassName}
        {...customProps}
      >
        {content}
      </CustomComponent>
    );
  }

  if (props.href !== undefined) {
    const {
      icon: _icon,
      label: _label,
      badge: _badge,
      isActive: _active,
      as: _as,
      className: _cls,
      ...anchorProps
    } = props;
    return (
      <a
        data-active={isActive}
        aria-current={ariaCurrent}
        title={label}
        className={sharedClassName}
        {...anchorProps}
      >
        {content}
      </a>
    );
  }

  const {
    icon: _icon,
    label: _label,
    badge: _badge,
    isActive: _active,
    as: _as,
    className: _cls,
    ...buttonProps
  } = props;
  return (
    <button
      type="button"
      data-active={isActive}
      aria-current={ariaCurrent}
      title={label}
      className={sharedClassName}
      {...buttonProps}
    >
      {content}
    </button>
  );
}

/* -------------------------------------------------------------------------- */
/*                                SidebarAvatar                               */
/* -------------------------------------------------------------------------- */

export interface SidebarAvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  name: string;
  email?: string;
  avatarUrl?: string;
  initials?: string;
  /**
   * Host-agnostic Image component slot (e.g. Next.js Image, custom optimized image component).
   */
  imageComponent?: React.ElementType;
}

export function SidebarAvatar({
  name,
  email,
  avatarUrl,
  initials,
  imageComponent: ImageComponent,
  className,
  ...props
}: SidebarAvatarProps) {
  return (
    <div className={cn(styles.avatar, className)} {...props}>
      {avatarUrl ? (
        ImageComponent ? (
          <ImageComponent src={avatarUrl} alt={name} className={styles.avatarImage} />
        ) : (
          <img src={avatarUrl} alt={name} className={styles.avatarImage} />
        )
      ) : (
        <div className={styles.avatarImage}>{initials || name.slice(0, 2).toUpperCase()}</div>
      )}
      <div className={styles.avatarInfo}>
        <div className={styles.avatarName}>{name}</div>
        {email && <div className={styles.avatarSub}>{email}</div>}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                               SidebarTrigger                               */
/* -------------------------------------------------------------------------- */

export interface SidebarTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  id?: string;
}

export function SidebarTrigger({
  id,
  className,
  onClick,
  'aria-label': ariaLabel = 'Toggle navigation sidebar',
  'aria-controls': ariaControls,
  ...props
}: SidebarTriggerProps) {
  const {
    sidebarId,
    toggleSidebar,
    toggleSidebarMobile,
    isSidebarOpenMobile,
    isSidebarCollapsed,
    isMobile,
  } = useLayout();
  const isExpanded = isMobile ? isSidebarOpenMobile : !isSidebarCollapsed;

  return (
    <button
      {...props}
      id={id ?? `${sidebarId}-trigger`}
      data-sidebar-trigger=""
      type="button"
      className={cn(styles.trigger, className)}
      onClick={(e) => {
        onClick?.(e);
        if (e.defaultPrevented) return;
        const isMobileEffective =
          isMobile ||
          (typeof window !== 'undefined' &&
            typeof window.matchMedia === 'function' &&
            window.matchMedia('(max-width: 768px)').matches);
        if (isMobileEffective) {
          toggleSidebarMobile();
        } else {
          toggleSidebar();
        }
      }}
      aria-label={ariaLabel}
      aria-controls={ariaControls ?? sidebarId}
      aria-expanded={isExpanded}
    >
      <Icon name="sidebar-left" size={16} aria-hidden="true" />
    </button>
  );
}
