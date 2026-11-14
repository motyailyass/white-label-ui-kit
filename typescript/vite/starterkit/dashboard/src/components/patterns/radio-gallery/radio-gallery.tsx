'use client';

import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import { Button, type ControlSize, Radio } from '@/components/ui';
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
import styles from './radio-gallery.module.css';

export type RadioSpecimenDirection = 'ltr' | 'rtl';
export type RadioInteractionState = 'resting' | 'invalid' | 'disabled';
export type RadioStageView = 'single' | 'all-sizes';
export type RadioTouchTarget = 'auto' | 'comfortable';

export interface RadioGalleryProps {
  linkComponent?: StudioLinkComponent;
}

interface RadioOptionDef {
  id: string;
  labels: Record<'en' | 'fr' | 'ar', string>;
}

interface RadioPresetDef {
  id: string;
  labelKey:
    | 'common.studio.radioPresetBilling'
    | 'common.studio.radioPresetTier'
    | 'common.studio.radioPresetDeployment'
    | 'common.studio.radioPresetResidency'
    | 'common.studio.radioPresetNotification';
  defaultValue: string;
  legends: Record<'en' | 'fr' | 'ar', string>;
  options: readonly RadioOptionDef[];
  helpers?: Record<'en' | 'fr' | 'ar', string>;
  errors: Record<'en' | 'fr' | 'ar', string>;
  showHelper: boolean;
}

