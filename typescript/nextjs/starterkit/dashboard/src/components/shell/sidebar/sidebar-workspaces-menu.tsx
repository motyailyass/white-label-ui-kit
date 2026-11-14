'use client';

import type React from 'react';
import { Icon } from '@/components/icons';
import { SidebarGroup, SidebarItem, type SidebarItemBaseProps } from './primary-sidebar-menu';
import styles from './sidebar.module.css';

export type SidebarWorkspaceTone = 'primary' | 'info' | 'success' | 'warning' | 'danger';

export interface SidebarWorkspaceItem extends Omit<SidebarItemBaseProps, 'icon'> {
  id?: string;
  href?: string;
  tone?: SidebarWorkspaceTone;
  icon?: React.ReactNode;
}

export interface SidebarWorkspacesMenuProps {
  label?: React.ReactNode;
  action?: React.ReactNode;
  items: SidebarWorkspaceItem[];
  className?: string;
  collapsible?: boolean;
  defaultOpen?: boolean;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

/**
 * SidebarWorkspacesMenu renders the Workspaces / Teams section on the sidebar.
 */
export function SidebarWorkspacesMenu({
  label,
  action,
  items,
  className,
  collapsible = true,
  defaultOpen = true,
  isOpen,
  onOpenChange,
}: SidebarWorkspacesMenuProps) {
  return (
    <SidebarGroup
      label={label}
      action={action}
      className={className}
      collapsible={collapsible}
      defaultOpen={defaultOpen}
      isOpen={isOpen}
      onOpenChange={onOpenChange}
    >
      {items.map((item) => (
        <SidebarItem
          key={item.id ?? item.label}
          label={item.label}
          href={item.href}
          isActive={item.isActive}
          badge={item.badge}
          as={item.as}
          icon={
            item.icon ?? (
              <span className={styles.workspaceToneIcon} data-tone={item.tone ?? 'primary'}>
                <Icon name="slack" size={18} aria-hidden="true" />
              </span>
            )
          }
        />
      ))}
    </SidebarGroup>
  );
}
