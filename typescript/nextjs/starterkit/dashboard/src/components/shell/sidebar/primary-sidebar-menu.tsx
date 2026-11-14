'use client';

import React from 'react';
import { Icon } from '@/components/icons';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/cn';
import styles from './sidebar.module.css';

/* -------------------------------------------------------------------------- */
/*                            PrimarySidebarMenu / Nav                        */
/* -------------------------------------------------------------------------- */

export interface PrimarySidebarMenuProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode;
}

export function PrimarySidebarMenu({ className, children, ...props }: PrimarySidebarMenuProps) {
  return (
    <nav className={cn(styles.nav, className)} {...props}>
      {children}
    </nav>
  );
}

export { PrimarySidebarMenu as SidebarNav, PrimarySidebarMenu as SidebarMenu };
export type {
  PrimarySidebarMenuProps as SidebarNavProps,
  PrimarySidebarMenuProps as SidebarMenuProps,
};

/* -------------------------------------------------------------------------- */
/*                                SidebarGroup                                */
/* -------------------------------------------------------------------------- */

export interface SidebarGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  label?: React.ReactNode;
  action?: React.ReactNode;
  collapsible?: boolean;
  defaultOpen?: boolean;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  toggleAriaLabel?: string;
  children: React.ReactNode;
}

export function SidebarGroup({
  label,
  action,
  collapsible = false,
  defaultOpen = true,
  isOpen: controlledIsOpen,
  onOpenChange,
  toggleAriaLabel,
  className,
  children,
  ...props
}: SidebarGroupProps) {
  const [uncontrolledIsOpen, setUncontrolledIsOpen] = React.useState(defaultOpen);
  const isControlled = controlledIsOpen !== undefined;
  const isOpen = isControlled ? controlledIsOpen : uncontrolledIsOpen;
  const contentId = React.useId();

  const handleToggle = () => {
    const next = !isOpen;
    if (!isControlled) {
      setUncontrolledIsOpen(next);
    }
    onOpenChange?.(next);
  };

  return (
    <div className={cn(styles.group, className)} {...props}>
      {label && (
        <div className={styles.groupHeader}>
          {collapsible ? (
            action ? (
              <div className={styles.groupHeaderRow}>
                <button
                  type="button"
                  className={styles.groupLabelTrigger}
                  onClick={handleToggle}
                  aria-expanded={isOpen}
                  aria-controls={contentId}
                >
                  <span className={styles.groupLabel} data-role="eyebrow">
                    {label}
                  </span>
                </button>
                <div className={styles.groupHeaderEnd}>
                  <div className={styles.groupAction}>{action}</div>
                  <button
                    type="button"
                    className={styles.groupChevronTrigger}
                    onClick={handleToggle}
                    aria-expanded={isOpen}
                    aria-controls={contentId}
                    aria-label={toggleAriaLabel ?? (typeof label === 'string' ? label : undefined)}
                  >
                    <span
                      className={styles.groupChevron}
                      data-collapsed={!isOpen}
                      aria-hidden="true"
                    >
                      <Icon name="chevron-down" size={14} />
                    </span>
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                className={styles.groupTrigger}
                onClick={handleToggle}
                aria-expanded={isOpen}
                aria-controls={contentId}
              >
                <span className={styles.groupLabel} data-role="eyebrow">
                  {label}
                </span>
                <span className={styles.groupChevron} data-collapsed={!isOpen} aria-hidden="true">
                  <Icon name="chevron-down" size={14} />
                </span>
              </button>
            )
          ) : (
            <>
              <div className={styles.groupLabel} data-role="eyebrow">
                {label}
              </div>
              {action && <div className={styles.groupAction}>{action}</div>}
            </>
          )}
        </div>
      )}
      <div
        id={contentId}
        hidden={collapsible ? !isOpen : undefined}
        className={styles.groupContent}
      >
        {children}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                                 SidebarItem                                */
/* -------------------------------------------------------------------------- */

export interface SidebarItemBaseProps {
  icon?: React.ReactNode;
  label: string;
  badge?: React.ReactNode;
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
        <Badge size="sm" variant="default" shape="pill" className={styles.badge} data-role="badge">
          {badge}
        </Badge>
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
