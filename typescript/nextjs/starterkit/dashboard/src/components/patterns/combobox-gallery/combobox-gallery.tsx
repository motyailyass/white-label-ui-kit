'use client';

import {
  type ReactNode,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Icon } from '@/components/icons';
import {
  Combobox,
  type ComboboxItems,
  type ComboboxOption,
  type ComboboxOptionGroup,
  type ControlSize,
} from '@/components/ui';
import { cn } from '@/lib/cn';
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
export type ComboboxInteractionState = 'resting' | 'invalid' | 'loading' | 'disabled';
export type ComboboxStageView = 'single' | 'all-sizes';
export type ComboboxTouchTarget = 'auto' | 'comfortable';

export interface ComboboxGalleryProps {
  linkComponent?: StudioLinkComponent;
}

const sampleFlatOptions: ComboboxOption[] = [
  { value: 'us', label: 'United States', description: 'North America · USD' },
  { value: 'ca', label: 'Canada', description: 'North America · CAD' },
  { value: 'gb', label: 'United Kingdom', description: 'Europe · GBP' },
  { value: 'de', label: 'Germany', description: 'Europe · EUR' },
  { value: 'fr', label: 'France', description: 'Europe · EUR' },
  { value: 'jp', label: 'Japan', description: 'Asia · JPY' },
  { value: 'au', label: 'Australia', description: 'Oceania · AUD' },
  { value: 'br', label: 'Brazil', description: 'South America · BRL', disabled: true },
  { value: 'ae', label: 'United Arab Emirates', description: 'Middle East · AED' },
];

const sampleGroupedOptions: ComboboxOptionGroup[] = [
  {
    label: 'North America',
    options: [
      { value: 'us', label: 'United States', description: 'USD' },
      { value: 'ca', label: 'Canada', description: 'CAD' },
    ],
  },
  {
    label: 'Europe',
    options: [
      { value: 'gb', label: 'United Kingdom', description: 'GBP' },
      { value: 'de', label: 'Germany', description: 'EUR' },
      { value: 'fr', label: 'France', description: 'EUR' },
    ],
  },
  {
    label: 'Asia & Middle East',
    options: [
      { value: 'jp', label: 'Japan', description: 'JPY' },
      { value: 'ae', label: 'United Arab Emirates', description: 'AED' },
    ],
  },
];

