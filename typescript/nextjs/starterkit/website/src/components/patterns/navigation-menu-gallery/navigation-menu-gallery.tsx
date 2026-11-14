'use client';

import { type MouseEvent, useCallback, useMemo, useState } from 'react';
import type { IconName } from '@/components/icons';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui';
import { useI18n } from '@/providers';
import {
  GalleryCodeInspector,
  GalleryStudioLayout,
  type StudioLinkComponent,
  StudioSegmentedControl,
  type StudioSegmentedOption,
  type StudioSpecGroup,
  StudioToggleRow,
} from '../gallery-studio';
import styles from './navigation-menu-gallery.module.css';

export interface NavigationMenuGalleryProps {
  linkComponent?: StudioLinkComponent;
}

type NavStylePreset = 'icons' | 'text' | 'simple';

interface NavSubItemSpec {
  id: string;
  href: string;
  labelEn: string;
  labelAr: string;
  icon: IconName;
}

interface NavTopItemSpec {
  id: string;
  labelEn: string;
  labelAr: string;
  href?: string;
  children?: NavSubItemSpec[];
}

const OVERVIEW_ITEM: NavTopItemSpec = {
  id: 'overview',
  labelEn: 'Overview',
  labelAr: 'نظرة عامة',
  href: '#overview',
};

const MENU_ITEMS: NavTopItemSpec[] = [
  OVERVIEW_ITEM,
  {
    id: 'products',
    labelEn: 'Products',
    labelAr: 'المنتجات',
    children: [
      {
        id: 'analytics',
        href: '#analytics',
        labelEn: 'Analytics',
        labelAr: 'التحليلات',
        icon: 'chart',
      },
      {
        id: 'automations',
        href: '#automations',
        labelEn: 'Automations',
        labelAr: 'الأتمتة',
        icon: 'settings',
      },
      {
        id: 'integrations',
        href: '#integrations',
        labelEn: 'Integrations',
        labelAr: 'التكاملات',
        icon: 'api',
      },
      {
        id: 'security',
        href: '#security',
        labelEn: 'Security',
        labelAr: 'الأمان',
        icon: 'check-circle',
      },
    ],
  },
  {
    id: 'resources',
    labelEn: 'Resources',
    labelAr: 'الموارد',
    children: [
      {
        id: 'docs',
        href: '#docs',
        labelEn: 'Documentation',
        labelAr: 'الوثائق',
        icon: 'folder',
      },
      {
        id: 'api',
        href: '#api',
        labelEn: 'API Reference',
        labelAr: 'مرجع API',
        icon: 'api',
      },
      {
        id: 'guides',
        href: '#guides',
        labelEn: 'Guides',
        labelAr: 'الأدلة',
        icon: 'attachment',
      },
    ],
  },
  {
    id: 'pricing',
    labelEn: 'Pricing',
    labelAr: 'الأسعار',
    href: '#pricing',
  },
];

const SIMPLE_ITEMS: NavTopItemSpec[] = [
  OVERVIEW_ITEM,
  { id: 'deployments', labelEn: 'Deployments', labelAr: 'عمليات النشر', href: '#deployments' },
  { id: 'members', labelEn: 'Members', labelAr: 'الأعضاء', href: '#members' },
  { id: 'settings', labelEn: 'Settings', labelAr: 'الإعدادات', href: '#settings' },
];

