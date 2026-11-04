'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Icon, type IconName } from '@/components/icons';
import {
  Button,
  type ButtonProps,
  type ButtonVariant,
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
import styles from './button-gallery.module.css';

export type ButtonIconMode = 'none' | 'start' | 'end' | 'both' | 'icon-only';
export type ButtonInteractionState = 'resting' | 'loading' | 'disabled';
export type ButtonStageView = 'single' | 'all-sizes';
export type ButtonTouchTarget = 'auto' | 'comfortable';
export type ButtonSpecimenDirection = 'ltr' | 'rtl';

export interface ButtonGalleryProps {
  linkComponent?: StudioLinkComponent;
}

export function ButtonGallery({ linkComponent }: ButtonGalleryProps) {
  const { t, locale, direction } = useI18n();
  const { resolvedTheme } = useTheme();

  // Component-Specific Preview Controls (Default starts at primitive secondary)
  const [specimenDir, setSpecimenDir] = useState<ButtonSpecimenDirection>('ltr');
  const [variant, setVariant] = useState<ButtonVariant>('secondary');
  const [size, setSize] = useState<ControlSize | 'default'>('default');
  const [stageView, setStageView] = useState<ButtonStageView>('single');
  const [iconMode, setIconMode] = useState<ButtonIconMode>('none');
  const [fullWidth, setFullWidth] = useState(false);
  const [interactionState, setInteractionState] = useState<ButtonInteractionState>('resting');
  const [touchTarget, setTouchTarget] = useState<ButtonTouchTarget>('auto');
  const [buttonType, setButtonType] = useState<'button' | 'submit' | 'reset'>('button');

  // Live specimen ref for computed specs measurement
  const specimenRef = useRef<HTMLButtonElement | null>(null);
  const [measuredSpecs, setMeasuredSpecs] = useState<{
    height: string;
    width: string;
    bg: string;
    border: string;
    radius: string;
  } | null>(null);

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
    variant,
    size,
    touchTarget,
    buttonType,
    interactionState,
    iconMode,
    fullWidth,
    specimenDir,
    resolvedTheme,
  ]);

  const handleReset = useCallback(() => {
    setSpecimenDir('ltr');
    setVariant('secondary');
    setSize('default');
    setStageView('single');
    setIconMode('none');
    setFullWidth(false);
    setInteractionState('resting');
    setTouchTarget('auto');
    setButtonType('button');
  }, []);

  const isLoading = interactionState === 'loading';
  const isDisabled = interactionState === 'disabled';

  const resolvedSize: ControlSize | undefined = size === 'default' ? undefined : size;

  // Icon Slots
  const renderIcon = (name: IconName) => <Icon name={name} />;
  const hasStartIcon = iconMode === 'start' || iconMode === 'both';
  const hasEndIcon = iconMode === 'end' || iconMode === 'both';
  const isIconOnly = iconMode === 'icon-only';

  const startIconSlot = hasStartIcon ? renderIcon('check') : undefined;
  const endIconSlot = hasEndIcon ? renderIcon('arrow-right') : undefined;

  // Active specimen label text based on specimen direction
  const sampleLabelText = specimenDir === 'rtl' ? 'حفظ التغييرات' : t('common.studio.btnSampleLabel');

  // Generate dynamic standalone JSX Snippet
  const jsxSnippet = useMemo(() => {
    const propsList: string[] = [];
    if (variant !== 'secondary') propsList.push(`variant="${variant}"`);
    if (size !== 'default') propsList.push(`size="${size}"`);
    if (touchTarget !== 'auto') propsList.push(`touchTarget="${touchTarget}"`);
    if (buttonType !== 'button') propsList.push(`type="${buttonType}"`);
    if (isLoading) propsList.push('loading');
    if (isDisabled) propsList.push('disabled');
    if (hasStartIcon) propsList.push('startIcon={<Icon name="check" />}');
    if (hasEndIcon) propsList.push('endIcon={<Icon name="arrow-right" />}');
    if (isIconOnly) {
      propsList.push('iconOnly');
      propsList.push(`aria-label="${t('common.studio.btnIconOnlyAria')}"`);
    }

    const needsIconImport = hasStartIcon || hasEndIcon || isIconOnly;
    const imports = [
      `import { Button } from '@/components/ui';`,
      needsIconImport ? `import { Icon } from '@/components/icons';` : null,
      fullWidth ? `import styles from './my-action.module.css';` : null,
    ]
      .filter(Boolean)
      .join('\n');

    const propsStr = propsList.length > 0 ? ` ${propsList.join(' ')}` : '';
    const childrenStr = isIconOnly ? '\n  <Icon name="check" />\n' : `\n  ${sampleLabelText}\n`;

    if (fullWidth) {
      return `${imports}\n\n/* Full-width container pattern via CSS Module: */\n<Button${propsStr} className={styles.fullWidth}>\n  ${childrenStr.trim()}\n</Button>`;
    }

    return `${imports}\n\n<Button${propsStr}>${childrenStr}</Button>`;
  }, [
    variant,
    size,
    touchTarget,
    buttonType,
    isLoading,
    isDisabled,
    hasStartIcon,
    hasEndIcon,
    isIconOnly,
    sampleLabelText,
    fullWidth,
    t,
  ]);

  // Generate dynamic CSS Module override if fullWidth is enabled
  const cssModuleSnippet = useMemo(() => {
    if (!fullWidth) return null;
    return `.fullWidth {\n  inline-size: 100%;\n}`;
  }, [fullWidth]);

  // Generate complete AI Agent Prompt
  const aiAgentPrompt = useMemo(() => {
    return `You are implementing a Button using the project's white-label UI Kit. Follow these exact instructions:

1. Import pure primitives and icons from their root barrels:
   import { Button } from '@/components/ui';
   import { Icon } from '@/components/icons';

2. Render the Button component with the following configuration:
   ${jsxSnippet}

3. Styling & Token Rules:
   - Zero physical CSS properties (no width, height, margin-left, padding-right).
   - Use CSS Logical Properties only (inline-size, block-size, padding-inline, padding-block).
   - 100% shadow-free in dashboard routes.
   - Sizing: ${size === 'default' ? 'Product default (md = 36px in dashboard, xl = 48px in website)' : `Explicit size="${size}"`}.
   - Corner Radius: Consumes system token var(--radius-control) (6px in dashboard, 8px in website).
   - Variant: variant="${variant}" (${variant === 'secondary' ? 'Bordered neutral outline' : variant === 'subtle' ? 'Tinted brand accent' : variant}).
   - RTL Support: Direction mirrors automatically via logical properties; directional icons mirror automatically under dir="rtl".
   - Accessible Name: ${isIconOnly ? 'aria-label is strictly required for icon-only actions.' : 'Accessible text provided via children.'}
${cssModuleSnippet ? `\n4. CSS Module overrides:\n${cssModuleSnippet}` : ''}`;
  }, [jsxSnippet, size, variant, isIconOnly, cssModuleSnippet]);

  // Selected Settings & Measured Specifications table
  const specGroups: readonly StudioSpecGroup[] = useMemo(() => {
    return [
      {
        title: t('common.studio.specCategoryVariant'),
        items: [
          { label: 'variant', value: variant },
          { label: 'size', value: size },
          { label: 'touchTarget', value: touchTarget },
          { label: 'type', value: buttonType },
          { label: 'loading', value: isLoading ? 'true' : 'false' },
          { label: 'disabled', value: isDisabled ? 'true' : 'false' },
        ],
      },
      {
        title: t('common.studio.specCategoryTokens'),
        items: [
          {
            label: '--radius-control',
            value: 'var(--radius-control) (Product Preset: 6px / 8px)',
          },
          { label: 'Width Mode', value: fullWidth ? '100% (CSS Layout Override)' : 'Auto (Intrinsic)' },
          { label: 'Icon Layout', value: iconMode },
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
    variant,
    size,
    touchTarget,
    buttonType,
    isLoading,
    isDisabled,
    fullWidth,
    iconMode,
    specimenDir,
    measuredSpecs,
    locale,
    direction,
    resolvedTheme,
    t,
  ]);

  // Control Options
  const specimenDirOptions: readonly StudioSegmentedOption<ButtonSpecimenDirection>[] = [
    { value: 'ltr', label: t('common.studio.specimenDirLtr') },
    { value: 'rtl', label: t('common.studio.specimenDirRtl') },
  ];

  const variantOptions: readonly StudioSegmentedOption<ButtonVariant>[] = [
    { value: 'primary', label: t('common.studio.optVariantPrimary'), testId: 'opt-variant-primary' },
    { value: 'secondary', label: t('common.studio.optVariantSecondary'), testId: 'opt-variant-secondary' },
    { value: 'subtle', label: t('common.studio.optVariantSubtle'), testId: 'opt-variant-subtle' },
    { value: 'ghost', label: t('common.studio.optVariantGhost'), testId: 'opt-variant-ghost' },
    { value: 'danger', label: t('common.studio.optVariantDanger'), testId: 'opt-variant-danger' },
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

  const viewOptions: readonly StudioSegmentedOption<ButtonStageView>[] = [
    { value: 'single', label: t('common.studio.viewSingle'), testId: 'opt-view-single' },
    { value: 'all-sizes', label: t('common.studio.viewAllSizes'), testId: 'opt-view-all-sizes' },
  ];

  const iconOptions: readonly StudioSegmentedOption<ButtonIconMode>[] = [
    { value: 'none', label: t('common.studio.iconNone'), testId: 'opt-icon-none' },
    { value: 'start', label: t('common.studio.iconStart'), testId: 'opt-icon-start' },
    { value: 'end', label: t('common.studio.iconEnd'), testId: 'opt-icon-end' },
    { value: 'both', label: t('common.studio.iconBoth'), testId: 'opt-icon-both' },
    { value: 'icon-only', label: t('common.studio.iconOnly'), testId: 'opt-icon-only' },
  ];

  const stateOptions: readonly StudioSegmentedOption<ButtonInteractionState>[] = [
    { value: 'resting', label: t('common.studio.stateResting'), testId: 'opt-state-resting' },
    { value: 'loading', label: t('common.studio.stateLoading'), testId: 'opt-state-loading' },
    { value: 'disabled', label: t('common.studio.stateDisabled'), testId: 'opt-state-disabled' },
  ];

  const touchTargetOptions: readonly StudioSegmentedOption<ButtonTouchTarget>[] = [
    { value: 'auto', label: t('common.studio.touchAuto'), testId: 'opt-touch-auto' },
    { value: 'comfortable', label: t('common.studio.touchComfortable'), testId: 'opt-touch-comfortable' },
  ];

  const buttonTypeOptions: readonly StudioSegmentedOption<'button' | 'submit' | 'reset'>[] = [
    { value: 'button', label: t('common.studio.typeButton'), testId: 'opt-type-button' },
    { value: 'submit', label: t('common.studio.typeSubmit'), testId: 'opt-type-submit' },
    { value: 'reset', label: t('common.studio.typeReset'), testId: 'opt-type-reset' },
  ];

  const renderActiveButton = (overrideSize?: ControlSize, customTestId = 'studio-active-button') => {
    const finalSize = overrideSize ?? resolvedSize;
    const isSingleMainSpecimen = customTestId === 'studio-active-button';

    const commonProps: ButtonProps & { 'data-testid'?: string } = {
      variant,
      size: finalSize,
      touchTarget,
      type: buttonType,
      loading: isLoading,
      disabled: isDisabled,
      startIcon: startIconSlot,
      endIcon: endIconSlot,
      'data-testid': customTestId,
    };

    if (isIconOnly) {
      return (
        <Button
          {...commonProps}
          iconOnly
          ref={isSingleMainSpecimen ? specimenRef : undefined}
          aria-label={t('common.studio.btnIconOnlyAria')}
        >
          <Icon name="check" />
        </Button>
      );
    }

    return (
      <Button
        {...commonProps}
        ref={isSingleMainSpecimen ? specimenRef : undefined}
      >
        {sampleLabelText}
      </Button>
    );
  };

  const allSizesList: readonly ControlSize[] = ['xs', 'sm', 'md', 'lg', 'xl', '2xl'];

  return (
    <GalleryStudioLayout
      activeRoute="button"
      title={t('common.studio.btnTitle')}
      subtitle={t('common.studio.btnSubtitle')}
      testId="button-gallery"
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
            label={t('common.studio.btnVariantLabel')}
            value={variant}
            options={variantOptions}
            onChange={setVariant}
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
            label={t('common.studio.btnIconModeLabel')}
            value={iconMode}
            options={iconOptions}
            onChange={setIconMode}
          />

          <StudioToggleRow
            label={t('common.studio.btnFullWidthLabel')}
            checked={fullWidth}
            onCheckedChange={setFullWidth}
            testId="toggle-button-full-width"
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

          <StudioSegmentedControl
            label={t('common.studio.btnTypeLabel')}
            value={buttonType}
            options={buttonTypeOptions}
            onChange={setButtonType}
          />
        </>
      }
      inspector={
        <GalleryCodeInspector
          aiPrompt={aiAgentPrompt}
          jsxCode={jsxSnippet}
          cssCode={cssModuleSnippet}
          jsxFileName="my-button-action.tsx"
          cssFileName="my-button-action.module.css"
          specGroups={specGroups}
        />
      }
    >
      <div className={styles.stageActionArea}>
        {stageView === 'single' ? (
          <div className={cn(styles.singleSpecimenRow, fullWidth && styles.specimenFullWidth)}>
            {renderActiveButton()}
          </div>
        ) : (
          <div className={styles.allSizesGrid}>
            {allSizesList.map((sz) => (
              <div key={sz} className={styles.sizeCard}>
                <span className={styles.sizeCardLabel}>size=&quot;{sz}&quot;</span>
                {renderActiveButton(sz, `studio-size-button-${sz}`)}
              </div>
            ))}
          </div>
        )}

        {/* Clean, centered semantic variants presentation directly under live preview */}
        <div className={styles.variantsCenterSection}>
          <span className={styles.variantsCenterLabel}>
            {t('common.studio.btnCoreVariantsTitle')}
          </span>
          <div className={styles.variantsCenterRow}>
            {(['primary', 'secondary', 'subtle', 'ghost', 'danger'] as const).map((v) => (
              <div
                key={v}
                className={cn(styles.variantItemWrapper, variant === v && styles.variantItemActive)}
              >
                <Button
                  variant={v}
                  size={resolvedSize}
                  touchTarget={touchTarget}
                  startIcon={hasStartIcon ? renderIcon('check') : undefined}
                  endIcon={hasEndIcon ? renderIcon('arrow-right') : undefined}
                  onClick={() => setVariant(v)}
                  data-testid={`variant-quick-select-${v}`}
                >
                  {v === 'secondary'
                    ? t('common.studio.optVariantSecondary')
                    : v === 'subtle'
                      ? t('common.studio.optVariantSubtle')
                      : v.charAt(0).toUpperCase() + v.slice(1)}
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </GalleryStudioLayout>
  );
}
