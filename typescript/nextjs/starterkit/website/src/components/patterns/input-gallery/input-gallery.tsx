'use client';

import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import { Button, type ControlSize, Input, type InputType } from '@/components/ui';
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
import styles from './input-gallery.module.css';

export type InputSpecimenDirection = 'ltr' | 'rtl';
export type InputInteractionState = 'resting' | 'invalid' | 'disabled' | 'readonly';
export type InputStageView = 'single' | 'all-sizes';
export type InputTouchTarget = 'auto' | 'comfortable';

export interface InputGalleryProps {
  linkComponent?: StudioLinkComponent;
}

interface InputPresetDef {
  id: string;
  labelKey:
    | 'common.studio.compInput'
    | 'common.inputGallery.emailLabel'
    | 'common.inputGallery.passwordLabel'
    | 'common.inputGallery.searchLabel'
    | 'common.studio.optStateInvalid'
    | 'common.studio.optStateDisabled'
    | 'common.studio.optStateReadonly';
  type: InputType;
  state: InputInteractionState;
  sampleValue: string;
  labels: Record<'en' | 'fr' | 'ar', string>;
  placeholders: Record<'en' | 'fr' | 'ar', string>;
  helpers?: Record<'en' | 'fr' | 'ar', string>;
  errors?: Record<'en' | 'fr' | 'ar', string>;
  showHelper: boolean;
  showError: boolean;
}

const INPUT_PRESETS: readonly InputPresetDef[] = [
  {
    id: 'text',
    labelKey: 'common.studio.compInput',
    type: 'text',
    state: 'resting',
    sampleValue: 'Alex Doe',
    labels: { en: 'Full Name', fr: 'Nom complet', ar: 'الاسم الكامل' },
    placeholders: { en: 'e.g. Alex Doe', fr: 'ex. Alex Dupont', ar: 'مثال: أحمد محمد' },
    showHelper: false,
    showError: false,
  },
  {
    id: 'email',
    labelKey: 'common.inputGallery.emailLabel',
    type: 'email',
    state: 'resting',
    sampleValue: 'alex.doe@example.com',
    labels: { en: 'Email Address', fr: 'Adresse e-mail', ar: 'البريد الإلكتروني' },
    placeholders: {
      en: 'alex.doe@example.com',
      fr: 'alex.dupont@example.com',
      ar: 'alex@example.com',
    },
    helpers: {
      en: 'We will send verification updates to this address.',
      fr: 'Nous vous enverrons les mises à jour à cette adresse.',
      ar: 'سنرسل تحديثات التحقق إلى هذا العنوان.',
    },
    showHelper: true,
    showError: false,
  },
  {
    id: 'password',
    labelKey: 'common.inputGallery.passwordLabel',
    type: 'password',
    state: 'resting',
    sampleValue: 'Sup3rS3cret!',
    labels: { en: 'Account Password', fr: 'Mot de passe du compte', ar: 'كلمة مرور الحساب' },
    placeholders: {
      en: 'Enter password...',
      fr: 'Entrez le mot de passe...',
      ar: 'أدخل كلمة المرور...',
    },
    helpers: {
      en: 'Must be at least 8 characters with numbers and symbols.',
      fr: 'Au moins 8 caractères avec chiffres et symboles.',
      ar: 'يجب أن تتكون من 8 أحرف على الأقل وتحتوي على أرقام ورموز.',
    },
    showHelper: true,
    showError: false,
  },
  {
    id: 'search',
    labelKey: 'common.inputGallery.searchLabel',
    type: 'search',
    state: 'resting',
    sampleValue: 'design tokens scale',
    labels: {
      en: 'Search Documentation',
      fr: 'Rechercher dans la documentation',
      ar: 'البحث في التوثيق',
    },
    placeholders: {
      en: 'Search components or docs...',
      fr: 'Rechercher composants ou docs...',
      ar: 'ابحث عن المكونات أو الرموز...',
    },
    showHelper: false,
    showError: false,
  },
  {
    id: 'invalid',
    labelKey: 'common.studio.optStateInvalid',
    type: 'text',
    state: 'invalid',
    sampleValue: 'al',
    labels: { en: 'Username', fr: 'Nom d’utilisateur', ar: 'اسم المستخدم' },
    placeholders: {
      en: 'Choose a username...',
      fr: 'Choisir un nom d’utilisateur...',
      ar: 'اختر اسم مستخدم...',
    },
    errors: {
      en: 'Username must contain at least 3 characters.',
      fr: 'Le nom d’utilisateur doit comporter au moins 3 caractères.',
      ar: 'يجب أن يحتوي اسم المستخدم على 3 أحرف على الأقل.',
    },
    showHelper: false,
    showError: true,
  },
  {
    id: 'disabled',
    labelKey: 'common.studio.optStateDisabled',
    type: 'text',
    state: 'disabled',
    sampleValue: 'acme-corp.starterkit.dev',
    labels: {
      en: 'Workspace Domain (Disabled)',
      fr: 'Domaine de l’espace (Désactivé)',
      ar: 'نطاق مساحة العمل (معطل)',
    },
    placeholders: { en: 'Domain', fr: 'Domaine', ar: 'النطاق' },
    showHelper: false,
    showError: false,
  },
  {
    id: 'readonly',
    labelKey: 'common.studio.optStateReadonly',
    type: 'text',
    state: 'readonly',
    sampleValue: 'WK7X-992B-44PQ-2026',
    labels: {
      en: 'License Key (Read-Only)',
      fr: 'Clé de licence (Lecture seule)',
      ar: 'مفتاح الترخيص (للقراءة فقط)',
    },
    placeholders: { en: 'License Key', fr: 'Clé de licence', ar: 'مفتاح الترخيص' },
    showHelper: false,
    showError: false,
  },
];

