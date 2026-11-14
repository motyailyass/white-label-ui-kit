'use client';

import { useCallback, useEffect, useId, useMemo, useState } from 'react';
import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
  type BreadcrumbSize,
} from '@/components/ui';
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
import styles from './breadcrumb-gallery.module.css';

export type BreadcrumbSpecimenDirection = 'ltr' | 'rtl';
export type BreadcrumbSeparatorStyle = 'chevron' | 'slash';
export type BreadcrumbStageView = 'single' | 'matrix';

const BREADCRUMB_SIZES: readonly BreadcrumbSize[] = ['sm', 'md', 'lg'];

export interface BreadcrumbGalleryProps {
  linkComponent?: StudioLinkComponent;
}

export function BreadcrumbGallery({ linkComponent }: BreadcrumbGalleryProps) {
  const { t, locale, direction } = useI18n();
  const { resolvedTheme } = useTheme();
  const densityHeadingId = useId();
  const separatorHeadingId = useId();

  // Studio Interactive State
  const [specimenDir, setSpecimenDir] = useState<BreadcrumbSpecimenDirection>(direction);
  const [stageView, setStageView] = useState<BreadcrumbStageView>('single');
  const [size, setSize] = useState<BreadcrumbSize>('md');
  const [separatorStyle, setSeparatorStyle] = useState<BreadcrumbSeparatorStyle>('chevron');
  const [hasEllipsis, setHasEllipsis] = useState(false);

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
    setSeparatorStyle('chevron');
    setHasEllipsis(false);
  }, [direction]);

  const dirOptions: readonly StudioSegmentedOption<BreadcrumbSpecimenDirection>[] = [
    { value: 'ltr', label: t('common.studio.specimenDirLtr'), testId: 'opt-dir-ltr' },
    { value: 'rtl', label: t('common.studio.specimenDirRtl'), testId: 'opt-dir-rtl' },
  ];

  const viewOptions: readonly StudioSegmentedOption<BreadcrumbStageView>[] = [
    { value: 'single', label: t('common.studio.breadcrumbViewSingle'), testId: 'opt-view-single' },
    { value: 'matrix', label: t('common.studio.breadcrumbViewMatrix'), testId: 'opt-view-matrix' },
  ];

  const sizeOptions: readonly StudioSegmentedOption<BreadcrumbSize>[] = [
    { value: 'sm', label: t('common.studio.breadcrumbSizeSm'), testId: 'opt-size-sm' },
    { value: 'md', label: t('common.studio.breadcrumbSizeMd'), testId: 'opt-size-md' },
    { value: 'lg', label: t('common.studio.breadcrumbSizeLg'), testId: 'opt-size-lg' },
  ];

  const separatorOptions: readonly StudioSegmentedOption<BreadcrumbSeparatorStyle>[] = [
    { value: 'chevron', label: t('common.studio.breadcrumbSepChevron'), testId: 'opt-sep-chevron' },
    { value: 'slash', label: t('common.studio.breadcrumbSepSlash'), testId: 'opt-sep-slash' },
  ];

  const sizeLabelMap: Record<BreadcrumbSize, string> = useMemo(
    () => ({
      sm: t('common.studio.breadcrumbSizeSm'),
      md: t('common.studio.breadcrumbSizeMd'),
      lg: t('common.studio.breadcrumbSizeLg'),
    }),
    [t],
  );

  const specGroups: StudioSpecGroup[] = useMemo(
    () => [
      {
        title: t('common.studio.breadcrumbSpecLandmark'),
        items: [
          {
            label: t('common.studio.breadcrumbSpecRole'),
            value: 'navigation (aria-label)',
          },
          {
            label: t('common.studio.breadcrumbSpecCurrentItem'),
            value: 'aria-current="page"',
          },
          {
            label: t('common.studio.breadcrumbSpecSize'),
            value: size,
          },
          {
            label: t('common.studio.breadcrumbSpecDirection'),
            value: specimenDir.toUpperCase(),
          },
        ],
      },
      {
        title: t('common.studio.breadcrumbSpecTheme'),
        items: [
          {
            label: t('common.studio.breadcrumbSpecActiveTheme'),
            value: resolvedTheme,
          },
          {
            label: t('common.studio.breadcrumbSpecSeparator'),
            value: separatorStyle,
          },
          {
            label: t('common.studio.breadcrumbSpecRtlMirroring'),
            value: t('common.studio.breadcrumbSpecRtlMirrorValue'),
          },
        ],
      },
    ],
    [t, size, specimenDir, resolvedTheme, separatorStyle],
  );

  const jsxSnippet = useMemo(() => {
    const sizeProp = size !== 'md' ? ` size="${size}"` : '';
    const sep =
      separatorStyle === 'slash'
        ? '<BreadcrumbSeparator>/</BreadcrumbSeparator>'
        : '<BreadcrumbSeparator />';
    const ellipsisNode = hasEllipsis
      ? `\n    <BreadcrumbItem>\n      <BreadcrumbEllipsis />\n    </BreadcrumbItem>\n    ${sep}`
      : '';

    return `<Breadcrumb aria-label="${specimenT('common.studio.breadcrumbNavAria')}"${sizeProp}>
  <BreadcrumbList>
    <BreadcrumbItem>
      <BreadcrumbLink href="/">${specimenT('common.studio.breadcrumbHome')}</BreadcrumbLink>
    </BreadcrumbItem>
    ${sep}
    <BreadcrumbItem>
      <BreadcrumbLink href="/projects">${specimenT('common.studio.breadcrumbProjects')}</BreadcrumbLink>
    </BreadcrumbItem>
    ${sep}${ellipsisNode}
    <BreadcrumbItem>
      <BreadcrumbPage>${specimenT('common.studio.breadcrumbSettings')}</BreadcrumbPage>
    </BreadcrumbItem>
  </BreadcrumbList>
</Breadcrumb>`;
  }, [size, separatorStyle, hasEllipsis, specimenT]);

  const cssModuleSnippet = `/* Breadcrumb adheres to 100% CSS logical properties */
.container {
  display: flex;
  align-items: center;
  padding-block: var(--space-2);
}`;

  const aiAgentPrompt = useMemo(
    () => `Render a pure white-label Breadcrumb navigation hierarchy:
- Enclosing <nav aria-label="${specimenT('common.studio.breadcrumbNavAria')}"> landmark
- Density: size="${size}"
- Separator: ${separatorStyle === 'slash' ? 'slash (/)' : 'chevron (directional, mirrors under RTL)'}
- Ellipsis collapsed mode: ${hasEllipsis ? 'true' : 'false'}
- Direction: ${specimenDir}
- Theme: ${resolvedTheme}
- 100% CSS logical properties, zero dashboard shadows.`,
    [size, separatorStyle, hasEllipsis, specimenDir, resolvedTheme, specimenT],
  );

  const LinkComp = linkComponent;
  const separatorNode = separatorStyle === 'slash' ? '/' : undefined;

  return (
    <GalleryStudioLayout
      activeRoute="breadcrumb"
      title={t('common.studio.breadcrumbTitle')}
      subtitle={t('common.studio.breadcrumbSubtitle')}
      testId="breadcrumb-studio"
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
            label={t('common.studio.breadcrumbViewModeLabel')}
            value={stageView}
            options={viewOptions}
            onChange={setStageView}
          />

          <StudioSegmentedControl
            label={t('common.studio.breadcrumbSizeLabel')}
            value={size}
            options={sizeOptions}
            onChange={setSize}
          />

          <StudioSegmentedControl
            label={t('common.studio.breadcrumbSeparatorLabel')}
            value={separatorStyle}
            options={separatorOptions}
            onChange={setSeparatorStyle}
          />

          <hr className={styles.controlDivider} />

          <StudioToggleRow
            label={t('common.studio.breadcrumbToggleEllipsis')}
            checked={hasEllipsis}
            onCheckedChange={setHasEllipsis}
            testId="toggle-breadcrumb-ellipsis"
          />
        </div>
      }
      inspector={
        <GalleryCodeInspector
          aiPrompt={aiAgentPrompt}
          jsxCode={jsxSnippet}
          cssCode={cssModuleSnippet}
          jsxFileName="page-breadcrumbs.tsx"
          cssFileName="page-breadcrumbs.module.css"
          specGroups={specGroups}
        />
      }
    >
      <div
        data-testid="breadcrumb-canvas"
        className={cn(styles.canvasArea, specimenDir === 'rtl' && styles.canvasRtl)}
        dir={specimenDir}
        lang={specimenLangAttr}
      >
        {stageView === 'single' ? (
          <div className={styles.specimenCard} data-testid="breadcrumb-specimen-card">
            <div className={styles.specimenStage}>
              <Breadcrumb
                data-testid="specimen-breadcrumb"
                aria-label={specimenT('common.studio.breadcrumbNavAria')}
                size={size}
              >
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbLink as={LinkComp} href="#home">
                      {specimenT('common.studio.breadcrumbHome')}
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator>{separatorNode}</BreadcrumbSeparator>
                  <BreadcrumbItem>
                    <BreadcrumbLink as={LinkComp} href="#projects">
                      {specimenT('common.studio.breadcrumbProjects')}
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator>{separatorNode}</BreadcrumbSeparator>
                  {hasEllipsis && (
                    <>
                      <BreadcrumbItem>
                        <BreadcrumbEllipsis />
                      </BreadcrumbItem>
                      <BreadcrumbSeparator>{separatorNode}</BreadcrumbSeparator>
                    </>
                  )}
                  <BreadcrumbItem>
                    <BreadcrumbPage>{specimenT('common.studio.breadcrumbSettings')}</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>
          </div>
        ) : (
          <div className={styles.matrixStack} data-testid="breadcrumb-matrix-grid">
            <section aria-labelledby={densityHeadingId} className={styles.sectionBlock}>
              <h2 id={densityHeadingId} className={styles.sectionHeading}>
                {t('common.studio.breadcrumbMatrixDensityHeading')}
              </h2>
              <div className={styles.specimenGrid}>
                {BREADCRUMB_SIZES.map((itemSize) => (
                  <div key={itemSize} className={styles.showcaseCard}>
                    <span className={styles.showcaseLabel}>{sizeLabelMap[itemSize]}</span>
                    <Breadcrumb
                      data-testid={`matrix-breadcrumb-size-${itemSize}`}
                      aria-label={`${specimenT('common.studio.breadcrumbNavAria')} (${itemSize})`}
                      size={itemSize}
                    >
                      <BreadcrumbList>
                        <BreadcrumbItem>
                          <BreadcrumbLink as={LinkComp} href="#admin">
                            {specimenT('common.studio.breadcrumbAdmin')}
                          </BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                          <BreadcrumbLink as={LinkComp} href="#users">
                            {specimenT('common.studio.breadcrumbUsers')}
                          </BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                          <BreadcrumbPage>
                            {specimenT('common.studio.breadcrumbSettings')}
                          </BreadcrumbPage>
                        </BreadcrumbItem>
                      </BreadcrumbList>
                    </Breadcrumb>
                  </div>
                ))}
              </div>
            </section>

            <section aria-labelledby={separatorHeadingId} className={styles.sectionBlock}>
              <h2 id={separatorHeadingId} className={styles.sectionHeading}>
                {t('common.studio.breadcrumbMatrixSeparatorsHeading')}
              </h2>
              <div className={styles.specimenGrid}>
                <div className={styles.showcaseCard}>
                  <span className={styles.showcaseLabel}>
                    {t('common.studio.breadcrumbSepChevron')}
                  </span>
                  <Breadcrumb
                    data-testid="matrix-breadcrumb-sep-chevron"
                    aria-label={specimenT('common.studio.breadcrumbNavAria')}
                    size="md"
                  >
                    <BreadcrumbList>
                      <BreadcrumbItem>
                        <BreadcrumbLink as={LinkComp} href="#docs">
                          {specimenT('common.studio.breadcrumbDocs')}
                        </BreadcrumbLink>
                      </BreadcrumbItem>
                      <BreadcrumbSeparator />
                      <BreadcrumbItem>
                        <BreadcrumbLink as={LinkComp} href="#components">
                          {specimenT('common.studio.breadcrumbComponents')}
                        </BreadcrumbLink>
                      </BreadcrumbItem>
                      <BreadcrumbSeparator />
                      <BreadcrumbItem>
                        <BreadcrumbPage>
                          {specimenT('common.studio.breadcrumbPageLabel')}
                        </BreadcrumbPage>
                      </BreadcrumbItem>
                    </BreadcrumbList>
                  </Breadcrumb>
                </div>

                <div className={styles.showcaseCard}>
                  <span className={styles.showcaseLabel}>
                    {t('common.studio.breadcrumbSepSlash')}
                  </span>
                  <Breadcrumb
                    data-testid="matrix-breadcrumb-sep-slash"
                    aria-label={specimenT('common.studio.breadcrumbNavAria')}
                    size="md"
                  >
                    <BreadcrumbList>
                      <BreadcrumbItem>
                        <BreadcrumbLink as={LinkComp} href="#docs">
                          {specimenT('common.studio.breadcrumbDocs')}
                        </BreadcrumbLink>
                      </BreadcrumbItem>
                      <BreadcrumbSeparator>/</BreadcrumbSeparator>
                      <BreadcrumbItem>
                        <BreadcrumbLink as={LinkComp} href="#components">
                          {specimenT('common.studio.breadcrumbComponents')}
                        </BreadcrumbLink>
                      </BreadcrumbItem>
                      <BreadcrumbSeparator>/</BreadcrumbSeparator>
                      <BreadcrumbItem>
                        <BreadcrumbPage>
                          {specimenT('common.studio.breadcrumbPageLabel')}
                        </BreadcrumbPage>
                      </BreadcrumbItem>
                    </BreadcrumbList>
                  </Breadcrumb>
                </div>

                <div className={styles.showcaseCard}>
                  <span className={styles.showcaseLabel}>
                    {t('common.studio.breadcrumbToggleEllipsis')}
                  </span>
                  <Breadcrumb
                    data-testid="matrix-breadcrumb-ellipsis"
                    aria-label={specimenT('common.studio.breadcrumbNavAria')}
                    size="md"
                  >
                    <BreadcrumbList>
                      <BreadcrumbItem>
                        <BreadcrumbLink as={LinkComp} href="#home">
                          {specimenT('common.studio.breadcrumbHome')}
                        </BreadcrumbLink>
                      </BreadcrumbItem>
                      <BreadcrumbSeparator />
                      <BreadcrumbItem>
                        <BreadcrumbEllipsis />
                      </BreadcrumbItem>
                      <BreadcrumbSeparator />
                      <BreadcrumbItem>
                        <BreadcrumbPage>
                          {specimenT('common.studio.breadcrumbSettings')}
                        </BreadcrumbPage>
                      </BreadcrumbItem>
                    </BreadcrumbList>
                  </Breadcrumb>
                </div>
              </div>
            </section>
          </div>
        )}
      </div>
    </GalleryStudioLayout>
  );
}
