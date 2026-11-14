'use client';

import { useCallback, useEffect, useId, useMemo, useState } from 'react';
import { Skeleton, type SkeletonAnimation, type SkeletonVariant } from '@/components/ui';
import {
  BidiText,
  defaultMessages,
  type SupportedLocale,
  translate,
  type TranslationKey,
} from '@/i18n';
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
import styles from './skeleton-gallery.module.css';

export type SkeletonSpecimenDirection = 'ltr' | 'rtl';
export type SkeletonStageView = 'single' | 'matrix';

const SKELETON_VARIANTS: readonly SkeletonVariant[] = [
  'text',
  'circular',
  'rounded',
  'rectangular',
];
const SKELETON_ANIMATIONS: readonly SkeletonAnimation[] = ['pulse', 'wave', 'none'];

export interface SkeletonGalleryProps {
  linkComponent?: StudioLinkComponent;
}

export function SkeletonGallery({ linkComponent }: SkeletonGalleryProps) {
  const { t, locale, direction } = useI18n();
  const { resolvedTheme } = useTheme();
  const variantsHeadingId = useId();
  const animationsHeadingId = useId();

  // Studio Interactive State
  const [specimenDir, setSpecimenDir] = useState<SkeletonSpecimenDirection>(direction);
  const [stageView, setStageView] = useState<SkeletonStageView>('single');
  const [variant, setVariant] = useState<SkeletonVariant>('rounded');
  const [animation, setAnimation] = useState<SkeletonAnimation>('pulse');
  const [isSimulatedLoaded, setIsSimulatedLoaded] = useState(false);

  useEffect(() => {
    setSpecimenDir(direction);
  }, [direction]);

  const specimenLocale: SupportedLocale =
    specimenDir === 'rtl' ? 'ar' : locale === 'ar' ? 'en' : locale;
  const specimenLangAttr = specimenLocale !== locale ? specimenLocale : undefined;
  const specimenT = useCallback(
    (key: TranslationKey) => translate(defaultMessages, specimenLocale, key),
    [specimenLocale],
  );

  const handleReset = useCallback(() => {
    setSpecimenDir(direction);
    setStageView('single');
    setVariant('rounded');
    setAnimation('pulse');
    setIsSimulatedLoaded(false);
  }, [direction]);

  const dirOptions: readonly StudioSegmentedOption<SkeletonSpecimenDirection>[] = [
    { value: 'ltr', label: t('common.studio.specimenDirLtr'), testId: 'opt-dir-ltr' },
    { value: 'rtl', label: t('common.studio.specimenDirRtl'), testId: 'opt-dir-rtl' },
  ];

  const viewOptions: readonly StudioSegmentedOption<SkeletonStageView>[] = [
    { value: 'single', label: t('common.studio.skeletonViewSingle'), testId: 'opt-view-single' },
    { value: 'matrix', label: t('common.studio.skeletonViewMatrix'), testId: 'opt-view-matrix' },
  ];

  const variantOptions: readonly StudioSegmentedOption<SkeletonVariant>[] = [
    { value: 'text', label: t('common.studio.skeletonVarText'), testId: 'opt-var-text' },
    {
      value: 'circular',
      label: t('common.studio.skeletonVarCircular'),
      testId: 'opt-var-circular',
    },
    { value: 'rounded', label: t('common.studio.skeletonVarRounded'), testId: 'opt-var-rounded' },
    {
      value: 'rectangular',
      label: t('common.studio.skeletonVarRectangular'),
      testId: 'opt-var-rectangular',
    },
  ];

  const animationOptions: readonly StudioSegmentedOption<SkeletonAnimation>[] = [
    { value: 'pulse', label: t('common.studio.skeletonAnimPulse'), testId: 'opt-anim-pulse' },
    { value: 'wave', label: t('common.studio.skeletonAnimWave'), testId: 'opt-anim-wave' },
    { value: 'none', label: t('common.studio.skeletonAnimNone'), testId: 'opt-anim-none' },
  ];

  const variantLabelMap: Record<SkeletonVariant, string> = useMemo(
    () => ({
      text: specimenT('common.studio.skeletonVarText'),
      circular: specimenT('common.studio.skeletonVarCircular'),
      rounded: specimenT('common.studio.skeletonVarRounded'),
      rectangular: specimenT('common.studio.skeletonVarRectangular'),
    }),
    [specimenT],
  );

  const animationLabelMap: Record<SkeletonAnimation, string> = useMemo(
    () => ({
      pulse: specimenT('common.studio.skeletonAnimPulse'),
      wave: specimenT('common.studio.skeletonAnimWave'),
      none: specimenT('common.studio.skeletonAnimNone'),
    }),
    [specimenT],
  );

  const specGroups: StudioSpecGroup[] = useMemo(
    () => [
      {
        title: t('common.studio.skeletonSpecGeometry'),
        items: [
          { label: t('common.studio.skeletonSpecVariant'), value: variant },
          { label: t('common.studio.skeletonSpecAnimation'), value: animation },
          { label: t('common.studio.skeletonSpecAriaRole'), value: 'aria-hidden="true"' },
          { label: t('common.studio.skeletonSpecDirection'), value: specimenDir.toUpperCase() },
        ],
      },
      {
        title: t('common.studio.skeletonSpecTheme'),
        items: [
          { label: t('common.studio.skeletonSpecThemeVal'), value: resolvedTheme },
          {
            label: t('common.studio.skeletonSpecSurfaceToken'),
            value: '--color-border-subtle',
          },
          {
            label: t('common.studio.skeletonSpecClsProtection'),
            value: t('common.studio.skeletonSpecClsValue'),
          },
        ],
      },
    ],
    [variant, animation, specimenDir, resolvedTheme, t],
  );

  const jsxSnippet = useMemo(() => {
    const varProp = variant !== 'text' ? `\n  variant="${variant}"` : '';
    const animProp = animation !== 'pulse' ? `\n  animation="${animation}"` : '';
    const widthProp =
      variant === 'circular'
        ? `\n  width={64}\n  height={64}`
        : `\n  width="100%"\n  height={${variant === 'text' ? 24 : 96}}`;

    return `<Skeleton${varProp}${animProp}${widthProp}\n/>`;
  }, [variant, animation]);

  const cssModuleSnippet = `.skeletonWrapper {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  inline-size: 100%;
}`;

  const aiAgentPrompt = useMemo(
    () => `Render a pure white-label Skeleton loading placeholder:
- Variant: ${variant}
- Animation: ${animation}
- Screen reader isolation: aria-hidden="true"
- Theme: ${resolvedTheme}
- Fill token: --color-border-subtle, zero dashboard shadows, reduced-motion safe.`,
    [variant, animation, resolvedTheme],
  );

  return (
    <GalleryStudioLayout
      activeRoute="skeleton"
      title={t('common.studio.skeletonTitle')}
      subtitle={t('common.studio.skeletonSubtitle')}
      testId="skeleton-studio"
      linkComponent={linkComponent}
      onReset={handleReset}
      controls={
        <div className={styles.controlGroup}>
          <StudioSegmentedControl
            label={t('common.studio.specimenDirectionLabel')}
            value={specimenDir}
            options={dirOptions}
            onChange={setSpecimenDir}
          />

          <StudioSegmentedControl
            label={t('common.studio.skeletonViewModeLabel')}
            value={stageView}
            options={viewOptions}
            onChange={setStageView}
          />

          {stageView === 'single' && (
            <>
              <StudioSegmentedControl
                label={t('common.studio.skeletonShapeLabel')}
                value={variant}
                options={variantOptions}
                onChange={setVariant}
                columns={2}
              />

              <StudioSegmentedControl
                label={t('common.studio.skeletonAnimationLabel')}
                value={animation}
                options={animationOptions}
                onChange={setAnimation}
              />

              <hr className={styles.controlDivider} />

              <StudioToggleRow
                label={t('common.studio.skeletonToggleLoaded')}
                checked={isSimulatedLoaded}
                onCheckedChange={setIsSimulatedLoaded}
                testId="toggle-skeleton-loaded"
              />
            </>
          )}
        </div>
      }
      inspector={
        <GalleryCodeInspector
          aiPrompt={aiAgentPrompt}
          jsxCode={jsxSnippet}
          cssCode={cssModuleSnippet}
          jsxFileName="card-skeleton.tsx"
          cssFileName="card-skeleton.module.css"
          specGroups={specGroups}
        />
      }
    >
      <div
        className={cn(styles.canvasArea, specimenDir === 'rtl' && styles.canvasRtl)}
        dir={specimenDir}
        lang={specimenLangAttr}
        data-testid="skeleton-canvas"
      >
        {stageView === 'single' ? (
          <div className={styles.specimenCard} data-testid="skeleton-specimen-card">
            <div className={styles.specimenStage}>
              {!isSimulatedLoaded ? (
                <Skeleton
                  variant={variant}
                  animation={animation}
                  width={variant === 'circular' ? 64 : '100%'}
                  height={variant === 'circular' ? 64 : variant === 'text' ? '1.5rem' : 96}
                  data-testid="specimen-skeleton"
                />
              ) : (
                <p className={styles.loadedText} data-testid="specimen-loaded">
                  {specimenT('common.studio.skeletonLoadedContent')}
                </p>
              )}
            </div>
          </div>
        ) : (
          <div className={styles.sectionBlock} data-testid="skeleton-matrix-grid">
            <section className={styles.sectionBlock} aria-labelledby={variantsHeadingId}>
              <h2 id={variantsHeadingId} className={styles.sectionHeading}>
                {specimenT('common.studio.skeletonMatrixVariantsHeading')}
              </h2>
              <div className={styles.specimenGrid}>
                {SKELETON_VARIANTS.map((v) => (
                  <div key={v} className={styles.showcaseCard}>
                    <span className={styles.showcaseLabel}>
                      {variantLabelMap[v]} (<BidiText dir="ltr">{v}</BidiText>)
                    </span>
                    <div className={styles.matrixStage}>
                      <Skeleton
                        variant={v}
                        animation={animation}
                        width={v === 'circular' ? 48 : '100%'}
                        height={v === 'circular' ? 48 : v === 'text' ? '1.25rem' : 64}
                        data-testid={`matrix-skeleton-var-${v}`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className={styles.sectionBlock} aria-labelledby={animationsHeadingId}>
              <h2 id={animationsHeadingId} className={styles.sectionHeading}>
                {specimenT('common.studio.skeletonMatrixAnimationsHeading')}
              </h2>
              <div className={styles.specimenGrid}>
                {SKELETON_ANIMATIONS.map((anim) => (
                  <div key={anim} className={styles.showcaseCard}>
                    <span className={styles.showcaseLabel}>
                      {animationLabelMap[anim]} (<BidiText dir="ltr">{anim}</BidiText>)
                    </span>
                    <div className={styles.matrixStage}>
                      <Skeleton
                        variant="rounded"
                        animation={anim}
                        width="100%"
                        height={64}
                        data-testid={`matrix-skeleton-anim-${anim}`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}
      </div>
    </GalleryStudioLayout>
  );
}