export function InputGallery({ linkComponent }: InputGalleryProps) {
  const { t, locale, direction } = useI18n();
  const { resolvedTheme } = useTheme();

  const activeLang = useMemo(() => {
    return (locale === 'fr' || locale === 'ar' ? locale : 'en') as 'en' | 'fr' | 'ar';
  }, [locale]);

  // Studio Interactive State
  const [specimenDir, setSpecimenDir] = useState<InputSpecimenDirection>('ltr');
  const [inputType, setInputType] = useState<InputType>('text');
  const [size, setSize] = useState<ControlSize | 'default'>('default');
  const [stageView, setStageView] = useState<InputStageView>('single');
  const [interactionState, setInteractionState] = useState<InputInteractionState>('resting');
  const [touchTarget, setTouchTarget] = useState<InputTouchTarget>('auto');
  const [fullWidth, setFullWidth] = useState(false);
  const [showLabel, setShowLabel] = useState(true);
  const [showHelper, setShowHelper] = useState(false);
  const [showError, setShowError] = useState(false);

  // Content state for active specimen
  const [activeLabel, setActiveLabel] = useState('Full Name');
  const [activePlaceholder, setActivePlaceholder] = useState('e.g. Alex Doe');
  const [inputValue, setInputValue] = useState('Alex Doe');
  const [activeHelper, setActiveHelper] = useState('');
  const [activeError, setActiveError] = useState('');

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
    (map?: Record<'en' | 'fr' | 'ar', string>, currentDir = specimenDir) => {
      if (!map) return '';
      if (currentDir === 'rtl') return map.ar;
      return map[activeLang] ?? map.en;
    },
    [activeLang, specimenDir],
  );

  const applyPreset = useCallback(
    (preset: InputPresetDef, currentDir: InputSpecimenDirection = specimenDir) => {
      setInputType(preset.type);
      setInteractionState(preset.state);
      setInputValue(preset.sampleValue);
      setActiveLabel(resolveText(preset.labels, currentDir));
      setActivePlaceholder(resolveText(preset.placeholders, currentDir));
      setActiveHelper(resolveText(preset.helpers, currentDir));
      setActiveError(resolveText(preset.errors, currentDir));
      setShowLabel(true);
      setShowHelper(preset.showHelper);
      setShowError(preset.showError);
    },
    [resolveText, specimenDir],
  );

  const handleReset = useCallback(() => {
    setSpecimenDir('ltr');
    setSize('default');
    setStageView('single');
    setTouchTarget('auto');
    setFullWidth(false);
    applyPreset(INPUT_PRESETS[0], 'ltr');
  }, [applyPreset]);

  // When user switches direction, adapt active labels if standard
  const handleDirectionChange = useCallback(
    (nextDir: InputSpecimenDirection) => {
      setSpecimenDir(nextDir);
      const activePreset = INPUT_PRESETS.find(
        (p) => p.type === inputType && p.state === interactionState,
      );
      if (activePreset) {
        setActiveLabel(resolveText(activePreset.labels, nextDir));
        setActivePlaceholder(resolveText(activePreset.placeholders, nextDir));
        setActiveHelper(resolveText(activePreset.helpers, nextDir));
        setActiveError(resolveText(activePreset.errors, nextDir));
      }
    },
    [inputType, interactionState, resolveText],
  );

  // When user changes input type in the sidebar
  const handleTypeChange = useCallback(
    (nextType: InputType) => {
      setInputType(nextType);
      const matchingPreset = INPUT_PRESETS.find((p) => p.type === nextType);
      if (matchingPreset) {
        setInputValue(matchingPreset.sampleValue);
        setActiveLabel(resolveText(matchingPreset.labels));
        setActivePlaceholder(resolveText(matchingPreset.placeholders));
        if (matchingPreset.helpers) {
          setActiveHelper(resolveText(matchingPreset.helpers));
          setShowHelper(matchingPreset.showHelper);
        }
      } else if (nextType === 'tel') {
        setInputValue('+1 (555) 019-2834');
        setActiveLabel(
          resolveText({ en: 'Phone Number', fr: 'Numéro de téléphone', ar: 'رقم الهاتف' }),
        );
        setActivePlaceholder('+1 (555) 019-2834');
      } else if (nextType === 'url') {
        setInputValue('https://starterkit.dev');
        setActiveLabel(
          resolveText({ en: 'Website URL', fr: 'URL du site web', ar: 'رابط الموقع' }),
        );
        setActivePlaceholder('https://example.com');
      }
    },
    [resolveText],
  );

  // When user changes operational state in the sidebar
  const handleStateChange = useCallback(
    (nextState: InputInteractionState) => {
      setInteractionState(nextState);
      if (nextState === 'invalid') {
        setShowError(true);
        setActiveError(t('common.studio.inputSampleError'));
      } else {
        setShowError(false);
      }
    },
    [t],
  );

  const resolvedSize: ControlSize | undefined = size === 'default' ? undefined : size;
  const isInvalid = interactionState === 'invalid' || showError;
  const isDisabled = interactionState === 'disabled';
  const isReadOnly = interactionState === 'readonly';

  const baseId = useId();
  const activeInputId = `${baseId}-stage-input`;
  const activeHelpId = `${baseId}-stage-help`;
  const activeErrorId = `${baseId}-stage-error`;

  useEffect(() => {
    if (specimenRef.current) {
      const s = window.getComputedStyle(specimenRef.current);
      const rect = specimenRef.current.getBoundingClientRect();
      setMeasuredSpecs({
        height: `${Math.round(rect.height)}px`,
        width: `${Math.round(rect.width)}px`,
        bg: s.backgroundColor,
        border: `${s.borderWidth} ${s.borderStyle} ${s.borderColor}`,
        radius: s.borderRadius,
      });
    }
  }, [
    inputType,
    size,
    touchTarget,
    interactionState,
    fullWidth,
    specimenDir,
    resolvedTheme,
    inputValue,
  ]);

  // Descriptions for aria-describedby
  const describedBy = useMemo(() => {
    const ids: string[] = [];
    if (showHelper && activeHelper) ids.push(activeHelpId);
    if (isInvalid && activeError) ids.push(activeErrorId);
    return ids.length > 0 ? ids.join(' ') : undefined;
  }, [showHelper, activeHelper, isInvalid, activeError, activeHelpId, activeErrorId]);

  // Dynamic JSX Snippet
  const jsxSnippet = useMemo(() => {
    const propsList: string[] = [];
    if (inputType !== 'text') propsList.push(`type="${inputType}"`);
    if (size !== 'default') propsList.push(`size="${size}"`);
    if (touchTarget !== 'auto') propsList.push(`touchTarget="${touchTarget}"`);
    if (isDisabled) propsList.push('disabled');
    if (isReadOnly) propsList.push('readOnly');
    if (isInvalid) propsList.push('aria-invalid="true"');
    if (describedBy) propsList.push(`aria-describedby="${describedBy}"`);
    if (activePlaceholder) propsList.push(`placeholder="${activePlaceholder}"`);
    if (inputValue) propsList.push(`defaultValue="${inputValue}"`);

    const propsStr = propsList.length > 0 ? ` ${propsList.join(' ')}` : '';
    const labelJsx = showLabel ? `<label htmlFor="${activeInputId}">${activeLabel}</label>\n` : '';
    const helperJsx =
      showHelper && activeHelper ? `\n<p id="${activeHelpId}">${activeHelper}</p>` : '';
    const errorJsx =
      isInvalid && activeError ? `\n<p id="${activeErrorId}">${activeError}</p>` : '';

    if (fullWidth) {
      return `/* To expand to full width of parent container: */\n${labelJsx}<Input id="${activeInputId}"${propsStr} className={styles.fullWidth} />${helperJsx}${errorJsx}`;
    }

    return `${labelJsx}<Input id="${activeInputId}"${propsStr} />${helperJsx}${errorJsx}`;
  }, [
    inputType,
    size,
    touchTarget,
    isDisabled,
    isReadOnly,
    isInvalid,
    describedBy,
    activePlaceholder,
    inputValue,
    showLabel,
    activeInputId,
    activeLabel,
    showHelper,
    activeHelper,
    activeHelpId,
    activeError,
    activeErrorId,
    fullWidth,
  ]);

  const cssModuleSnippet = useMemo(() => {
    if (!fullWidth) return null;
    return `.fullWidth {\n  inline-size: 100%;\n}`;
  }, [fullWidth]);

  // AI Prompt Export
  const aiAgentPrompt = useMemo(() => {
    return `You are implementing an Input component using the project's white-label UI Kit. Follow these exact instructions:

1. Import pure primitive from its root barrel:
   import { Input } from '@/components/ui';

2. Render the Input component with the following configuration:
   ${jsxSnippet}

3. Styling & Architectural Rules:
   - Zero physical CSS properties (no width, height, margin-left, padding-right).
   - Use CSS Logical Properties only (inline-size, block-size, padding-inline, padding-block).
   - 100% shadow-free in dashboard routes.
   - Sizing: ${size === 'default' ? 'Product default (md = 36px in dashboard, xl = 48px in website)' : `Explicit size="${size}"`}.
   - Corner Radius: Consumes system token var(--radius-control) (6px in dashboard, 8px in website).
   - Type: type="${inputType}".
   - RTL Support: Direction mirrors automatically via logical properties; text align starts on inline-start.
   - Labeling: Always associate an external <label htmlFor="..."> with the input id for accessibility.
${cssModuleSnippet ? `\n4. CSS Module overrides:\n${cssModuleSnippet}` : ''}`;
  }, [jsxSnippet, size, inputType, cssModuleSnippet]);

  // Computed Specifications
  const specGroups: readonly StudioSpecGroup[] = useMemo(() => {
    return [
      {
        title: t('common.studio.specCategoryVariant'),
        items: [
          { label: 'type', value: inputType },
          { label: 'size', value: size },
          { label: 'touchTarget', value: touchTarget },
          { label: 'disabled', value: isDisabled ? 'true' : 'false' },
          { label: 'readOnly', value: isReadOnly ? 'true' : 'false' },
          { label: 'aria-invalid', value: isInvalid ? 'true' : 'false' },
        ],
      },
      {
        title: t('common.studio.specCategoryMeasured'),
        items: [
          { label: 'Computed Height', value: measuredSpecs?.height ?? '—' },
          { label: 'Computed Width', value: measuredSpecs?.width ?? '—' },
          { label: 'Background Color', value: measuredSpecs?.bg ?? '—' },
          { label: 'Border', value: measuredSpecs?.border ?? '—' },
          { label: 'Border Radius', value: measuredSpecs?.radius ?? '—' },
        ],
      },
      {
        title: t('common.studio.specCategoryTokens'),
        items: [
          {
            label: '--radius-control',
            value: 'var(--radius-control) (Product Preset: 6px / 8px)',
          },
          { label: 'Width Mode', value: fullWidth ? '100% (Full Width)' : 'Intrinsic Auto' },
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
    inputType,
    size,
    touchTarget,
    isDisabled,
    isReadOnly,
    isInvalid,
    fullWidth,
    specimenDir,
    locale,
    direction,
    resolvedTheme,
    measuredSpecs,
    t,
  ]);

  // Control Options
  const specimenDirOptions: readonly StudioSegmentedOption<InputSpecimenDirection>[] = [
    { value: 'ltr', label: t('common.studio.specimenDirLtr'), testId: 'opt-dir-ltr' },
    { value: 'rtl', label: t('common.studio.specimenDirRtl'), testId: 'opt-dir-rtl' },
  ];

  const typeOptions: readonly StudioSegmentedOption<InputType>[] = [
    { value: 'text', label: 'Text', testId: 'opt-type-text' },
    { value: 'email', label: 'Email', testId: 'opt-type-email' },
    { value: 'search', label: 'Search', testId: 'opt-type-search' },
    { value: 'password', label: 'Password', testId: 'opt-type-password' },
    { value: 'tel', label: 'Tel', testId: 'opt-type-tel' },
    { value: 'url', label: 'URL', testId: 'opt-type-url' },
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

  const stateOptions: readonly StudioSegmentedOption<InputInteractionState>[] = [
    { value: 'resting', label: t('common.studio.optStateResting'), testId: 'opt-state-resting' },
    { value: 'invalid', label: t('common.studio.optStateInvalid'), testId: 'opt-state-invalid' },
    { value: 'disabled', label: t('common.studio.optStateDisabled'), testId: 'opt-state-disabled' },
    { value: 'readonly', label: t('common.studio.optStateReadonly'), testId: 'opt-state-readonly' },
  ];

  const viewOptions: readonly StudioSegmentedOption<InputStageView>[] = [
    { value: 'single', label: t('common.studio.viewSingle'), testId: 'opt-view-single' },
    { value: 'all-sizes', label: t('common.studio.viewAllSizes'), testId: 'opt-view-all-sizes' },
  ];

  const touchTargetOptions: readonly StudioSegmentedOption<InputTouchTarget>[] = [
    { value: 'auto', label: t('common.studio.touchAuto'), testId: 'opt-touch-auto' },
    {
      value: 'comfortable',
      label: t('common.studio.touchComfortable'),
      testId: 'opt-touch-comfortable',
    },
  ];

  const allSizesList: readonly ControlSize[] = ['xs', 'sm', 'md', 'lg', 'xl', '2xl'];

  return (
    <GalleryStudioLayout
      activeRoute="input"
      title={t('common.studio.inputTitle')}
      subtitle={t('common.studio.inputSubtitle')}
      testId="input-gallery"
      previewDir={specimenDir}
      onReset={handleReset}
      linkComponent={linkComponent}
      controls={
        <>
          <StudioSegmentedControl
            label={t('common.studio.specimenDirectionLabel')}
            value={specimenDir}
            options={specimenDirOptions}
            onChange={handleDirectionChange}
          />

          <hr className={styles.controlDivider} />

          <StudioSegmentedControl
            label={t('common.studio.inputTypeLabel')}
            value={inputType}
            options={typeOptions}
            onChange={handleTypeChange}
          />

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
            label={t('common.studio.inputStateLabel')}
            value={interactionState}
            options={stateOptions}
            onChange={handleStateChange}
          />

          <StudioToggleRow
            label={t('common.studio.inputFullWidthLabel')}
            checked={fullWidth}
            onCheckedChange={setFullWidth}
            testId="toggle-input-full-width"
          />

          <StudioSegmentedControl
            label={t('common.studio.btnTouchTargetLabel')}
            value={touchTarget}
            options={touchTargetOptions}
            onChange={setTouchTarget}
          />

          <hr className={styles.controlDivider} />

          <StudioToggleRow
            label={t('common.studio.inputShowLabelToggle')}
            checked={showLabel}
            onCheckedChange={setShowLabel}
          />

          <StudioToggleRow
            label={t('common.studio.inputShowHelperToggle')}
            checked={showHelper}
            onCheckedChange={setShowHelper}
          />

          <StudioToggleRow
            label={t('common.studio.inputShowErrorToggle')}
            checked={showError}
            onCheckedChange={setShowError}
            testId="toggle-input-show-error"
          />
        </>
      }
      inspector={
        <GalleryCodeInspector
          aiPrompt={aiAgentPrompt}
          jsxCode={jsxSnippet}
          cssCode={cssModuleSnippet}
          jsxFileName="my-input-field.tsx"
          cssFileName="my-input-field.module.css"
          specGroups={specGroups}
        />
      }
    >
      <div className={cn(styles.stageActionArea, fullWidth && styles.wrapperFullWidth)}>
        {stageView === 'single' ? (
          <div className={styles.singleSpecimenRow}>
            <div className={cn(styles.fieldGroup, fullWidth && styles.wrapperFullWidth)}>
              {showLabel && (
                <label htmlFor={activeInputId} className={styles.label}>
                  {activeLabel}
                </label>
              )}
              <Input
                ref={specimenRef}
                id={activeInputId}
                type={inputType}
                size={resolvedSize}
                touchTarget={touchTarget}
                disabled={isDisabled}
                readOnly={isReadOnly}
                aria-invalid={isInvalid || undefined}
                aria-describedby={describedBy}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={activePlaceholder}
                data-testid="studio-active-input"
              />
              {showHelper && activeHelper && (
                <p id={activeHelpId} className={styles.helpText}>
                  {activeHelper}
                </p>
              )}
              {isInvalid && activeError && (
                <p id={activeErrorId} className={styles.errorText}>
                  {activeError}
                </p>
              )}
            </div>
          </div>
        ) : (
          <div className={styles.allSizesGrid}>
            {allSizesList.map((sz) => (
              <div key={sz} className={styles.sizeCard}>
                <span className={styles.sizeCardLabel}>size=&quot;{sz}&quot;</span>
                <Input
                  type={inputType}
                  size={sz}
                  touchTarget={touchTarget}
                  disabled={isDisabled}
                  readOnly={isReadOnly}
                  aria-invalid={isInvalid || undefined}
                  placeholder={`size="${sz}"`}
                  data-testid={`studio-size-input-${sz}`}
                />
              </div>
            ))}
          </div>
        )}

        {/* Clean, centered Quick Configuration Presets */}
        <div className={styles.variantsCenterSection}>
          <span className={styles.variantsCenterLabel}>
            {t('common.studio.inputQuickPresetsTitle')}
          </span>
          <div className={styles.variantsCenterRow}>
            {INPUT_PRESETS.map((preset) => {
              const isActive = inputType === preset.type && interactionState === preset.state;
              return (
                <Button
                  key={preset.id}
                  variant={isActive ? 'primary' : 'secondary'}
                  size="sm"
                  data-testid={`preset-quick-select-${preset.id}`}
                  onClick={() => applyPreset(preset)}
                >
                  {t(preset.labelKey)}
                </Button>
              );
            })}
          </div>
        </div>
      </div>
    </GalleryStudioLayout>
  );
}
