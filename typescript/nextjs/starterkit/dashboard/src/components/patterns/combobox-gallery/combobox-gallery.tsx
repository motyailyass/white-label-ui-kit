'use client';

import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import { Icon } from '@/components/icons';
import {
  Button,
  Combobox,
  type ComboboxItems,
  type ComboboxOption,
  type ComboboxOptionGroup,
  type ControlSize,
} from '@/components/ui';
import { useI18n, useTheme } from '@/providers';
import {
  GalleryCodeInspector,
  GalleryStudioLayout,
  type StudioLinkComponent,
  StudioSegmentedControl,
  type StudioSegmentedOption,
  type StudioSpecGroup,
  StudioToggleRow,
} from '../gallery-studio';
import styles from './combobox-gallery.module.css';

export type ComboboxSpecimenDirection = 'ltr' | 'rtl';
export type ComboboxSelectionMode = 'single' | 'multiple';
export type ComboboxInteractionState = 'resting' | 'invalid' | 'loading' | 'disabled';
export type ComboboxStageView = 'single' | 'all-sizes';
export type ComboboxTouchTarget = 'auto' | 'comfortable';

export interface ComboboxGalleryProps {
  linkComponent?: StudioLinkComponent;
}

interface LocalizedOptionDef {
  value: string;
  labels: Record<'en' | 'fr' | 'ar', string>;
  descriptions: Record<'en' | 'fr' | 'ar', string>;
  disabled?: boolean;
}

interface LocalizedGroupDef {
  labels: Record<'en' | 'fr' | 'ar', string>;
  options: LocalizedOptionDef[];
}

const RAW_OPTIONS: readonly LocalizedOptionDef[] = [
  {
    value: 'us',
    labels: { en: 'United States', fr: 'États-Unis', ar: 'الولايات المتحدة' },
    descriptions: {
      en: 'North America · USD',
      fr: 'Amérique du Nord · USD',
      ar: 'أمريكا الشمالية · دولار',
    },
  },
  {
    value: 'ca',
    labels: { en: 'Canada', fr: 'Canada', ar: 'كندا' },
    descriptions: {
      en: 'North America · CAD',
      fr: 'Amérique du Nord · CAD',
      ar: 'أمريكا الشمالية · دولار كندي',
    },
  },
  {
    value: 'gb',
    labels: { en: 'United Kingdom', fr: 'Royaume-Uni', ar: 'المملكة المتحدة' },
    descriptions: { en: 'Europe · GBP', fr: 'Europe · GBP', ar: 'أوروبا · جنيه إسترليني' },
  },
  {
    value: 'de',
    labels: { en: 'Germany', fr: 'Allemagne', ar: 'ألمانيا' },
    descriptions: { en: 'Europe · EUR', fr: 'Europe · EUR', ar: 'أوروبا · يورو' },
  },
  {
    value: 'fr',
    labels: { en: 'France', fr: 'France', ar: 'فرنسا' },
    descriptions: { en: 'Europe · EUR', fr: 'Europe · EUR', ar: 'أوروبا · يورو' },
  },
  {
    value: 'jp',
    labels: { en: 'Japan', fr: 'Japon', ar: 'اليابان' },
    descriptions: { en: 'Asia · JPY', fr: 'Asie · JPY', ar: 'آسيا · ين ياباني' },
  },
  {
    value: 'au',
    labels: { en: 'Australia', fr: 'Australie', ar: 'أستراليا' },
    descriptions: { en: 'Oceania · AUD', fr: 'Océanie · AUD', ar: 'أوقيانوسيا · دولار أسترالي' },
  },
  {
    value: 'br',
    labels: { en: 'Brazil', fr: 'Brésil', ar: 'البرازيل' },
    descriptions: {
      en: 'South America · BRL',
      fr: 'Amérique du Sud · BRL',
      ar: 'أمريكا الجنوبية · ريال',
    },
    disabled: true,
  },
  {
    value: 'ae',
    labels: {
      en: 'United Arab Emirates',
      fr: 'Émirats arabes unis',
      ar: 'الإمارات العربية المتحدة',
    },
    descriptions: { en: 'Middle East · AED', fr: 'Moyen-Orient · AED', ar: 'الشرق الأوسط · درهم' },
  },
];