export function NavigationMenuGallery({ linkComponent }: NavigationMenuGalleryProps) {
  const { t } = useI18n();

  const [specimenDir, setSpecimenDir] = useState<'ltr' | 'rtl'>('ltr');
  const [stylePreset, setStylePreset] = useState<NavStylePreset>('icons');
  const [orientation, setOrientation] = useState<'horizontal' | 'vertical'>('horizontal');
  const [activeItem, setActiveItem] = useState<string | null>('products');
  const [selectedLinkId, setSelectedLinkId] = useState<string>('overview');
  const [disabled, setDisabled] = useState<boolean>(false);

  const isRtl = specimenDir === 'rtl';
  const showIcons = stylePreset === 'icons';
  const items = stylePreset === 'simple' ? SIMPLE_ITEMS : MENU_ITEMS;

  const handleStylePresetChange = useCallback((nextPreset: NavStylePreset) => {
    setStylePreset(nextPreset);
    setActiveItem(nextPreset === 'simple' ? null : 'products');
  }, []);

  const handleOrientationChange = useCallback(
    (nextOrientation: 'horizontal' | 'vertical') => {
      setOrientation(nextOrientation);
      if (stylePreset !== 'simple') {
        setActiveItem('products');
      }
    },
    [stylePreset],
  );

  const handleReset = useCallback(() => {
    setSpecimenDir('ltr');
    setStylePreset('icons');
    setOrientation('horizontal');
    setActiveItem('products');
    setSelectedLinkId('overview');
    setDisabled(false);
  }, []);

  const handlePreviewLinkClick = useCallback((e: MouseEvent<HTMLAnchorElement>, linkId: string) => {
    e.preventDefault();
    setSelectedLinkId(linkId);
  }, []);

  const dirOptions: StudioSegmentedOption<'ltr' | 'rtl'>[] = [
    { value: 'ltr', label: t('common.studio.specimenDirLtr') },
    { value: 'rtl', label: t('common.studio.specimenDirRtl') },
  ];

  const styleOptions: StudioSegmentedOption<NavStylePreset>[] = [
    { value: 'icons', label: 'With Icons' },
    { value: 'text', label: 'Text Only' },
    { value: 'simple', label: 'Simple Bar' },
  ];

  const orientationOptions: StudioSegmentedOption<'horizontal' | 'vertical'>[] = [
    { value: 'horizontal', label: 'Horizontal' },
    { value: 'vertical', label: 'Vertical' },
  ];

  const specGroups: StudioSpecGroup[] = useMemo(
    () => [
      {
        title: 'Component Parameters',
        items: [
          { label: 'Variant', value: stylePreset },
          { label: 'Orientation', value: orientation },
          { label: 'Open Menu', value: activeItem ?? 'none' },
          { label: 'Disabled', value: disabled ? 'true' : 'false' },
          { label: 'Direction', value: specimenDir.toUpperCase() },
        ],
      },
      {
        title: 'WAI-ARIA & Keyboard Navigation',
        items: [
          { label: 'Landmark', value: '<nav aria-label="..."> container' },
          { label: 'Menubar', value: `role="menubar" aria-orientation="${orientation}"` },
          { label: 'Bar Traversal', value: 'ArrowRight / ArrowLeft (mirrors in RTL) / Home / End' },
          { label: 'Submenu', value: 'ArrowDown / ArrowUp / Escape restores trigger focus' },
        ],
      },
    ],
    [stylePreset, orientation, activeItem, disabled, specimenDir],
  );

  const jsxSnippet = useMemo(() => {
    return `<NavigationMenu
  value={${activeItem ? `"${activeItem}"` : 'null'}}
  onValueChange={setActiveItem}
  orientation="${orientation}"${disabled ? '\n  disabled' : ''}
  aria-label="Main Navigation"
>
  <NavigationMenuList>
    <NavigationMenuItem>
      <NavigationMenuLink href="/overview" active>Overview</NavigationMenuLink>
    </NavigationMenuItem>
    <NavigationMenuItem value="products">
      <NavigationMenuTrigger>Products</NavigationMenuTrigger>
      <NavigationMenuContent>
        <NavigationMenuLink href="/analytics"${showIcons ? ' icon="chart"' : ''}>Analytics</NavigationMenuLink>
        <NavigationMenuLink href="/automations"${showIcons ? ' icon="settings"' : ''}>Automations</NavigationMenuLink>
        <NavigationMenuLink href="/integrations"${showIcons ? ' icon="api"' : ''}>Integrations</NavigationMenuLink>
      </NavigationMenuContent>
    </NavigationMenuItem>
    <NavigationMenuItem>
      <NavigationMenuLink href="/pricing">Pricing</NavigationMenuLink>
    </NavigationMenuItem>
  </NavigationMenuList>
</NavigationMenu>`;
  }, [activeItem, orientation, disabled, showIcons]);

  const aiPrompt = useMemo(() => {
    return `Generate a white-label React NavigationMenu component using White-Label UI Kit:
- Orientation: ${orientation}
- Compound structure: NavigationMenu, NavigationMenuList, NavigationMenuItem, NavigationMenuTrigger, NavigationMenuContent, NavigationMenuLink
- WAI-ARIA role="menubar" and role="menuitem" with aria-haspopup="menu", aria-expanded, and aria-orientation="${orientation}"
- Full keyboard navigation: ArrowRight/ArrowLeft (RTL-aware), ArrowDown/ArrowUp, Home/End, Escape focus restoration
- Direction: ${specimenDir.toUpperCase()}`;
  }, [orientation, specimenDir]);

  const controls = (
    <>
      <StudioSegmentedControl
        label={t('common.studio.specimenDirectionLabel')}
        value={specimenDir}
        options={dirOptions}
        onChange={setSpecimenDir}
      />

      <StudioSegmentedControl
        label={t('common.studio.navigationMenuScenario')}
        value={stylePreset}
        options={styleOptions}
        onChange={handleStylePresetChange}
      />

      <StudioSegmentedControl
        label={t('common.studio.navigationMenuOrientation')}
        value={orientation}
        options={orientationOptions}
        onChange={handleOrientationChange}
      />

      <StudioToggleRow
        label={t('common.studio.fileUploadDisabled')}
        checked={disabled}
        onCheckedChange={setDisabled}
        testId="toggle-nav-disabled"
      />
    </>
  );

  return (
    <GalleryStudioLayout
      activeRoute="navigation-menu"
      title={t('common.studio.navigationMenuTitle')}
      subtitle={t('common.studio.navigationMenuSubtitle')}
      testId="gallery-navigation-menu"
      controls={controls}
      onReset={handleReset}
      previewDir={specimenDir}
      linkComponent={linkComponent}
      inspector={
        <GalleryCodeInspector
          aiPrompt={aiPrompt}
          jsxCode={jsxSnippet}
          cssCode={null}
          cssFileName="navigation-menu.module.css"
          jsxFileName="navigation-menu.tsx"
          specGroups={specGroups}
        />
      }
    >
      <div className={styles.specimenCanvas} dir={specimenDir} lang={isRtl ? 'ar' : 'en'}>
        <div className={styles.specimenBox} data-orientation={orientation}>
          <NavigationMenu
            value={activeItem}
            onValueChange={setActiveItem}
            orientation={orientation}
            disabled={disabled}
            aria-label={isRtl ? 'التنقل الرئيسي' : 'Main Navigation'}
            data-testid="interactive-nav-menu"
          >
            <NavigationMenuList>
              {items.map((item) =>
                item.children ? (
                  <NavigationMenuItem key={item.id} value={item.id}>
                    <NavigationMenuTrigger data-testid={`nav-trigger-${item.id}`}>
                      {isRtl ? item.labelAr : item.labelEn}
                    </NavigationMenuTrigger>
                    <NavigationMenuContent data-testid={`nav-content-${item.id}`}>
                      {item.children.map((sub) => (
                        <NavigationMenuLink
                          key={sub.id}
                          href={sub.href}
                          icon={showIcons ? sub.icon : undefined}
                          active={selectedLinkId === sub.id}
                          onClick={(e) => handlePreviewLinkClick(e, sub.id)}
                          data-testid={`nav-link-${sub.id}`}
                        >
                          {isRtl ? sub.labelAr : sub.labelEn}
                        </NavigationMenuLink>
                      ))}
                    </NavigationMenuContent>
                  </NavigationMenuItem>
                ) : (
                  <NavigationMenuItem key={item.id} value={item.id}>
                    <NavigationMenuLink
                      href={item.href}
                      active={selectedLinkId === item.id}
                      onClick={(e) => handlePreviewLinkClick(e, item.id)}
                      data-testid={`nav-link-${item.id}`}
                    >
                      {isRtl ? item.labelAr : item.labelEn}
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                ),
              )}
            </NavigationMenuList>
          </NavigationMenu>
        </div>
      </div>
    </GalleryStudioLayout>
  );
}