const RADIO_PRESETS: readonly RadioPresetDef[] = [
  {
    id: 'billing',
    labelKey: 'common.studio.radioPresetBilling',
    defaultValue: 'annual',
    legends: {
      en: 'Billing Cycle',
      fr: 'Cycle de facturation',
      ar: 'دورة الفوترة',
    },
    options: [
      {
        id: 'monthly',
        labels: {
          en: 'Monthly billing (standard rate)',
          fr: 'Facturation mensuelle (tarif standard)',
          ar: 'فاتورة شهرية (السعر القياسي)',
        },
      },
      {
        id: 'annual',
        labels: {
          en: 'Annual billing (Save 20% on cloud workloads)',
          fr: 'Facturation annuelle (Économisez 20% sur le cloud)',
          ar: 'فاتورة سنوية (خصم 20% على أحمال العمل السحابية)',
        },
      },
    ],
    helpers: {
      en: 'Annual commitments receive priority cloud ingress and support.',
      fr: 'Les forfaits annuels bénéficient d’une priorité sur le support et l’infrastructure.',
      ar: 'تحصل الخطط السنوية على أولوية في دعم العملاء والبنية السحابية.',
    },
    errors: {
      en: 'Please select a billing cycle to finalize your subscription tier.',
      fr: 'Veuillez sélectionner un cycle de facturation pour finaliser votre abonnement.',
      ar: 'يرجى اختيار دورة الفوترة لإتمام اشتراكك.',
    },
    showHelper: true,
  },
  {
    id: 'tier',
    labelKey: 'common.studio.radioPresetTier',
    defaultValue: 'pro',
    legends: {
      en: 'Subscription Tier',
      fr: 'Formule d’abonnement',
      ar: 'مستوى الاشتراك',
    },
    options: [
      {
        id: 'starter',
        labels: {
          en: 'Starter ($19/mo per seat)',
          fr: 'Starter (19 $/mois par utilisateur)',
          ar: 'البداية (19 $/شهر لكل مقعد)',
        },
      },
      {
        id: 'pro',
        labels: {
          en: 'Professional ($49/mo per seat)',
          fr: 'Professionnel (49 $/mois par utilisateur)',
          ar: 'المحترف (49 $/شهر لكل مقعد)',
        },
      },
      {
        id: 'enterprise',
        labels: {
          en: 'Enterprise (Custom SLA & dedicated VPC)',
          fr: 'Entreprise (SLA dédié et VPC privé)',
          ar: 'المؤسسات (اتفاقية مستوى خدمة مخصصة وشبكة خاصة)',
        },
      },
    ],
    helpers: {
      en: 'Upgrade or downgrade anytime with prorated credit calculation.',
      fr: 'Changez d’offre à tout moment avec ajustement calculé au prorata.',
      ar: 'قم بالترقية أو التخفيض في أي وقت مع حساب الرصيد تناسبيًا.',
    },
    errors: {
      en: 'Please select a subscription tier to continue provisioning.',
      fr: 'Veuillez sélectionner une formule d’abonnement pour continuer.',
      ar: 'يرجى اختيار باقة الاشتراك للمتابعة.',
    },
    showHelper: true,
  },
  {
    id: 'deployment',
    labelKey: 'common.studio.radioPresetDeployment',
    defaultValue: 'cloud',
    legends: {
      en: 'Deployment Model',
      fr: 'Modèle de déploiement',
      ar: 'نموذج النشر',
    },
    options: [
      {
        id: 'cloud',
        labels: {
          en: 'Multi-Tenant Public Cloud',
          fr: 'Cloud public mutualisé',
          ar: 'سحابة عامة مشتركة',
        },
      },
      {
        id: 'hybrid',
        labels: {
          en: 'Hybrid Virtual Private Cloud',
          fr: 'Cloud privé virtuel hybride',
          ar: 'سحابة هجينة خاصة',
        },
      },
      {
        id: 'onpremise',
        labels: {
          en: 'Air-Gapped On-Premises Installation',
          fr: 'Installation sur site isolé (Air-gapped)',
          ar: 'تثبيت محلي معزول تماماً',
        },
      },
    ],
    helpers: {
      en: 'Controls where your encrypted data partitions and workloads reside.',
      fr: 'Détermine l’emplacement de vos partitions de données chiffrées.',
      ar: 'يحدد موقع أقسام بياناتك المشفرة وأحمال العمل الخاصة بك.',
    },
    errors: {
      en: 'Please select an infrastructure deployment model.',
      fr: 'Veuillez sélectionner un modèle de déploiement d’infrastructure.',
      ar: 'يرجى اختيار نموذج نشر البنية التحتية.',
    },
    showHelper: true,
  },
  {
    id: 'residency',
    labelKey: 'common.studio.radioPresetResidency',
    defaultValue: 'eu',
    legends: {
      en: 'Data Residency Region',
      fr: 'Région de résidence des données',
      ar: 'منطقة استضافة البيانات',
    },
    options: [
      {
        id: 'eu',
        labels: {
          en: 'European Union (GDPR compliance & Frankfurt cluster)',
          fr: 'Union Européenne (Conformité RGPD et cluster Francfort)',
          ar: 'الاتحاد الأوروبي (امتثال GDPR وخادم فرانكفورت)',
        },
      },
      {
        id: 'us',
        labels: {
          en: 'United States (CCPA / SOC2 Type II & Virginia cluster)',
          fr: 'États-Unis (CCPA / SOC2 Type II et cluster Virginie)',
          ar: 'الولايات المتحدة (CCPA / SOC2 وخادم فرجينيا)',
        },
      },
    ],
    helpers: {
      en: 'Determines the geographical region where persistent storage is provisioned.',
      fr: 'Définit la région géographique où le stockage persistant est alloué.',
      ar: 'يحدد المنطقة الجغرافية التي يتم فيها توفير التخزين الدائم.',
    },
    errors: {
      en: 'Please select an applicable legal jurisdiction to establish data residency.',
      fr: 'Veuillez sélectionner une juridiction légale pour définir la résidence des données.',
      ar: 'يرجى اختيار الاختصاص القانوني المعمول به لتحديد موطن تخزين البيانات.',
    },
    showHelper: true,
  },
  {
    id: 'notification',
    labelKey: 'common.studio.radioPresetNotification',
    defaultValue: 'daily',
    legends: {
      en: 'Notification Digest Cadence',
      fr: 'Fréquence du récapitulatif des notifications',
      ar: 'وتيرة ملخص الإشعارات',
    },
    options: [
      {
        id: 'realtime',
        labels: {
          en: 'Real-Time Push Notifications',
          fr: 'Notifications push en temps réel',
          ar: 'إشعارات فورية مباشرة',
        },
      },
      {
        id: 'daily',
        labels: {
          en: 'Daily Activity Digest (09:00 UTC)',
          fr: 'Récapitulatif quotidien (09h00 UTC)',
          ar: 'ملخص يومي للنشاط (09:00 بالتوقيت العالمي)',
        },
      },
      {
        id: 'weekly',
        labels: {
          en: 'Weekly Executive Summary (Monday)',
          fr: 'Synthèse hebdomadaire (Lundi)',
          ar: 'ملخص تنفيذي أسبوعي (كل اثنين)',
        },
      },
    ],
    helpers: {
      en: 'Can be customized per workspace or channel from account settings.',
      fr: 'Personnalisable par espace de travail depuis vos paramètres de compte.',
      ar: 'يمكن تخصيص الإشعارات لكل مساحة عمل من خلال إعدادات الحساب.',
    },
    errors: {
      en: 'Please select a notification delivery cadence.',
      fr: 'Veuillez choisir une fréquence de distribution des notifications.',
      ar: 'يرجى تحديد وتيرة استلام الإشعارات.',
    },
    showHelper: true,
  },
];

