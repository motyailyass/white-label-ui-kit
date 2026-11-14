'use client';

import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import { Button, type ControlSize, Textarea } from '@/components/ui';
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
import styles from './textarea-gallery.module.css';

export type TextareaSpecimenDirection = 'ltr' | 'rtl';
export type TextareaInteractionState = 'resting' | 'invalid' | 'disabled' | 'readonly';
export type TextareaStageView = 'single' | 'all-sizes';
export type TextareaTouchTarget = 'auto' | 'comfortable';

export interface TextareaGalleryProps {
  linkComponent?: StudioLinkComponent;
}

interface TextareaPresetDef {
  id: string;
  labelKey:
    | 'common.studio.textareaPresetNotes'
    | 'common.studio.textareaPresetScope'
    | 'common.studio.textareaPresetCode'
    | 'common.studio.textareaPresetCompact'
    | 'common.studio.textareaPresetInvalid'
    | 'common.studio.textareaPresetDisabled'
    | 'common.studio.textareaPresetReadOnly';
  rows: number;
  state: TextareaInteractionState;
  sampleValue: Record<'en' | 'fr' | 'ar', string>;
  labels: Record<'en' | 'fr' | 'ar', string>;
  placeholders: Record<'en' | 'fr' | 'ar', string>;
  helpers?: Record<'en' | 'fr' | 'ar', string>;
  errors?: Record<'en' | 'fr' | 'ar', string>;
  showHelper: boolean;
  showError: boolean;
}

