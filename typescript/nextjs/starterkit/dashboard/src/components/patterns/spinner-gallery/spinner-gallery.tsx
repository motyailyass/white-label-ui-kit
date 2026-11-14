'use client';

import { useCallback, useEffect, useId, useMemo, useState } from 'react';
import { Spinner, type SpinnerSize, type SpinnerVariant } from '@/components/ui';
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
import styles from './spinner-gallery.module.css';

export type SpinnerSpecimenDirection = 'ltr' | 'rtl';
export type SpinnerStageView = 'single' | 'matrix';

const SPINNER_SIZE_PIXELS: Record<SpinnerSize, string> = {
  xs: '12px',
  sm: '16px',
  md: '20px',
  lg: '24px',
  xl: '32px',
};

const SPINNER_SIZES: readonly SpinnerSize[] = ['xs', 'sm', 'md', 'lg', 'xl'];
const SPINNER_VARIANTS: readonly SpinnerVariant[] = ['default', 'primary', 'current', 'inverse'];

export interface SpinnerGalleryProps {
  linkComponent?: StudioLinkComponent;
}

export function SpinnerGallery({ linkComponent }: SpinnerGalleryProps) {
  const { t, locale, direction } = useI18n();
  const { resolvedTheme } = useTheme();
  const sizesHeadingId = useId();
  const variantsHeadingId = useId();

  // Studio Interactive State
  const [specimenDir, setSpecimenDir] = useState<SpinnerSpecimenDirection>(direction);
  const [stageView, setStageView] = useState<SpinnerStageView>('single');
  const [size, setSize] = useState<SpinnerSize>('md');
  const [variant, setVariant] = useState<SpinnerVariant>('primary');
  const [hasLabel, setHasLabel] = useState(false);

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
    setSize('md');
    setVariant('primary');
    setHasLabel(false);
  }, [direction]);

  const dirOptions: readonly StudioSegmentedOption<SpinnerSpecimenDirection>[] = [
    { value: 'ltr', label: t('common.studio.specimenDirLtr'), testId: 'opt-dir-ltr' },
    { value: 'rtl', label: t('common.studio.specimenDirRtl'), testId: 'opt-dir-rtl' },
  ];

  const viewOptions: readonly StudioSegmentedOption<SpinnerStageView>[] = [
    { value: 'single', label: t('common.studio.spinnerViewSingle'), testId: 'opt-view-single' },
    { value: 'matrix', label: t('common.studio.spinnerViewMatrix'), testId: 'opt-view-matrix' },
  ];

  const sizeOptions: readonly StudioSegmentedOption<SpinnerSize>[] = [
    { value: 'xs', label: t('common.studio.spinnerSizeXs'), testId: 'opt-size-xs' },
    { value: 'sm', label: t('common.studio.spinnerSizeSm'), testId: 'opt-size-sm' },
    { value: 'md', label: t('common.studio.spinnerSizeMd'), testId: 'opt-size-md' },
    { value: 'lg', label: t('common.studio.spinnerSizeLg'), testId: 'opt-size-lg' },
    { value: 'xl', label: t('common.studio.spinnerSizeXl'), testId: 'opt-size-xl' },
  ];

  const variantOptions: readonly StudioSegmentedOption<SpinnerVariant>[] = [
    { value: 'default', label: t('common.studio.spinnerVarDefault'), testId: 'opt-var-default' },
    { value: 'primary', label: t('common.studio.spinnerVarPrimary'), testId: 'opt-var-primary' },
    { value: 'current', label: t('common.studio.spinnerVarCurrent'), testId: 'opt-var-current' },
    { value: 'inverse', label: t('common.studio.spinnerVarInverse'), testId: 'opt-var-inverse' },
  ];

  const variantLabelMap: Record<SpinnerVariant, string> = useMemo(
    () => ({
      default: specimenT('common.studio.spinnerVarDefault'),
      primary: specimenT('common.studio.spinnerVarPrimary'),
      current: specimenT('common.studio.spinnerVarCurrent'),
      inverse: specimenT('common.studio.spinnerVarInverse'),
    }),
    [specimenT],
  );

  const specGroups: StudioSpecGroup[] = useMemo(
    () => [
      {
        title: t('common.studio.spinnerSpecSemantics'),
        items: [
          {
            label: t('common.studio.spinnerSpecRole'),
            value: hasLabel
              ? t('common.studio.spinnerSpecRoleAccessible')
              : t('common.studio.spinnerSpecRoleDecorative'),
          },
          {
            label: t('common.studio.spinnerSpecSize'),
            value: `${size} (${SPINNER_SIZE_PIXELS[size]})`,
          },
          { label: t('common.studio.spinnerSpecVariant'), value: variant },
          {
            label: t('common.studio.spinnerSpecReducedMotion'),
            value: t('common.studio.spinnerSpecReducedMotionVal'),
          },
        ],
      },
      {
        title: t('common.studio.spinnerSpecTheme'),
        items: [
          { label: t('common.studio.spinnerSpecThemeVal'), value: resolvedTheme },
          {
            label: t('common.studio.spinnerSpecTransform'),
            value: t('common.studio.spinnerSpecTransformVal'),
          },
        ],
      },
    ],
    [hasLabel, size, variant, resolvedTheme, t],
  );

  const jsxSnippet = useMemo(() => {
    const sizeProp = size !== 'md' ? `\n  size="${size}"` : '';
    const varProp = variant !== 'default' ? `\n  variant="${variant}"` : '';
    const labelProp = hasLabel
      ? `\n  label={t('common.studio.spinnerSnippetLabel')}\n  showLabel`
      : '';

    return `<Spinner${sizeProp}${varProp}${labelProp}\n/>`;
  }, [size, variant, hasLabel]);

  const cssModuleSnippet = `.loadingWrapper {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
}`;

  const aiAgentPrompt = useMemo(
    () => `Render a pure white-label Spinner:
- Size: ${size} (${SPINNER_SIZE_PIXELS[size]})
- Variant: ${variant}
- Accessible announcement: ${hasLabel ? `role="status", aria-live="polite", showLabel={true}, localized label via t()` : 'decorative (aria-hidden="true")'}
- Theme: ${resolvedTheme}
- 100% SVG geometry, zero dashboard shadows, reduced-motion safe.`,
    [size, variant, hasLabel, resolvedTheme],
  );

  return (
    <GalleryStudioLayout
      activeRoute="spinner"
      title={t('common.studio.spinnerTitle')}
      subtitle={t('common.studio.spinnerSubtitle')}
      testId="spinner-studio"
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
            label={t('common.studio.spinnerViewModeLabel')}
            value={stageView}
            options={viewOptions}
            onChange={setStageView}
          />

          {stageView === 'single' && (
            <>
              <StudioSegmentedControl
                label={t('common.studio.spinnerSizeLabel')}
                value={size}
                options={sizeOptions}
                onChange={setSize}
                columns={2}
              />

              <StudioSegmentedControl
                label={t('common.studio.spinnerVariantLabel')}
                value={variant}
                options={variantOptions}
                onChange={setVariant}
                columns={2}
              />

              <hr className={styles.controlDivider} />

              <StudioToggleRow
                label={t('common.studio.spinnerToggleLabel')}
                checked={hasLabel}
                onCheckedChange={setHasLabel}
                testId="toggle-spinner-label"
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
          jsxFileName="loading-spinner.tsx"
          cssFileName="loading-spinner.module.css"
          specGroups={specGroups}
        />
      }
    >
      <div
        className={cn(styles.canvasArea, specimenDir === 'rtl' && styles.canvasRtl)}
        dir={specimenDir}
        lang={specimenLangAttr}
        data-testid="spinner-canvas"
      >
        {stageView === 'single' ? (
          <div
            className={cn(
              styles.specimenCard,
              variant === 'inverse' && styles.inverseStage,
              variant === 'current' && styles.currentStage,
            )}
          >
            <div className={styles.specimenStage}>
              <Spinner
                size={size}
                variant={variant}
                label={hasLabel ? specimenT('common.studio.spinnerLoadingLabel') : undefined}
                showLabel={hasLabel}
                data-testid="specimen-spinner"
              />
            </div>
          </div>
        ) : (
          <div className={styles.sectionBlock} data-testid="spinner-matrix-grid">
            <section className={styles.sectionBlock} aria-labelledby={sizesHeadingId}>
              <h2 id={sizesHeadingId} className={styles.sectionHeading}>
                {specimenT('common.studio.spinnerMatrixSizesHeading')}
              </h2>
              <div className={styles.specimenGrid}>
                {SPINNER_SIZES.map((s) => (
                  <div key={s} className={styles.showcaseCard}>
                    <div className={styles.scaleItem}>
                      <Spinner
                        size={s}
                        variant="primary"
                        label={specimenT('common.studio.spinnerLoadingLabel')}
                        data-testid={`matrix-spinner-size-${s}`}
                      />
                      <span className={styles.scaleLabel}>
                        <BidiText dir="ltr">
                          {`${s.toUpperCase()} (${SPINNER_SIZE_PIXELS[s]})`}
                        </BidiText>
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className={styles.sectionBlock} aria-labelledby={variantsHeadingId}>
              <h2 id={variantsHeadingId} className={styles.sectionHeading}>
                {specimenT('common.studio.spinnerMatrixVariantsHeading')}
              </h2>
              <div className={styles.specimenGrid}>
                {SPINNER_VARIANTS.map((v) => (
                  <div
                    key={v}
                    className={cn(
                      styles.showcaseCard,
                      v === 'inverse' && styles.inverseStage,
                      v === 'current' && styles.currentStage,
                    )}
                  >
                    <div className={styles.scaleItem}>
                      <Spinner
                        size="lg"
                        variant={v}
                        label={specimenT('common.studio.spinnerLoadingLabel')}
                        data-testid={`matrix-spinner-variant-${v}`}
                      />
                      <span
                        className={cn(styles.scaleLabel, v === 'inverse' && styles.inverseLabel)}
                      >
                        {variantLabelMap[v]}
                      </span>
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
