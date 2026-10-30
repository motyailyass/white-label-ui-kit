'use client';

import type React from 'react';
import { createContext, useCallback, useContext, useMemo } from 'react';
import { cn } from '@/lib/cn';
import { Icon } from '@/components/icons';
import { useLayout } from '../layout-context';
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
  open,
  onOpenChange,
  mode = 'inline',
  width,
  className,
  style,
  children,
  ...props
}: PanelProps) {
  const { isPanelOpen, setPanelOpen } = useLayout();
  const isControlled = open !== undefined;
  const isOpen = isControlled ? open : isPanelOpen;

  const requestClose = useCallback(() => {
    if (isControlled) {
      onOpenChange?.(false);
    } else {
      setPanelOpen(false);
      onOpenChange?.(false);
    }
  }, [isControlled, onOpenChange, setPanelOpen]);

  const contextValue = useMemo(() => ({ isOpen, requestClose }), [isOpen, requestClose]);

  const dynamicStyle = width
    ? {
        ...style,
        width: typeof width === 'number' ? `${width}px` : width,
        minWidth: typeof width === 'number' ? `${width}px` : width,
      }
    : style;

  return (
    <PanelContext.Provider value={contextValue}>
      <aside
        className={cn(styles.panel, className)}
        data-open={isOpen}
        data-mode={mode}
        style={dynamicStyle}
        aria-label="Contextual panel"
        {...props}
      >
        {children}
      </aside>
    </PanelContext.Provider>
  );
}

/* -------------------------------------------------------------------------- */
/*                                 PanelHeader                                */
/* -------------------------------------------------------------------------- */

export interface PanelHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  description?: string;
  onClose?: () => void;
}

export function PanelHeader({
  title,
  description,
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
    <div className={cn(styles.header, className)} {...props}>
      <div className={styles.headerInfo}>
        <h3 className={styles.title}>{title}</h3>
        {description && <p className={styles.subtitle}>{description}</p>}
      </div>

      <div className={styles.headerActions}>
        {children}
        <button
          type="button"
          className={styles.closeButton}
          onClick={handleClose}
          aria-label="Close panel"
        >
          <Icon name="close" size={16} />
        </button>
      </div>
    </div>
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

export interface PanelFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function PanelFooter({ className, children, ...props }: PanelFooterProps) {
  return (
    <div className={cn(styles.footer, className)} {...props}>
      {children}
    </div>
  );
}
