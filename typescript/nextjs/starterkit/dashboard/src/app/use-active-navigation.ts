'use client';

import { usePathname } from 'next/navigation';
import type { NavGroup, SecondaryNavGroup } from '@/layouts/types';

export function useActiveNavigation(groups: NavGroup[]): NavGroup[] {
  const pathname = usePathname();

  return groups.map((group) => ({
    ...group,
    items: group.items.map((item) => ({
      ...item,
      isActive: item.href
        ? pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))
        : false,
    })),
  }));
}

export function useActiveSecondaryNav(groups: SecondaryNavGroup[]): SecondaryNavGroup[] {
  const pathname = usePathname();

  return groups.map((group) => ({
    ...group,
    items: group.items.map((item) => ({
      ...item,
      isActive: item.href
        ? pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))
        : false,
    })),
  }));
}
