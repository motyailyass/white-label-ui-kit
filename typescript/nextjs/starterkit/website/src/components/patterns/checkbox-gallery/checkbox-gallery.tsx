'use client';

import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import { Button, Checkbox, type ControlSize } from '@/components/ui';
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
import styles from './checkbox-gallery.module.css';

export type CheckboxSpecimenDirection = 'ltr' | 'rtl';
export type CheckboxInteractionState = 'resting' | 'indeterminate' | 'invalid' | 'disabled';
export type CheckboxStageView = 'single' | 'all-sizes';
export type CheckboxTouchTarget = 'auto' | 'comfortable';

export interface CheckboxGalleryProps {
  linkComponent?: StudioLinkComponent;
}

interface CheckboxPresetDef {
  id: string;
  labelKey:
    | 'common.studio.checkboxPresetTerms'
    | 'common.studio.checkboxPresetMarketing'
    | 'common.studio.checkboxPresetPermissions'
    | 'common.studio.checkboxPresetDiagnostics'
    | 'common.studio.checkboxPresetSecurity';
  checked: boolean;
  indeterminate: boolean;
  labels: Record<'en' | 'fr' | 'ar', string>;
  helpers: Record<'en' | 'fr' | 'ar', string>;
  errors: Record<'en' | 'fr' | 'ar', string>;
}

const CHECKBOX_PRESETS: readonly CheckboxPresetDef[] = [
  {
    id: 'terms',
    labelKey: 'common.studio.checkboxPresetTerms',
    checked: true,
    indeterminate: false,
    labels: {
      en: 'I accept the terms of service and conditions',
      fr: 'J’accepte les conditions générales d’utilisation',
      ar: 'أوافق على شروط الخدمة والأحكام العامة',
    },
    helpers: {
      en: 'Required to complete account creation and access services.',
      fr: 'Requis pour finaliser la création du compte et accéder aux services.',
      ar: 'مطلوب لإكمال إنشاء الحساب بنجاح والوصول إلى كافة الخدمات.',
    },
    errors: {
      en: 'You must accept the terms of service and conditions to proceed.',
      fr: 'Vous devez accepter les conditions d’utilisation pour continuer.',
      ar: 'يجب عليك الموافقة على شروط الخدمة والأحكام للمتابعة.',
    },
  },
  {
    id: 'marketing',
    labelKey: 'common.studio.checkboxPresetMarketing',
    checked: false,
    indeterminate: false,
    labels: {
      en: 'Email newsletter and weekly feature digests',
      fr: 'Lettre d’information par e-mail et résumés hebdomadaires',
      ar: 'النشرة البريدية الأسبوعية وملخصات الميزات الجديدة',
    },
    helpers: {
      en: 'Unsubscribe at any time from your account settings.',
      fr: 'Désabonnez-vous à tout moment depuis les paramètres de votre compte.',
      ar: 'يمكنك إلغاء الاشتراك في أي وقت من إعدادات حسابك.',
    },
    errors: {
      en: 'Please indicate your communication preference.',
      fr: 'Veuillez indiquer vos préférences de communication.',
      ar: 'يرجى تحديد تفضيلات التواصل الخاصة بك.',
    },
  },
  {
    id: 'permissions',
    labelKey: 'common.studio.checkboxPresetPermissions',
    checked: true,
    indeterminate: true,
    labels: {
      en: 'Select all workspace permissions (4 of 8 granted)',
      fr: 'Sélectionner toutes les autorisations (4 sur 8 accordées)',
      ar: 'تحديد جميع أذونات مساحة العمل (تم منح 4 من 8)',
    },
    helpers: {
      en: 'Click to grant all permissions or uncheck to revoke all.',
      fr: 'Cliquez pour accorder toutes les autorisations ou décochez pour tout révoquer.',
      ar: 'انقر لمنح جميع الأذونات أو قم بإلغاء التحديد لسحب كافة الصلاحيات.',
    },
    errors: {
      en: 'At least one administrative permission must remain assigned.',
      fr: 'Au moins une autorisation administrative doit rester attribuée.',
      ar: 'يجب أن يبقى إذن إداري واحد على الأقل قيد التعيين.',
    },
  },
  {
    id: 'diagnostics',
    labelKey: 'common.studio.checkboxPresetDiagnostics',
    checked: true,
    indeterminate: false,
    labels: {
      en: 'Anonymous crash telemetry and performance metrics',
      fr: 'Télémétrie anonyme des pannes et métriques de performance',
      ar: 'قياسات الأداء وتقارير الأعطال مجهولة المصدر',
    },
    helpers: {
      en: 'Helps engineering identify memory bottlenecks and cluster degradations.',
      fr: 'Aide nos équipes à identifier les goulots d’étranglement de mémoire.',
      ar: 'يساعد المهندسين في تحديد اختناقات الذاكرة ومشكلات التجمع.',
    },
    errors: {
      en: 'Telemetry confirmation is required for staging clusters.',
      fr: 'La télémétrie doit être confirmée pour les clusters de pré-production.',
      ar: 'يجب تأكيد إعدادات القياس عن بُعد للتجمعات التجريبية.',
    },
  },
  {
    id: 'security',
    labelKey: 'common.studio.checkboxPresetSecurity',
    checked: true,
    indeterminate: false,
    labels: {
      en: 'Enforce hardware security key (FIDO2) for high-risk actions',
      fr: 'Exiger une clé de sécurité matérielle (FIDO2) pour les actions critiques',
      ar: 'فرض مفتاح أمان مادي (FIDO2) للإجراءات عالية الحساسية',
    },
    helpers: {
      en: 'Mandatory security baseline enforced across enterprise organization workspaces.',
      fr: 'Socle de sécurité obligatoire imposé par la politique de l’entreprise.',
      ar: 'إعداد أمان إلزامي ومفروض بموجب سياسة المؤسسة العامة.',
    },
    errors: {
      en: 'Hardware security enforcement is required for root administrators.',
      fr: 'La clé matérielle est obligatoire pour les administrateurs racines.',
      ar: 'فرض مفتاح الأمان المادي مطلوب للمسؤولين الرئيسيين.',
    },
  },
];

