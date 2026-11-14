'use client';

import { useCallback, useEffect, useId, useMemo, useState } from 'react';
import { Separator, type SeparatorLabelAlign, type SeparatorOrientation } from '@/components/ui';
import { defaultMessages, type SupportedLocale, translate, type TranslationKey } from '@/i18n';
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
import styles from './separator-gallery.module.css';

export type SeparatorSpecimenDirection = 'ltr' | 'rtl';
export type SeparatorStageView = 'single' | 'matrix';

export interface SeparatorGalleryProps {
  linkComponent?: StudioLinkComponent;
}

export function SeparatorGallery({ linkComponent }: SeparatorGalleryProps) {
  const { t, locale, direction } = useI18n();
  const { resolvedTheme } = useTheme();
  const matrixHorizHeadingId = useId();
  const matrixVertHeadingId = useId();

  // Studio Interactive State
  const [specimenDir, setSpecimenDir] = useState<SeparatorSpecimenDirection>(direction);
  const [stageView, setStageView] = useState<SeparatorStageView>('single');
  const [orientation, setOrientation] = useState<SeparatorOrientation>('horizontal');
  const [hasLabel, setHasLabel] = useState(false);
  const [labelAlign, setLabelAlign] = useState<SeparatorLabelAlign>('center');
  const [isDecorative, setIsDecorative] = useState(true);

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
    setOrientation('horizontal');
    setHasLabel(false);
    setLabelAlign('center');
    setIsDecorative(true);
  }, [direction]);

  const dirOptions: readonly StudioSegmentedOption<SeparatorSpecimenDirection>[] = [
    { value: 'ltr', label: t('common.studio.specimenDirLtr'), testId: 'opt-dir-ltr' },
    { value: 'rtl', label: t('common.studio.specimenDirRtl'), testId: 'opt-dir-rtl' },
  ];

  const viewOptions: readonly StudioSegmentedOption<SeparatorStageView>[] = [
    { value: 'single', label: t('common.studio.separatorViewSingle'), testId: 'opt-view-single' },
    { value: 'matrix', label: t('common.studio.separatorViewMatrix'), testId: 'opt-view-matrix' },
  ];

  const orientationOptions: readonly StudioSegmentedOption<SeparatorOrientation>[] = [
    {
      value: 'horizontal',
      label: t('common.studio.separatorOrientHorizontal'),
      testId: 'opt-orient-horizontal',
    },
    {
      value: 'vertical',
      label: t('common.studio.separatorOrientVertical'),
      testId: 'opt-orient-vertical',
    },
  ];

  const labelAlignOptions: readonly StudioSegmentedOption<SeparatorLabelAlign>[] = [
    { value: 'start', label: t('common.studio.separatorAlignStart'), testId: 'opt-align-start' },
    { value: 'center', label: t('common.studio.separatorAlignCenter'), testId: 'opt-align-center' },
    { value: 'end', label: t('common.studio.separatorAlignEnd'), testId: 'opt-align-end' },
  ];

  const specGroups: StudioSpecGroup[] = useMemo(
    () => [
      {
        title: t('common.studio.separatorSpecSemantics'),
        items: [
          { label: t('common.studio.separatorSpecOrientation'), value: orientation },
          {
            label: t('common.studio.separatorSpecRole'),
            value: isDecorative ? 'none' : 'separator',
          },
          { label: t('common.studio.separatorSpecDirection'), value: specimenDir.toUpperCase() },
          {
            label: t('common.studio.separatorSpecWithLabel'),
            value: hasLabel
              ? `${t('common.studio.separatorSpecYes')} (${labelAlign})`
              : t('common.studio.separatorSpecNo'),
          },
        ],
      },
      {
        title: t('common.studio.separatorSpecTheme'),
        items: [
          { label: t('common.studio.separatorSpecThemeVal'), value: resolvedTheme },
          {
            label: t('common.studio.separatorSpecBorderToken'),
            value: '--color-border-subtle',
          },
        ],
      },
    ],
    [orientation, isDecorative, specimenDir, hasLabel, labelAlign, resolvedTheme, t],
  );

  const jsxSnippet = useMemo(() => {
    const orientProp = orientation === 'vertical' ? '\n  orientation="vertical"' : '';
    const decProp = !isDecorative ? '\n  decorative={false}' : '';
    const labelProps =
      orientation === 'horizontal' && hasLabel
        ? `\n  label={t('common.studio.separatorLabelOr')}${labelAlign !== 'center' ? `\n  labelAlign="${labelAlign}"` : ''}`
        : '';

    return `<Separator${orientProp}${decProp}${labelProps} />`;
  }, [orientation, isDecorative, hasLabel, labelAlign]);

  const cssModuleSnippet = `/* Separator consumes 100% CSS logical properties */
.container {
  display: flex;
  flex-direction: ${orientation === 'horizontal' ? 'column' : 'row'};
  gap: var(--space-4);
}`;

  const aiAgentPrompt = useMemo(
    () => `Render a pure white-label Separator divider using @/components/ui Separator:
- Orientation: ${orientation}
- Decorative: ${isDecorative ? 'true (role="none")' : 'false (role="separator" + aria-orientation + aria-labelledby for labels)'}
- Labeled: ${hasLabel ? `true (align="${labelAlign}", localized via t())` : 'false'}
- Theme: ${resolvedTheme}
- 100% CSS logical properties, zero dashboard shadows.`,
    [orientation, isDecorative, hasLabel, labelAlign, resolvedTheme],
  );

  return (
    <GalleryStudioLayout
      activeRoute="separator"
      title={t('common.studio.separatorTitle')}
      subtitle={t('common.studio.separatorSubtitle')}
      testId="separator-studio"
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
            label={t('common.studio.separatorViewModeLabel')}
            value={stageView}
            options={viewOptions}
            onChange={setStageView}
          />

          {stageView === 'single' && (
            <>
              <StudioSegmentedControl
                label={t('common.studio.separatorOrientationLabel')}
                value={orientation}
                options={orientationOptions}
                onChange={(val) => {
                  setOrientation(val);
                  if (val === 'vertical') setHasLabel(false);
                }}
              />

              {orientation === 'horizontal' && (
                <StudioToggleRow
                  label={t('common.studio.separatorToggleLabel')}
                  checked={hasLabel}
                  onCheckedChange={setHasLabel}
                  testId="toggle-separator-label"
                />
              )}

              {orientation === 'horizontal' && hasLabel && (
                <StudioSegmentedControl
                  label={t('common.studio.separatorAlignLabel')}
                  value={labelAlign}
                  options={labelAlignOptions}
                  onChange={setLabelAlign}
                />
              )}

              <hr className={styles.controlDivider} />

              <StudioToggleRow
                label={t('common.studio.separatorToggleDecorative')}
                checked={isDecorative}
                onCheckedChange={setIsDecorative}
                testId="toggle-separator-decorative"
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
          jsxFileName="content-divider.tsx"
          cssFileName="content-divider.module.css"
          specGroups={specGroups}
        />
      }
    >
      <div
        className={cn(styles.canvasArea, specimenDir === 'rtl' && styles.canvasRtl)}
        dir={specimenDir}
        lang={specimenLangAttr}
        data-testid="separator-canvas"
      >
        {stageView === 'single' ? (
          <div className={styles.specimenCard}>
            {orientation === 'horizontal' ? (
              <div className={styles.stageHorizontal}>
                <div className={styles.mockBox}>
                  {specimenT('common.studio.separatorAboveText')}
                </div>
                <Separator
                  orientation="horizontal"
                  decorative={isDecorative}
                  label={hasLabel ? specimenT('common.studio.separatorLabelOr') : undefined}
                  labelAlign={labelAlign}
                  data-testid="specimen-separator"
                />
                <div className={styles.mockBox}>
                  {specimenT('common.studio.separatorBelowText')}
                </div>
              </div>
            ) : (
              <div className={styles.stageVertical}>
                <div className={styles.mockBox}>
                  {specimenT('common.studio.separatorStartItem')}
                </div>
                <Separator
                  orientation="vertical"
                  decorative={isDecorative}
                  data-testid="specimen-separator"
                />
                <div className={styles.mockBox}>{specimenT('common.studio.separatorEndItem')}</div>
              </div>
            )}
          </div>
        ) : (
          <div className={styles.sectionBlock} data-testid="separator-matrix-grid">
            <section className={styles.sectionBlock} aria-labelledby={matrixHorizHeadingId}>
              <h2 id={matrixHorizHeadingId} className={styles.sectionHeading}>
                {specimenT('common.studio.separatorMatrixHorizontalHeading')}
              </h2>
              <div className={styles.specimenGrid}>
                <div className={styles.showcaseCard}>
                  <h3 className={styles.showcaseTitle}>
                    {specimenT('common.studio.separatorMatrixBareLabel')}
                  </h3>
                  <div className={styles.stageHorizontal}>
                    <div className={styles.mockBox}>
                      {specimenT('common.studio.separatorAboveText')}
                    </div>
                    <Separator data-testid="matrix-sep-bare" />
                    <div className={styles.mockBox}>
                      {specimenT('common.studio.separatorBelowText')}
                    </div>
                  </div>
                </div>

                <div className={styles.showcaseCard}>
                  <h3 className={styles.showcaseTitle}>
                    {specimenT('common.studio.separatorMatrixStartLabel')}
                  </h3>
                  <Separator
                    decorative={false}
                    label={specimenT('common.studio.separatorLabelOr')}
                    labelAlign="start"
                    data-testid="matrix-sep-start"
                  />
                </div>

                <div className={styles.showcaseCard}>
                  <h3 className={styles.showcaseTitle}>
                    {specimenT('common.studio.separatorMatrixCenterLabel')}
                  </h3>
                  <Separator
                    decorative={false}
                    label={specimenT('common.studio.separatorAuthOrText')}
                    labelAlign="center"
                    data-testid="matrix-sep-center"
                  />
                </div>

                <div className={styles.showcaseCard}>
                  <h3 className={styles.showcaseTitle}>
                    {specimenT('common.studio.separatorMatrixEndLabel')}
                  </h3>
                  <Separator
                    decorative={false}
                    label={specimenT('common.studio.separatorLabelOr')}
                    labelAlign="end"
                    data-testid="matrix-sep-end"
                  />
                </div>
              </div>
            </section>

            <section className={styles.sectionBlock} aria-labelledby={matrixVertHeadingId}>
              <h2 id={matrixVertHeadingId} className={styles.sectionHeading}>
                {specimenT('common.studio.separatorOrientVertical')}
              </h2>
              <div className={styles.specimenGrid}>
                <div className={styles.showcaseCard}>
                  <h3 className={styles.showcaseTitle}>
                    {specimenT('common.studio.separatorOrientVertical')}
                  </h3>
                  <div className={styles.stageVertical}>
                    <div className={styles.mockBox}>
                      {specimenT('common.studio.separatorStartItem')}
                    </div>
                    <Separator
                      orientation="vertical"
                      decorative={false}
                      data-testid="matrix-sep-vertical"
                    />
                    <div className={styles.mockBox}>
                      {specimenT('common.studio.separatorEndItem')}
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        )}
      </div>
    </GalleryStudioLayout>
  );
}