const allSizesList: readonly ControlSize[] = ['xs', 'sm', 'md', 'lg', 'xl', '2xl'];

export function RadioGallery({ linkComponent }: RadioGalleryProps) {
  const { t, locale, direction } = useI18n();
  const { resolvedTheme } = useTheme();

  // Studio Interactive State
  const [activePresetId, setActivePresetId] = useState<string>(RADIO_PRESETS[0].id);
  const [specimenDir, setSpecimenDir] = useState<RadioSpecimenDirection>('ltr');
  const [size, setSize] = useState<ControlSize | 'default'>('default');
  const [stageView, setStageView] = useState<RadioStageView>('single');
  const [interactionState, setInteractionState] = useState<RadioInteractionState>('resting');
  const [touchTarget, setTouchTarget] = useState<RadioTouchTarget>('auto');

  // Radio Group Value
  const [selectedValue, setSelectedValue] = useState<string>(RADIO_PRESETS[0].defaultValue);

  // Content & Feedback States
  const [showLabel, setShowLabel] = useState(true);
  const [showHelper, setShowHelper] = useState(RADIO_PRESETS[0].showHelper);
  const [showError, setShowError] = useState(false);

  const activeRadioRef = useRef<HTMLInputElement>(null);

  // Live Measured DOM Geometry
  const [measuredSpecs, setMeasuredSpecs] = useState<{
    targetHeight: string;
    targetWidth: string;
    circleSize: string;
    dotSize: string;
    bg: string;
    border: string;
    radius: string;
  } | null>(null);

  const activeLang = specimenDir === 'rtl' ? 'ar' : (locale as 'en' | 'fr' | 'ar');

  const currentPreset = useMemo(() => {
    return RADIO_PRESETS.find((p) => p.id === activePresetId) ?? RADIO_PRESETS[0];
  }, [activePresetId]);

  const applyPreset = useCallback((preset: RadioPresetDef) => {
    setActivePresetId(preset.id);
    setSelectedValue(preset.defaultValue);
    setInteractionState('resting');
    setShowError(false);
  }, []);

  const handleStateChange = useCallback(
    (nextState: RadioInteractionState) => {
      setInteractionState(nextState);
      if (nextState === 'invalid') {
        setSelectedValue(''); // Simulates empty mandatory choice that failed validation
        setShowError(true);
      } else {
        setShowError(false);
        if (!selectedValue) {
          setSelectedValue(currentPreset.defaultValue);
        }
      }
    },
    [currentPreset, selectedValue],
  );

  const handleSelectOption = useCallback(
    (optId: string) => {
      setSelectedValue(optId);
      // Selecting an option resolves any mandatory empty selection error
      if (interactionState === 'invalid') {
        setInteractionState('resting');
        setShowError(false);
      }
    },
    [interactionState],
  );

  const handleDirectionChange = useCallback((dir: RadioSpecimenDirection) => {
    setSpecimenDir(dir);
  }, []);

  const handleReset = useCallback(() => {
    setSpecimenDir('ltr');
    setSize('default');
    setStageView('single');
    setInteractionState('resting');
    setTouchTarget('auto');
    setShowLabel(true);
    applyPreset(RADIO_PRESETS[0]);
  }, [applyPreset]);

  const resolvedSize: ControlSize | undefined = size === 'default' ? undefined : size;
  const isInvalid = (interactionState === 'invalid' && !selectedValue) || showError;
  const isDisabled = interactionState === 'disabled';

  const baseId = useId();
  const groupName = `${baseId}-radio-group`;
  const helpId = `${baseId}-help`;
  const errorId = `${baseId}-error`;

  const describedBy = useMemo(() => {
    const ids: string[] = [];
    if (showHelper && currentPreset.helpers) ids.push(helpId);
    if (isInvalid && currentPreset.errors) ids.push(errorId);
    return ids.length > 0 ? ids.join(' ') : undefined;
  }, [showHelper, currentPreset.helpers, helpId, isInvalid, currentPreset.errors, errorId]);

  useEffect(() => {
    if (activeRadioRef.current) {
      const input = activeRadioRef.current;
      const root = input.closest('span');
      const indicator = input.nextElementSibling as HTMLElement | null;
      const dot = indicator?.firstElementChild as HTMLElement | null;

      if (root && indicator) {
        const rootRect = root.getBoundingClientRect();
        const indRect = indicator.getBoundingClientRect();
        const dotRect = dot?.getBoundingClientRect() ?? { width: 0 };
        const s = window.getComputedStyle(indicator);

        setMeasuredSpecs({
          targetHeight: `${Math.round(rootRect.height)}px`,
          targetWidth: `${Math.round(rootRect.width)}px`,
          circleSize: `${Math.round(indRect.width)}px`,
          dotSize: `${Math.round(dotRect.width)}px`,
          bg: s.backgroundColor,
          border: `${s.borderWidth} ${s.borderStyle} ${s.borderColor}`,
          radius: s.borderRadius,
        });
      }
    }
  }, [size, touchTarget, interactionState, selectedValue, specimenDir, resolvedTheme, stageView]);

  // Dynamic Standalone Code Snippet
  const jsxSnippet = useMemo(() => {
    const propsList: string[] = [];
    if (size !== 'default') propsList.push(`size="${size}"`);
    if (touchTarget !== 'auto') propsList.push(`touchTarget="${touchTarget}"`);
    if (isDisabled) propsList.push('disabled');
    if (isInvalid) propsList.push('aria-invalid="true"');
    if (describedBy) propsList.push(`aria-describedby="${describedBy}"`);

    const extraProps = propsList.length > 0 ? `\n      ${propsList.join('\n      ')}` : '';
    const legendText = currentPreset.legends[activeLang];

    const optionsMarkup = currentPreset.options
      .map((opt) => {
        const optId = `radio-${opt.id}`;
        return `    <div className="fieldRow">
      <Radio
        id="${optId}"
        name="radio-group"
        value="${opt.id}"
        checked={value === '${opt.id}'}
        onChange={(e) => setValue(e.target.value)}${extraProps}
      />
      <label htmlFor="${optId}">${opt.labels[activeLang]}</label>
    </div>`;
      })
      .join('\n');

    return `import { Radio } from '@/components/ui';

<fieldset className="fieldset">
  <legend className="legend">${legendText}</legend>
${optionsMarkup}
</fieldset>`;
  }, [size, touchTarget, isDisabled, isInvalid, describedBy, currentPreset, activeLang]);

  const cssModuleSnippet = `.fieldset {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  border: none;
  padding: 0;
  margin: 0;
}

.legend {
  font-size: var(--typography-label-size);
  font-weight: var(--typography-label-weight);
  color: var(--color-text-primary);
  margin-block-end: var(--space-2);
}

.fieldRow {
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
    return `You are implementing an accessible Radio mutual-exclusion selection group using the project's white-label UI Kit. Follow these exact rules:

1. Import pure primitive:
   import { Radio } from '@/components/ui';

2. Usage:
   ${jsxSnippet}

3. Architectural Invariants:
   - 100% pure native <input type="radio"> driving DOM state, wrapped in an inline-flex target container.
   - Mutual exclusivity governed natively by the 'name' attribute across options within the group.
   - Interaction target (${touchTarget === 'comfortable' ? '48x48px min' : '36px md / 48px xl'}) is decoupled from the visible circular indicator (16px md / 20px xl).
   - Inner bullet dot scales to 50% outer diameter with smooth standard easing.
   - Stable neutral hover border: resting border does not jump on hover.
   - Group validation occurs at the <fieldset> level with an accessible alert message rather than alarming solid-red dots.
   - 100% CSS logical properties (inline-size, block-size, padding-inline, margin-block).
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
          { label: 'selectedValue', value: selectedValue || '(none - empty mandatory choice)' },
          { label: 'touchTarget', value: touchTarget },
        ],
      },
      {
        title: t('common.studio.specCategoryMeasured'),
        items: [
          { label: t('common.studio.specMinBlockSize'), value: measuredSpecs?.targetHeight ?? '—' },
          { label: t('common.studio.specInlineSize'), value: measuredSpecs?.targetWidth ?? '—' },
          { label: t('common.studio.specCircleSize'), value: measuredSpecs?.circleSize ?? '—' },
          { label: t('common.studio.specDotSize'), value: measuredSpecs?.dotSize ?? '—' },
          { label: t('common.studio.specBackgroundColor'), value: measuredSpecs?.bg ?? '—' },
          { label: t('common.studio.specBorder'), value: measuredSpecs?.border ?? '—' },
          { label: t('common.studio.specRadius'), value: measuredSpecs?.radius ?? '—' },
        ],
      },
      {
        title: t('common.studio.specCategoryTokens'),
        items: [
          { label: '--radius-full', value: 'var(--radius-full) (9999px)' },
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
    selectedValue,
    touchTarget,
    measuredSpecs,
    specimenDir,
    locale,
    direction,
    resolvedTheme,
    t,
  ]);

  // Sidebar Controls Options
  const specimenDirOptions: readonly StudioSegmentedOption<RadioSpecimenDirection>[] = [
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

  const stateOptions: readonly StudioSegmentedOption<RadioInteractionState>[] = [
    { value: 'resting', label: t('common.studio.optStateResting'), testId: 'opt-state-resting' },
    { value: 'invalid', label: t('common.studio.optStateInvalid'), testId: 'opt-state-invalid' },
    { value: 'disabled', label: t('common.studio.optStateDisabled'), testId: 'opt-state-disabled' },
  ];

  const viewOptions: readonly StudioSegmentedOption<RadioStageView>[] = [
    { value: 'single', label: t('common.studio.viewSingle'), testId: 'opt-view-single' },
    { value: 'all-sizes', label: t('common.studio.viewAllSizes'), testId: 'opt-view-all-sizes' },
  ];

  const touchTargetOptions: readonly StudioSegmentedOption<RadioTouchTarget>[] = [
    { value: 'auto', label: t('common.studio.touchAuto'), testId: 'opt-touch-auto' },
    {
      value: 'comfortable',
      label: t('common.studio.touchComfortable'),
      testId: 'opt-touch-comfortable',
    },
  ];

  return (
    <GalleryStudioLayout
      activeRoute="radio"
      title={t('common.radioGallery.title')}
      subtitle={t('common.radioGallery.subtitle')}
      testId="radio-gallery"
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
          jsxFileName="my-radio-group.tsx"
          cssFileName="my-radio-group.module.css"
          specGroups={specGroups}
        />
      }
    >
      <div className={styles.stageActionArea}>
        {stageView === 'single' ? (
          <div className={styles.singleSpecimenRow}>
            <fieldset className={styles.fieldset} aria-describedby={describedBy}>
              <legend className={styles.legend}>{currentPreset.legends[activeLang]}</legend>
              {currentPreset.options.map((opt, index) => {
                const optId = `${baseId}-option-${opt.id}`;
                const isChecked = selectedValue === opt.id;
                const isPrimaryRef = isChecked || (!selectedValue && index === 0);

                return (
                  <div key={opt.id} className={styles.fieldRow}>
                    <Radio
                      ref={isPrimaryRef ? activeRadioRef : undefined}
                      id={optId}
                      name={groupName}
                      value={opt.id}
                      checked={isChecked}
                      size={resolvedSize}
                      touchTarget={touchTarget}
                      disabled={isDisabled}
                      aria-invalid={isInvalid || undefined}
                      onChange={() => handleSelectOption(opt.id)}
                      data-testid={`studio-radio-${opt.id}`}
                    />
                    {showLabel && (
                      <label
                        htmlFor={optId}
                        className={cn(styles.label, isDisabled && styles.labelDisabled)}
                      >
                        {opt.labels[activeLang]}
                      </label>
                    )}
                  </div>
                );
              })}
              {showHelper && !isInvalid && currentPreset.helpers && (
                <p id={helpId} className={styles.helpText}>
                  {currentPreset.helpers[activeLang]}
                </p>
              )}
              {isInvalid && currentPreset.errors && (
                <p id={errorId} className={styles.errorText} role="alert">
                  {currentPreset.errors[activeLang]}
                </p>
              )}
            </fieldset>
          </div>
        ) : (
          <div className={styles.allSizesGrid}>
            {allSizesList.map((sz) => (
              <div key={sz} className={styles.sizeCard}>
                <span className={styles.sizeCardLabel}>size=&quot;{sz}&quot;</span>
                <div className={styles.fieldRow}>
                  <Radio
                    id={`${baseId}-grid-${sz}-1`}
                    name={`grid-group-${sz}`}
                    size={sz}
                    touchTarget={touchTarget}
                    checked={selectedValue === 'opt-1'}
                    disabled={isDisabled}
                    aria-invalid={isInvalid || undefined}
                    onChange={() => setSelectedValue('opt-1')}
                    data-testid={`studio-size-radio-${sz}-1`}
                  />
                  {showLabel && (
                    <label
                      htmlFor={`${baseId}-grid-${sz}-1`}
                      className={cn(styles.label, isDisabled && styles.labelDisabled)}
                    >
                      Option 1
                    </label>
                  )}
                </div>
                <div className={styles.fieldRow}>
                  <Radio
                    id={`${baseId}-grid-${sz}-2`}
                    name={`grid-group-${sz}`}
                    size={sz}
                    touchTarget={touchTarget}
                    checked={selectedValue === 'opt-2'}
                    disabled={isDisabled}
                    aria-invalid={isInvalid || undefined}
                    onChange={() => setSelectedValue('opt-2')}
                    data-testid={`studio-size-radio-${sz}-2`}
                  />
                  {showLabel && (
                    <label
                      htmlFor={`${baseId}-grid-${sz}-2`}
                      className={cn(styles.label, isDisabled && styles.labelDisabled)}
                    >
                      Option 2
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
            {t('common.studio.radioQuickPresetsTitle')}
          </span>
          <div className={styles.variantsCenterRow}>
            {RADIO_PRESETS.map((preset) => {
              const isActive = activePresetId === preset.id;
              return (
                <Button
                  key={preset.id}
                  variant={isActive ? 'primary' : 'secondary'}
                  size="sm"
                  data-testid={`preset-quick-radio-${preset.id}`}
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
