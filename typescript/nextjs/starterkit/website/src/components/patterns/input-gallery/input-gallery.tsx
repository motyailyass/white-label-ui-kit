'use client';

import {
  useCallback,
  useId,
  useMemo,
  useState,
} from 'react';
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

export function InputGallery({ linkComponent }: InputGalleryProps) {
  const { t, locale, direction } = useI18n();
  const { resolvedTheme } = useTheme();

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
  const [inputValue, setInputValue] = useState('');

  const handleReset = useCallback(() => {
    setSpecimenDir('ltr');
    setInputType('text');
    setSize('default');
    setStageView('single');
    setInteractionState('resting');
    setTouchTarget('auto');
    setFullWidth(false);
    setShowLabel(true);
    setShowHelper(false);
    setShowError(false);
    setInputValue('');
  }, []);

  const resolvedSize: ControlSize | undefined = size === 'default' ? undefined : size;
  const isInvalid = interactionState === 'invalid' || showError;
  const isDisabled = interactionState === 'disabled';
  const isReadOnly = interactionState === 'readonly';

  const baseId = useId();
  const activeInputId = `${baseId}-stage-input`;
  const activeHelpId = `${baseId}-stage-help`;
  const activeErrorId = `${baseId}-stage-error`;

  const activePlaceholder =
    specimenDir === 'rtl' ? 'أدخل القيمة المطلوبة...' : t('common.studio.inputSamplePlaceholder');
  const activeLabelText =
    specimenDir === 'rtl' ? 'حقل إدخال المستخدم' : t('common.studio.inputSampleLabel');
  const activeHelpText =
    specimenDir === 'rtl'
      ? 'يدعم الحروف الأبجدية والأرقام والتنسيقات القياسية.'
      : t('common.studio.inputSampleHelper');
  const activeErrorText =
    specimenDir === 'rtl'
      ? 'يرجى تقديم قيمة صحيحة ومقبولة.'
      : t('common.studio.inputSampleError');

  // Descriptions for aria-describedby
  const describedBy = useMemo(() => {
    const ids: string[] = [];
    if (showHelper) ids.push(activeHelpId);
    if (isInvalid) ids.push(activeErrorId);
    return ids.length > 0 ? ids.join(' ') : undefined;
  }, [showHelper, isInvalid, activeHelpId, activeErrorId]);

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
    propsList.push(`placeholder="${activePlaceholder}"`);

    const propsStr = propsList.length > 0 ? ` ${propsList.join(' ')}` : '';
    const labelJsx = showLabel ? `<label htmlFor="${activeInputId}">${activeLabelText}</label>\n` : '';
    const helperJsx = showHelper ? `\n<p id="${activeHelpId}">${activeHelpText}</p>` : '';
    const errorJsx = isInvalid ? `\n<p id="${activeErrorId}">${activeErrorText}</p>` : '';

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
    showLabel,
    activeInputId,
    activeLabelText,
    showHelper,
    activeHelpId,
    activeHelpText,
    activeErrorId,
    activeErrorText,
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
    t,
  ]);

  // Control Options
  const specimenDirOptions: readonly StudioSegmentedOption<InputSpecimenDirection>[] = [
    { value: 'ltr', label: t('common.studio.specimenDirLtr') },
    { value: 'rtl', label: t('common.studio.specimenDirRtl') },
  ];

  const typeOptions: readonly StudioSegmentedOption<InputType>[] = [
    { value: 'text', label: 'Text' },
    { value: 'email', label: 'Email' },
    { value: 'search', label: 'Search' },
    { value: 'password', label: 'Password' },
    { value: 'tel', label: 'Tel' },
    { value: 'url', label: 'URL' },
  ];

  const sizeOptions: readonly StudioSegmentedOption<ControlSize | 'default'>[] = [
    { value: 'default', label: 'Def' },
    { value: 'xs', label: 'XS' },
    { value: 'sm', label: 'SM' },
    { value: 'md', label: 'MD' },
    { value: 'lg', label: 'LG' },
    { value: 'xl', label: 'XL' },
    { value: '2xl', label: '2XL' },
  ];

  const stateOptions: readonly StudioSegmentedOption<InputInteractionState>[] = [
    { value: 'resting', label: t('common.studio.optStateResting') },
    { value: 'invalid', label: t('common.studio.optStateInvalid') },
    { value: 'disabled', label: t('common.studio.optStateDisabled') },
    { value: 'readonly', label: t('common.studio.optStateReadonly') },
  ];

  const viewOptions: readonly StudioSegmentedOption<InputStageView>[] = [
    { value: 'single', label: t('common.studio.viewSingle') },
    { value: 'all-sizes', label: t('common.studio.viewAllSizes') },
  ];

  const touchTargetOptions: readonly StudioSegmentedOption<InputTouchTarget>[] = [
    { value: 'auto', label: t('common.studio.touchAuto') },
    { value: 'comfortable', label: t('common.studio.touchComfortable') },
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
            onChange={setSpecimenDir}
          />

          <hr className={styles.controlDivider} />

          <StudioSegmentedControl
            label={t('common.studio.inputTypeLabel')}
            value={inputType}
            options={typeOptions}
            onChange={setInputType}
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
            onChange={setInteractionState}
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
                  {activeLabelText}
                </label>
              )}
              <Input
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
              {showHelper && (
                <p id={activeHelpId} className={styles.helpText}>
                  {activeHelpText}
                </p>
              )}
              {isInvalid && (
                <p id={activeErrorId} className={styles.errorText}>
                  {activeErrorText}
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
                />
              </div>
            ))}
          </div>
        )}

        {/* Clean, centered Quick-Inspect Strip */}
        <div className={styles.variantsCenterSection}>
          <span className={styles.variantsCenterLabel}>Quick Variant Inspector</span>
          <div className={styles.variantsCenterRow}>
            {[
              { label: 'Standard Text', type: 'text' as const, state: 'resting' as const },
              { label: 'Email', type: 'email' as const, state: 'resting' as const },
              { label: 'Search', type: 'search' as const, state: 'resting' as const },
              { label: 'Password', type: 'password' as const, state: 'resting' as const },
              { label: 'Validation Error', type: 'text' as const, state: 'invalid' as const },
              { label: 'Disabled', type: 'text' as const, state: 'disabled' as const },
              { label: 'Read-Only', type: 'text' as const, state: 'readonly' as const },
            ].map((v) => {
              const isActive = inputType === v.type && interactionState === v.state;
              return (
                <div
                  key={v.label}
                  className={cn(styles.variantItemWrapper, isActive && styles.variantItemActive)}
                >
                  <Button
                    variant={isActive ? 'primary' : 'secondary'}
                    size="sm"
                    onClick={() => {
                      setInputType(v.type);
                      setInteractionState(v.state);
                    }}
                  >
                    {v.label}
                  </Button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </GalleryStudioLayout>
  );
}
