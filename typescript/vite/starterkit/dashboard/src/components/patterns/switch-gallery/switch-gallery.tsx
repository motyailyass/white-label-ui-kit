'use client';

import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import { Icon } from '@/components/icons';
import { Button, type ControlSize, Switch } from '@/components/ui';
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
import styles from './switch-gallery.module.css';

export type SwitchSpecimenDirection = 'ltr' | 'rtl';
export type SwitchInteractionState = 'resting' | 'invalid' | 'disabled';
export type SwitchStageView = 'single' | 'all-sizes';
export type SwitchTouchTarget = 'auto' | 'comfortable';

export interface SwitchGalleryProps {
  linkComponent?: StudioLinkComponent;
}

interface SwitchPresetDef {
  id: string;
  labelKey:
    | 'common.studio.switchPresetNotifications'
    | 'common.studio.switchPresetTwoFactor'
    | 'common.studio.switchPresetAnalytics'
    | 'common.studio.switchPresetAutosave'
    | 'common.studio.switchPresetMaintenance';
  defaultChecked: boolean;
  labels: Record<'en' | 'fr' | 'ar', string>;
  helpers: Record<'en' | 'fr' | 'ar', string>;
  errors: Record<'en' | 'fr' | 'ar', string>;
}

const SWITCH_PRESETS: readonly SwitchPresetDef[] = [
  {
    id: 'notifications',
    labelKey: 'common.studio.switchPresetNotifications',
    defaultChecked: true,
    labels: {
      en: 'Real-time push notifications',
      fr: 'Notifications push en temps réel',
      ar: 'تفعيل الإشعارات الفورية المباشرة',
    },
    helpers: {
      en: 'Receive instant alerts for critical incidents and deployments.',
      fr: 'Recevez des alertes instantanées pour les incidents critiques.',
      ar: 'استلام تنبيهات فورية للحوادث الحرجة وعمليات النشر.',
    },
    errors: {
      en: 'Cannot enable: Browser notification permission is currently blocked in site settings.',
      fr: 'Activation impossible : L’autorisation de notification du navigateur est bloquée.',
      ar: 'تعذر التفعيل: تم حظر إذن إشعارات المتصفح في إعدادات الموقع.',
    },
  },
  {
    id: 'twofactor',
    labelKey: 'common.studio.switchPresetTwoFactor',
    defaultChecked: true,
    labels: {
      en: 'Enforce hardware security key (FIDO2) authentication',
      fr: 'Exiger une clé de sécurité matérielle (FIDO2)',
      ar: 'فرض مفتاح أمان مادي (FIDO2)',
    },
    helpers: {
      en: 'Protects administrator accounts against credential harvesting.',
      fr: 'Protège les comptes d’administrateurs contre le vol d’identifiants.',
      ar: 'حماية حسابات المسؤولين من هجمات التصيد وسرقة بيانات الاعتماد.',
    },
    errors: {
      en: 'Cannot enforce: A backup hardware security key (FIDO2) must be enrolled before enforcing.',
      fr: 'Application impossible : Une clé matérielle de secours (FIDO2) doit être enregistrée au préalable.',
      ar: 'تعذر الفرض: يجب تسجيل مفتاح أمان مادي احتياطي (FIDO2) قبل الفرض.',
    },
  },
  {
    id: 'analytics',
    labelKey: 'common.studio.switchPresetAnalytics',
    defaultChecked: false,
    labels: {
      en: 'Anonymous usage telemetry and crash diagnostics',
      fr: 'Télémétrie anonyme et diagnostics de panne',
      ar: 'قياسات الاستخدام وتقارير الأعطال مجهولة المصدر',
    },
    helpers: {
      en: 'Help engineering identify performance regressions and memory leaks.',
      fr: 'Aide à identifier les régressions de performance et fuites de mémoire.',
      ar: 'مساعدة المهندسين في تحديد تراجعات الأداء وتسريبات الذاكرة.',
    },
    errors: {
      en: 'Cannot enable: Telemetry stream is blocked by active workspace governance policy.',
      fr: 'Activation impossible : Le flux de télémétrie est bloqué par la politique de gouvernance.',
      ar: 'تعذر التفعيل: تدفق القياس عن بُعد محظور بموجب سياسة حوكمة مساحة العمل.',
    },
  },
  {
    id: 'autosave',
    labelKey: 'common.studio.switchPresetAutosave',
    defaultChecked: true,
    labels: {
      en: 'Continuous cloud document autosave',
      fr: 'Sauvegarde automatique continue dans le cloud',
      ar: 'الحفظ التلقائي المستمر للمستندات في السحابة',
    },
    helpers: {
      en: 'Automatically synchronizes drafting buffers every 3 seconds.',
      fr: 'Synchronise automatiquement les brouillons toutes les 3 secondes.',
      ar: 'مزامنة مسودات العمل تلقائياً كل 3 ثوانٍ.',
    },
    errors: {
      en: 'Cannot sync: Connection to remote document storage buffer failed.',
      fr: 'Synchronisation impossible : Échec de connexion au tampon de stockage distant.',
      ar: 'تعذر المزامنة: فشل الاتصال بمخزن المستندات المؤقت البعيد.',
    },
  },
  {
    id: 'maintenance',
    labelKey: 'common.studio.switchPresetMaintenance',
    defaultChecked: false,
    labels: {
      en: 'Cluster maintenance mode (Drain traffic)',
      fr: 'Mode maintenance du cluster (Détourner le trafic)',
      ar: 'وضع صيانة التجمع (تحويل مسار البيانات)',
    },
    helpers: {
      en: 'Diverts incoming traffic to fallback failover regions.',
      fr: 'Détourne le trafic entrant vers les régions de secours.',
      ar: 'تحويل حركة المرور الواردة إلى مناطق الاستجابة للطوارئ.',
    },
    errors: {
      en: 'Cannot drain traffic: At least 2 active standby replica nodes are required before enabling maintenance mode.',
      fr: 'Drainage impossible : Au moins 2 nœuds réplicas de secours actifs sont requis avant le mode maintenance.',
      ar: 'تعذر تصريف البيانات: يلزم وجود عقدتين احتياطيتين نشطتين على الأقل قبل تفعيل وضع الصيانة.',
    },
  },
];

