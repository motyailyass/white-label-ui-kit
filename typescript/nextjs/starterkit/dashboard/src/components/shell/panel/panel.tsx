'use client';

import type React from 'react';
import { createContext, useCallback, useContext, useEffect, useMemo, useRef } from 'react';
import { Icon } from '@/components/icons';
import { cn } from '@/lib/cn';
import { acquireBodyScrollLock } from '@/lib/scroll-lock';
import { useLayout } from '../layout-context';
import { isTopmostModal, pushModal } from '../modal-stack';
import styles from './panel.module.css';

/* -------------------------------------------------------------------------- */
/*                                Panel Context                               */
/* -------------------------------------------------------------------------- */

interface PanelContextValue {
  isOpen: boolean;
  requestClose: () => void;
}

const PanelContext = createContext<PanelContextValue | undefined>(undefined);

/* -------------------------------------------------------------------------- */
/*                                    Panel                                   */
/* -------------------------------------------------------------------------- */

export interface PanelProps extends React.HTMLAttributes<HTMLElement> {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  mode?: 'inline' | 'overlay';
  width?: number | string;
  children: React.ReactNode;
}

export function Panel({
  id,
  open,
  onOpenChange,
  mode = 'inline',
  width,
  className,
  style,
  children,
  'aria-label': ariaLabel = 'Contextual panel',
  ...props
}: PanelProps) {
  const {
    panelId,
    isPanelOpen,
    setPanelOpen,
    isTablet,
    isSidebarOpenMobile,
    setSidebarOpenMobile,
    registerPanelController,
  } = useLayout();
  const resolvedId = id ?? panelId;
  const isControlled = open !== undefined;
  const isOpen = isControlled ? open : isPanelOpen;
  const isOverlayModal = isOpen && (mode === 'overlay' || isTablet);

  const panelRef = useRef<HTMLElement | null>(null);

  // Exclusive modal ownership: close sidebar mobile drawer if panel opens in overlay modal mode
  useEffect(() => {
    if (isOverlayModal && isSidebarOpenMobile) {
      setSidebarOpenMobile(false);
    }
  }, [isOverlayModal, isSidebarOpenMobile, setSidebarOpenMobile]);

  // Register controlled panel with LayoutContext so togglePanel (Cmd+.) drives onOpenChange
  useEffect(() => {
    if (isControlled) {
      registerPanelController({
        open,
        onOpenChange,
      });
      return () => registerPanelController(null);
    }
  }, [isControlled, open, onOpenChange, registerPanelController]);

  const requestClose = useCallback(() => {
    if (isControlled) {
      onOpenChange?.(false);
    } else {
      setPanelOpen(false);
      onOpenChange?.(false);
    }
  }, [isControlled, onOpenChange, setPanelOpen]);

  const requestCloseRef = useRef(requestClose);
  requestCloseRef.current = requestClose;

  // Overlay/tablet modal dialog behavior: Escape dismissal, focus trap, focus restoration, and scroll lock
  useEffect(() => {
    if (!isOverlayModal) return;

    const releaseScrollLock = acquireBodyScrollLock();
    const previousActiveElement = document.activeElement as HTMLElement | null;
    const unregisterModal = pushModal('panel-overlay', () => requestCloseRef.current());

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
      if (!panelRef.current) return [];
      return Array.from(panelRef.current.querySelectorAll<HTMLElement>(focusableSelector)).filter(
        isVisible,
      );
    };

    const initialFocusFrame = requestAnimationFrame(() => {
      const focusables = getFocusables();
      if (focusables.length > 0) {
        focusables[0].focus();
      } else {
        panelRef.current?.focus();
      }
    });

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isTopmostModal('panel-overlay')) {
          e.preventDefault();
          e.stopPropagation();
          requestCloseRef.current();
        }
        return;
      }

      if (e.key === 'Tab') {
        const currentFocusables = getFocusables();
        if (currentFocusables.length === 0) {
          e.preventDefault();
          panelRef.current?.focus();
          return;
        }

        const first = currentFocusables[0];
        const last = currentFocusables[currentFocusables.length - 1];

        // If focus is currently outside the panel container, recover focus immediately
        if (!panelRef.current?.contains(document.activeElement)) {
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
  }, [isOverlayModal]);

  const contextValue = useMemo(() => ({ isOpen, requestClose }), [isOpen, requestClose]);

  const dynamicStyle: React.CSSProperties | undefined =
    width !== undefined
      ? ({
          ...style,
          '--panel-width': typeof width === 'number' ? `${width}px` : width,
        } as React.CSSProperties)
      : style;

  return (
    <PanelContext.Provider value={contextValue}>
      <div
        id={`${resolvedId}-backdrop`}
        data-panel-backdrop=""
        className={styles.backdrop}
        data-open={isOverlayModal}
        onClick={requestClose}
        aria-hidden="true"
      />
      <aside
        {...props}
        ref={panelRef}
        id={resolvedId}
        data-panel=""
        className={cn(styles.panel, className)}
        data-open={isOpen}
        data-mode={mode}
        style={dynamicStyle}
        aria-label={ariaLabel}
        role={isOverlayModal ? 'dialog' : undefined}
        aria-modal={isOverlayModal ? 'true' : undefined}
        tabIndex={isOverlayModal ? -1 : props.tabIndex}
        inert={isSidebarOpenMobile ? true : undefined}
      >
        {children}
      </aside>
    </PanelContext.Provider>
  );
}

