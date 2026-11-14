'use client';

import { useCallback, useEffect, useId, useMemo, useState } from 'react';
import { Icon } from '@/components/icons';
import {
  StatCard,
  StatCardDescription,
  StatCardFooter,
  StatCardHeader,
  StatCardIcon,
  type StatCardSize,
  StatCardTitle,
  StatCardTrend,
  type StatCardTrendDirection,
  StatCardValue,
  type StatCardVariant,
} from '@/components/ui';
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
import styles from './stat-card-gallery.module.css';

export type StatCardSpecimenDirection = 'ltr' | 'rtl';
export type StatCardStageView = 'single' | 'matrix';

const STAT_CARD_SIZES: readonly StatCardSize[] = ['sm', 'md', 'lg'];

export interface StatCardGalleryProps {
  linkComponent?: StudioLinkComponent;
}

export function StatCardGallery({ linkComponent }: StatCardGalleryProps) {
  const { t, locale, direction } = useI18n();
  const { resolvedTheme } = useTheme();
  const variantsHeadingId = useId();
  const sizesHeadingId = useId();

  // Studio Interactive State
  const [specimenDir, setSpecimenDir] = useState<StatCardSpecimenDirection>(direction);
  const [stageView, setStageView] = useState<StatCardStageView>('single');
  const [variant, setVariant] = useState<StatCardVariant>('default');
  const [size, setSize] = useState<StatCardSize>('md');
  const [trendDirection, setTrendDirection] = useState<StatCardTrendDirection>('up');
  const [hasIcon, setHasIcon] = useState(true);
  const [hasFooter, setHasFooter] = useState(true);
  const [isPillTrend, setIsPillTrend] = useState(false);

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
    setVariant('default');
    setSize('md');
    setTrendDirection('up');
    setHasIcon(true);
    setHasFooter(true);
    setIsPillTrend(false);
  }, [direction]);

  const dirOptions: readonly StudioSegmentedOption<StatCardSpecimenDirection>[] = [
    { value: 'ltr', label: t('common.studio.specimenDirLtr'), testId: 'opt-dir-ltr' },
    { value: 'rtl', label: t('common.studio.specimenDirRtl'), testId: 'opt-dir-rtl' },
  ];

  const viewOptions: readonly StudioSegmentedOption<StatCardStageView>[] = [
    { value: 'single', label: t('common.studio.statCardViewSingle'), testId: 'opt-view-single' },
    { value: 'matrix', label: t('common.studio.statCardViewMatrix'), testId: 'opt-view-matrix' },
  ];

  const variantOptions: readonly StudioSegmentedOption<StatCardVariant>[] = [
    { value: 'default', label: t('common.studio.statCardVarDefault'), testId: 'opt-var-default' },
    { value: 'raised', label: t('common.studio.statCardVarRaised'), testId: 'opt-var-raised' },
    { value: 'subtle', label: t('common.studio.statCardVarSubtle'), testId: 'opt-var-subtle' },
  ];

  const sizeOptions: readonly StudioSegmentedOption<StatCardSize>[] = [
    { value: 'sm', label: t('common.studio.statCardSizeSm'), testId: 'opt-size-sm' },
    { value: 'md', label: t('common.studio.statCardSizeMd'), testId: 'opt-size-md' },
    { value: 'lg', label: t('common.studio.statCardSizeLg'), testId: 'opt-size-lg' },
  ];

  const trendOptions: readonly StudioSegmentedOption<StatCardTrendDirection>[] = [
    { value: 'up', label: t('common.studio.statCardTrendUp'), testId: 'opt-trend-up' },
    { value: 'down', label: t('common.studio.statCardTrendDown'), testId: 'opt-trend-down' },
    {
      value: 'neutral',
      label: t('common.studio.statCardTrendNeutral'),
      testId: 'opt-trend-neutral',
    },
  ];

  const trendSrLabelMap: Record<StatCardTrendDirection, string> = useMemo(
    () => ({
      up: specimenT('common.studio.statCardTrendSrUp'),
      down: specimenT('common.studio.statCardTrendSrDown'),
      neutral: specimenT('common.studio.statCardTrendSrNeutral'),
    }),
    [specimenT],
  );

  const variantLabelMap: Record<StatCardVariant, string> = useMemo(
    () => ({
      default: t('common.studio.statCardVarDefault'),
      raised: t('common.studio.statCardVarRaised'),
      subtle: t('common.studio.statCardVarSubtle'),
    }),
    [t],
  );

  const specGroups: StudioSpecGroup[] = useMemo(
    () => [
      {
        title: t('common.studio.statCardSpecSemantics'),
        items: [
          { label: t('common.studio.statCardSpecVariant'), value: variant },
          { label: t('common.studio.statCardSpecSize'), value: size },
          { label: t('common.studio.statCardSpecTrend'), value: trendDirection },
          {
            label: t('common.studio.statCardSpecTabular'),
            value: t('common.studio.statCardSpecTabularVal'),
          },
          { label: t('common.studio.statCardSpecDirection'), value: specimenDir.toUpperCase() },
        ],
      },
      {
        title: t('common.studio.statCardSpecTheme'),
        items: [
          { label: t('common.studio.statCardSpecThemeVal'), value: resolvedTheme },
          {
            label: t('common.studio.statCardSpecSurfaceToken'),
            value: `--color-surface${variant === 'default' ? '' : `-${variant}`}`,
          },
          {
            label: t('common.studio.statCardSpecElevation'),
            value: t('common.studio.statCardSpecElevationVal'),
          },
        ],
      },
    ],
    [t, variant, size, trendDirection, specimenDir, resolvedTheme],
  );

  const jsxSnippet = useMemo(() => {
    const varProp = variant !== 'default' ? ` variant="${variant}"` : '';
    const sizeProp = size !== 'md' ? ` size="${size}"` : '';
    const iconNode = hasIcon
      ? '\n    <StatCardIcon><Icon name="feature" size={18} /></StatCardIcon>'
      : '';
    const trendText =
      trendDirection === 'up' ? '+12.4%' : trendDirection === 'down' ? '-4.2%' : '0.0%';
    const pillProp = isPillTrend ? ' pill' : '';
    const srLabel = trendSrLabelMap[trendDirection];
    const footerNode = hasFooter
      ? `\n  <StatCardFooter>
    <StatCardTrend direction="${trendDirection}"${pillProp} label="${srLabel}">
      ${trendText}
    </StatCardTrend>
    <StatCardDescription>${specimenT('common.studio.statCardSampleDesc')}</StatCardDescription>
  </StatCardFooter>`
      : '';

    return `<StatCard${varProp}${sizeProp}>
  <StatCardHeader>
    <StatCardTitle>${specimenT('common.studio.statCardSampleTitle')}</StatCardTitle>${iconNode}
  </StatCardHeader>
  <StatCardValue>$84,250</StatCardValue>${footerNode}
</StatCard>`;
  }, [variant, size, hasIcon, trendDirection, isPillTrend, hasFooter, specimenT, trendSrLabelMap]);

  const cssModuleSnippet = `/* StatCard consumes semantic tokens with zero shadows */
.statGrid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 15rem), 1fr));
  gap: var(--space-4);
}`;

  const aiAgentPrompt = useMemo(
    () => `Render a pure white-label StatCard KPI metric:
- Surface: variant="${variant}"
- Density: size="${size}"
- Trend: direction="${trendDirection}", pill=${isPillTrend}
- Figures: tabular-nums layout stability with BidiText dir="ltr" on numeric tokens
- Direction: ${specimenDir}
- Theme: ${resolvedTheme}
- 100% CSS logical properties, zero dashboard shadows.`,
    [variant, size, trendDirection, isPillTrend, specimenDir, resolvedTheme],
  );

  const activeTrendDelta =
    trendDirection === 'up' ? '+12.4%' : trendDirection === 'down' ? '-4.2%' : '0.0%';

  return (
    <GalleryStudioLayout
      activeRoute="stat-card"
      title={t('common.studio.statCardTitle')}
      subtitle={t('common.studio.statCardSubtitle')}
      testId="stat-card-studio"
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
            label={t('common.studio.statCardViewModeLabel')}
            value={stageView}
            options={viewOptions}
            onChange={setStageView}
          />

          <StudioSegmentedControl
            label={t('common.studio.statCardVariantLabel')}
            value={variant}
            options={variantOptions}
            onChange={setVariant}
          />

          <StudioSegmentedControl
            label={t('common.studio.statCardSizeLabel')}
            value={size}
            options={sizeOptions}
            onChange={setSize}
          />

          <StudioSegmentedControl
            label={t('common.studio.statCardTrendLabel')}
            value={trendDirection}
            options={trendOptions}
            onChange={setTrendDirection}
          />

          <hr className={styles.controlDivider} />

          <StudioToggleRow
            label={t('common.studio.statCardToggleIcon')}
            checked={hasIcon}
            onCheckedChange={setHasIcon}
            testId="toggle-stat-card-icon"
          />

          <StudioToggleRow
            label={t('common.studio.statCardToggleFooter')}
            checked={hasFooter}
            onCheckedChange={setHasFooter}
            testId="toggle-stat-card-footer"
          />

          {hasFooter && (
            <StudioToggleRow
              label={t('common.studio.statCardTogglePill')}
              checked={isPillTrend}
              onCheckedChange={setIsPillTrend}
              testId="toggle-stat-card-pill"
            />
          )}
        </div>
      }
      inspector={
        <GalleryCodeInspector
          aiPrompt={aiAgentPrompt}
          jsxCode={jsxSnippet}
          cssCode={cssModuleSnippet}
          jsxFileName="kpi-metric-card.tsx"
          cssFileName="kpi-metric-card.module.css"
          specGroups={specGroups}
        />
      }
    >
      <div
        data-testid="stat-card-canvas"
        className={cn(styles.canvasArea, specimenDir === 'rtl' && styles.canvasRtl)}
        dir={specimenDir}
        lang={specimenLangAttr}
      >
        {stageView === 'single' ? (
          <div className={styles.specimenStage}>
            <StatCard data-testid="specimen-stat-card" variant={variant} size={size}>
              <StatCardHeader>
                <StatCardTitle>{specimenT('common.studio.statCardSampleTitle')}</StatCardTitle>
                {hasIcon && (
                  <StatCardIcon>
                    <Icon name="feature" size={18} />
                  </StatCardIcon>
                )}
              </StatCardHeader>
              <StatCardValue>
                <BidiText dir="ltr">$84,250</BidiText>
              </StatCardValue>
              {hasFooter && (
                <StatCardFooter>
                  <StatCardTrend
                    direction={trendDirection}
                    pill={isPillTrend}
                    label={trendSrLabelMap[trendDirection]}
                  >
                    <BidiText dir="ltr">{activeTrendDelta}</BidiText>
                  </StatCardTrend>
                  <StatCardDescription>
                    {specimenT('common.studio.statCardSampleDesc')}
                  </StatCardDescription>
                </StatCardFooter>
              )}
            </StatCard>
          </div>
        ) : (
          <div className={styles.matrixStack} data-testid="stat-card-matrix-grid">
            <section aria-labelledby={variantsHeadingId} className={styles.sectionBlock}>
              <h2 id={variantsHeadingId} className={styles.sectionHeading}>
                {t('common.studio.statCardMatrixVariantsHeading')}
              </h2>
              <div className={styles.specimenGrid}>
                <StatCard variant="default" data-testid="matrix-stat-card-default">
                  <StatCardHeader>
                    <StatCardTitle>
                      {specimenT('common.studio.statCardSubscribersTitle')}
                    </StatCardTitle>
                    <StatCardIcon>
                      <Icon name="anonymous" size={18} />
                    </StatCardIcon>
                  </StatCardHeader>
                  <StatCardValue>
                    <BidiText dir="ltr">1,429</BidiText>
                  </StatCardValue>
                  <StatCardFooter>
                    <StatCardTrend direction="up" pill={isPillTrend} label={trendSrLabelMap.up}>
                      <BidiText dir="ltr">+8.1%</BidiText>
                    </StatCardTrend>
                    <StatCardDescription>
                      {`${variantLabelMap.default} · ${specimenT('common.studio.statCardSubscribersDesc')}`}
                    </StatCardDescription>
                  </StatCardFooter>
                </StatCard>

                <StatCard variant="raised" data-testid="matrix-stat-card-raised">
                  <StatCardHeader>
                    <StatCardTitle>{specimenT('common.studio.statCardBounceTitle')}</StatCardTitle>
                    <StatCardIcon>
                      <Icon name="warning" size={18} />
                    </StatCardIcon>
                  </StatCardHeader>
                  <StatCardValue>
                    <BidiText dir="ltr">24.8%</BidiText>
                  </StatCardValue>
                  <StatCardFooter>
                    <StatCardTrend direction="down" pill={isPillTrend} label={trendSrLabelMap.down}>
                      <BidiText dir="ltr">-3.2%</BidiText>
                    </StatCardTrend>
                    <StatCardDescription>
                      {`${variantLabelMap.raised} · ${specimenT('common.studio.statCardBounceDesc')}`}
                    </StatCardDescription>
                  </StatCardFooter>
                </StatCard>

                <StatCard variant="subtle" data-testid="matrix-stat-card-subtle">
                  <StatCardHeader>
                    <StatCardTitle>{specimenT('common.studio.statCardSessionTitle')}</StatCardTitle>
                    <StatCardIcon>
                      <Icon name="sliders" size={18} />
                    </StatCardIcon>
                  </StatCardHeader>
                  <StatCardValue>{specimenT('common.studio.statCardSessionValue')}</StatCardValue>
                  <StatCardFooter>
                    <StatCardTrend
                      direction="neutral"
                      pill={isPillTrend}
                      label={trendSrLabelMap.neutral}
                    >
                      <BidiText dir="ltr">0.0%</BidiText>
                    </StatCardTrend>
                    <StatCardDescription>
                      {`${variantLabelMap.subtle} · ${specimenT('common.studio.statCardSessionDesc')}`}
                    </StatCardDescription>
                  </StatCardFooter>
                </StatCard>
              </div>
            </section>

            <section aria-labelledby={sizesHeadingId} className={styles.sectionBlock}>
              <h2 id={sizesHeadingId} className={styles.sectionHeading}>
                {t('common.studio.statCardMatrixSizesHeading')}
              </h2>
              <div className={styles.specimenGrid}>
                {STAT_CARD_SIZES.map((itemSize) => (
                  <StatCard
                    key={itemSize}
                    size={itemSize}
                    data-testid={`matrix-stat-card-size-${itemSize}`}
                  >
                    <StatCardHeader>
                      <StatCardTitle>
                        {specimenT('common.studio.statCardSampleTitle')}
                      </StatCardTitle>
                      <StatCardIcon>
                        <Icon name="feature" size={18} />
                      </StatCardIcon>
                    </StatCardHeader>
                    <StatCardValue>
                      <BidiText dir="ltr">$84,250</BidiText>
                    </StatCardValue>
                    <StatCardFooter>
                      <StatCardTrend
                        direction={trendDirection}
                        pill={isPillTrend}
                        label={trendSrLabelMap[trendDirection]}
                      >
                        <BidiText dir="ltr">{activeTrendDelta}</BidiText>
                      </StatCardTrend>
                      <StatCardDescription>
                        {itemSize.toUpperCase()} · {specimenT('common.studio.statCardSampleDesc')}
                      </StatCardDescription>
                    </StatCardFooter>
                  </StatCard>
                ))}
              </div>
            </section>
          </div>
        )}
      </div>
    </GalleryStudioLayout>
  );
}
