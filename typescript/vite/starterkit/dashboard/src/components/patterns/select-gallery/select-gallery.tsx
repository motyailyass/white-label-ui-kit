'use client';

import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import { Button, type ControlSize, Select } from '@/components/ui';
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
import styles from './select-gallery.module.css';

export type SelectSpecimenDirection = 'ltr' | 'rtl';
export type SelectInteractionState = 'resting' | 'invalid' | 'disabled';
export type SelectStageView = 'single' | 'all-sizes';
export type SelectTouchTarget = 'auto' | 'comfortable';

export interface SelectGalleryProps {
  linkComponent?: StudioLinkComponent;
}

interface SelectOptionDef {
  value: string;
  labels: Record<'en' | 'fr' | 'ar', string>;
}

interface SelectPresetDef {
  id: string;
  labelKey:
    | 'common.studio.selectPresetRegion'
    | 'common.studio.selectPresetRole'
    | 'common.studio.selectPresetCurrency'
    | 'common.studio.selectPresetNoIcon'
    | 'common.studio.selectPresetInvalid'
    | 'common.studio.selectPresetDisabled';
  state: SelectInteractionState;
  showIcon: boolean;
  defaultValue: string;
  labels: Record<'en' | 'fr' | 'ar', string>;
  helpers?: Record<'en' | 'fr' | 'ar', string>;
  errors?: Record<'en' | 'fr' | 'ar', string>;
  options: readonly SelectOptionDef[];
  showHelper: boolean;
  showError: boolean;
}

const REGION_OPTIONS: readonly SelectOptionDef[] = [
  {
    value: 'us-east',
    labels: {
      en: 'US East (N. Virginia)',
      fr: 'États-Unis Est (Virginie)',
      ar: 'شرق الولايات المتحدة (فيرجينيا)',
    },
  },
  {
    value: 'eu-west',
    labels: { en: 'EU West (Frankfurt)', fr: 'UE Ouest (Francfort)', ar: 'غرب أوروبا (فرانكفورت)' },
  },
  {
    value: 'ap-south',
    labels: { en: 'AP South (Mumbai)', fr: 'Asie Sud (Mumbai)', ar: 'جنوب آسيا (مومباي)' },
  },
  {
    value: 'me-central',
    labels: { en: 'ME Central (Dubai)', fr: 'MO Central (Dubaï)', ar: 'الشرق الأوسط (دبي)' },
  },
];

const ROLE_OPTIONS: readonly SelectOptionDef[] = [
  {
    value: 'admin',
    labels: {
      en: 'Administrator (Full Access)',
      fr: 'Administrateur (Accès complet)',
      ar: 'مسؤول (وصول كامل)',
    },
  },
  {
    value: 'editor',
    labels: {
      en: 'Editor (Can Edit & Publish)',
      fr: 'Éditeur (Peut éditer et publier)',
      ar: 'محرر (يمكنه التعديل والنشر)',
    },
  },
  {
    value: 'viewer',
    labels: { en: 'Viewer (Read Only)', fr: 'Lecteur (Lecture seule)', ar: 'مشاهد (قراءة فقط)' },
  },
  {
    value: 'billing',
    labels: { en: 'Billing Manager', fr: 'Gestionnaire de facturation', ar: 'مدير الفواتير' },
  },
];

const CURRENCY_OPTIONS: readonly SelectOptionDef[] = [
  {
    value: 'usd',
    labels: {
      en: 'USD ($) — US Dollar',
      fr: 'USD ($) — Dollar américain',
      ar: 'USD ($) — دولار أمريكي',
    },
  },
  {
    value: 'eur',
    labels: { en: 'EUR (€) — Euro', fr: 'EUR (€) — Euro', ar: 'EUR (€) — يورو' },
  },
  {
    value: 'gbp',
    labels: {
      en: 'GBP (£) — British Pound',
      fr: 'GBP (£) — Livre sterling',
      ar: 'GBP (£) — جنيه إسترليني',
    },
  },
  {
    value: 'aed',
    labels: {
      en: 'AED (د.إ) — UAE Dirham',
      fr: 'AED (د.إ) — Dirham des EAU',
      ar: 'AED (د.إ) — درهم إماراتي',
    },
  },
];

