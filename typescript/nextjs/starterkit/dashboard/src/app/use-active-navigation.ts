'use client';

import { usePathname } from 'next/navigation';
import type { NavGroup, SecondaryNavGroup } from '@/layouts/types';

/**
 * Determines whether a navigation item is active given the current pathname and all available links.
 * 1. Exact match takes highest priority.
 * 2. If an exact match exists elsewhere in the navigation set, ancestor prefixes are NOT marked active.
 * 3. Segment boundaries (/section/item) ensure unrelated prefix matches (/classic-other) never match.
 */
export function isNavigationActive(
  pathname: string,
  href?: string,
  allHrefs: string[] = [],
): boolean {
  if (!href) return false;

  // 1. Exact match
  if (pathname === href) return true;

  // 2. If the current pathname exists as an explicit item in navigation, don't mark ancestor prefixes
  if (allHrefs.includes(pathname)) return false;

  // 3. Segment boundary matching for nested unlisted child routes (excluding root '/')
  if (href !== '/' && pathname.startsWith(`${href}/`)) {
    return true;
  }

  return false;
}

export function useActiveNavigation(groups: NavGroup[]): NavGroup[] {
  const pathname = usePathname();

  // Collect all unique non-empty hrefs in the navigation set
  const allHrefs = groups.flatMap((group) =>
    group.items.map((item) => item.href).filter((h): h is string => Boolean(h)),
  );

  return groups.map((group) => ({
    ...group,
    items: group.items.map((item) => ({
      ...item,
      isActive: isNavigationActive(pathname, item.href, allHrefs),
    })),
  }));
}

export function useActiveSecondaryNav(groups: SecondaryNavGroup[]): SecondaryNavGroup[] {
  const pathname = usePathname();

  const allHrefs = groups.flatMap((group) =>
    group.items.map((item) => item.href).filter((h): h is string => Boolean(h)),
  );

  return groups.map((group) => ({
    ...group,
    items: group.items.map((item) => ({
      ...item,
      isActive: isNavigationActive(pathname, item.href, allHrefs),
    })),
  }));
}