const allSizesList: readonly ControlSize[] = ['xs', 'sm', 'md', 'lg', 'xl', '2xl'];

export function SwitchGallery({ linkComponent }: SwitchGalleryProps) {
  const { t, locale, direction } = useI18n();
  const { resolvedTheme } = useTheme();

  const activeLang = useMemo(() => {
    return (locale === 'fr' || locale === 'ar' ? locale : 'en') as 'en' | 'fr' | 'ar';
  }, [locale]);

  // Studio Interactive State
  const [specimenDir, setSpecimenDir] = useState<SwitchSpecimenDirection>('ltr');
  const [size, setSize] = useState<ControlSize | 'default'>('default');
  const [stageView, setStageView] = useState<SwitchStageView>('single');
  const [interactionState, setInteractionState] = useState<SwitchInteractionState>('resting');
  const [touchTarget, setTouchTarget] = useState<SwitchTouchTarget>('auto');
  const [checked, setChecked] = useState(true);

  // Field & Content State
  const [activePresetId, setActivePresetId] = useState<string>('notifications');
  const [activeLabel, setActiveLabel] = useState(SWITCH_PRESETS[0].labels.en);
  const [activeHelper, setActiveHelper] = useState(SWITCH_PRESETS[0].helpers.en);
  const [activeError, setActiveError] = useState(SWITCH_PRESETS[0].errors.en);
  const [showLabel, setShowLabel] = useState(true);
  const [showHelper, setShowHelper] = useState(true);

  // Live specimen ref for computed specs measurement
  const specimenRef = useRef<HTMLInputElement | null>(null);
  const [measuredSpecs, setMeasuredSpecs] = useState<{
    targetHeight: string;
    targetWidth: string;
    trackWidth: string;
    trackHeight: string;
    thumbSize: string;
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
    (preset: SwitchPresetDef) => {
      setActivePresetId(preset.id);
      setChecked(preset.defaultChecked);
      setActiveLabel(resolveText(preset.labels));
      setActiveHelper(resolveText(preset.helpers));
      setActiveError(resolveText(preset.errors));
      setInteractionState('resting');
    },
    [resolveText],
  );

  const handleStateChange = useCallback((nextState: SwitchInteractionState) => {
    setInteractionState(nextState);
    if (nextState === 'invalid') {
      setChecked(false); // Simulates action blocked in off position
    }
  }, []);

  const handleCheckedChange = useCallback(
    (newChecked: boolean) => {
      setChecked(newChecked);
      // Turning switch on resolves prerequisite error in demo
      if (newChecked && interactionState === 'invalid') {
        setInteractionState('resting');
      }
    },
    [interactionState],
  );

  const handleDirectionChange = useCallback(
    (dir: SwitchSpecimenDirection) => {
      setSpecimenDir(dir);
      const activePreset = SWITCH_PRESETS.find((p) => p.id === activePresetId) ?? SWITCH_PRESETS[0];
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
    applyPreset(SWITCH_PRESETS[0]);
  }, [applyPreset]);

  const resolvedSize: ControlSize | undefined = size === 'default' ? undefined : size;
  const isInvalid = interactionState === 'invalid';
  const isDisabled = interactionState === 'disabled';

  const baseId = useId();
  const activeSwitchId = `${baseId}-active-switch`;
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
      const track = input.nextElementSibling as HTMLElement | null;
      const thumb = track?.firstElementChild as HTMLElement | null;

      if (root && track) {
        const rootRect = root.getBoundingClientRect();
        const trackRect = track.getBoundingClientRect();
        const thumbRect = thumb?.getBoundingClientRect() ?? { width: 0 };
        const s = window.getComputedStyle(track);

        setMeasuredSpecs({
          targetHeight: `${Math.round(rootRect.height)}px`,
          targetWidth: `${Math.round(rootRect.width)}px`,
          trackWidth: `${Math.round(trackRect.width)}px`,
          trackHeight: `${Math.round(trackRect.height)}px`,
          thumbSize: `${Math.round(thumbRect.width)}px`,
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
    if (isDisabled) propsList.push('disabled');
    if (isInvalid) propsList.push('aria-invalid="true"');
    if (describedBy) propsList.push(`aria-describedby="${describedBy}"`);
    propsList.push(`checked={checked}`);
    propsList.push(`onChange={(e) => setChecked(e.target.checked)}`);

    const propsStr = propsList.length > 0 ? `\n    ${propsList.join('\n    ')}\n  ` : ' ';

    return `import { Switch } from '@/components/ui';

<div className="fieldRow">
  <Switch
    id="feature-toggle"${propsStr}/>
  <label htmlFor="feature-toggle">${activeLabel}</label>
</div>`;
  }, [size, touchTarget, isDisabled, isInvalid, describedBy, activeLabel]);

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
    return `You are implementing an accessible Switch binary toggle control using the project's white-label UI Kit. Follow these exact rules:

1. Import pure primitive:
   import { Switch } from '@/components/ui';

2. Usage:
   ${jsxSnippet}

3. Architectural Invariants:
   - 100% pure native <input type="checkbox" role="switch"> driving DOM state.
   - Interaction target (${touchTarget === 'comfortable' ? '48x48px min' : '36px md / 48px xl'}) is decoupled from the visible pill track (${size === 'default' ? '32x16px md / 40x20px xl' : `explicit size="${size}"`}).
   - Immediate position toggle via logical flexbox (flex-start -> flex-end), naturally inverting for RTL without physical coordinates.
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
          { label: 'touchTarget', value: touchTarget },
        ],
      },
      {
        title: t('common.studio.specCategoryMeasured'),
        items: [
          { label: t('common.studio.specMinBlockSize'), value: measuredSpecs?.targetHeight ?? '—' },
          { label: t('common.studio.specInlineSize'), value: measuredSpecs?.targetWidth ?? '—' },
          {
            label: t('common.studio.specTrackSize'),
            value: measuredSpecs
              ? `${measuredSpecs.trackWidth} × ${measuredSpecs.trackHeight}`
              : '—',
          },
          { label: t('common.studio.specThumbSize'), value: measuredSpecs?.thumbSize ?? '—' },
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
    checked,
    touchTarget,
    measuredSpecs,
    specimenDir,
    locale,
    direction,
    resolvedTheme,
    t,
  ]);

  // Sidebar Controls Options
  const specimenDirOptions: readonly StudioSegmentedOption<SwitchSpecimenDirection>[] = [
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

  const stateOptions: readonly StudioSegmentedOption<SwitchInteractionState>[] = [
    { value: 'resting', label: t('common.studio.optStateResting'), testId: 'opt-state-resting' },
    { value: 'invalid', label: t('common.studio.optStateInvalid'), testId: 'opt-state-invalid' },
    { value: 'disabled', label: t('common.studio.optStateDisabled'), testId: 'opt-state-disabled' },
  ];

  const viewOptions: readonly StudioSegmentedOption<SwitchStageView>[] = [
    { value: 'single', label: t('common.studio.viewSingle'), testId: 'opt-view-single' },
    { value: 'all-sizes', label: t('common.studio.viewAllSizes'), testId: 'opt-view-all-sizes' },
  ];

  const touchTargetOptions: readonly StudioSegmentedOption<SwitchTouchTarget>[] = [
    { value: 'auto', label: t('common.studio.touchAuto'), testId: 'opt-touch-auto' },
    {
      value: 'comfortable',
      label: t('common.studio.touchComfortable'),
      testId: 'opt-touch-comfortable',
    },
  ];

  return (
    <GalleryStudioLayout
      activeRoute="switch"
      title={t('common.switchGallery.title')}
      subtitle={t('common.switchGallery.subtitle')}
      testId="switch-gallery"
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
            label={t('common.studio.switchCheckedToggle')}
            checked={checked}
            onCheckedChange={handleCheckedChange}
            testId="toggle-switch-checked"
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
        </>
      }
      inspector={
        <GalleryCodeInspector
          aiPrompt={aiAgentPrompt}
          jsxCode={jsxSnippet}
          cssCode={cssModuleSnippet}
          jsxFileName="my-switch.tsx"
          cssFileName="my-switch.module.css"
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
                <Switch
                  ref={specimenRef}
                  id={activeSwitchId}
                  size={resolvedSize}
                  touchTarget={touchTarget}
                  checked={checked}
                  disabled={isDisabled}
                  aria-invalid={isInvalid || undefined}
                  aria-describedby={describedBy}
                  onChange={(e) => handleCheckedChange(e.target.checked)}
                  data-testid="studio-active-switch"
                />
                {showLabel && (
                  <label
                    htmlFor={activeSwitchId}
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
                  <Icon name="error" className={styles.errorIcon} aria-hidden="true" />
                  <span>{activeError}</span>
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
                  <Switch
                    id={`${baseId}-grid-${sz}`}
                    size={sz}
                    touchTarget={touchTarget}
                    checked={checked}
                    disabled={isDisabled}
                    aria-invalid={isInvalid || undefined}
                    onChange={(e) => handleCheckedChange(e.target.checked)}
                    data-testid={`studio-size-switch-${sz}`}
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
            {t('common.studio.switchQuickPresetsTitle')}
          </span>
          <div className={styles.variantsCenterRow}>
            {SWITCH_PRESETS.map((preset) => {
              const isActive = activePresetId === preset.id;
              return (
                <Button
                  key={preset.id}
                  variant={isActive ? 'primary' : 'secondary'}
                  size="sm"
                  data-testid={`preset-quick-switch-${preset.id}`}
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