const ENVIRONMENT_OPTIONS: readonly SelectOptionDef[] = [
  {
    value: '',
    labels: {
      en: 'Choose an environment...',
      fr: 'Choisir un environnement...',
      ar: 'اختر بيئة...',
    },
  },
  {
    value: 'prod',
    labels: {
      en: 'Production (Live Traffic)',
      fr: 'Production (Trafic réel)',
      ar: 'الإنتاج (الزيارات الفعلية)',
    },
  },
  {
    value: 'staging',
    labels: { en: 'Staging (Pre-release)', fr: 'Pré-production (Test)', ar: 'البيئة التجريبية' },
  },
];

const CLUSTER_OPTIONS: readonly SelectOptionDef[] = [
  {
    value: 'prod-cluster',
    labels: {
      en: 'Cluster Alpha (Locked)',
      fr: 'Cluster Alpha (Verrouillé)',
      ar: 'المجموعة ألفا (مقفلة)',
    },
  },
];

const SELECT_PRESETS: readonly SelectPresetDef[] = [
  {
    id: 'region',
    labelKey: 'common.studio.selectPresetRegion',
    state: 'resting',
    showIcon: true,
    defaultValue: 'us-east',
    labels: { en: 'Deployment Region', fr: 'Région de déploiement', ar: 'منطقة النشر' },
    helpers: {
      en: 'Choose the datacenter closest to your primary user base.',
      fr: 'Choisissez le centre de données le plus proche de vos utilisateurs.',
      ar: 'اختر مركز البيانات الأقرب لمستخدميك لتقليل زمن الاستجابة.',
    },
    options: REGION_OPTIONS,
    showHelper: true,
    showError: false,
  },
  {
    id: 'role',
    labelKey: 'common.studio.selectPresetRole',
    state: 'resting',
    showIcon: true,
    defaultValue: 'editor',
    labels: { en: 'Account Role', fr: 'Rôle du compte', ar: 'دور الحساب' },
    helpers: {
      en: 'Controls workspace access and administrative capabilities.',
      fr: 'Contrôle les accès à l’espace de travail et l’administration.',
      ar: 'يتحكم في صلاحيات مساحة العمل والأذونات الإدارية.',
    },
    options: ROLE_OPTIONS,
    showHelper: true,
    showError: false,
  },
  {
    id: 'currency',
    labelKey: 'common.studio.selectPresetCurrency',
    state: 'resting',
    showIcon: true,
    defaultValue: 'usd',
    labels: { en: 'Billing Currency', fr: 'Devise de facturation', ar: 'عملة الفواتير' },
    options: CURRENCY_OPTIONS,
    showHelper: false,
    showError: false,
  },
  {
    id: 'no-icon',
    labelKey: 'common.studio.selectPresetNoIcon',
    state: 'resting',
    showIcon: false,
    defaultValue: 'us-east',
    labels: {
      en: 'Minimal Select (No Chevron)',
      fr: 'Sélection minimale (Sans chevron)',
      ar: 'اختيار مبسط (بدون سهم)',
    },
    helpers: {
      en: 'Decorative chevron omitted; symmetrical end padding applied.',
      fr: 'Chevron omis; espacement de fin symétrique appliqué.',
      ar: 'تم حذف السهم الزخرفي؛ يتم تطبيق الحشوة المتماثلة تلقائياً.',
    },
    options: REGION_OPTIONS,
    showHelper: true,
    showError: false,
  },
  {
    id: 'invalid',
    labelKey: 'common.studio.selectPresetInvalid',
    state: 'invalid',
    showIcon: true,
    defaultValue: '',
    labels: { en: 'Mandatory Environment', fr: 'Environnement obligatoire', ar: 'البيئة المطلوبة' },
    errors: {
      en: 'Please select a deployment environment before proceeding.',
      fr: 'Veuillez sélectionner un environnement avant de continuer.',
      ar: 'يرجى تحديد بيئة النشر قبل المتابعة.',
    },
    options: ENVIRONMENT_OPTIONS,
    showHelper: false,
    showError: true,
  },
  {
    id: 'disabled',
    labelKey: 'common.studio.selectPresetDisabled',
    state: 'disabled',
    showIcon: true,
    defaultValue: 'prod-cluster',
    labels: { en: 'Locked Cluster', fr: 'Cluster verrouillé', ar: 'المجموعة المقفلة' },
    options: CLUSTER_OPTIONS,
    showHelper: false,
    showError: false,
  },
];

const allSizesList: readonly ControlSize[] = ['xs', 'sm', 'md', 'lg', 'xl', '2xl'];

