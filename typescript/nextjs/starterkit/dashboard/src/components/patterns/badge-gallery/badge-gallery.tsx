'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Icon } from '@/components/icons';
import { Badge, type BadgeShape, type BadgeSize, type BadgeVariant, Button } from '@/components/ui';
import { defaultMessages, translate, type SupportedLocale, type TranslationKey } from '@/i18n';
import { useI18n } from '@/providers';
import {
  GalleryCodeInspector,
  GalleryStudioLayout,
  type StudioLinkComponent,
  StudioSegmentedControl,
  type StudioSegmentedOption,
  type StudioSpecGroup,
  StudioToggleRow,
} from '../gallery-studio';
import styles from './badge-gallery.module.css';

export type BadgeSpecimenDirection = 'ltr' | 'rtl';
export type BadgeStageView = 'single' | 'matrix';

export interface BadgeGalleryProps {
  linkComponent?: StudioLinkComponent;
}

export function BadgeGallery({ linkComponent }: BadgeGalleryProps) {
  const { t, locale, direction } = useI18n();

  // Studio Interactive State
  const [specimenDir, setSpecimenDir] = useState<BadgeSpecimenDirection>(direction);
  const [stageView, setStageView] = useState<BadgeStageView>('single');
  const [variant, setVariant] = useState<BadgeVariant>('primary');
  const [size, setSize] = useState<BadgeSize>('md');
  const [shape, setShape] = useState<BadgeShape>('pill');
  const [hasDot, setHasDot] = useState(false);
  const [hasDotPulse, setHasDotPulse] = useState(false);
  const [hasIcon, setHasIcon] = useState(false);
  const [isDismissible, setIsDismissible] = useState(false);
  const [isRemoved, setIsRemoved] = useState(false);

  // Sync specimen preview direction when global LanguageSwitcher changes direction
  useEffect(() => {
    setSpecimenDir(direction);
  }, [direction]);

  const handleReset = useCallback(() => {
    setSpecimenDir(direction);
    setStageView('single');
    setVariant('primary');
    setSize('md');
    setShape('pill');
    setHasDot(false);
    setHasDotPulse(false);
    setHasIcon(false);
    setIsDismissible(false);
    setIsRemoved(false);
  }, [direction]);

  const effectiveDotPulse = hasDot && hasDotPulse;

  const specimenLocale: SupportedLocale =
    specimenDir === 'rtl' ? 'ar' : locale === 'ar' ? 'en' : locale;
  const specimenLangAttr = specimenLocale !== locale ? specimenLocale : undefined;
  const specimenT = useCallback(
    (key: TranslationKey) => translate(defaultMessages, specimenLocale, key),
    [specimenLocale],
  );

  // Options for segmented controls
  const dirOptions: readonly StudioSegmentedOption<BadgeSpecimenDirection>[] = useMemo(
    () => [
      { value: 'ltr', label: t('common.studio.specimenDirLtr'), testId: 'opt-dir-ltr' },
      { value: 'rtl', label: t('common.studio.specimenDirRtl'), testId: 'opt-dir-rtl' },
    ],
    [t],
  );

  const stageViewOptions: readonly StudioSegmentedOption<BadgeStageView>[] = useMemo(
    () => [
      { value: 'single', label: t('common.studio.badgeViewSingle'), testId: 'opt-view-single' },
      { value: 'matrix', label: t('common.studio.badgeViewMatrix'), testId: 'opt-view-matrix' },
    ],
    [t],
  );

  const variantOptions: readonly StudioSegmentedOption<BadgeVariant>[] = useMemo(
    () => [
      {
        value: 'default',
        label: t('common.studio.badgeVariantDefault'),
        testId: 'opt-variant-default',
      },
      {
        value: 'primary',
        label: t('common.studio.badgeVariantPrimary'),
        testId: 'opt-variant-primary',
      },
      {
        value: 'success',
        label: t('common.studio.badgeVariantSuccess'),
        testId: 'opt-variant-success',
      },
      {
        value: 'warning',
        label: t('common.studio.badgeVariantWarning'),
        testId: 'opt-variant-warning',
      },
      {
        value: 'danger',
        label: t('common.studio.badgeVariantDanger'),
        testId: 'opt-variant-danger',
      },
      { value: 'info', label: t('common.studio.badgeVariantInfo'), testId: 'opt-variant-info' },
      {
        value: 'outline',
        label: t('common.studio.badgeVariantOutline'),
        testId: 'opt-variant-outline',
      },
    ],
    [t],
  );

  const sizeOptions: readonly StudioSegmentedOption<BadgeSize>[] = useMemo(
    () => [
      { value: 'sm', label: t('common.studio.badgeSizeSm'), testId: 'opt-size-sm' },
      { value: 'md', label: t('common.studio.badgeSizeMd'), testId: 'opt-size-md' },
      { value: 'lg', label: t('common.studio.badgeSizeLg'), testId: 'opt-size-lg' },
    ],
    [t],
  );

  const shapeOptions: readonly StudioSegmentedOption<BadgeShape>[] = useMemo(
    () => [
      { value: 'pill', label: t('common.studio.badgeShapePill'), testId: 'opt-shape-pill' },
      {
        value: 'rounded',
        label: t('common.studio.badgeShapeRounded'),
        testId: 'opt-shape-rounded',
      },
    ],
    [t],
  );

  const activeLabel = specimenT('common.studio.badgeSampleActiveLabel');
  const removeAriaLabel = specimenT('common.studio.badgeRemoveAria');

  // Dynamic JSX Snippet
  const jsxSnippet = useMemo(() => {
    const imports = [
      `import { Badge } from '@/components/ui';`,
      hasIcon ? `import { Icon } from '@/components/icons';` : null,
    ]
      .filter(Boolean)
      .join('\n');

    const propsList: string[] = [];
    if (variant !== 'default') propsList.push(`variant="${variant}"`);
    if (size !== 'md') propsList.push(`size="${size}"`);
    if (shape !== 'pill') propsList.push(`shape="${shape}"`);
    if (hasDot) propsList.push('dot');
    if (effectiveDotPulse) propsList.push('dotPulse');
    if (hasIcon) propsList.push('startIcon={<Icon name="feature" />}');
    if (isDismissible) {
      propsList.push('onRemove={handleRemove}');
      propsList.push(`removeAriaLabel="${removeAriaLabel}"`);
    }

    const formattedProps =
      propsList.length === 0
        ? ''
        : propsList.length <= 2
          ? ` ${propsList.join(' ')}`
          : `\n      ${propsList.join('\n      ')}\n    `;

    return `${imports}

export function StatusBadge() {
  return (
    <Badge${formattedProps}>
      ${activeLabel}
    </Badge>
  );
}`;
  }, [
    variant,
    size,
    shape,
    hasDot,
    effectiveDotPulse,
    hasIcon,
    isDismissible,
    activeLabel,
    removeAriaLabel,
  ]);

  const aiAgentPrompt = useMemo(() => {
    return `Implement a white-label status badge using the kit's pure Badge primitive:

\`\`\`tsx
${jsxSnippet}
\`\`\`

Requirements & Tokens:
- Pure UI Boundary: Consume \`Badge\` from \`@/components/ui\`.
- Variant: ${variant} using semantic surface and status color tokens.
- Density: ${size} (${size === 'sm' ? '20px / 1.25rem' : size === 'md' ? '24px / 1.5rem' : '28px / 1.75rem'} minimum block size).
- Shape: ${shape} (${shape === 'pill' ? 'var(--radius-full)' : 'var(--radius-control)'}).
- Tabular Numbers: Numerical counters apply \`font-variant-numeric: tabular-nums\`.
- Reduced Motion & RTL: Respect \`prefers-reduced-motion: reduce\` on dotPulse and Arabic line-height clearance.
- Shadow Policy: 100% shadow-free in both Dashboard and Website starters.
`;
  }, [jsxSnippet, variant, size, shape]);

  // Measured Spec Groups (100% Localized)
  const specGroups: readonly StudioSpecGroup[] = useMemo(() => {
    const heightMap: Record<BadgeSize, string> = {
      sm: '20px (1.25rem)',
      md: '24px (1.5rem)',
      lg: '28px (1.75rem)',
    };
    const fontMap: Record<BadgeSize, string> = {
      sm: '12px (var(--font-size-xs))',
      md: '12px (var(--font-size-xs))',
      lg: '14px (var(--font-size-sm))',
    };

    const variantLabelMap: Record<BadgeVariant, string> = {
      default: t('common.studio.badgeVariantDefault'),
      primary: t('common.studio.badgeVariantPrimary'),
      success: t('common.studio.badgeVariantSuccess'),
      warning: t('common.studio.badgeVariantWarning'),
      danger: t('common.studio.badgeVariantDanger'),
      info: t('common.studio.badgeVariantInfo'),
      outline: t('common.studio.badgeVariantOutline'),
    };

    return [
      {
        title: t('common.studio.specCategoryVariant'),
        items: [
          { label: t('common.studio.badgeSpecVariant'), value: variantLabelMap[variant] },
          { label: t('common.studio.badgeSpecSize'), value: size },
          {
            label: t('common.studio.badgeSpecShape'),
            value:
              shape === 'pill'
                ? t('common.studio.badgeShapePill')
                : t('common.studio.badgeShapeRounded'),
          },
          {
            label: t('common.studio.badgeSpecDot'),
            value: hasDot ? t('common.studio.enabled') : t('common.studio.disabledOption'),
          },
          {
            label: t('common.studio.badgeSpecDotPulse'),
            value: effectiveDotPulse
              ? t('common.studio.enabled')
              : t('common.studio.disabledOption'),
          },
          {
            label: t('common.studio.badgeSpecDismissible'),
            value: isDismissible ? t('common.studio.enabled') : t('common.studio.disabledOption'),
          },
        ],
      },
      {
        title: t('common.studio.specCategoryTokens'),
        items: [
          { label: t('common.studio.badgeSpecMinBlockSize'), value: heightMap[size] },
          { label: t('common.studio.badgeSpecFontSize'), value: fontMap[size] },
          {
            label: t('common.studio.specRadius'),
            value:
              shape === 'pill'
                ? t('common.studio.badgeSpecRadiusPill')
                : t('common.studio.badgeSpecRadiusRounded'),
          },
          {
            label: t('common.studio.badgeSpecNumerals'),
            value: t('common.studio.badgeSpecNumeralsValue'),
          },
          {
            label: t('common.studio.badgeSpecShadowPolicy'),
            value: t('common.studio.badgeSpecShadowValue'),
          },
        ],
      },
    ];
  }, [variant, size, shape, hasDot, effectiveDotPulse, isDismissible, t]);

  return (
    <GalleryStudioLayout
      activeRoute="badge"
      title={t('common.studio.badgeTitle')}
      subtitle={t('common.studio.badgeSubtitle')}
      testId="badge-studio"
      previewDir={specimenDir}
      onReset={handleReset}
      linkComponent={linkComponent}
      controls={
        <div className={styles.controlsPanel}>
          <StudioSegmentedControl
            label={t('common.studio.specimenDirectionLabel')}
            value={specimenDir}
            options={dirOptions}
            onChange={setSpecimenDir}
          />

          <StudioSegmentedControl
            label={t('common.studio.badgeCanvasViewLabel')}
            value={stageView}
            options={stageViewOptions}
            onChange={setStageView}
          />

          <StudioSegmentedControl
            label={t('common.studio.badgeVariantLabel')}
            value={variant}
            options={variantOptions}
            onChange={setVariant}
          />

          <StudioSegmentedControl
            label={t('common.studio.badgeSizeLabel')}
            value={size}
            options={sizeOptions}
            onChange={setSize}
          />

          <StudioSegmentedControl
            label={t('common.studio.badgeShapeLabel')}
            value={shape}
            options={shapeOptions}
            onChange={setShape}
          />

          <hr className={styles.controlDivider} />

          <StudioToggleRow
            label={t('common.studio.badgeDotToggle')}
            checked={hasDot}
            onCheckedChange={(checked) => {
              setHasDot(checked);
              if (!checked) {
                setHasDotPulse(false);
              }
            }}
            testId="toggle-badge-dot"
          />

          {hasDot && (
            <StudioToggleRow
              label={t('common.studio.badgeDotPulseToggle')}
              checked={hasDotPulse}
              onCheckedChange={setHasDotPulse}
              testId="toggle-badge-dot-pulse"
            />
          )}

          <StudioToggleRow
            label={t('common.studio.badgeIconToggle')}
            checked={hasIcon}
            onCheckedChange={setHasIcon}
            testId="toggle-badge-icon"
          />

          <StudioToggleRow
            label={t('common.studio.badgeDismissibleToggle')}
            checked={isDismissible}
            onCheckedChange={(checked) => {
              setIsDismissible(checked);
              setIsRemoved(false);
            }}
            testId="toggle-badge-dismissible"
          />
        </div>
      }
      inspector={
        <GalleryCodeInspector
          aiPrompt={aiAgentPrompt}
          jsxCode={jsxSnippet}
          cssCode={null}
          jsxFileName="status-badge.tsx"
          cssFileName="status-badge.module.css"
          specGroups={specGroups}
        />
      }
    >
      <div className={styles.canvasArea} dir={specimenDir} lang={specimenLangAttr}>
        {stageView === 'single' ? (
          <div className={styles.specimenCard}>
            <div className={styles.specimenStage}>
              {!isRemoved ? (
                <Badge
                  data-testid="studio-badge"
                  variant={variant}
                  size={size}
                  shape={shape}
                  dot={hasDot}
                  dotPulse={effectiveDotPulse}
                  startIcon={hasIcon ? <Icon name="feature" /> : undefined}
                  onRemove={isDismissible ? () => setIsRemoved(true) : undefined}
                  removeAriaLabel={isDismissible ? removeAriaLabel : undefined}
                >
                  {activeLabel}
                </Badge>
              ) : (
                <Button
                  data-testid="studio-restore-badge"
                  variant="subtle"
                  size="xs"
                  onClick={() => setIsRemoved(false)}
                >
                  {specimenT('common.studio.badgeRestoreBtn')}
                </Button>
              )}
            </div>
          </div>
        ) : (
          <div className={styles.matrixGrid} data-testid="badge-matrix-grid">
            <div className={styles.matrixCard}>
              <h3 className={styles.matrixCardTitle}>
                {specimenT('common.studio.badgeMatrixVariantsTitle')}
              </h3>
              <div className={styles.matrixCardContent}>
                <Badge variant="default" shape={shape}>
                  {specimenT('common.studio.badgeVariantDefault')}
                </Badge>
                <Badge variant="primary" shape={shape}>
                  {specimenT('common.studio.badgeVariantPrimary')}
                </Badge>
                <Badge variant="success" shape={shape}>
                  {specimenT('common.studio.badgeVariantSuccess')}
                </Badge>
                <Badge variant="warning" shape={shape}>
                  {specimenT('common.studio.badgeVariantWarning')}
                </Badge>
                <Badge variant="danger" shape={shape}>
                  {specimenT('common.studio.badgeVariantDanger')}
                </Badge>
                <Badge variant="info" shape={shape}>
                  {specimenT('common.studio.badgeVariantInfo')}
                </Badge>
                <Badge variant="outline" shape={shape}>
                  {specimenT('common.studio.badgeVariantOutline')}
                </Badge>
              </div>
            </div>

            <div className={styles.matrixCard}>
              <h3 className={styles.matrixCardTitle}>
                {specimenT('common.studio.badgeMatrixSizesTitle')}
              </h3>
              <div className={styles.matrixCardContent}>
                <Badge size="sm" variant={variant} shape={shape}>
                  {specimenT('common.studio.badgeSizeSm')}
                </Badge>
                <Badge size="md" variant={variant} shape={shape}>
                  {specimenT('common.studio.badgeSizeMd')}
                </Badge>
                <Badge size="lg" variant={variant} shape={shape}>
                  {specimenT('common.studio.badgeSizeLg')}
                </Badge>
              </div>
            </div>

            <div className={styles.matrixCard}>
              <h3 className={styles.matrixCardTitle}>
                {specimenT('common.studio.badgeMatrixStatusTitle')}
              </h3>
              <div className={styles.matrixCardContent}>
                <Badge variant="success" dot dotPulse>
                  {specimenT('common.studio.badgeStatusOperational')}
                </Badge>
                <Badge variant="warning" dot>
                  {specimenT('common.studio.badgeStatusDegraded')}
                </Badge>
                <Badge variant="danger" dot>
                  {specimenT('common.studio.badgeStatusOutage')}
                </Badge>
                <Badge variant="info" dot dotPulse>
                  {specimenT('common.studio.badgeStatusBuilding')}
                </Badge>
                <Badge variant="default" size="sm">
                  3
                </Badge>
                <Badge variant="primary" size="sm">
                  42
                </Badge>
                <Badge variant="danger" size="sm">
                  99+
                </Badge>
                <Badge variant="outline" size="md">
                  1,280
                </Badge>
              </div>
            </div>
          </div>
        )}
      </div>
    </GalleryStudioLayout>
  );
}
