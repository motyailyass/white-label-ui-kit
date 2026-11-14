'use client';

import { Fragment, useCallback, useMemo, useState } from 'react';
import { Kbd, KbdGroup, KbdSeparator, type KbdSize, type KbdVariant } from '@/components/ui';
import { type SupportedLocale } from '@/i18n';
import { useI18n } from '@/providers';
import {
  GalleryCodeInspector,
  GalleryStudioLayout,
  type StudioLinkComponent,
  StudioSegmentedControl,
  type StudioSegmentedOption,
  type StudioSpecGroup,
} from '../gallery-studio';
import styles from './kbd-gallery.module.css';

export interface KbdGalleryProps {
  linkComponent?: StudioLinkComponent;
}

type PresetKey = 'search' | 'save' | 'close' | 'format';

export function KbdGallery({ linkComponent }: KbdGalleryProps) {
  const { t, locale } = useI18n();

  const [specimenDir, setSpecimenDir] = useState<'ltr' | 'rtl'>('ltr');
  const [size, setSize] = useState<KbdSize>('md');
  const [variant, setVariant] = useState<KbdVariant>('outline');
  const [preset, setPreset] = useState<PresetKey>('search');

  const specimenLocale: SupportedLocale =
    specimenDir === 'rtl' ? 'ar' : locale === 'ar' ? 'en' : locale;
  const specimenLangAttr = specimenLocale !== locale ? specimenLocale : undefined;

  const handleReset = useCallback(() => {
    setSpecimenDir('ltr');
    setSize('md');
    setVariant('outline');
    setPreset('search');
  }, []);

  const dirOptions: StudioSegmentedOption<'ltr' | 'rtl'>[] = useMemo(
    () => [
      { value: 'ltr', label: t('common.studio.specimenDirLtr'), testId: 'kbd-dir-ltr' },
      { value: 'rtl', label: t('common.studio.specimenDirRtl'), testId: 'kbd-dir-rtl' },
    ],
    [t],
  );

  const sizeOptions: StudioSegmentedOption<KbdSize>[] = useMemo(
    () => [
      { value: 'sm', label: t('common.studio.kbdSizeSm'), testId: 'kbd-size-sm' },
      { value: 'md', label: t('common.studio.kbdSizeMd'), testId: 'kbd-size-md' },
      { value: 'lg', label: t('common.studio.kbdSizeLg'), testId: 'kbd-size-lg' },
    ],
    [t],
  );

  const variantOptions: StudioSegmentedOption<KbdVariant>[] = useMemo(
    () => [
      {
        value: 'outline',
        label: t('common.studio.kbdVariantOutline'),
        testId: 'kbd-variant-outline',
      },
      { value: 'subtle', label: t('common.studio.kbdVariantSubtle'), testId: 'kbd-variant-subtle' },
      { value: 'ghost', label: t('common.studio.kbdVariantGhost'), testId: 'kbd-variant-ghost' },
    ],
    [t],
  );

  const presetOptions: StudioSegmentedOption<PresetKey>[] = [
    { value: 'search', label: '⌘ + K', testId: 'kbd-preset-search' },
    { value: 'save', label: 'Ctrl + S', testId: 'kbd-preset-save' },
    { value: 'close', label: 'Esc', testId: 'kbd-preset-close' },
    { value: 'format', label: 'Shift + Alt + F', testId: 'kbd-preset-format' },
  ];

  const activeKeys = useMemo(() => {
    switch (preset) {
      case 'save':
        return ['Ctrl', 'S'];
      case 'close':
        return ['Esc'];
      case 'format':
        return ['Shift', 'Alt', 'F'];
      case 'search':
      default:
        return ['⌘', 'K'];
    }
  }, [preset]);

  const jsxSnippet = useMemo(() => {
    if (activeKeys.length === 1) {
      return `<Kbd size="${size}" variant="${variant}">${activeKeys[0]}</Kbd>`;
    }
    return `<KbdGroup>
  ${activeKeys
    .map((k) => `<Kbd size="${size}" variant="${variant}">${k}</Kbd>`)
    .join('\n  <KbdSeparator />\n  ')}
</KbdGroup>`;
  }, [activeKeys, size, variant]);

  const aiPrompt = useMemo(() => {
    return `Create an accessible keyboard key badge using White-Label UI Kit:
- Size: ${size} (sm, md, lg)
- Variant: ${variant} (outline, subtle, ghost)
- Semantic HTML: <kbd> element with <KbdGroup> and <KbdSeparator>
- Monospace font stack with zero shadow in dashboard
- 100% CSS logical properties, high contrast dark mode compliant`;
  }, [size, variant]);

  const specGroups: readonly StudioSpecGroup[] = useMemo(() => {
    return [
      {
        title: t('common.studio.kbdSpecConfigTitle'),
        items: [
          { label: t('common.studio.kbdSize'), value: size },
          { label: t('common.studio.kbdVariant'), value: variant },
          { label: t('common.studio.kbdSpecActiveKeys'), value: activeKeys.join(' + ') },
          { label: t('common.studio.specDirection'), value: specimenDir.toUpperCase() },
        ],
      },
      {
        title: t('common.studio.kbdSpecA11yTitle'),
        items: [
          { label: t('common.studio.kbdSpecElement'), value: '<kbd>' },
          { label: t('common.studio.kbdSpecFontStack'), value: 'var(--font-family-mono)' },
          { label: t('common.studio.kbdSpecUserSelect'), value: 'none' },
        ],
      },
    ];
  }, [size, variant, activeKeys, specimenDir, t]);

  const controls = (
    <>
      <StudioSegmentedControl
        label={t('common.studio.specimenDirectionLabel')}
        value={specimenDir}
        options={dirOptions}
        onChange={setSpecimenDir}
      />

      <StudioSegmentedControl
        label={t('common.studio.kbdSize')}
        value={size}
        options={sizeOptions}
        onChange={setSize}
      />

      <StudioSegmentedControl
        label={t('common.studio.kbdVariant')}
        value={variant}
        options={variantOptions}
        onChange={setVariant}
      />

      <StudioSegmentedControl
        label={t('common.studio.kbdPreset')}
        value={preset}
        options={presetOptions}
        onChange={setPreset}
      />
    </>
  );

  return (
    <GalleryStudioLayout
      activeRoute="kbd"
      title={t('common.studio.kbdTitle')}
      subtitle={t('common.studio.kbdSubtitle')}
      testId="gallery-kbd"
      controls={controls}
      onReset={handleReset}
      previewDir={specimenDir}
      linkComponent={linkComponent}
      inspector={
        <GalleryCodeInspector
          aiPrompt={aiPrompt}
          jsxCode={jsxSnippet}
          cssCode={null}
          cssFileName="kbd.module.css"
          jsxFileName="kbd.tsx"
          specGroups={specGroups}
        />
      }
    >
      <div className={styles.specimenCanvas} dir={specimenDir} lang={specimenLangAttr}>
        <div className={styles.specimenBox}>
          {activeKeys.length === 1 ? (
            <Kbd size={size} variant={variant} data-testid="live-kbd">
              {activeKeys[0]}
            </Kbd>
          ) : (
            <KbdGroup data-testid="live-kbd-group">
              {activeKeys.map((key, i) => (
                <Fragment key={`${key}-${i}`}>
                  <Kbd size={size} variant={variant}>
                    {key}
                  </Kbd>
                  {i < activeKeys.length - 1 ? <KbdSeparator /> : null}
                </Fragment>
              ))}
            </KbdGroup>
          )}
        </div>
      </div>
    </GalleryStudioLayout>
  );
}