export function SelectGallery({ linkComponent }: SelectGalleryProps) {
  const { t, locale, direction } = useI18n();
  const { resolvedTheme } = useTheme();

  const activeLang = useMemo(() => {
    return (locale === 'fr' || locale === 'ar' ? locale : 'en') as 'en' | 'fr' | 'ar';
  }, [locale]);

  // Studio Interactive State
  const [specimenDir, setSpecimenDir] = useState<SelectSpecimenDirection>('ltr');
  const [size, setSize] = useState<ControlSize | 'default'>('default');
  const [stageView, setStageView] = useState<SelectStageView>('single');
  const [interactionState, setInteractionState] = useState<SelectInteractionState>('resting');
  const [fullWidth, setFullWidth] = useState(false);
  const [touchTarget, setTouchTarget] = useState<SelectTouchTarget>('auto');
  const [showIcon, setShowIcon] = useState(true);

  // Field & Content State
  const [activePresetId, setActivePresetId] = useState<string>('region');
  const [selectedValue, setSelectedValue] = useState<string>(SELECT_PRESETS[0].defaultValue);
  const [currentOptions, setCurrentOptions] = useState<readonly SelectOptionDef[]>(
    SELECT_PRESETS[0].options,
  );
  const [activeLabel, setActiveLabel] = useState(SELECT_PRESETS[0].labels.en);
  const [activeHelper, setActiveHelper] = useState('');
  const [activeError, setActiveError] = useState('');
  const [showLabel, setShowLabel] = useState(true);
  const [showHelper, setShowHelper] = useState(true);
  const [showError, setShowError] = useState(false);

  // Live specimen ref for computed specs measurement
  const specimenRef = useRef<HTMLSelectElement | null>(null);
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

  const applyPreset = useCallback(
    (preset: SelectPresetDef) => {
      setActivePresetId(preset.id);
      setInteractionState(preset.state);
      setShowIcon(preset.showIcon);
      setSelectedValue(preset.defaultValue);
      setCurrentOptions(preset.options);
      setActiveLabel(resolveText(preset.labels));
      setActiveHelper(preset.helpers ? resolveText(preset.helpers) : '');
      setActiveError(preset.errors ? resolveText(preset.errors) : '');
      setShowHelper(preset.showHelper);
      setShowError(preset.showError);
    },
    [resolveText],
  );

  const handleDirectionChange = useCallback(
    (dir: SelectSpecimenDirection) => {
      setSpecimenDir(dir);
      const activePreset = SELECT_PRESETS.find((p) => p.id === activePresetId) ?? SELECT_PRESETS[0];
      const targetLang = dir === 'rtl' ? 'ar' : activeLang;
      setActiveLabel(activePreset.labels[targetLang]);
      if (activePreset.helpers) {
        setActiveHelper(activePreset.helpers[targetLang]);
      }
      if (activePreset.errors) {
        setActiveError(activePreset.errors[targetLang]);
      }
    },
    [activeLang, activePresetId],
  );

  const handleReset = useCallback(() => {
    setSpecimenDir('ltr');
    setSize('default');
    setStageView('single');
    setInteractionState('resting');
    setFullWidth(false);
    setTouchTarget('auto');
    setShowIcon(true);
    applyPreset(SELECT_PRESETS[0]);
  }, [applyPreset]);

  const resolvedSize: ControlSize | undefined = size === 'default' ? undefined : size;
  const isInvalid = interactionState === 'invalid' || showError;
  const isDisabled = interactionState === 'disabled';

  const baseId = useId();
  const activeSelectId = `${baseId}-active-select`;
  const activeHelpId = `${baseId}-active-help`;
  const activeErrorId = `${baseId}-active-error`;

  const describedBy = useMemo(() => {
    const ids: string[] = [];
    if (showHelper && activeHelper) ids.push(activeHelpId);
    if (isInvalid && activeError) ids.push(activeErrorId);
    return ids.length > 0 ? ids.join(' ') : undefined;
  }, [showHelper, activeHelper, activeHelpId, isInvalid, activeError, activeErrorId]);

  useEffect(() => {
    if (specimenRef.current) {
      const el = specimenRef.current;
      const s = window.getComputedStyle(el);
      const rect = el.getBoundingClientRect();
      setMeasuredSpecs({
        height: `${Math.round(rect.height)}px`,
        width: `${Math.round(rect.width)}px`,
        bg: s.backgroundColor,
        border: `${s.borderWidth} ${s.borderStyle} ${s.borderColor}`,
        radius: s.borderRadius,
      });
    }
  }, [
    size,
    touchTarget,
    interactionState,
    showIcon,
    specimenDir,
    resolvedTheme,
    fullWidth,
    selectedValue,
  ]);

  // Dynamic Standalone Code Snippet
  const jsxSnippet = useMemo(() => {
    const propsList: string[] = [];
    if (size !== 'default') propsList.push(`size="${size}"`);
    if (touchTarget !== 'auto') propsList.push(`touchTarget="${touchTarget}"`);
    if (!showIcon) propsList.push('showIcon={false}');
    if (isDisabled) propsList.push('disabled');
    if (isInvalid) propsList.push('aria-invalid="true"');
    if (describedBy) propsList.push(`aria-describedby="${describedBy}"`);
    propsList.push(`value={value}`);
    propsList.push(`onChange={(e) => setValue(e.target.value)}`);

    const propsStr = propsList.length > 0 ? `\n  ${propsList.join('\n  ')}\n` : ' ';

    return `import { Select } from '@/components/ui';

<div className="fieldGroup">
  <label htmlFor="user-select">${activeLabel}</label>
  <Select id="user-select"${propsStr}>
    <option value="us-east">US East (N. Virginia)</option>
    <option value="eu-west">EU West (Frankfurt)</option>
    <option value="ap-south">AP South (Mumbai)</option>
    <option value="me-central">ME Central (Dubai)</option>
  </Select>
</div>`;
  }, [size, touchTarget, showIcon, isDisabled, isInvalid, describedBy, activeLabel]);

  const cssModuleSnippet = `.fieldGroup {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  inline-size: 100%;${fullWidth ? '' : '\n  max-inline-size: 24rem;'}
}

.label {
  font-size: var(--typography-label-size);
  color: var(--color-text-primary);
  font-weight: var(--typography-label-weight);
}`;

  const aiAgentPrompt = useMemo(() => {
    return `You are implementing an accessible single-choice Select dropdown using the project's white-label UI Kit. Follow these exact rules:

1. Import pure primitive:
   import { Select } from '@/components/ui';

2. Usage:
   ${jsxSnippet}

3. Architectural Invariants:
   - 100% pure native <select> wrapped in an inline-block geometry root with custom token-spaced chevron.
   - 2px balanced focus ring (zero floating gap, HeroUI style).
   - Stable neutral hover border: resting border remains stable on hover without artificial jump.
   - 100% CSS logical properties (inline-size, block-size, padding-inline, padding-block).
   - Zero dashboard shadows: list elevation is native browser-owned.
   - Size: ${size === 'default' ? 'Product default (md = 36px in dashboard, xl = 48px in website)' : `Explicit size="${size}"`}.`;
  }, [jsxSnippet, size]);

  const specGroups: readonly StudioSpecGroup[] = useMemo(() => {
    return [
      {
        title: t('common.studio.specCategoryVariant'),
        items: [
          { label: 'size', value: size },
          { label: 'state', value: interactionState },
          { label: 'showIcon', value: showIcon ? 'true' : 'false' },
          { label: 'touchTarget', value: touchTarget },
          { label: 'fullWidth', value: fullWidth ? 'true' : 'false' },
        ],
      },
      {
        title: t('common.studio.specCategoryMeasured'),
        items: [
          { label: t('common.studio.specMinBlockSize'), value: measuredSpecs?.height ?? '—' },
          { label: t('common.studio.specInlineSize'), value: measuredSpecs?.width ?? '—' },
          { label: t('common.studio.specBackgroundColor'), value: measuredSpecs?.bg ?? '—' },
          { label: t('common.studio.specBorder'), value: measuredSpecs?.border ?? '—' },
          { label: t('common.studio.specRadius'), value: measuredSpecs?.radius ?? '—' },
        ],
      },
      {
        title: t('common.studio.specCategoryTokens'),
        items: [
          { label: '--radius-control', value: 'var(--radius-control) (6px / 8px)' },
          { label: '--color-border-focus', value: 'var(--color-border-focus)' },
          { label: t('common.studio.specimenDirectionLabel'), value: specimenDir.toUpperCase() },
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
    interactionState,
    showIcon,
    touchTarget,
    fullWidth,
    measuredSpecs,
    specimenDir,
    locale,
    direction,
    resolvedTheme,
    t,
  ]);

  // Sidebar Controls Options
  const specimenDirOptions: readonly StudioSegmentedOption<SelectSpecimenDirection>[] = [
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

  const stateOptions: readonly StudioSegmentedOption<SelectInteractionState>[] = [
    { value: 'resting', label: t('common.studio.optStateResting'), testId: 'opt-state-resting' },
    { value: 'invalid', label: t('common.studio.optStateInvalid'), testId: 'opt-state-invalid' },
    { value: 'disabled', label: t('common.studio.optStateDisabled'), testId: 'opt-state-disabled' },
  ];

  const viewOptions: readonly StudioSegmentedOption<SelectStageView>[] = [
    { value: 'single', label: t('common.studio.viewSingle'), testId: 'opt-view-single' },
    { value: 'all-sizes', label: t('common.studio.viewAllSizes'), testId: 'opt-view-all-sizes' },
  ];

  const touchTargetOptions: readonly StudioSegmentedOption<SelectTouchTarget>[] = [
    { value: 'auto', label: t('common.studio.touchAuto'), testId: 'opt-touch-auto' },
    {
      value: 'comfortable',
      label: t('common.studio.touchComfortable'),
      testId: 'opt-touch-comfortable',
    },
  ];

  return (
    <GalleryStudioLayout
      activeRoute="select"
      title={t('common.selectGallery.title')}
      subtitle={t('common.selectGallery.subtitle')}
      testId="select-gallery"
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
            onChange={(s) => {
              setInteractionState(s);
              if (s === 'invalid') {
                setShowError(true);
              } else {
                setShowError(false);
              }
            }}
          />

          <StudioToggleRow
            label={t('common.studio.inputFullWidthLabel')}
            checked={fullWidth}
            onCheckedChange={setFullWidth}
            testId="toggle-select-full-width"
          />

          <StudioSegmentedControl
            label={t('common.studio.btnTouchTargetLabel')}
            value={touchTarget}
            options={touchTargetOptions}
            onChange={setTouchTarget}
          />

          <hr className={styles.controlDivider} />

          <StudioToggleRow
            label={t('common.studio.selectPresetNoIcon')}
            checked={!showIcon}
            onCheckedChange={(omitted) => setShowIcon(!omitted)}
            testId="toggle-select-hide-icon"
          />

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
          />
        </>
      }
      inspector={
        <GalleryCodeInspector
          aiPrompt={aiAgentPrompt}
          jsxCode={jsxSnippet}
          cssCode={cssModuleSnippet}
          jsxFileName="my-select-dropdown.tsx"
          cssFileName="my-select-dropdown.module.css"
          specGroups={specGroups}
        />
      }
    >
      <div className={cn(styles.stageActionArea, fullWidth && styles.wrapperFullWidth)}>
        {stageView === 'single' ? (
          <div className={styles.singleSpecimenRow}>
            <div className={cn(styles.fieldGroup, fullWidth && styles.wrapperFullWidth)}>
              {showLabel && (
                <label htmlFor={activeSelectId} className={styles.label}>
                  {activeLabel}
                </label>
              )}
              <Select
                ref={specimenRef}
                id={activeSelectId}
                size={resolvedSize}
                touchTarget={touchTarget}
                showIcon={showIcon}
                disabled={isDisabled}
                aria-invalid={isInvalid || undefined}
                aria-describedby={describedBy}
                value={selectedValue}
                onChange={(e) => setSelectedValue(e.target.value)}
                data-testid="studio-active-select"
              >
                {currentOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {resolveText(opt.labels)}
                  </option>
                ))}
              </Select>
              {showHelper && activeHelper && (
                <p id={activeHelpId} className={styles.helpText}>
                  {activeHelper}
                </p>
              )}
              {isInvalid && activeError && (
                <p id={activeErrorId} className={styles.errorText} role="alert">
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
                <Select
                  id={`${baseId}-grid-${sz}`}
                  size={sz}
                  touchTarget={touchTarget}
                  showIcon={showIcon}
                  disabled={isDisabled}
                  aria-invalid={isInvalid || undefined}
                  value={selectedValue}
                  onChange={(e) => setSelectedValue(e.target.value)}
                  data-testid={`studio-size-select-${sz}`}
                >
                  {currentOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {resolveText(opt.labels)}
                    </option>
                  ))}
                </Select>
              </div>
            ))}
          </div>
        )}

        {/* Clean, centered Quick Configuration Presets */}
        <div className={styles.variantsCenterSection}>
          <span className={styles.variantsCenterLabel}>
            {t('common.studio.selectQuickPresetsTitle')}
          </span>
          <div className={styles.variantsCenterRow}>
            {SELECT_PRESETS.map((preset) => {
              const isActive = activePresetId === preset.id;
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
