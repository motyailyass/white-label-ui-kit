'use client';

import { useCallback, useEffect, useId, useMemo, useState } from 'react';
import { Progress, type ProgressSize, type ProgressVariant } from '@/components/ui';
import {
  defaultMessages,
  formatNumber,
  type SupportedLocale,
  type TranslationKey,
  translate,
} from '@/i18n';
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
import styles from './progress-gallery.module.css';

export interface ProgressGalleryProps {
  linkComponent?: StudioLinkComponent;
}

const DEFAULT_VALUE = 75;
const PRESET_VALUES = [0, 25, 50, 75, 100] as const;

const RAMP_VARIANTS: readonly {
  variant: ProgressVariant;
  tagKey: TranslationKey;
  labelKey: TranslationKey;
}[] = [
  {
    variant: 'default',
    tagKey: 'common.studio.progressMatrixDefaultTag',
    labelKey: 'common.studio.progressMatrixDefaultLabel',
  },
  {
    variant: 'success',
    tagKey: 'common.studio.progressVariantSuccess',
    labelKey: 'common.studio.progressMatrixSuccessLabel',
  },
  {
    variant: 'warning',
    tagKey: 'common.studio.progressVariantWarning',
    labelKey: 'common.studio.progressMatrixWarningLabel',
  },
  {
    variant: 'danger',
    tagKey: 'common.studio.progressVariantDanger',
    labelKey: 'common.studio.progressMatrixDangerLabel',
  },
] as const;