const allSizesList: readonly ControlSize[] = ['xs', 'sm', 'md', 'lg', 'xl', '2xl'];

export function CheckboxGallery({ linkComponent }: CheckboxGalleryProps) {
  const { t, locale, direction } = useI18n();
  const { resolvedTheme } = useTheme();

  const activeLang = useMemo(() => {
    return (locale === 'fr' || locale === 'ar' ? locale : 'en') as 'en' | 'fr' | 'ar';
  }, [locale]);

  // Studio Interactive State
  const [specimenDir, setSpecimenDir] = useState<CheckboxSpecimenDirection>('ltr');
  const [size, setSize] = useState<ControlSize | 'default'>('default');
  const [stageView, setStageView] = useState<CheckboxStageView>('single');
  const [interactionState, setInteractionState] = useState<CheckboxInteractionState>('resting');
  const [touchTarget, setTouchTarget] = useState<CheckboxTouchTarget>('auto');
  const [checked, setChecked] = useState(true);

  // Field & Content State
  const [activePresetId, setActivePresetId] = useState<string>('terms');
  const [activeLabel, setActiveLabel] = useState(CHECKBOX_PRESETS[0].labels.en);
  const [activeHelper, setActiveHelper] = useState(CHECKBOX_PRESETS[0].helpers.en);
  const [activeError, setActiveError] = useState(CHECKBOX_PRESETS[0].errors.en);
  const [showLabel, setShowLabel] = useState(true);
  const [showHelper, setShowHelper] = useState(true);
  const [showError, setShowError] = useState(false);

  // Live specimen ref for computed specs measurement
  const specimenRef = useRef<HTMLInputElement | null>(null);
  const [measuredSpecs, setMeasuredSpecs] = useState<{
    targetHeight: string;
    targetWidth: string;
    boxSize: string;
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
    (preset: CheckboxPresetDef) => {
      setActivePresetId(preset.id);
      setChecked(preset.checked);
      setActiveLabel(resolveText(preset.labels));
      setActiveHelper(resolveText(preset.helpers));
      setActiveError(resolveText(preset.errors));
      setInteractionState(preset.indeterminate ? 'indeterminate' : 'resting');
      setShowError(false);
    },
    [resolveText],
  );

  const handleStateChange = useCallback((nextState: CheckboxInteractionState) => {
    setInteractionState(nextState);
    if (nextState === 'invalid') {
      setChecked(false); // Simulates unchecked required consent
      setShowError(true);
    } else {
      setShowError(false);
    }
  }, []);

  const handleCheckedChange = useCallback(
    (newChecked: boolean) => {
      setChecked(newChecked);
      // Checking satisfies any mandatory empty selection error
      if (newChecked && interactionState === 'invalid') {
        setInteractionState('resting');
        setShowError(false);
      }
    },
    [interactionState],
  );

  const handleDirectionChange = useCallback(
    (dir: CheckboxSpecimenDirection) => {
      setSpecimenDir(dir);
      const activePreset =
        CHECKBOX_PRESETS.find((p) => p.id === activePresetId) ?? CHECKBOX_PRESETS[0];
      const targetLang = dir === 'rtl' ? 'ar' : activeLang;
      setActiveLabel(activePreset.labels[targetLang]);
      setActiveHelper(activePreset.helpers[targetLang]);
      setActiveError(activePreset.errors[targetLang]);
    },
    [activeLang, activePresetId],
  );

  const handleReset = useCallback(() => {
    setSpecimenDir('ltr');
    setSize('default');
    setStageView('single');
    setInteractionState('resting');
    setTouchTarget('auto');
    applyPreset(CHECKBOX_PRESETS[0]);
  }, [applyPreset]);

  const resolvedSize: ControlSize | undefined = size === 'default' ? undefined : size;
  const isIndeterminate = interactionState === 'indeterminate';
  const isInvalid = (interactionState === 'invalid' && !checked) || showError;
  const isDisabled = interactionState === 'disabled';

  const baseId = useId();
  const activeCheckboxId = `${baseId}-active-checkbox`;
  const activeHelpId = `${baseId}-active-help`;
  const activeErrorId = `${baseId}-active-error`;

  const describedBy = useMemo(() => {
    const ids: string[] = [];
    if (showHelper && !isInvalid && activeHelper) ids.push(activeHelpId);
    if (isInvalid && activeError) ids.push(activeErrorId);
    return ids.length > 0 ? ids.join(' ') : undefined;
  }, [showHelper, isInvalid, activeHelper, activeHelpId, activeError, activeErrorId]);

  useEffect(() => {
    if (specimenRef.current) {
      const input = specimenRef.current;
      const root = input.closest('span');
      const indicator = input.nextElementSibling as HTMLElement | null;

      if (root && indicator) {
        const rootRect = root.getBoundingClientRect();
        const indRect = indicator.getBoundingClientRect();
        const s = window.getComputedStyle(indicator);

        setMeasuredSpecs({
          targetHeight: `${Math.round(rootRect.height)}px`,
          targetWidth: `${Math.round(rootRect.width)}px`,
          boxSize: `${Math.round(indRect.width)}px`,
          bg: s.backgroundColor,
          border: `${s.borderWidth} ${s.borderStyle} ${s.borderColor}`,
          radius: s.borderRadius,
        });
      }
    }
  }, [size, touchTarget, interactionState, checked, specimenDir, resolvedTheme]);

  // Dynamic Standalone Code Snippet
  const jsxSnippet = useMemo(() => {
    const propsList: string[] = [];
    if (size !== 'default') propsList.push(`size="${size}"`);
    if (touchTarget !== 'auto') propsList.push(`touchTarget="${touchTarget}"`);
    if (isIndeterminate) propsList.push('indeterminate');
    if (isDisabled) propsList.push('disabled');
    if (isInvalid) propsList.push('aria-invalid="true"');
    if (describedBy) propsList.push(`aria-describedby="${describedBy}"`);
    propsList.push(`checked={checked}`);
    propsList.push(`onChange={(e) => setChecked(e.target.checked)}`);

    const propsStr = propsList.length > 0 ? `\n    ${propsList.join('\n    ')}\n  ` : ' ';

    return `import { Checkbox } from '@/components/ui';

<div className="fieldRow">
  <Checkbox
    id="user-consent"${propsStr}/>
  <label htmlFor="user-consent">${activeLabel}</label>
</div>`;
  }, [size, touchTarget, isIndeterminate, isDisabled, isInvalid, describedBy, activeLabel]);

  const cssModuleSnippet = `.fieldRow {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  min-inline-size: 0;
}

.label {
  font-size: var(--typography-label-size);
  color: var(--color-text-primary);
  font-weight: var(--typography-label-weight);
  cursor: pointer;
  user-select: none;
}`;

  const aiAgentPrompt = useMemo(() => {
    return `You are implementing an accessible Checkbox binary or tri-state selection control using the project's white-label UI Kit. Follow these exact rules:

1. Import pure primitive:
   import { Checkbox } from '@/components/ui';

2. Usage:
   ${jsxSnippet}

3. Architectural Invariants:
   - 100% pure native <input type="checkbox"> driving DOM state, wrapped in an inline-flex target container.
   - Interaction target (${touchTarget === 'comfortable' ? '48x48px min' : '36px md / 48px xl'}) is decoupled from the visible indicator box (16px md / 20px xl).
   - Indeterminate mixed state synchronized directly to HTMLInputElement.indeterminate.
   - Stable neutral hover border: resting border does not jump on hover.
   - 100% CSS logical properties (inline-size, block-size, padding-inline).
   - Zero dashboard shadows.
   - Size: ${size === 'default' ? 'Product default (md = 36px in dashboard, xl = 48px in website)' : `Explicit size="${size}"`}.`;
  }, [jsxSnippet, size, touchTarget]);

  const specGroups: readonly StudioSpecGroup[] = useMemo(() => {
    return [
      {
        title: t('common.studio.specCategoryVariant'),
        items: [
          { label: 'size', value: size },
          { label: 'state', value: interactionState },
          { label: 'checked', value: checked ? 'true' : 'false' },
          { label: 'indeterminate', value: isIndeterminate ? 'true' : 'false' },
          { label: 'touchTarget', value: touchTarget },
        ],
      },
      {
        title: t('common.studio.specCategoryMeasured'),
        items: [
          { label: t('common.studio.specMinBlockSize'), value: measuredSpecs?.targetHeight ?? '—' },
          { label: t('common.studio.specInlineSize'), value: measuredSpecs?.targetWidth ?? '—' },
          { label: t('common.studio.specIndicatorBox'), value: measuredSpecs?.boxSize ?? '—' },
          { label: t('common.studio.specBackgroundColor'), value: measuredSpecs?.bg ?? '—' },
          { label: t('common.studio.specBorder'), value: measuredSpecs?.border ?? '—' },
          { label: t('common.studio.specRadius'), value: measuredSpecs?.radius ?? '—' },
        ],
      },
      {
        title: t('common.studio.specCategoryTokens'),
        items: [
          { label: '--radius-sm', value: 'var(--radius-sm) (4px)' },
          { label: '--color-border-control', value: 'var(--color-border-control)' },
          { label: '--color-primary', value: 'var(--color-primary)' },
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
    checked,
    isIndeterminate,
    touchTarget,
    measuredSpecs,
    specimenDir,
    locale,
    direction,
    resolvedTheme,
    t,
  ]);

  // Sidebar Controls Options
  const specimenDirOptions: readonly StudioSegmentedOption<CheckboxSpecimenDirection>[] = [
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

  const stateOptions: readonly StudioSegmentedOption<CheckboxInteractionState>[] = [
    { value: 'resting', label: t('common.studio.optStateResting'), testId: 'opt-state-resting' },
    {
      value: 'indeterminate',
      label: t('common.studio.optStateIndeterminate'),
      testId: 'opt-state-indeterminate',
    },
    { value: 'invalid', label: t('common.studio.optStateInvalid'), testId: 'opt-state-invalid' },
    { value: 'disabled', label: t('common.studio.optStateDisabled'), testId: 'opt-state-disabled' },
  ];

  const viewOptions: readonly StudioSegmentedOption<CheckboxStageView>[] = [
    { value: 'single', label: t('common.studio.viewSingle'), testId: 'opt-view-single' },
    { value: 'all-sizes', label: t('common.studio.viewAllSizes'), testId: 'opt-view-all-sizes' },
  ];

  const touchTargetOptions: readonly StudioSegmentedOption<CheckboxTouchTarget>[] = [
    { value: 'auto', label: t('common.studio.touchAuto'), testId: 'opt-touch-auto' },
    {
      value: 'comfortable',
      label: t('common.studio.touchComfortable'),
      testId: 'opt-touch-comfortable',
    },
  ];

  return (
    <GalleryStudioLayout
      activeRoute="checkbox"
      title={t('common.checkboxGallery.title')}
      subtitle={t('common.checkboxGallery.subtitle')}
      testId="checkbox-gallery"
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
            onChange={handleStateChange}
          />

          <StudioToggleRow
            label={t('common.studio.checkboxCheckedToggle')}
            checked={checked}
            onCheckedChange={handleCheckedChange}
            testId="toggle-checkbox-checked"
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
          />
        </>
      }
      inspector={
        <GalleryCodeInspector
          aiPrompt={aiAgentPrompt}
          jsxCode={jsxSnippet}
          cssCode={cssModuleSnippet}
          jsxFileName="my-checkbox.tsx"
          cssFileName="my-checkbox.module.css"
          specGroups={specGroups}
        />
      }
    >
      <div className={styles.stageActionArea}>
        {stageView === 'single' ? (
          <div className={styles.singleSpecimenRow}>
            <div
              className={styles.fieldGroup}
              data-size={size === 'default' ? undefined : size}
              data-touch-target={touchTarget}
            >
              <div className={styles.fieldRow}>
                <Checkbox
                  ref={specimenRef}
                  id={activeCheckboxId}
                  size={resolvedSize}
                  touchTarget={touchTarget}
                  checked={checked}
                  indeterminate={isIndeterminate}
                  disabled={isDisabled}
                  aria-invalid={isInvalid || undefined}
                  aria-describedby={describedBy}
                  onChange={(e) => handleCheckedChange(e.target.checked)}
                  data-testid="studio-active-checkbox"
                />
                {showLabel && (
                  <label
                    htmlFor={activeCheckboxId}
                    className={cn(styles.label, isDisabled && styles.labelDisabled)}
                  >
                    {activeLabel}
                  </label>
                )}
              </div>
              {showHelper && !isInvalid && activeHelper && (
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
                <div className={styles.fieldRow}>
                  <Checkbox
                    id={`${baseId}-grid-${sz}`}
                    size={sz}
                    touchTarget={touchTarget}
                    checked={checked}
                    indeterminate={isIndeterminate}
                    disabled={isDisabled}
                    aria-invalid={isInvalid || undefined}
                    onChange={(e) => handleCheckedChange(e.target.checked)}
                    data-testid={`studio-size-checkbox-${sz}`}
                  />
                  {showLabel && (
                    <label
                      htmlFor={`${baseId}-grid-${sz}`}
                      className={cn(styles.label, isDisabled && styles.labelDisabled)}
                    >
                      {sz.toUpperCase()}
                    </label>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Clean, centered Quick Configuration Presets */}
        <div className={styles.variantsCenterSection}>
          <span className={styles.variantsCenterLabel}>
            {t('common.studio.checkboxQuickPresetsTitle')}
          </span>
          <div className={styles.variantsCenterRow}>
            {CHECKBOX_PRESETS.map((preset) => {
              const isActive = activePresetId === preset.id;
              return (
                <Button
                  key={preset.id}
                  variant={isActive ? 'primary' : 'secondary'}
                  size="sm"
                  data-testid={`preset-quick-checkbox-${preset.id}`}
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
