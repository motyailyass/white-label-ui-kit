'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  type CardFooterAlign,
  type CardPadding,
  type CardVariant,
} from '@/components/ui';
import {
  BidiText,
  defaultMessages,
  translate,
  type SupportedLocale,
  type TranslationKey,
} from '@/i18n';
import { cn } from '@/lib/cn';
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
import styles from './card-gallery.module.css';

export type CardSpecimenDirection = 'ltr' | 'rtl';
export type CardStageView = 'single' | 'matrix';

export interface CardGalleryProps {
  linkComponent?: StudioLinkComponent;
}

const SAMPLE_MEDIA =
  'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=600&auto=format&fit=crop&q=80';

export function CardGallery({ linkComponent }: CardGalleryProps) {
  const { t, locale, direction } = useI18n();

  // Studio Interactive State
  const [specimenDir, setSpecimenDir] = useState<CardSpecimenDirection>(direction);
  const [stageView, setStageView] = useState<CardStageView>('single');
  const [variant, setVariant] = useState<CardVariant>('default');
  const [padding, setPadding] = useState<CardPadding>('md');
  const [hasHeaderDivider, setHasHeaderDivider] = useState(false);
  const [hasFooterDivider, setHasFooterDivider] = useState(false);
  const [footerAlign, setFooterAlign] = useState<CardFooterAlign>('end');
  const [clickCount, setClickCount] = useState(0);

  // Sync specimen preview direction when global LanguageSwitcher changes direction
  useEffect(() => {
    setSpecimenDir(direction);
  }, [direction]);

  const handleReset = useCallback(() => {
    setSpecimenDir(direction);
    setStageView('single');
    setVariant('default');
    setPadding('md');
    setHasHeaderDivider(false);
    setHasFooterDivider(false);
    setFooterAlign('end');
    setClickCount(0);
  }, [direction]);

  const specimenLocale: SupportedLocale =
    specimenDir === 'rtl' ? 'ar' : locale === 'ar' ? 'en' : locale;
  const specimenLangAttr = specimenLocale !== locale ? specimenLocale : undefined;
  const specimenT = useCallback(
    (key: TranslationKey) => translate(defaultMessages, specimenLocale, key),
    [specimenLocale],
  );

  // Options for segmented controls
  const dirOptions: readonly StudioSegmentedOption<CardSpecimenDirection>[] = [
    { value: 'ltr', label: t('common.studio.specimenDirLtr'), testId: 'opt-dir-ltr' },
    { value: 'rtl', label: t('common.studio.specimenDirRtl'), testId: 'opt-dir-rtl' },
  ];

  const viewOptions: readonly StudioSegmentedOption<CardStageView>[] = [
    { value: 'single', label: t('common.studio.cardViewSingle'), testId: 'opt-view-single' },
    { value: 'matrix', label: t('common.studio.cardViewMatrix'), testId: 'opt-view-matrix' },
  ];

  const variantOptions: readonly StudioSegmentedOption<CardVariant>[] = [
    {
      value: 'default',
      label: t('common.studio.cardVariantDefault'),
      testId: 'opt-variant-default',
    },
    { value: 'subtle', label: t('common.studio.cardVariantSubtle'), testId: 'opt-variant-subtle' },
    { value: 'raised', label: t('common.studio.cardVariantRaised'), testId: 'opt-variant-raised' },
    {
      value: 'interactive',
      label: t('common.studio.cardVariantInteractive'),
      testId: 'opt-variant-interactive',
    },
  ];

  const paddingOptions: readonly StudioSegmentedOption<CardPadding>[] = [
    { value: 'none', label: t('common.studio.cardPadNone'), testId: 'opt-pad-none' },
    { value: 'sm', label: t('common.studio.cardPadSm'), testId: 'opt-pad-sm' },
    { value: 'md', label: t('common.studio.cardPadMd'), testId: 'opt-pad-md' },
    { value: 'lg', label: t('common.studio.cardPadLg'), testId: 'opt-pad-lg' },
  ];

  const footerAlignOptions: readonly StudioSegmentedOption<CardFooterAlign>[] = [
    { value: 'end', label: t('common.studio.cardAlignEnd'), testId: 'opt-align-end' },
    { value: 'between', label: t('common.studio.cardAlignBetween'), testId: 'opt-align-between' },
    { value: 'start', label: t('common.studio.cardAlignStart'), testId: 'opt-align-start' },
    { value: 'stretch', label: t('common.studio.cardAlignStretch'), testId: 'opt-align-stretch' },
  ];

  // Dynamic JSX Snippet
  const jsxSnippet = useMemo(() => {
    const propsList: string[] = [];
    if (variant !== 'default') propsList.push(`variant="${variant}"`);
    if (padding !== 'md') propsList.push(`padding="${padding}"`);
    if (variant === 'interactive') propsList.push('onClick={() => handleClick()}');

    const formattedProps = propsList.length === 0 ? '' : ` ${propsList.join(' ')}`;

    const titleText = specimenT('common.studio.cardSpecimenTitle');
    const descText = specimenT('common.studio.cardSpecimenDesc');
    const bodyText = specimenT('common.studio.cardSpecimenBody');
    const actionCancel = specimenT('common.studio.cardActionDismiss');
    const actionConfirm = specimenT('common.studio.cardActionExport');

    const headerDividerAttr = hasHeaderDivider ? ' divider' : '';
    const footerDividerAttr = hasFooterDivider ? ' divider' : '';
    const footerAlignAttr = footerAlign !== 'end' ? ` align="${footerAlign}"` : '';

    return `<Card${formattedProps}>
  <CardHeader${headerDividerAttr}>
    <CardTitle as="h3">${titleText}</CardTitle>
    <CardDescription>${descText}</CardDescription>
  </CardHeader>
  <CardContent>
    <p>${bodyText}</p>
  </CardContent>
  <CardFooter${footerDividerAttr}${footerAlignAttr}>
    <Button variant="secondary" size="sm">${actionCancel}</Button>
    <Button variant="primary" size="sm">${actionConfirm}</Button>
  </CardFooter>
</Card>`;
  }, [variant, padding, hasHeaderDivider, hasFooterDivider, footerAlign, specimenT]);

  const cssModuleSnippet = `/* Custom card container styling */
.widgetContainer {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  inline-size: 100%;
}`;

  const aiAgentPrompt = useMemo(() => {
    return `Implement a white-label container using the kit's pure Card primitive:

\`\`\`tsx
${jsxSnippet}
\`\`\`

Requirements & Tokens:
- Pure UI Boundary: Consume \`@/components/ui/card\` compound exports directly.
- Variant: ${variant} using semantic surface tokens.
- Density Padding: ${padding}.
- Typography Roles: \`--typography-card-title-*\` with automatic :lang(ar) diacritic clearance.
- Corner Radius: Consumes semantic role \`--radius-card\` (8px dashboard / 12px website).
- Zero Dashboard Shadows: 100% shadow-free boundary; separation strictly via borders and surfaces.
- Logical Properties: 100% CSS logical padding and compartment boundaries.
`;
  }, [jsxSnippet, variant, padding]);

  // Measured Spec Groups
  const specGroups: readonly StudioSpecGroup[] = useMemo(() => {
    const padMap: Record<CardPadding, string> = {
      none: '0',
      sm: '12px (--space-3)',
      md: '20px (--space-5)',
      lg: '24px–32px (--space-6 / --space-8)',
    };
    const surfaceMap: Record<CardVariant, string> = {
      default: '--color-surface',
      subtle: '--color-surface-subtle',
      raised: '--color-surface-raised + --color-border-strong',
      interactive: '--color-surface + :hover / :focus-visible',
    };

    return [
      {
        title: t('common.studio.specCategoryVariant'),
        items: [
          { label: t('common.studio.cardSpecVariant'), value: variant },
          { label: t('common.studio.cardSpecPadding'), value: padding },
          {
            label: t('common.studio.cardSpecHeaderDivider'),
            value: hasHeaderDivider
              ? t('common.studio.cardSpecBoolTrue')
              : t('common.studio.cardSpecBoolFalse'),
          },
          {
            label: t('common.studio.cardSpecFooterDivider'),
            value: hasFooterDivider
              ? t('common.studio.cardSpecBoolTrue')
              : t('common.studio.cardSpecBoolFalse'),
          },
          { label: t('common.studio.cardSpecFooterAlign'), value: footerAlign },
        ],
      },
      {
        title: t('common.studio.specCategoryTokens'),
        items: [
          { label: t('common.studio.cardSpecSurfaceToken'), value: surfaceMap[variant] },
          { label: t('common.studio.cardSpecPaddingToken'), value: padMap[padding] },
          { label: t('common.studio.cardSpecRadiusRole'), value: 'var(--radius-card)' },
          {
            label: t('common.studio.cardSpecBorderRole'),
            value: '1px solid var(--color-border-subtle)',
          },
          {
            label: t('common.studio.cardSpecShadowPolicy'),
            value: t('common.studio.cardSpecShadowValue'),
          },
        ],
      },
    ];
  }, [variant, padding, hasHeaderDivider, hasFooterDivider, footerAlign, t]);

  return (
    <GalleryStudioLayout
      activeRoute="card"
      title={t('common.studio.cardTitle')}
      subtitle={t('common.studio.cardSubtitle')}
      testId="card-studio"
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
            label={t('common.studio.cardViewLabel')}
            value={stageView}
            options={viewOptions}
            onChange={setStageView}
          />

          <StudioSegmentedControl
            label={t('common.studio.cardVariantLabel')}
            value={variant}
            options={variantOptions}
            onChange={setVariant}
          />

          <StudioSegmentedControl
            label={t('common.studio.cardPaddingLabel')}
            value={padding}
            options={paddingOptions}
            onChange={setPadding}
          />

          <StudioSegmentedControl
            label={t('common.studio.cardFooterAlignLabel')}
            value={footerAlign}
            options={footerAlignOptions}
            onChange={setFooterAlign}
          />

          <hr className={styles.controlDivider} />

          <StudioToggleRow
            label={t('common.studio.cardHeaderDividerLabel')}
            checked={hasHeaderDivider}
            onCheckedChange={setHasHeaderDivider}
            testId="toggle-header-divider"
          />

          <StudioToggleRow
            label={t('common.studio.cardFooterDividerLabel')}
            checked={hasFooterDivider}
            onCheckedChange={setHasFooterDivider}
            testId="toggle-footer-divider"
          />
        </div>
      }
      inspector={
        <GalleryCodeInspector
          aiPrompt={aiAgentPrompt}
          jsxCode={jsxSnippet}
          cssCode={cssModuleSnippet}
          jsxFileName="analytics-card.tsx"
          cssFileName="analytics-card.module.css"
          specGroups={specGroups}
        />
      }
    >
      <div
        className={cn(styles.canvasArea, specimenDir === 'rtl' && styles.canvasRtl)}
        dir={specimenDir}
        lang={specimenLangAttr}
      >
        {stageView === 'single' ? (
          <div className={styles.specimenCard}>
            <div className={styles.specimenStage}>
              <Card
                variant={variant}
                padding={padding}
                interactive={variant === 'interactive'}
                onClick={
                  variant === 'interactive' ? () => setClickCount((prev) => prev + 1) : undefined
                }
                className={styles.fullWidth}
                data-testid="studio-card"
              >
                {padding === 'none' && (
                  <div className={styles.stageBleedCover}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={SAMPLE_MEDIA}
                      alt={specimenT('common.studio.cardBleedCoverAlt')}
                      className={styles.stageBleedImage}
                    />
                    <div className={styles.stageBleedNotice}>
                      <Badge variant="primary" size="sm">
                        {specimenT('common.studio.cardBleedBadge')}
                      </Badge>
                    </div>
                  </div>
                )}
                <CardHeader
                  divider={hasHeaderDivider}
                  className={padding === 'none' ? styles.stageBleedInset : undefined}
                >
                  <CardTitle as="h3">{specimenT('common.studio.cardSpecimenTitle')}</CardTitle>
                  <CardDescription>{specimenT('common.studio.cardSpecimenDesc')}</CardDescription>
                </CardHeader>
                <CardContent className={padding === 'none' ? styles.stageBleedInset : undefined}>
                  <p className={styles.marginZero}>{specimenT('common.studio.cardSpecimenBody')}</p>
                  {variant === 'interactive' && (
                    <Badge
                      variant="primary"
                      size="sm"
                      className={styles.alignSelfStart}
                      data-testid="studio-card-clicks"
                    >
                      {specimenT('common.studio.cardSpecimenClicksLabel')}{' '}
                      <BidiText dir="ltr">{clickCount}</BidiText>
                    </Badge>
                  )}
                </CardContent>
                <CardFooter
                  divider={hasFooterDivider}
                  align={footerAlign}
                  className={padding === 'none' ? styles.stageBleedInset : undefined}
                >
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={variant === 'interactive' ? (e) => e.stopPropagation() : undefined}
                  >
                    {specimenT('common.studio.cardActionDismiss')}
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={variant === 'interactive' ? (e) => e.stopPropagation() : undefined}
                  >
                    {specimenT('common.studio.cardActionExport')}
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        ) : (
          <div className={styles.matrixContainer} data-testid="card-matrix-grid">
            <section className={styles.matrixGroup} aria-labelledby="card-surfaces-heading">
              <h3 id="card-surfaces-heading" className={styles.matrixGroupTitle}>
                {specimenT('common.studio.cardMatrixSurfacesTitle')}
              </h3>
              <div className={styles.matrixGrid}>
                <Card variant="default" padding="md">
                  <CardHeader>
                    <CardTitle as="h4">{specimenT('common.studio.cardVariantDefault')}</CardTitle>
                    <CardDescription>{specimenT('common.studio.cardMatrixDesc')}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Badge variant="outline" size="sm" className={styles.alignSelfStart}>
                      <BidiText dir="ltr">variant="default"</BidiText>
                    </Badge>
                  </CardContent>
                </Card>

                <Card variant="subtle" padding="md">
                  <CardHeader>
                    <CardTitle as="h4">{specimenT('common.studio.cardVariantSubtle')}</CardTitle>
                    <CardDescription>{specimenT('common.studio.cardMatrixDesc')}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Badge variant="outline" size="sm" className={styles.alignSelfStart}>
                      <BidiText dir="ltr">variant="subtle"</BidiText>
                    </Badge>
                  </CardContent>
                </Card>

                <Card variant="raised" padding="md">
                  <CardHeader>
                    <CardTitle as="h4">{specimenT('common.studio.cardVariantRaised')}</CardTitle>
                    <CardDescription>{specimenT('common.studio.cardMatrixDesc')}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Badge variant="outline" size="sm" className={styles.alignSelfStart}>
                      <BidiText dir="ltr">variant="raised"</BidiText>
                    </Badge>
                  </CardContent>
                </Card>

                <Card variant="interactive" padding="md">
                  <CardHeader>
                    <CardTitle as="h4">
                      {specimenT('common.studio.cardVariantInteractive')}
                    </CardTitle>
                    <CardDescription>{specimenT('common.studio.cardMatrixDesc')}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Badge variant="outline" size="sm" className={styles.alignSelfStart}>
                      <BidiText dir="ltr">variant="interactive"</BidiText>
                    </Badge>
                  </CardContent>
                </Card>
              </div>
            </section>

            <section className={styles.matrixGroup} aria-labelledby="card-paddings-heading">
              <h3 id="card-paddings-heading" className={styles.matrixGroupTitle}>
                {specimenT('common.studio.cardMatrixPaddingsTitle')}
              </h3>
              <div className={styles.matrixGrid}>
                <Card variant="default" padding="sm">
                  <CardHeader>
                    <CardTitle as="h4">{specimenT('common.studio.cardPadSm')}</CardTitle>
                    <CardDescription>{specimenT('common.studio.cardMatrixDesc')}</CardDescription>
                  </CardHeader>
                  <CardFooter divider>
                    <Badge variant="outline" size="sm">
                      <BidiText dir="ltr">padding="sm"</BidiText>
                    </Badge>
                  </CardFooter>
                </Card>

                <Card variant="default" padding="md">
                  <CardHeader>
                    <CardTitle as="h4">{specimenT('common.studio.cardPadMd')}</CardTitle>
                    <CardDescription>{specimenT('common.studio.cardMatrixDesc')}</CardDescription>
                  </CardHeader>
                  <CardFooter divider>
                    <Badge variant="outline" size="sm">
                      <BidiText dir="ltr">padding="md"</BidiText>
                    </Badge>
                  </CardFooter>
                </Card>

                <Card variant="default" padding="lg">
                  <CardHeader>
                    <CardTitle as="h4">{specimenT('common.studio.cardPadLg')}</CardTitle>
                    <CardDescription>{specimenT('common.studio.cardMatrixDesc')}</CardDescription>
                  </CardHeader>
                  <CardFooter divider>
                    <Badge variant="outline" size="sm">
                      <BidiText dir="ltr">padding="lg"</BidiText>
                    </Badge>
                  </CardFooter>
                </Card>
              </div>
            </section>
          </div>
        )}
      </div>
    </GalleryStudioLayout>
  );
}
