'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  type PaginationShape,
  type PaginationSize,
} from '@/components/ui';
import {
  BidiText,
  defaultMessages,
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
  type StudioSpecGroup,
  StudioToggleRow,
} from '../gallery-studio';
import styles from './pagination-gallery.module.css';

export interface PaginationGalleryProps {
  linkComponent?: StudioLinkComponent;
}

export function PaginationGallery({ linkComponent }: PaginationGalleryProps) {
  const { t, locale, direction } = useI18n();

  const [specimenDir, setSpecimenDir] = useState<'ltr' | 'rtl'>(direction);
  const [size, setSize] = useState<PaginationSize>('md');
  const [shape, setShape] = useState<PaginationShape>('rounded');
  const [currentPage, setCurrentPage] = useState<number>(3);
  const [totalPages, setTotalPages] = useState<number>(10);
  const [showEllipsis, setShowEllipsis] = useState<boolean>(true);

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
    setSize('md');
    setShape('rounded');
    setCurrentPage(3);
    setTotalPages(10);
    setShowEllipsis(true);
  }, [direction]);

  const pageNumbers = useMemo(() => {
    if (!showEllipsis || totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const pages: (number | 'ellipsis')[] = [];
    pages.push(1);

    if (currentPage > 3) {
      pages.push('ellipsis');
    }

    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (currentPage < totalPages - 2) {
      pages.push('ellipsis');
    }

    if (totalPages > 1) {
      pages.push(totalPages);
    }

    return pages;
  }, [currentPage, totalPages, showEllipsis]);

  const specGroups: StudioSpecGroup[] = useMemo(
    () => [
      {
        title: t('common.studio.paginationSpecGroupConfig'),
        items: [
          {
            label: t('common.studio.paginationSpecActivePage'),
            value: `${currentPage} / ${totalPages}`,
          },
          { label: t('common.studio.paginationSpecDensity'), value: size },
          {
            label: t('common.studio.paginationSpecShape'),
            value:
              shape === 'pill'
                ? t('common.studio.paginationShapePill')
                : t('common.studio.paginationShapeRounded'),
          },
          {
            label: t('common.studio.paginationSpecPrevDisabled'),
            value:
              currentPage === 1
                ? t('common.studio.paginationYes')
                : t('common.studio.paginationNo'),
          },
          {
            label: t('common.studio.paginationSpecNextDisabled'),
            value:
              currentPage === totalPages
                ? t('common.studio.paginationYes')
                : t('common.studio.paginationNo'),
          },
        ],
      },
      {
        title: t('common.studio.paginationSpecGroupA11y'),
        items: [
          {
            label: t('common.studio.paginationSpecLandmark'),
            value: t('common.studio.paginationSpecLandmarkVal'),
          },
          {
            label: t('common.studio.paginationSpecCurrentFlag'),
            value: t('common.studio.paginationSpecCurrentFlagVal'),
          },
          {
            label: t('common.studio.paginationSpecDisabled'),
            value: t('common.studio.paginationSpecDisabledVal'),
          },
          {
            label: t('common.studio.paginationSpecRTL'),
            value: t('common.studio.paginationSpecRTLVal'),
          },
        ],
      },
    ],
    [currentPage, shape, size, t, totalPages],
  );

  const jsxSnippet = useMemo(() => {
    const landmarkLabel = specimenT('common.studio.paginationLandmarkLabel');
    const prevLabel = specimenT('common.studio.paginationPrevLabel');
    const nextLabel = specimenT('common.studio.paginationNextLabel');
    const moreLabel = specimenT('common.studio.paginationMorePagesLabel');

    return `<Pagination aria-label="${landmarkLabel}" size="${size}" shape="${shape}">
  <PaginationContent>
    <PaginationItem>
      <PaginationPrevious
        as="button"
        type="button"
        label="${prevLabel}"
        disabled={${currentPage === 1}}
        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
      />
    </PaginationItem>
${pageNumbers
  .map((p, idx) =>
    p === 'ellipsis'
      ? `    <PaginationItem key="e-${idx}">
      <PaginationEllipsis label="${moreLabel}" />
    </PaginationItem>`
      : `    <PaginationItem key="${p}">
      <PaginationLink
        as="button"
        type="button"
        isActive={${currentPage === p}}
        onClick={() => setCurrentPage(${p})}
      >
        ${p}
      </PaginationLink>
    </PaginationItem>`,
  )
  .join('\n')}
    <PaginationItem>
      <PaginationNext
        as="button"
        type="button"
        label="${nextLabel}"
        disabled={${currentPage === totalPages}}
        onClick={() => setCurrentPage(p => Math.min(${totalPages}, p + 1))}
      />
    </PaginationItem>
  </PaginationContent>
</Pagination>`;
  }, [currentPage, pageNumbers, shape, size, specimenT, totalPages]);

  const aiPrompt = useMemo(
    () =>
      `Build an accessible multi-page Pagination control at size="${size}", shape="${shape}", currentPage=${currentPage}, totalPages=${totalPages}, RTL-mirrored chevron icons, disabled state click guards, and localized landmark/control labels.`,
    [size, shape, currentPage, totalPages],
  );

  return (
    <GalleryStudioLayout
      activeRoute="pagination"
      title={t('common.studio.paginationTitle')}
      subtitle={t('common.studio.paginationSubtitle')}
      testId="pagination-studio"
      previewDir={specimenDir}
      onReset={handleReset}
      linkComponent={linkComponent}
      controls={
        <>
          <StudioSegmentedControl<'ltr' | 'rtl'>
            label={t('common.studio.specimenDirectionLabel')}
            value={specimenDir}
            columns={2}
            onChange={setSpecimenDir}
            options={[
              {
                value: 'ltr',
                label: t('common.studio.specimenDirLtr'),
                testId: 'pagination-dir-ltr',
              },
              {
                value: 'rtl',
                label: t('common.studio.specimenDirRtl'),
                testId: 'pagination-dir-rtl',
              },
            ]}
          />

          <StudioSegmentedControl<PaginationSize>
            label={t('common.studio.paginationSizeLabel')}
            value={size}
            columns={3}
            onChange={setSize}
            options={[
              {
                value: 'sm',
                label: t('common.studio.paginationSizeSm'),
                testId: 'pagination-size-sm',
              },
              {
                value: 'md',
                label: t('common.studio.paginationSizeMd'),
                testId: 'pagination-size-md',
              },
              {
                value: 'lg',
                label: t('common.studio.paginationSizeLg'),
                testId: 'pagination-size-lg',
              },
            ]}
          />

          <StudioSegmentedControl<PaginationShape>
            label={t('common.studio.paginationShapeLabel')}
            value={shape}
            columns={2}
            onChange={setShape}
            options={[
              {
                value: 'rounded',
                label: t('common.studio.paginationShapeRounded'),
                testId: 'pagination-shape-rounded',
              },
              {
                value: 'pill',
                label: t('common.studio.paginationShapePill'),
                testId: 'pagination-shape-pill',
              },
            ]}
          />

          <StudioSegmentedControl<string>
            label={t('common.studio.paginationTotalLabel')}
            value={String(totalPages)}
            columns={3}
            onChange={(val) => {
              const count = Number(val);
              setTotalPages(count);
              if (currentPage > count) setCurrentPage(count);
            }}
            options={[
              {
                value: '5',
                label: t('common.studio.paginationPages5'),
                testId: 'pagination-total-5',
              },
              {
                value: '10',
                label: t('common.studio.paginationPages10'),
                testId: 'pagination-total-10',
              },
              {
                value: '20',
                label: t('common.studio.paginationPages20'),
                testId: 'pagination-total-20',
              },
            ]}
          />

          <StudioToggleRow
            label={t('common.studio.paginationToggleEllipsis')}
            checked={showEllipsis}
            onCheckedChange={setShowEllipsis}
            testId="toggle-pagination-ellipsis"
          />
        </>
      }
      inspector={
        <GalleryCodeInspector
          aiPrompt={aiPrompt}
          jsxCode={jsxSnippet}
          cssCode={null}
          jsxFileName="pagination-controls.tsx"
          cssFileName="pagination.module.css"
          specGroups={specGroups}
        />
      }
    >
      <div
        className={styles.stageWrapper}
        data-testid="pagination-canvas"
        dir={specimenDir}
        lang={specimenLangAttr}
      >
        <div className={styles.specimenCard}>
          <div className={styles.pageStatus} data-testid="pagination-status">
            <span>{specimenT('common.studio.paginationActivePrefix')}:</span>
            <span className={styles.pageNumber}>
              {specimenT('common.studio.paginationPageLabel')}{' '}
              <BidiText dir="ltr">{currentPage}</BidiText>{' '}
              {specimenT('common.studio.paginationOfLabel')}{' '}
              <BidiText dir="ltr">{totalPages}</BidiText>
            </span>
          </div>

          <Pagination
            aria-label={specimenT('common.studio.paginationLandmarkLabel')}
            size={size}
            shape={shape}
            data-testid="specimen-pagination"
          >
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  as="button"
                  type="button"
                  label={specimenT('common.studio.paginationPrevLabel')}
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  data-testid="pagination-prev-btn"
                />
              </PaginationItem>

              {pageNumbers.map((page, index) => (
                <PaginationItem key={page === 'ellipsis' ? `ellipsis-${index}` : page}>
                  {page === 'ellipsis' ? (
                    <PaginationEllipsis
                      label={specimenT('common.studio.paginationMorePagesLabel')}
                    />
                  ) : (
                    <PaginationLink
                      as="button"
                      type="button"
                      isActive={currentPage === page}
                      onClick={() => setCurrentPage(page)}
                      data-testid={`pagination-page-${page}`}
                    >
                      {page}
                    </PaginationLink>
                  )}
                </PaginationItem>
              ))}

              <PaginationItem>
                <PaginationNext
                  as="button"
                  type="button"
                  label={specimenT('common.studio.paginationNextLabel')}
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  data-testid="pagination-next-btn"
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </div>
    </GalleryStudioLayout>
  );
}
