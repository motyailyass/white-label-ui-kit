import type { IconSvgElement } from '@hugeicons/react';
import {
  Alert02Icon,
  AlertCircleIcon,
  ArrowDown01Icon,
  ArrowLeft01Icon,
  ArrowRight01Icon,
  ArrowUp01Icon,
  Cancel01Icon,
  Home01Icon,
  Mail01Icon,
  Moon02Icon,
  Search01Icon,
  Settings01Icon,
  SidebarLeftIcon,
  Sun01Icon,
} from '@hugeicons/core-free-icons';

interface IconEntry {
  svg: IconSvgElement;
  mirror?: boolean;
}

const icon = (svg: IconSvgElement): IconEntry => ({ svg });
const directional = (svg: IconSvgElement): IconEntry => ({ svg, mirror: true });

export const iconRegistry = {
  // actions
  search: icon(Search01Icon),
  close: icon(Cancel01Icon),

  // navigation (directional glyphs flip under dir="rtl")
  'chevron-right': directional(ArrowRight01Icon),
  'chevron-left': directional(ArrowLeft01Icon),
  'chevron-down': icon(ArrowDown01Icon),
  'chevron-up': icon(ArrowUp01Icon),
  'sidebar-left': directional(SidebarLeftIcon),

  // common semantic glyphs
  inbox: icon(Mail01Icon),
  warning: icon(Alert02Icon),
  error: icon(AlertCircleIcon),
  home: icon(Home01Icon),
  settings: icon(Settings01Icon),
  sun: icon(Sun01Icon),
  moon: icon(Moon02Icon),
} as const satisfies Record<string, IconEntry>;

export type IconName = keyof typeof iconRegistry;