const TEXTAREA_PRESETS: readonly TextareaPresetDef[] = [
  {
    id: 'notes',
    labelKey: 'common.studio.textareaPresetNotes',
    rows: 4,
    state: 'resting',
    sampleValue: { en: '', fr: '', ar: '' },
    labels: { en: 'Project Notes', fr: 'Notes de projet', ar: 'ملاحظات المشروع' },
    placeholders: {
      en: 'Enter your project notes, meeting takeaways, or feedback...',
      fr: 'Entrez les notes de projet, comptes-rendus ou retours...',
      ar: 'اكتب ملاحظات وتفاصيل المشروع هنا...',
    },
    showHelper: false,
    showError: false,
  },
  {
    id: 'scope',
    labelKey: 'common.studio.textareaPresetScope',
    rows: 6,
    state: 'resting',
    sampleValue: {
      en: 'Feature Scope:\n1. White-label Core UI primitives with 100% pure contracts\n2. Real-time telemetry synchronization\n3. Zero dashboard shadows & 2px balanced focus ring',
      fr: 'Périmètre fonctionnel :\n1. Primitives Core UI white-label avec contrats 100% purs\n2. Synchronisation télémétrique en temps réel\n3. Zéro ombre sur le tableau de bord et anneau de focus équilibré de 2px',
      ar: 'نطاق الميزات:\n1. مكوّنات واجهة أساسية قابلة لإعادة العلامة بعقود نقية 100%\n2. مزامنة القياسات عن بُعد في الوقت الفعلي\n3. لوحة تحكم بلا ظلال مع حلقة تركيز متوازنة بسماكة 2px',
    },
    labels: { en: 'Project Scope', fr: 'Portée du projet', ar: 'نطاق المشروع' },
    placeholders: {
      en: 'Detail project deliverables...',
      fr: 'Détaillez les livrables du projet...',
      ar: 'أدخل نطاق ومخرجات المشروع...',
    },
    helpers: {
      en: 'Supports multi-line plain text, indentation, and code notes.',
      fr: 'Prend en charge le texte multiligne, les indentations et les notes de code.',
      ar: 'يدعم النص المتعدد، المسافات البادئة، وملاحظات البرمجة.',
    },
    showHelper: true,
    showError: false,
  },
  {
    id: 'code',
    labelKey: 'common.studio.textareaPresetCode',
    rows: 5,
    state: 'resting',
    sampleValue: {
      en: '{\n  "service": "telemetry-worker",\n  "status": "active",\n  "retries": 3\n}',
      fr: '{\n  "service": "telemetry-worker",\n  "status": "active",\n  "retries": 3\n}',
      ar: '{\n  "service": "telemetry-worker",\n  "status": "active",\n  "retries": 3\n}',
    },
    labels: { en: 'Configuration Snippet', fr: 'Extrait de configuration', ar: 'مقتطف التكوين' },
    placeholders: {
      en: 'Enter JSON or YAML configuration...',
      fr: 'Entrez la configuration JSON ou YAML...',
      ar: 'أدخل كود التكوين بصيغة JSON أو YAML...',
    },
    showHelper: false,
    showError: false,
  },
  {
    id: 'compact',
    labelKey: 'common.studio.textareaPresetCompact',
    rows: 2,
    state: 'resting',
    sampleValue: {
      en: 'Short feedback comment or summary note.',
      fr: 'Bref commentaire ou note de synthèse.',
      ar: 'تعليق موجز أو ملاحظة تلخيصية.',
    },
    labels: { en: 'Quick Comment', fr: 'Commentaire rapide', ar: 'تعليق سريع' },
    placeholders: {
      en: 'Provide brief feedback...',
      fr: 'Donnez un bref commentaire...',
      ar: 'أدخل تعليقاً سريعاً...',
    },
    showHelper: false,
    showError: false,
  },
  {
    id: 'invalid',
    labelKey: 'common.studio.textareaPresetInvalid',
    rows: 4,
    state: 'invalid',
    sampleValue: { en: 'Too short', fr: 'Trop court', ar: 'قصير جداً' },
    labels: {
      en: 'Required Project Summary',
      fr: 'Résumé de projet requis',
      ar: 'ملخص المشروع المطلوب',
    },
    placeholders: {
      en: 'Enter detailed summary...',
      fr: 'Entrez un résumé détaillé...',
      ar: 'أدخل ملخصاً تفصيلياً...',
    },
    errors: {
      en: 'Project summary must contain at least 20 characters.',
      fr: 'Le résumé du projet doit comporter au moins 20 caractères.',
      ar: 'يجب أن يحتوي ملخص المشروع على 20 حرفاً على الأقل.',
    },
    showHelper: false,
    showError: true,
  },
  {
    id: 'disabled',
    labelKey: 'common.studio.textareaPresetDisabled',
    rows: 4,
    state: 'disabled',
    sampleValue: {
      en: 'This project archive is locked for editing.',
      fr: 'Cette archive de projet est verrouillée en écriture.',
      ar: 'هذا الأرشيف محمي من التعديل.',
    },
    labels: { en: 'Archived Record', fr: 'Enregistrement archivé', ar: 'سجل مؤرشف' },
    placeholders: {
      en: 'Archived record...',
      fr: 'Texte archivé...',
      ar: 'نص مؤرشف...',
    },
    showHelper: false,
    showError: false,
  },
  {
    id: 'readonly',
    labelKey: 'common.studio.textareaPresetReadOnly',
    rows: 4,
    state: 'readonly',
    sampleValue: {
      en: 'Standard software license agreement & compliance terms.\nVertical resizing is preserved for reading comfort.',
      fr: 'Conditions standard du contrat de licence logicielle et de conformité.\nLe redimensionnement vertical est conservé pour le confort de lecture.',
      ar: 'شروط اتفاقية ترخيص البرمجيات والامتثال القياسية.\nيُحتفظ بتغيير الحجم الرأسي لراحة القراءة.',
    },
    labels: { en: 'Compliance Agreement', fr: 'Accord de conformité', ar: 'اتفاقية الامتثال' },
    placeholders: {
      en: 'Read-only text...',
      fr: 'Texte en lecture seule...',
      ar: 'نص للقراءة فقط...',
    },
    showHelper: false,
    showError: false,
  },
];

const allSizesList: readonly ControlSize[] = ['xs', 'sm', 'md', 'lg', 'xl', '2xl'];