export function ComboboxGallery({ linkComponent }: ComboboxGalleryProps) {
  const { t, locale, direction } = useI18n();
  const { resolvedTheme } = useTheme();

  // Studio Interactive State
  const [specimenDir, setSpecimenDir] = useState<ComboboxSpecimenDirection>('ltr');
  const [size, setSize] = useState<ControlSize | 'default'>('default');
  const [stageView, setStageView] = useState<ComboboxStageView>('single');
  const [interactionState, setInteractionState] = useState<ComboboxInteractionState>('resting');
  const [touchTarget, setTouchTarget] = useState<ComboboxTouchTarget>('auto');
  const [isGrouped, setIsGrouped] = useState(false);
  const [isClearable, setIsClearable] = useState(true);
  const [hasStartIcon, setHasStartIcon] = useState(true);
  const [selectedValue, setSelectedValue] = useState<string>('us');

  // Live specimen ref for computed specs measurement
  const specimenRef = useRef<HTMLInputElement | null>(null);
  const [measuredSpecs, setMeasuredSpecs] = useState<{
    height: string;
    width: string;
    bg: string;
    border: string;
    radius: string;
  } | null>(null);

  useEffect(() => {
    if (specimenRef.current) {
      const parent = specimenRef.current.parentElement;
      if (parent) {
        const s = window.getComputedStyle(parent);
        const rect = parent.getBoundingClientRect();
        setMeasuredSpecs({
          height: `${Math.round(rect.height)}px`,
          width: `${Math.round(rect.width)}px`,
          bg: s.backgroundColor,
          border: `${s.borderWidth} ${s.borderStyle} ${s.borderColor}`,
          radius: s.borderRadius,
        });
      }
    }
  }, [size, touchTarget, interactionState, hasStartIcon, specimenDir, resolvedTheme]);

  const handleReset = useCallback(() => {
    setSpecimenDir('ltr');
    setSize('default');
    setStageView('single');
    setInteractionState('resting');
    setTouchTarget('auto');
    setIsGrouped(false);
    setIsClearable(true);
    setHasStartIcon(true);
    setSelectedValue('us');
  }, []);

  const resolvedSize: ControlSize | undefined = size === 'default' ? undefined : size;
  const isInvalid = interactionState === 'invalid';
  const isLoading = interactionState === 'loading';
  const isDisabled = interactionState === 'disabled';

  const baseId = useId();
  const activeInputId = `${baseId}-combobox-input`;

  const activePlaceholder =
    specimenDir === 'rtl' ? 'ابحث عن دولة...' : t('common.studio.comboboxSamplePlaceholder');
  const activeLabelText =
    specimenDir === 'rtl' ? 'الدولة المحددة' : t('common.studio.comboboxSampleLabel');

  const currentOptions: ComboboxItems = isGrouped ? sampleGroupedOptions : sampleFlatOptions;

  // Segmented control options
  const dirOptions: readonly StudioSegmentedOption<ComboboxSpecimenDirection>[] = [
    { value: 'ltr', label: t('common.studio.specimenDirLtr'), testId: 'opt-dir-ltr' },
    { value: 'rtl', label: t('common.studio.specimenDirRtl'), testId: 'opt-dir-rtl' },
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

  const viewOptions: readonly StudioSegmentedOption<ComboboxStageView>[] = [
    { value: 'single', label: t('common.studio.viewSingle'), testId: 'opt-view-single' },
    { value: 'all-sizes', label: t('common.studio.viewAllSizes'), testId: 'opt-view-all-sizes' },
  ];

  const stateOptions: readonly StudioSegmentedOption<ComboboxInteractionState>[] = [
    { value: 'resting', label: t('common.studio.stateResting'), testId: 'opt-state-resting' },
    { value: 'invalid', label: t('common.studio.stateInvalid'), testId: 'opt-state-invalid' },
    { value: 'loading', label: t('common.studio.stateLoading'), testId: 'opt-state-loading' },
    { value: 'disabled', label: t('common.studio.stateDisabled'), testId: 'opt-state-disabled' },
  ];

  const touchTargetOptions: readonly StudioSegmentedOption<ComboboxTouchTarget>[] = [
    { value: 'auto', label: t('common.studio.touchAuto'), testId: 'opt-touch-auto' },
    { value: 'comfortable', label: t('common.studio.touchComfortable'), testId: 'opt-touch-comfortable' },
  ];

  // Dynamic JSX Snippet
  const jsxSnippet = useMemo(() => {
    const propsList: string[] = ['options={countryOptions}'];
    if (size !== 'default') propsList.push(`size="${size}"`);
    if (touchTarget !== 'auto') propsList.push(`touchTarget="${touchTarget}"`);
    if (isInvalid) propsList.push('invalid');
    if (isLoading) propsList.push('loading');
    if (isDisabled) propsList.push('disabled');
    if (isClearable) propsList.push('clearable');
    if (hasStartIcon) propsList.push('startIcon={<Icon name="search" />}');
    propsList.push(`value={country}`);
    propsList.push('onValueChange={setCountry}');

    const propsStr = `\n  ${propsList.join('\n  ')}\n`;

    return `import { useState } from 'react';
import { Combobox, type ComboboxOption } from '@/components/ui';
${hasStartIcon ? `import { Icon } from '@/components/icons';\n` : ''}
export function CountrySelect() {
  const [country, setCountry] = useState('us');

  return (
    <Combobox${propsStr}/>
  );
}`;
  }, [size, touchTarget, isInvalid, isLoading, isDisabled, isClearable, hasStartIcon]);

  const cssModuleSnippet = `/* Custom sizing & container integration */
.comboboxContainer {
  inline-size: 100%;
  max-inline-size: 28rem;
}
`;

  // AI Agent Prompt
  const aiAgentPrompt = useMemo(() => {
    return `Implement a white-label filterable Combobox component using the kit's pure Combobox primitive:

\`\`\`tsx
${jsxSnippet}
\`\`\`

Requirements & Tokens:
- Pure UI Boundary: Consume \`@/components/ui/combobox\` directly.
- Sizing: ${size === 'default' ? 'Product default (md = 36px in dashboard, xl = 48px in website)' : `Explicit size="${size}"`}.
- Touch Target Policy: ${touchTarget === 'auto' ? 'Auto (coarse pointer 48×48px expansion)' : 'Comfortable (48×48px enforced)'}.
- State: ${interactionState}.
- Features: Clearable = ${isClearable}, StartIcon = ${hasStartIcon}, Grouped = ${isGrouped}.
- WAI-ARIA: Combobox role with roving activedescendant focus, listbox popup, and escape dismiss.
- Direction: Logical properties only; full RTL/LTR bi-directional support.
`;
  }, [jsxSnippet, size, touchTarget, interactionState, isClearable, hasStartIcon, isGrouped]);

  // Measured Spec Groups
  const specGroups: readonly StudioSpecGroup[] = useMemo(() => {
    return [
      {
        title: t('common.studio.specCategoryVariant'),
        items: [
          { label: 'size', value: size },
          { label: 'touchTarget', value: touchTarget },
          { label: 'state', value: interactionState },
          { label: 'clearable', value: isClearable ? 'true' : 'false' },
          { label: 'grouped', value: isGrouped ? 'true' : 'false' },
        ],
      },
      {
        title: t('common.studio.specCategoryTokens'),
        items: [
          {
            label: '--radius-control',
            value: 'var(--radius-control) (Product Preset: 6px / 8px)',
          },
          { label: 'Z-Index Layer', value: 'var(--z-dropdown) (200)' },
          { label: 'Specimen Direction', value: specimenDir.toUpperCase() },
        ],
      },
      {
        title: t('common.studio.specCategoryMeasured'),
        items: [
          {
            label: t('common.studio.specMinBlockSize'),
            value: measuredSpecs ? measuredSpecs.height : 'Measuring...',
          },
          {
            label: 'Rendered Inline Size (Width)',
            value: measuredSpecs ? measuredSpecs.width : 'Measuring...',
          },
          {
            label: 'Computed Background',
            value: measuredSpecs ? measuredSpecs.bg : 'Measuring...',
          },
          {
            label: 'Computed Border',
            value: measuredSpecs ? measuredSpecs.border : 'Measuring...',
          },
          {
            label: t('common.studio.specRadius'),
            value: measuredSpecs ? measuredSpecs.radius : 'Measuring...',
          },
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
    size,
    touchTarget,
    interactionState,
    isClearable,
    isGrouped,
    specimenDir,
    measuredSpecs,
    t,
    locale,
    direction,
    resolvedTheme,
  ]);

  const allSizesList: readonly ControlSize[] = ['xs', 'sm', 'md', 'lg', 'xl', '2xl'];

  const renderActiveCombobox = (overrideSize?: ControlSize, customRef = false) => {
    return (
      <Combobox
        ref={customRef ? specimenRef : undefined}
        id={activeInputId}
        options={currentOptions}
        value={selectedValue}
        onValueChange={(val) => setSelectedValue(val)}
        size={overrideSize ?? resolvedSize}
        touchTarget={touchTarget}
        invalid={isInvalid}
        loading={isLoading}
        disabled={isDisabled}
        clearable={isClearable}
        startIcon={hasStartIcon ? <Icon name="search" /> : undefined}
        placeholder={activePlaceholder}
        emptyMessage={t('common.studio.comboboxEmpty')}
        clearAriaLabel={t('common.studio.comboboxClearAria')}
        toggleAriaLabel={t('common.studio.comboboxToggleAria')}
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

          <hr className={styles.controlDivider} />

          <StudioSegmentedControl
            label={t('common.studio.btnSizeLabel')}
            value={size}
            options={sizeOptions}
            onChange={setSize}
          />

          <StudioSegmentedControl
            label={t('common.studio.btnStageViewLabel')}
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
            label="Grouped Options"
            checked={isGrouped}
            onCheckedChange={setIsGrouped}
            testId="toggle-combobox-grouped"
          />

          <StudioToggleRow
            label="Clearable Button"
            checked={isClearable}
            onCheckedChange={setIsClearable}
            testId="toggle-combobox-clearable"
          />

          <StudioToggleRow
            label="Leading Search Icon"
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
                  ? 'Please select a valid option from the list.'
                  : 'Type to filter options or use arrow keys.'}
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
      </div>
    </GalleryStudioLayout>
  );
}