const RAW_GROUPS: readonly LocalizedGroupDef[] = [
  {
    labels: { en: 'North America', fr: 'Amérique du Nord', ar: 'أمريكا الشمالية' },
    options: [RAW_OPTIONS[0], RAW_OPTIONS[1]],
  },
  {
    labels: { en: 'Europe', fr: 'Europe', ar: 'أوروبا' },
    options: [RAW_OPTIONS[2], RAW_OPTIONS[3], RAW_OPTIONS[4]],
  },
  {
    labels: { en: 'Asia & Middle East', fr: 'Asie et Moyen-Orient', ar: 'آسيا والشرق الأوسط' },
    options: [RAW_OPTIONS[5], RAW_OPTIONS[8]],
  },
];

export function ComboboxGallery({ linkComponent }: ComboboxGalleryProps) {
  const { t, locale, direction } = useI18n();
  const { resolvedTheme } = useTheme();

  const activeLang = useMemo(() => {
    return (locale === 'fr' || locale === 'ar' ? locale : 'en') as 'en' | 'fr' | 'ar';
  }, [locale]);

  // Studio Interactive State
  const [specimenDir, setSpecimenDir] = useState<ComboboxSpecimenDirection>('ltr');
  const [selectionMode, setSelectionMode] = useState<ComboboxSelectionMode>('single');
  const [size, setSize] = useState<ControlSize | 'default'>('default');
  const [stageView, setStageView] = useState<ComboboxStageView>('single');
  const [interactionState, setInteractionState] = useState<ComboboxInteractionState>('resting');
  const [touchTarget, setTouchTarget] = useState<ComboboxTouchTarget>('auto');
  const [isGrouped, setIsGrouped] = useState(false);
  const [isClearable, setIsClearable] = useState(true);
  const [hasStartIcon, setHasStartIcon] = useState(true);
  const [singleValue, setSingleValue] = useState<string>('us');
  const [multiValues, setMultiValues] = useState<string[]>(['us', 'ca']);

  // Live specimen ref for computed specs measurement
  const specimenRef = useRef<HTMLInputElement | null>(null);
  const [measuredSpecs, setMeasuredSpecs] = useState<{
    height: string;
    width: string;
    bg: string;
    border: string;
    radius: string;
  } | null>(null);

  const resolveText = useCallback(
    (map: Record<'en' | 'fr' | 'ar', string>) => {
      if (specimenDir === 'rtl') return map.ar;
      return map[activeLang] ?? map.en;
    },
    [activeLang, specimenDir],
  );

  const localizedFlatOptions: ComboboxOption[] = useMemo(() => {
    return RAW_OPTIONS.map((opt) => ({
      value: opt.value,
      label: resolveText(opt.labels),
      description: resolveText(opt.descriptions),
      disabled: opt.disabled,
    }));
  }, [resolveText]);

  const localizedGroupedOptions: ComboboxOptionGroup[] = useMemo(() => {
    return RAW_GROUPS.map((grp) => ({
      label: resolveText(grp.labels),
      options: grp.options.map((opt) => ({
        value: opt.value,
        label: resolveText(opt.labels),
        description: resolveText(opt.descriptions),
        disabled: opt.disabled,
      })),
    }));
  }, [resolveText]);

  const currentOptions: ComboboxItems = isGrouped ? localizedGroupedOptions : localizedFlatOptions;

  const handleReset = useCallback(() => {
    setSpecimenDir('ltr');
    setSelectionMode('single');
    setSize('default');
    setStageView('single');
    setInteractionState('resting');
    setTouchTarget('auto');
    setIsGrouped(false);
    setIsClearable(true);
    setHasStartIcon(true);
    setSingleValue('us');
    setMultiValues(['us', 'ca']);
  }, []);

  const resolvedSize: ControlSize | undefined = size === 'default' ? undefined : size;
  const isInvalid = interactionState === 'invalid';
  const isLoading = interactionState === 'loading';
  const isDisabled = interactionState === 'disabled';

  const baseId = useId();
  const activeInputId = `${baseId}-combobox`;

  const activePlaceholder =
    specimenDir === 'rtl' ? 'ابحث عن دولة...' : t('common.studio.comboboxSamplePlaceholder');
  const activeLabelText =
    specimenDir === 'rtl' ? 'الدولة المحددة' : t('common.studio.comboboxSampleLabel');

  useEffect(() => {
    if (specimenRef.current) {
      const container = specimenRef.current.closest('div[class*="inputContainer"]');
      if (container) {
        const s = window.getComputedStyle(container);
        const rect = container.getBoundingClientRect();
        setMeasuredSpecs({
          height: `${Math.round(rect.height)}px`,
          width: `${Math.round(rect.width)}px`,
          bg: s.backgroundColor,
          border: `${s.borderWidth} ${s.borderStyle} ${s.borderColor}`,
          radius: s.borderRadius,
        });
      }
    }
  }, [
    selectionMode,
    size,
    touchTarget,
    interactionState,
    specimenDir,
    resolvedTheme,
    singleValue,
    multiValues,
    isGrouped,
  ]);

  // Dynamic Standalone Code Snippet
  const jsxSnippet = useMemo(() => {
    const propsList: string[] = [];
    if (selectionMode === 'multiple') propsList.push('multiple');
    if (size !== 'default') propsList.push(`size="${size}"`);
    if (touchTarget !== 'auto') propsList.push(`touchTarget="${touchTarget}"`);
    if (isInvalid) propsList.push('invalid');
    if (isLoading) propsList.push('loading');
    if (isDisabled) propsList.push('disabled');
    if (isClearable) propsList.push('clearable');
    if (hasStartIcon) propsList.push('startIcon={<Icon name="search" />}');
    propsList.push(`placeholder="${activePlaceholder}"`);
    propsList.push('clearAriaLabel="Clear selection"');
    propsList.push('toggleAriaLabel="Toggle options"');

    const valueStr =
      selectionMode === 'multiple'
        ? `value={${JSON.stringify(multiValues)}}`
        : `value="${singleValue}"`;

    const propsStr = propsList.length > 0 ? `\n  ${propsList.join('\n  ')}` : '';

    return `import { Combobox } from '@/components/ui';${hasStartIcon ? "\nimport { Icon } from '@/components/icons';" : ''}

<Combobox
  options={${isGrouped ? 'groupedOptions' : 'countryOptions'}}
  ${valueStr}${propsStr}
  onValueChange={(val) => setValue(val)}
/>`;
  }, [
    selectionMode,
    size,
    touchTarget,
    isInvalid,
    isLoading,
    isDisabled,
    isClearable,
    hasStartIcon,
    activePlaceholder,
    singleValue,
    multiValues,
    isGrouped,
  ]);

  const cssModuleSnippet = `.wrapper {\n  inline-size: 100%;\n  max-inline-size: 28rem;\n}`;

  const aiAgentPrompt = useMemo(() => {
    return `You are implementing an accessible Combobox widget using the project's white-label UI Kit. Follow these exact rules:

1. Import pure primitive:
   import { Combobox } from '@/components/ui';

2. Usage:
   ${jsxSnippet}

3. Architectural Invariants:
   - Zero physical CSS properties (inline-size, block-size, padding-inline, padding-block).
   - 100% shadow-free in dashboard routes.
   - 2px balanced focus contract (zero floating gap).
   - WAI-ARIA 1.2 compliant (role="combobox", role="listbox", aria-activedescendant).
   - Size: ${size === 'default' ? 'Product default (md = 36px in dashboard, xl = 48px in website)' : `Explicit size="${size}"`}.`;
  }, [jsxSnippet, size]);

  const specGroups: readonly StudioSpecGroup[] = useMemo(() => {
    return [
      {
        title: t('common.studio.specCategoryVariant'),
        items: [
          { label: 'mode', value: selectionMode },
          { label: 'size', value: size },
          { label: 'touchTarget', value: touchTarget },
          { label: 'grouped', value: isGrouped ? 'true' : 'false' },
          { label: 'clearable', value: isClearable ? 'true' : 'false' },
          { label: 'state', value: interactionState },
        ],
      },
      {
        title: t('common.studio.specCategoryMeasured'),
        items: [
          { label: 'Trigger Height', value: measuredSpecs?.height ?? '—' },
          { label: 'Trigger Width', value: measuredSpecs?.width ?? '—' },
          { label: 'Background Color', value: measuredSpecs?.bg ?? '—' },
          { label: 'Border', value: measuredSpecs?.border ?? '—' },
          { label: 'Border Radius', value: measuredSpecs?.radius ?? '—' },
        ],
      },
      {
        title: t('common.studio.specCategoryTokens'),
        items: [
          { label: '--radius-control', value: 'var(--radius-control) (6px / 8px)' },
          { label: '--z-dropdown', value: 'var(--z-dropdown) (200)' },
          { label: 'Specimen Direction', value: specimenDir.toUpperCase() },
        ],
      },
      {
        title: t('common.studio.specCategoryEnv'),
        items: [
          { label: t('common.studio.specLocale'), value: locale },
          { label: t('common.studio.specDirection'), value: direction.toUpperCase() },
          { label: t('common.studio.specTheme'), value: resolvedTheme },
        ],
      },
    ];
  }, [
    selectionMode,
    size,
    touchTarget,
    isGrouped,
    isClearable,
    interactionState,
    measuredSpecs,
    specimenDir,
    locale,
    direction,
    resolvedTheme,
    t,
  ]);

  // Sidebar Controls Options
  const dirOptions: readonly StudioSegmentedOption<ComboboxSpecimenDirection>[] = [
    { value: 'ltr', label: t('common.studio.specimenDirLtr'), testId: 'opt-dir-ltr' },
    { value: 'rtl', label: t('common.studio.specimenDirRtl'), testId: 'opt-dir-rtl' },
  ];

  const modeOptions: readonly StudioSegmentedOption<ComboboxSelectionMode>[] = [
    { value: 'single', label: t('common.studio.comboboxModeSingle'), testId: 'opt-mode-single' },
    { value: 'multiple', label: t('common.studio.comboboxModeMulti'), testId: 'opt-mode-multi' },
  ];

  const sizeOptions: readonly StudioSegmentedOption<ControlSize | 'default'>[] = [
    { value: 'default', label: 'Def', testId: 'opt-size-default' },
    { value: 'xs', label: 'XS', testId: 'opt-size-xs' },
    { value: 'sm', label: 'SM', testId: 'opt-size-sm' },
    { value: 'md', label: 'MD', testId: 'opt-size-md' },
    { value: 'lg', label: 'LG', testId: 'opt-size-lg' },
    { value: 'xl', label: 'XL', testId: 'opt-size-xl' },
    { value: '2xl', label: '2XL', testId: 'opt-size-2xl' },
  ];

  const stateOptions: readonly StudioSegmentedOption<ComboboxInteractionState>[] = [
    { value: 'resting', label: t('common.studio.optStateResting'), testId: 'opt-state-resting' },
    { value: 'invalid', label: t('common.studio.optStateInvalid'), testId: 'opt-state-invalid' },
    { value: 'loading', label: t('common.studio.stateLoading'), testId: 'opt-state-loading' },
    { value: 'disabled', label: t('common.studio.optStateDisabled'), testId: 'opt-state-disabled' },
  ];

  const viewOptions: readonly StudioSegmentedOption<ComboboxStageView>[] = [
    { value: 'single', label: t('common.studio.viewSingle'), testId: 'opt-view-single' },
    { value: 'all-sizes', label: t('common.studio.viewAllSizes'), testId: 'opt-view-all-sizes' },
  ];

  const touchTargetOptions: readonly StudioSegmentedOption<ComboboxTouchTarget>[] = [
    { value: 'auto', label: t('common.studio.touchAuto'), testId: 'opt-touch-auto' },
    {
      value: 'comfortable',
      label: t('common.studio.touchComfortable'),
      testId: 'opt-touch-comfortable',
    },
  ];

  const allSizesList: readonly ControlSize[] = ['xs', 'sm', 'md', 'lg', 'xl', '2xl'];

  const renderActiveCombobox = (overrideSize?: ControlSize, isMain = false) => {
    const commonProps = {
      options: currentOptions,
      size: overrideSize ?? resolvedSize,
      touchTarget,
      invalid: isInvalid,
      loading: isLoading,
      disabled: isDisabled,
      clearable: isClearable,
      startIcon: hasStartIcon ? <Icon name="search" /> : undefined,
      placeholder: activePlaceholder,
      emptyMessage: t('common.studio.comboboxEmpty'),
      loadingMessage: t('common.studio.comboboxLoading'),
      clearAriaLabel: t('common.studio.comboboxClearAria'),
      toggleAriaLabel: t('common.studio.comboboxToggleAria'),
      removeChipAriaLabel: (label: string) =>
        `${t('common.studio.comboboxRemoveChipAria')} ${label}`,
    };

    if (selectionMode === 'multiple') {
      return (
        <Combobox
          {...commonProps}
          multiple
          ref={isMain ? specimenRef : undefined}
          id={isMain ? activeInputId : undefined}
          value={multiValues}
          onValueChange={(vals) => setMultiValues(vals)}
          data-testid={isMain ? 'studio-active-combobox' : `studio-size-combobox-${overrideSize}`}
        />
      );
    }

    return (
      <Combobox
        {...commonProps}
        multiple={false}
        ref={isMain ? specimenRef : undefined}
        id={isMain ? activeInputId : undefined}
        value={singleValue}
        onValueChange={(val) => setSingleValue(val)}
        data-testid={isMain ? 'studio-active-combobox' : `studio-size-combobox-${overrideSize}`}
      />
    );
  };

  return (
    <GalleryStudioLayout
      activeRoute="combobox"
      title={t('common.studio.comboboxTitle')}
      subtitle={t('common.studio.comboboxSubtitle')}
      testId="combobox-gallery"
      previewDir={specimenDir}
      onReset={handleReset}
      linkComponent={linkComponent}
      controls={
        <>
          <StudioSegmentedControl
            label={t('common.studio.specimenDirectionLabel')}
            value={specimenDir}
            options={dirOptions}
            onChange={setSpecimenDir}
          />

          <StudioSegmentedControl
            label={t('common.studio.comboboxSelectionModeLabel')}
            value={selectionMode}
            options={modeOptions}
            onChange={setSelectionMode}
          />

          <hr className={styles.controlDivider} />

          <StudioSegmentedControl
            label={t('common.studio.btnSizeLabel')}
            value={size}
            options={sizeOptions}
            onChange={setSize}
          />

          <StudioSegmentedControl
            label={t('common.studio.btnCanvasViewLabel')}
            value={stageView}
            options={viewOptions}
            onChange={setStageView}
          />

          <hr className={styles.controlDivider} />

          <StudioSegmentedControl
            label={t('common.studio.btnStateLabel')}
            value={interactionState}
            options={stateOptions}
            onChange={setInteractionState}
          />

          <StudioSegmentedControl
            label={t('common.studio.btnTouchTargetLabel')}
            value={touchTarget}
            options={touchTargetOptions}
            onChange={setTouchTarget}
          />

          <hr className={styles.controlDivider} />

          <StudioToggleRow
            label={t('common.studio.comboboxGroupedLabel')}
            checked={isGrouped}
            onCheckedChange={setIsGrouped}
            testId="toggle-combobox-grouped"
          />

          <StudioToggleRow
            label={t('common.studio.comboboxClearableLabel')}
            checked={isClearable}
            onCheckedChange={setIsClearable}
            testId="toggle-combobox-clearable"
          />

          <StudioToggleRow
            label={t('common.studio.comboboxStartIconLabel')}
            checked={hasStartIcon}
            onCheckedChange={setHasStartIcon}
            testId="toggle-combobox-start-icon"
          />
        </>
      }
      inspector={
        <GalleryCodeInspector
          aiPrompt={aiAgentPrompt}
          jsxCode={jsxSnippet}
          cssCode={cssModuleSnippet}
          jsxFileName="country-select.tsx"
          cssFileName="country-select.module.css"
          specGroups={specGroups}
        />
      }
    >
      <div className={styles.stageActionArea}>
        {stageView === 'single' ? (
          <div className={styles.singleSpecimenRow}>
            <div className={styles.fieldGroup}>
              <label htmlFor={activeInputId} className={styles.fieldLabel}>
                {activeLabelText}
              </label>
              {renderActiveCombobox(undefined, true)}
              <span className={isInvalid ? styles.fieldError : styles.fieldHelper}>
                {isInvalid
                  ? t('common.studio.comboboxSampleError')
                  : selectionMode === 'multiple'
                    ? t('common.studio.comboboxSampleMultiHelper')
                    : t('common.studio.comboboxSampleHelper')}
              </span>
            </div>
          </div>
        ) : (
          <div className={styles.allSizesGrid}>
            {allSizesList.map((sz) => (
              <div key={sz} className={styles.sizeCard}>
                <span className={styles.sizeCardLabel}>size=&quot;{sz}&quot;</span>
                {renderActiveCombobox(sz)}
              </div>
            ))}
          </div>
        )}

        {/* Clean, centered Quick Configuration Presets */}
        <div className={styles.variantsCenterSection}>
          <span className={styles.variantsCenterLabel}>
            {t('common.studio.comboboxQuickPresetsTitle')}
          </span>
          <div className={styles.variantsCenterRow}>
            {[
              {
                id: 'single',
                labelKey: 'common.studio.comboboxPresetSingle' as const,
                apply: () => {
                  setSelectionMode('single');
                  setInteractionState('resting');
                  setIsGrouped(false);
                  setSingleValue('us');
                },
                isActive:
                  selectionMode === 'single' && !isGrouped && interactionState === 'resting',
              },
              {
                id: 'multi',
                labelKey: 'common.studio.comboboxPresetMulti' as const,
                apply: () => {
                  setSelectionMode('multiple');
                  setInteractionState('resting');
                  setIsGrouped(false);
                  setMultiValues(['us', 'ca']);
                },
                isActive: selectionMode === 'multiple' && interactionState === 'resting',
              },
              {
                id: 'grouped',
                labelKey: 'common.studio.comboboxPresetGrouped' as const,
                apply: () => {
                  setSelectionMode('single');
                  setIsGrouped(true);
                  setInteractionState('resting');
                  setSingleValue('us');
                },
                isActive: isGrouped && interactionState === 'resting',
              },
              {
                id: 'loading',
                labelKey: 'common.studio.comboboxPresetLoading' as const,
                apply: () => {
                  setInteractionState('loading');
                },
                isActive: interactionState === 'loading',
              },
              {
                id: 'invalid',
                labelKey: 'common.studio.comboboxPresetInvalid' as const,
                apply: () => {
                  setInteractionState('invalid');
                },
                isActive: interactionState === 'invalid',
              },
              {
                id: 'disabled',
                labelKey: 'common.studio.comboboxPresetDisabled' as const,
                apply: () => {
                  setInteractionState('disabled');
                },
                isActive: interactionState === 'disabled',
              },
            ].map((preset) => (
              <Button
                key={preset.id}
                variant={preset.isActive ? 'primary' : 'secondary'}
                size="sm"
                data-testid={`preset-quick-select-${preset.id}`}
                onClick={preset.apply}
              >
                {t(preset.labelKey)}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </GalleryStudioLayout>
  );
}