export function ProgressGallery({ linkComponent }: ProgressGalleryProps) {
  const { t, locale, direction } = useI18n();
  const rampHeadingId = useId();

  const [specimenDir, setSpecimenDir] = useState<'ltr' | 'rtl'>(direction);
  const [value, setValue] = useState<number>(DEFAULT_VALUE);
  const [isIndeterminate, setIsIndeterminate] = useState<boolean>(false);
  const [size, setSize] = useState<ProgressSize>('md');
  const [variant, setVariant] = useState<ProgressVariant>('default');
  const [showLabel, setShowLabel] = useState<boolean>(true);
  const [showValue, setShowValue] = useState<boolean>(true);

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
    setValue(DEFAULT_VALUE);
    setIsIndeterminate(false);
    setSize('md');
    setVariant('default');
    setShowLabel(true);
    setShowValue(true);
  }, [direction]);

  const dirOptions: readonly StudioSegmentedOption<'ltr' | 'rtl'>[] = useMemo(
    () => [
      { value: 'ltr', label: t('common.studio.specimenDirLtr'), testId: 'progress-dir-ltr' },
      { value: 'rtl', label: t('common.studio.specimenDirRtl'), testId: 'progress-dir-rtl' },
    ],
    [t],
  );

  const sizeOptions: readonly StudioSegmentedOption<ProgressSize>[] = useMemo(
    () => [
      { value: 'sm', label: t('common.studio.progressSizeSm'), testId: 'progress-size-sm' },
      { value: 'md', label: t('common.studio.progressSizeMd'), testId: 'progress-size-md' },
      { value: 'lg', label: t('common.studio.progressSizeLg'), testId: 'progress-size-lg' },
    ],
    [t],
  );

  const variantOptions: readonly StudioSegmentedOption<ProgressVariant>[] = useMemo(
    () => [
      {
        value: 'default',
        label: t('common.studio.progressVariantDefault'),
        testId: 'progress-variant-default',
      },
      {
        value: 'success',
        label: t('common.studio.progressVariantSuccess'),
        testId: 'progress-variant-success',
      },
      {
        value: 'warning',
        label: t('common.studio.progressVariantWarning'),
        testId: 'progress-variant-warning',
      },
      {
        value: 'danger',
        label: t('common.studio.progressVariantDanger'),
        testId: 'progress-variant-danger',
      },
    ],
    [t],
  );

  const presetOptions: readonly StudioSegmentedOption<string>[] = useMemo(
    () =>
      PRESET_VALUES.map((step) => ({
        value: String(step),
        label: `${formatNumber(step, locale)}%`,
        testId: `progress-preset-${step}`,
      })),
    [locale],
  );

  const specGroups: readonly StudioSpecGroup[] = useMemo(
    () => [
      {
        title: t('common.studio.specCategoryVariant'),
        items: [
          { label: t('common.studio.progressDensityLabel'), value: size },
          { label: t('common.studio.progressVariantLabel'), value: variant },
          {
            label: t('common.studio.progressToggleIndeterminate'),
            value: isIndeterminate ? t('common.studio.enabled') : `${value}%`,
          },
          {
            label: t('common.studio.specTrackSize'),
            value: size === 'sm' ? '4px' : size === 'lg' ? '12px' : '8px',
          },
        ],
      },
      {
        title: t('common.studio.specCategoryTokens'),
        items: [
          { label: t('common.studio.specBackgroundColor'), value: 'var(--color-border-subtle)' },
          { label: t('common.studio.specRadius'), value: 'var(--radius-full)' },
          { label: t('common.studio.specDirection'), value: specimenDir.toUpperCase() },
          { label: t('common.studio.specLocale'), value: specimenLocale },
        ],
      },
    ],
    [isIndeterminate, size, specimenDir, specimenLocale, t, value, variant],
  );

  const specimenLabel = specimenT('common.studio.progressSpecimenLabel');
  const specimenIndeterminateText = specimenT('common.studio.progressIndeterminateText');
  const formattedSpecimenValue = isIndeterminate
    ? specimenIndeterminateText
    : `${formatNumber(value, specimenLocale)}%`;

  const jsxSnippet = useMemo(() => {
    const optionalProps = [
      showLabel ? `  label="${specimenLabel}"` : null,
      showValue ? '  showValue' : null,
      isIndeterminate && showValue ? `  valueText="${specimenIndeterminateText}"` : null,
    ]
      .filter(Boolean)
      .join('\n');

    return `<Progress
  ${isIndeterminate ? 'value={null}' : `value={${value}}`}
  min={0}
  max={100}
  size="${size}"
  variant="${variant}"
${optionalProps ? `${optionalProps}\n` : ''}/>`;
  }, [
    isIndeterminate,
    showLabel,
    showValue,
    size,
    specimenIndeterminateText,
    specimenLabel,
    value,
    variant,
  ]);

  const aiPrompt = useMemo(
    () =>
      `Build an accessible linear Progress indicator: mode=${isIndeterminate ? 'indeterminate' : `determinate(${value}%)`}, size="${size}", variant="${variant}", GPU transform animations, RTL anchoring, and high-contrast --color-border-subtle track.`,
    [isIndeterminate, size, value, variant],
  );

  return (
    <GalleryStudioLayout
      activeRoute="progress"
      title={t('common.studio.progressTitle')}
      subtitle={t('common.studio.progressSubtitle')}
      testId="progress-studio"
      previewDir={specimenDir}
      onReset={handleReset}
      linkComponent={linkComponent}
      controls={
        <>
          <StudioSegmentedControl
            label={t('common.studio.specimenDirectionLabel')}
            value={specimenDir}
            columns={2}
            onChange={setSpecimenDir}
            options={dirOptions}
          />

          <StudioSegmentedControl
            label={t('common.studio.progressDensityLabel')}
            value={size}
            columns={3}
            onChange={setSize}
            options={sizeOptions}
          />

          <StudioSegmentedControl
            label={t('common.studio.progressVariantLabel')}
            value={variant}
            columns={2}
            onChange={setVariant}
            options={variantOptions}
          />

          {!isIndeterminate && (
            <StudioSegmentedControl
              label={t('common.studio.progressPresetLabel')}
              value={String(value)}
              onChange={(nextValue) => setValue(Number(nextValue))}
              options={presetOptions}
            />
          )}

          <StudioToggleRow
            label={t('common.studio.progressToggleIndeterminate')}
            checked={isIndeterminate}
            onCheckedChange={setIsIndeterminate}
            testId="toggle-progress-indeterminate"
          />

          <StudioToggleRow
            label={t('common.studio.progressToggleLabel')}
            checked={showLabel}
            onCheckedChange={setShowLabel}
            testId="toggle-progress-label"
          />

          <StudioToggleRow
            label={t('common.studio.progressToggleValue')}
            checked={showValue}
            onCheckedChange={setShowValue}
            testId="toggle-progress-value"
          />
        </>
      }
      inspector={
        <GalleryCodeInspector
          aiPrompt={aiPrompt}
          jsxCode={jsxSnippet}
          cssCode={null}
          jsxFileName="linear-progress.tsx"
          cssFileName="progress.module.css"
          specGroups={specGroups}
        />
      }
    >
      <div
        className={styles.stageWrapper}
        data-testid="progress-canvas"
        dir={specimenDir}
        lang={specimenLangAttr}
      >
        {/* Live Specimen Stage */}
        <div className={styles.specimenCard}>
          <Progress
            value={isIndeterminate ? null : value}
            min={0}
            max={100}
            size={size}
            variant={variant}
            label={showLabel ? specimenLabel : undefined}
            aria-label={showLabel ? undefined : specimenLabel}
            showValue={showValue}
            valueText={formattedSpecimenValue}
            data-testid="specimen-progress"
          />
        </div>

        {/* Variable-Driven Semantic Status Ramp */}
        <section className={styles.comparisonSection} aria-labelledby={rampHeadingId}>
          <div className={styles.comparisonHeader}>
            <h3 id={rampHeadingId} className={styles.comparisonTitle}>
              {specimenT('common.studio.progressRampTitle')}
            </h3>
            <p className={styles.comparisonDesc}>{specimenT('common.studio.progressRampDesc')}</p>
          </div>

          <div className={styles.matrixGrid}>
            {RAMP_VARIANTS.map((item) => {
              const rowLabel = specimenT(item.labelKey);
              return (
                <div key={item.variant} className={styles.matrixRow}>
                  <span className={styles.matrixLabel}>{specimenT(item.tagKey)}</span>
                  <Progress
                    value={isIndeterminate ? null : value}
                    min={0}
                    max={100}
                    size={size}
                    variant={item.variant}
                    label={showLabel ? rowLabel : undefined}
                    aria-label={showLabel ? undefined : rowLabel}
                    showValue={showValue}
                    valueText={formattedSpecimenValue}
                    data-testid={`progress-ramp-${item.variant}`}
                  />
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </GalleryStudioLayout>
  );
}
