import {
  Add01Icon,
  AiArtIcon,
  AiDrawingIcon,
  Alert02Icon,
  AlertCircleIcon,
  AllBookmarkIcon,
  AnonymousIcon,
  ArrowDown01Icon,
  ArrowLeft01Icon,
  ArrowRight01Icon,
  ArrowUp01Icon,
  Attachment02Icon,
  AudioWave02Icon,
  BellDotIcon,
  Cancel01Icon,
  ChartColumnDotsIcon,
  CheckmarkSquare02Icon,
  Download01Icon,
  Folder02Icon,
  Home01Icon,
  LayoutAlignLeftIcon,
  LayoutAlignRightIcon,
  LoaderCircleIcon,
  Logout05Icon,
  Mail01Icon,
  Menu01Icon,
  MilestoneIcon,
  Moon02Icon,
  MoreVerticalIcon,
  Search01Icon,
  Settings01Icon,
  SidebarLeftIcon,
  SlidersHorizontalIcon,
  Sun01Icon,
  Tick02Icon,
  Upload01Icon,
} from '@hugeicons/core-free-icons';
import type { IconSvgElement } from '@hugeicons/react';

interface IconEntry {
  svg: IconSvgElement;
  mirror?: boolean;
}

const icon = (svg: IconSvgElement): IconEntry => ({ svg });
const directional = (svg: IconSvgElement): IconEntry => ({ svg, mirror: true });

export const iconRegistry = {
  // actions
  add: icon(Add01Icon),
  plus: icon(Add01Icon),
  search: icon(Search01Icon),
  'search-01': icon(Search01Icon),
  close: icon(Cancel01Icon),
  cancel: icon(Cancel01Icon),
  menu: icon(Menu01Icon),
  check: icon(Tick02Icon),
  feature: icon(CheckmarkSquare02Icon),
  download: icon(Download01Icon),
  upload: icon(Upload01Icon),
  loader: icon(LoaderCircleIcon),
  'loader-circle': icon(LoaderCircleIcon),
  loading: icon(LoaderCircleIcon),
  spinner: icon(LoaderCircleIcon),

  // navigation & directional (directional glyphs flip under dir="rtl")
  'arrow-left': directional(ArrowLeft01Icon),
  'arrow-right': directional(ArrowRight01Icon),
  'arrow-up': icon(ArrowUp01Icon),
  'arrow-down': icon(ArrowDown01Icon),
  'chevron-right': directional(ArrowRight01Icon),
  'chevron-left': directional(ArrowLeft01Icon),
  'chevron-down': icon(ArrowDown01Icon),
  'chevron-up': icon(ArrowUp01Icon),
  'sidebar-left': directional(SidebarLeftIcon),
  logout: directional(Logout05Icon),
  milestone: directional(MilestoneIcon),

  // layout & alignment
  'layout-align-left': icon(LayoutAlignLeftIcon),
  'align-left': icon(LayoutAlignLeftIcon),
  'layout-align-right': icon(LayoutAlignRightIcon),
  'align-right': icon(LayoutAlignRightIcon),

  // media & content
  'ai-art': icon(AiArtIcon),
  'ai-drawing': icon(AiDrawingIcon),
  bookmark: icon(AllBookmarkIcon),
  bookmarks: icon(AllBookmarkIcon),
  attachment: icon(Attachment02Icon),
  'audio-wave': icon(AudioWave02Icon),
  folder: icon(Folder02Icon),

  // common semantic glyphs & status
  inbox: icon(Mail01Icon),
  warning: icon(Alert02Icon),
  error: icon(AlertCircleIcon),
  home: icon(Home01Icon),
  settings: icon(Settings01Icon),
  sliders: icon(SlidersHorizontalIcon),
  'sliders-horizontal': icon(SlidersHorizontalIcon),
  'more-vertical': icon(MoreVerticalIcon),
  'chart-column-dots': icon(ChartColumnDotsIcon),
  chart: icon(ChartColumnDotsIcon),
  'bell-dot': icon(BellDotIcon),
  bell: icon(BellDotIcon),
  anonymous: icon(AnonymousIcon),
  sun: icon(Sun01Icon),
  moon: icon(Moon02Icon),
} as const satisfies Record<string, IconEntry>;

export type IconName = keyof typeof iconRegistry;
