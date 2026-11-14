'use client';

import type React from 'react';
import { SidebarGroup, SidebarItem, type SidebarItemBaseProps } from './primary-sidebar-menu';

export interface SidebarSupportMenuItem extends SidebarItemBaseProps {
  id?: string;
  href?: string;
}

export interface SidebarSupportMenuProps {
  label?: React.ReactNode;
  action?: React.ReactNode;
  items: SidebarSupportMenuItem[];
  className?: string;
  collapsible?: boolean;
  defaultOpen?: boolean;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

/**
 * SidebarSupportMenu renders the Support & System section on the sidebar.
 */
export function SidebarSupportMenu({
  label,
  action,
  items,
  className,
  collapsible = true,
  defaultOpen = true,
  isOpen,
  onOpenChange,
}: SidebarSupportMenuProps) {
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
          icon={item.icon}
          badge={item.badge}
          isActive={item.isActive}
          as={item.as}
        />
      ))}
    </SidebarGroup>
  );
}