export function TextareaGallery({ linkComponent }: TextareaGalleryProps) {
  const { t, locale, direction } = useI18n();
  const { resolvedTheme } = useTheme();

  const activeLang = useMemo(() => {
    return (locale === 'fr' || locale === 'ar' ? locale : 'en') as 'en' | 'fr' | 'ar';
  }, [locale]);

  // Studio Interactive State
  const [specimenDir, setSpecimenDir] = useState<TextareaSpecimenDirection>('ltr');
  const [size, setSize] = useState<ControlSize | 'default'>('default');
  const [rows, setRows] = useState(4);
  const [stageView, setStageView] = useState<TextareaStageView>('single');
  const [interactionState, setInteractionState] = useState<TextareaInteractionState>('resting');
  const [fullWidth, setFullWidth] = useState(false);
  const [touchTarget, setTouchTarget] = useState<TextareaTouchTarget>('auto');

  // Content & Field State
  const [textareaValue, setTextareaValue] = useState('');
  const [activeLabel, setActiveLabel] = useState(TEXTAREA_PRESETS[0].labels.en);
  const [activePlaceholder, setActivePlaceholder] = useState(TEXTAREA_PRESETS[0].placeholders.en);
  const [activeHelper, setActiveHelper] = useState('');
  const [activeError, setActiveError] = useState('');
  const [showLabel, setShowLabel] = useState(true);
  const [showHelper, setShowHelper] = useState(false);
  const [showError, setShowError] = useState(false);

  // Live specimen ref for computed specs measurement
  const specimenRef = useRef<HTMLTextAreaElement | null>(null);
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
    (preset: TextareaPresetDef) => {
      if (specimenRef.current) {
        specimenRef.current.style.height = '';
        specimenRef.current.style.width = '';
      }
      setRows(preset.rows);
      setInteractionState(preset.state);
      setTextareaValue(resolveText(preset.sampleValue));
      setActiveLabel(resolveText(preset.labels));
      setActivePlaceholder(resolveText(preset.placeholders));
      setActiveHelper(preset.helpers ? resolveText(preset.helpers) : '');
      setActiveError(preset.errors ? resolveText(preset.errors) : '');
      setShowHelper(preset.showHelper);
      setShowError(preset.showError);
    },
    [resolveText],
  );

  const handleDirectionChange = useCallback(
    (dir: TextareaSpecimenDirection) => {
      setSpecimenDir(dir);
      // Synchronize active preset text for newly selected language/direction
      const activePreset =
        TEXTAREA_PRESETS.find((p) => p.state === interactionState && p.rows === rows) ??
        TEXTAREA_PRESETS[0];
      const targetLang = dir === 'rtl' ? 'ar' : activeLang;
      const previousLang = specimenDir === 'rtl' ? 'ar' : activeLang;
      const previousSample = activePreset.sampleValue[previousLang];
      const nextSample = activePreset.sampleValue[targetLang];
      // Swap specimen prose with the language, but never overwrite user-edited text.
      setTextareaValue((current) => (current === previousSample ? nextSample : current));
      setActiveLabel(activePreset.labels[targetLang]);
      setActivePlaceholder(activePreset.placeholders[targetLang]);
      if (activePreset.helpers) {
        setActiveHelper(activePreset.helpers[targetLang]);
      }
      if (activePreset.errors) {
        setActiveError(activePreset.errors[targetLang]);
      }
    },
    [activeLang, interactionState, rows, specimenDir],
  );

  const handleReset = useCallback(() => {
    setSpecimenDir('ltr');
    setSize('default');
    setRows(4);
    setStageView('single');
    setInteractionState('resting');
    setFullWidth(false);
    setTouchTarget('auto');
    applyPreset(TEXTAREA_PRESETS[0]);
  }, [applyPreset]);

  const resolvedSize: ControlSize | undefined = size === 'default' ? undefined : size;
  const isInvalid = interactionState === 'invalid' || showError;
  const isDisabled = interactionState === 'disabled';
  const isReadOnly = interactionState === 'readonly';

  const baseId = useId();
  const activeTextareaId = `${baseId}-active-textarea`;
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
      specimenRef.current.style.height = '';
      specimenRef.current.style.width = '';
    }
  }, [rows, size, touchTarget]);

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
    rows,
    touchTarget,
    interactionState,
    specimenDir,
    resolvedTheme,
    fullWidth,
    textareaValue,
  ]);

  // Dynamic Standalone Code Snippet
  const jsxSnippet = useMemo(() => {
    const propsList: string[] = [`rows={${rows}}`];
    if (size !== 'default') propsList.push(`size="${size}"`);
    if (touchTarget !== 'auto') propsList.push(`touchTarget="${touchTarget}"`);
    if (isDisabled) propsList.push('disabled');
    if (isReadOnly) propsList.push('readOnly');
    if (isInvalid) propsList.push('aria-invalid="true"');
    if (describedBy) propsList.push(`aria-describedby="${describedBy}"`);
    propsList.push(`placeholder="${activePlaceholder}"`);
    if (textareaValue) {
      propsList.push(`value={value}`);
      propsList.push(`onChange={(e) => setValue(e.target.value)}`);
    }

    const propsStr = propsList.length > 0 ? `\n  ${propsList.join('\n  ')}\n` : ' ';

    return `import { Textarea } from '@/components/ui';

<div className="fieldGroup">
  <label htmlFor="project-notes">${activeLabel}</label>
  <Textarea id="project-notes"${propsStr}/>
</div>`;
  }, [
    rows,
    size,
    touchTarget,
    isDisabled,
    isReadOnly,
    isInvalid,
    describedBy,
    activePlaceholder,
    textareaValue,
    activeLabel,
  ]);

  const cssModuleSnippet = `.fieldGroup {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  inline-size: 100%;${fullWidth ? '' : '\n  max-inline-size: 28rem;'}
}

.label {
  font-size: var(--typography-label-size);
  color: var(--color-text-primary);
  font-weight: var(--typography-label-weight);
}`;

  const aiAgentPrompt = useMemo(() => {
    return `You are implementing an accessible multiline Textarea field using the project's white-label UI Kit. Follow these exact rules:

1. Import pure primitive:
   import { Textarea } from '@/components/ui';

2. Usage:
   ${jsxSnippet}

3. Architectural Invariants:
   - 100% pure primitive: zero wrapper div, direct ref forwarding to HTMLTextAreaElement.
   - Initial visible height is governed by native rows={${rows}}, while size governs typographic density.
   - 2px balanced focus ring (zero floating gap, HeroUI style).
   - Vertical manual resizing (resize: vertical) locked against horizontal blowout; preserved on readOnly.
   - 100% CSS logical properties (inline-size, padding-inline, padding-block).
   - Size: ${size === 'default' ? 'Product default (md in dashboard, xl in website)' : `Explicit size="${size}"`}.`;
  }, [jsxSnippet, rows, size]);

  const specGroups: readonly StudioSpecGroup[] = useMemo(() => {
    return [
      {
        title: t('common.studio.specCategoryVariant'),
        items: [
          { label: 'rows', value: String(rows) },
          { label: 'size', value: size },
          { label: 'state', value: interactionState },
          { label: 'touchTarget', value: touchTarget },
          { label: 'fullWidth', value: fullWidth ? 'true' : 'false' },
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
          { label: '--radius-control', value: 'var(--radius-control) (6px / 8px)' },
          { label: '--color-border-focus', value: 'var(--color-border-focus)' },
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
    rows,
    size,
    interactionState,
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
  const specimenDirOptions: readonly StudioSegmentedOption<TextareaSpecimenDirection>[] = [
    { value: 'ltr', label: t('common.studio.specimenDirLtr'), testId: 'opt-dir-ltr' },
    { value: 'rtl', label: t('common.studio.specimenDirRtl'), testId: 'opt-dir-rtl' },
  ];

  const rowsOptions: readonly StudioSegmentedOption<string>[] = [
    { value: '1', label: '1', testId: 'opt-rows-1' },
    { value: '2', label: '2', testId: 'opt-rows-2' },
    { value: '4', label: '4 (Def)', testId: 'opt-rows-4' },
    { value: '6', label: '6', testId: 'opt-rows-6' },
    { value: '8', label: '8', testId: 'opt-rows-8' },
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

  const stateOptions: readonly StudioSegmentedOption<TextareaInteractionState>[] = [
    { value: 'resting', label: t('common.studio.optStateResting'), testId: 'opt-state-resting' },
    { value: 'invalid', label: t('common.studio.optStateInvalid'), testId: 'opt-state-invalid' },
    { value: 'disabled', label: t('common.studio.optStateDisabled'), testId: 'opt-state-disabled' },
    { value: 'readonly', label: t('common.studio.optStateReadonly'), testId: 'opt-state-readonly' },
  ];

  const viewOptions: readonly StudioSegmentedOption<TextareaStageView>[] = [
    { value: 'single', label: t('common.studio.viewSingle'), testId: 'opt-view-single' },
    { value: 'all-sizes', label: t('common.studio.viewAllSizes'), testId: 'opt-view-all-sizes' },
  ];

  const touchTargetOptions: readonly StudioSegmentedOption<TextareaTouchTarget>[] = [
    { value: 'auto', label: t('common.studio.touchAuto'), testId: 'opt-touch-auto' },
    {
      value: 'comfortable',
      label: t('common.studio.touchComfortable'),
      testId: 'opt-touch-comfortable',
    },
  ];

  return (
    <GalleryStudioLayout
      activeRoute="textarea"
      title={t('common.textareaGallery.title')}
      subtitle={t('common.textareaGallery.subtitle')}
      testId="textarea-gallery"
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

          <StudioSegmentedControl
            label={t('common.textareaGallery.rowsTitle')}
            value={String(rows)}
            options={rowsOptions}
            onChange={(r) => setRows(Number(r))}
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
            testId="toggle-textarea-full-width"
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
            testId="toggle-textarea-show-error"
          />
        </>
      }
      inspector={
        <GalleryCodeInspector
          aiPrompt={aiAgentPrompt}
          jsxCode={jsxSnippet}
          cssCode={cssModuleSnippet}
          jsxFileName="project-description.tsx"
          cssFileName="project-description.module.css"
          specGroups={specGroups}
        />
      }
    >
      <div className={cn(styles.stageActionArea, fullWidth && styles.wrapperFullWidth)}>
        {stageView === 'single' ? (
          <div className={styles.singleSpecimenRow}>
            <div className={cn(styles.fieldGroup, fullWidth && styles.wrapperFullWidth)}>
              {showLabel && (
                <label htmlFor={activeTextareaId} className={styles.label}>
                  {activeLabel}
                </label>
              )}
              <Textarea
                ref={specimenRef}
                id={activeTextareaId}
                size={resolvedSize}
                rows={rows}
                touchTarget={touchTarget}
                disabled={isDisabled}
                readOnly={isReadOnly}
                aria-invalid={isInvalid || undefined}
                aria-describedby={describedBy}
                value={textareaValue}
                onChange={(e) => setTextareaValue(e.target.value)}
                placeholder={activePlaceholder}
                data-testid="studio-active-textarea"
              />
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
                <label htmlFor={`${baseId}-size-${sz}`} className={styles.sizeCardLabel}>
                  size=&quot;{sz}&quot;
                </label>
                <Textarea
                  id={`${baseId}-size-${sz}`}
                  size={sz}
                  rows={3}
                  touchTarget={touchTarget}
                  disabled={isDisabled}
                  readOnly={isReadOnly}
                  aria-invalid={isInvalid || undefined}
                  placeholder={`size="${sz}"`}
                  data-testid={`studio-size-textarea-${sz}`}
                />
              </div>
            ))}
          </div>
        )}

        {/* Clean, centered Quick Configuration Presets */}
        <div className={styles.variantsCenterSection}>
          <span className={styles.variantsCenterLabel}>
            {t('common.studio.textareaQuickPresetsTitle')}
          </span>
          <div className={styles.variantsCenterRow}>
            {TEXTAREA_PRESETS.map((preset) => {
              const isActive =
                interactionState === preset.state &&
                rows === preset.rows &&
                textareaValue === resolveText(preset.sampleValue);
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