/* -------------------------------------------------------------------------- */
/*                                 PanelHeader                                */
/* -------------------------------------------------------------------------- */

export interface PanelHeaderProps extends React.HTMLAttributes<HTMLElement> {
  title: string;
  description?: string;
  headingAs?: 'h2' | 'h3' | 'h4';
  closeLabel?: string;
  onClose?: () => void;
}

export function PanelHeader({
  title,
  description,
  headingAs: HeadingTag = 'h2',
  closeLabel = 'Close panel',
  onClose,
  className,
  children,
  ...props
}: PanelHeaderProps) {
  const panelContext = useContext(PanelContext);
  const { setPanelOpen } = useLayout();

  const handleClose = () => {
    if (onClose) {
      onClose();
    } else if (panelContext) {
      panelContext.requestClose();
    } else {
      setPanelOpen(false);
    }
  };

  return (
    <header className={cn(styles.header, className)} {...props}>
      <div className={styles.headerInfo}>
        <HeadingTag className={styles.title}>{title}</HeadingTag>
        {description && <p className={styles.subtitle}>{description}</p>}
      </div>

      <div className={styles.headerActions}>
        {children}
        <button
          type="button"
          className={styles.closeButton}
          onClick={handleClose}
          aria-label={closeLabel}
        >
          <Icon name="close" size={16} aria-hidden="true" />
        </button>
      </div>
    </header>
  );
}

/* -------------------------------------------------------------------------- */
/*                                  PanelBody                                 */
/* -------------------------------------------------------------------------- */

export interface PanelBodyProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function PanelBody({ className, children, ...props }: PanelBodyProps) {
  return (
    <div className={cn(styles.body, className)} {...props}>
      {children}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                                 PanelFooter                                */
/* -------------------------------------------------------------------------- */

export interface PanelFooterProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode;
}

export function PanelFooter({ className, children, ...props }: PanelFooterProps) {
  return (
    <footer className={cn(styles.footer, className)} {...props}>
      {children}
    </footer>
  );
}

/* -------------------------------------------------------------------------- */
/*                                PanelTrigger                                */
/* -------------------------------------------------------------------------- */

export interface PanelTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode;
}

export function PanelTrigger({
  id,
  className,
  onClick,
  'aria-label': ariaLabel = 'Toggle inspector panel',
  'aria-controls': ariaControls,
  children,
  ...props
}: PanelTriggerProps) {
  const { panelId, togglePanel, isPanelOpen } = useLayout();

  return (
    <button
      {...props}
      id={id ?? `${panelId}-trigger`}
      data-panel-trigger=""
      type="button"
      className={cn(styles.trigger, className)}
      onClick={(e) => {
        togglePanel();
        onClick?.(e);
      }}
      aria-label={ariaLabel}
      aria-controls={ariaControls ?? panelId}
      aria-expanded={isPanelOpen}
    >
      {children ?? <Icon name="settings" size={16} aria-hidden="true" />}
    </button>
  );
}
