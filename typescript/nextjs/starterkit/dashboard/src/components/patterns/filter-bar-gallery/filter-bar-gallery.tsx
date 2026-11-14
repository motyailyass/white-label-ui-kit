'use client';

import { useCallback, useMemo, useState } from 'react';
import { Icon, type IconName } from '@/components/icons';
import {
  FilterBar,
  FilterBarClear,
  FilterBarGroup,
  FilterBarItem,
  FilterBarMain,
  FilterBarSummary,
  FilterBarTag,
  FilterBarTags,
  SearchInput,
} from '@/components/ui';
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
import styles from './filter-bar-gallery.module.css';

export type FilterFacetId = 'status' | 'category' | 'region';
export type FilterCountPreset = 'all' | 'single' | 'none';

export interface FilterBarGalleryProps {
  linkComponent?: StudioLinkComponent;
}

interface FacetDescriptor {
  id: FilterFacetId;
  icon: IconName;
  triggerEn: string;
  triggerAr: string;
  categoryEn: string;
  categoryAr: string;
  valueEn: string;
  valueAr: string;
}

const FACETS: readonly FacetDescriptor[] = [
  {
    id: 'status',
    icon: 'check-circle',
    triggerEn: 'Status',
    triggerAr: 'الحالة',
    categoryEn: 'Status',
    categoryAr: 'الحالة',
    valueEn: 'Paid',
    valueAr: 'مدفوع',
  },
  {
    id: 'category',
    icon: 'sliders',
    triggerEn: 'Category',
    triggerAr: 'الفئة',
    categoryEn: 'Category',
    categoryAr: 'الفئة',
    valueEn: 'Infrastructure',
    valueAr: 'البنية التحتية',
  },
  {
    id: 'region',
    icon: 'building',
    triggerEn: 'Region',
    triggerAr: 'المنطقة',
    categoryEn: 'Cluster',
    categoryAr: 'النطاق',
    valueEn: 'EU-Central',
    valueAr: 'أوروبا الوسطى',
  },
];

const TOTAL_RECORDS = 148;

function computeFilteredCount(activeCount: number, query: string): number {
  const baseByFilterCount =
    activeCount === 3 ? 24 : activeCount === 2 ? 52 : activeCount === 1 ? 94 : TOTAL_RECORDS;
  const trimmed = query.trim();
  if (!trimmed) return baseByFilterCount;
  return Math.max(
    1,
    Math.floor(baseByFilterCount / Math.min(baseByFilterCount, trimmed.length + 1)),
  );
}

export function FilterBarGallery({ linkComponent }: FilterBarGalleryProps) {
  const { t } = useI18n();

  const [specimenDir, setSpecimenDir] = useState<'ltr' | 'rtl'>('ltr');
  const [search, setSearch] = useState<string>('');
  const [activeFacetIds, setActiveFacetIds] = useState<FilterFacetId[]>([
    'status',
    'category',
    'region',
  ]);
  const [disabled, setDisabled] = useState<boolean>(false);

  const isRtl = specimenDir === 'rtl';

  const countPreset: FilterCountPreset =
    activeFacetIds.length >= 2 ? 'all' : activeFacetIds.length === 1 ? 'single' : 'none';

  const handleCountPresetChange = useCallback((preset: FilterCountPreset) => {
    if (preset === 'all') {
      setActiveFacetIds(['status', 'category', 'region']);
    } else if (preset === 'single') {
      setActiveFacetIds(['status']);
    } else {
      setActiveFacetIds([]);
    }
  }, []);

  const handleToggleFacet = useCallback((facetId: FilterFacetId) => {
    setActiveFacetIds((prev) =>
      prev.includes(facetId) ? prev.filter((id) => id !== facetId) : [...prev, facetId],
    );
  }, []);

  const handleRemoveFacet = useCallback((facetId: FilterFacetId) => {
    setActiveFacetIds((prev) => prev.filter((id) => id !== facetId));
  }, []);

  const handleClearAll = useCallback(() => {
    setActiveFacetIds([]);
    setSearch('');
  }, []);

  const handleReset = useCallback(() => {
    setSpecimenDir('ltr');
    setSearch('');
    setActiveFacetIds(['status', 'category', 'region']);
    setDisabled(false);
  }, []);

  const activeFacets = useMemo(
    () => FACETS.filter((facet) => activeFacetIds.includes(facet.id)),
    [activeFacetIds],
  );

  const matchingCount = useMemo(
    () => computeFilteredCount(activeFacets.length, search),
    [activeFacets.length, search],
  );

  const dirOptions: StudioSegmentedOption<'ltr' | 'rtl'>[] = [
    { value: 'ltr', label: t('common.studio.specimenDirLtr') },
    { value: 'rtl', label: t('common.studio.specimenDirRtl') },
  ];

  const countPresetOptions: StudioSegmentedOption<FilterCountPreset>[] = [
    { value: 'all', label: '3 Active' },
    { value: 'single', label: '1 Active' },
    { value: 'none', label: 'None (0)' },
  ];

  const summaryText = isRtl
    ? `عرض ${matchingCount} من أصل ${TOTAL_RECORDS} سجل`
    : `Showing ${matchingCount} of ${TOTAL_RECORDS} entries`;

  const jsxSnippet = useMemo(() => {
    return `<FilterBar aria-label="${isRtl ? 'شريط تصفية المعاملات المالية' : 'Transactions filter toolbar'}">
  <FilterBarMain>
    <SearchInput
      value={search}
      onChange={(e) => setSearch(e.target.value)}
      placeholder="${isRtl ? 'تصفية المعاملات...' : 'Filter transactions...'}"
      size="sm"${disabled ? '\n      disabled' : ''}
    />
    <FilterBarGroup>
      ${FACETS.map((facet) => {
        const isActive = activeFacetIds.includes(facet.id);
        const label = isRtl ? facet.triggerAr : facet.triggerEn;
        return `<FilterBarItem${isActive ? ' active count={1}' : ''}${disabled ? ' disabled' : ''}>${label}</FilterBarItem>`;
      }).join('\n      ')}
    </FilterBarGroup>
  </FilterBarMain>
  <FilterBarTags>
    ${activeFacets
      .map((f) => {
        const cat = isRtl ? f.categoryAr : f.categoryEn;
        const val = isRtl ? f.valueAr : f.valueEn;
        const removeLabel = isRtl ? `إزالة مرشح ${cat}: ${val}` : `Remove filter ${cat}: ${val}`;
        return `<FilterBarTag category="${cat}" label="${val}" removeAriaLabel="${removeLabel}" onRemove={() => remove("${f.id}")} />`;
      })
      .join(
        '\n    ',
      )}${activeFacets.length > 0 ? `\n    <FilterBarClear onClear={clearAll}>${isRtl ? 'مسح الكل' : 'Clear all'}</FilterBarClear>` : ''}
    <FilterBarSummary>${summaryText}</FilterBarSummary>
  </FilterBarTags>
</FilterBar>`;
  }, [activeFacetIds, activeFacets, disabled, isRtl, summaryText]);

  const aiPrompt = useMemo(() => {
    return `Create an accessible search and faceted filter toolbar using White-Label UI Kit:
- Active Filters: ${activeFacets.length}
- Disabled: ${disabled ? 'true' : 'false'}
- Direction: ${specimenDir.toUpperCase()}
- Faceted filter triggers with aria-pressed and count badges
- Active filter tag chips with category/value labels and accessible remove buttons
- Polite live-region result summary aligned in the footer bar
- Compound components: FilterBar, FilterBarMain, FilterBarGroup, FilterBarItem, FilterBarTags, FilterBarTag, FilterBarClear, FilterBarSummary`;
  }, [activeFacets.length, disabled, specimenDir]);

  const specGroups: StudioSpecGroup[] = useMemo(() => {
    return [
      {
        title: 'Component Parameters',
        items: [
          { label: 'Active Filters', value: `${activeFacets.length} active` },
          { label: 'Matched Records', value: `${matchingCount} / ${TOTAL_RECORDS}` },
          { label: 'Search Query', value: search || '(empty)' },
          { label: 'Disabled', value: disabled ? 'true' : 'false' },
          { label: 'Direction', value: specimenDir.toUpperCase() },
        ],
      },
      {
        title: 'Accessibility & WAI-ARIA',
        items: [
          { label: 'Toolbar Container', value: 'role="toolbar" aria-label' },
          { label: 'Facet Toggle', value: 'aria-pressed={active}' },
          { label: 'Tag Remove Action', value: 'aria-label="Remove filter {category}: {label}"' },
          { label: 'Result Summary', value: 'role="status" aria-live="polite"' },
        ],
      },
    ];
  }, [activeFacets.length, matchingCount, search, disabled, specimenDir]);

  const controls = (
    <>
      <StudioSegmentedControl
        label={t('common.studio.specimenDirectionLabel')}
        value={specimenDir}
        options={dirOptions}
        onChange={setSpecimenDir}
      />

      <StudioSegmentedControl
        label={t('common.studio.filterBarActiveCount')}
        value={countPreset}
        options={countPresetOptions}
        onChange={handleCountPresetChange}
      />

      <StudioToggleRow
        label={t('common.studio.fileUploadDisabled')}
        checked={disabled}
        onCheckedChange={setDisabled}
        testId="toggle-filter-disabled"
      />
    </>
  );

  const hasActiveFilters = activeFacets.length > 0 || search.trim().length > 0;

  return (
    <GalleryStudioLayout
      activeRoute="filter-bar"
      title={t('common.studio.filterBarTitle')}
      subtitle={t('common.studio.filterBarSubtitle')}
      testId="gallery-filter-bar"
      controls={controls}
      onReset={handleReset}
      previewDir={specimenDir}
      linkComponent={linkComponent}
      inspector={
        <GalleryCodeInspector
          aiPrompt={aiPrompt}
          jsxCode={jsxSnippet}
          cssCode={null}
          cssFileName="filter-bar.module.css"
          jsxFileName="filter-bar.tsx"
          specGroups={specGroups}
        />
      }
    >
      <div className={styles.specimenCanvas} dir={specimenDir} lang={isRtl ? 'ar' : 'en'}>
        <div className={styles.specimenBox}>
          <FilterBar
            aria-label={
              isRtl ? 'شريط تصفية المعاملات المالية' : 'Financial transactions filter toolbar'
            }
            data-testid="interactive-filter-bar"
          >
            <FilterBarMain>
              <div className={styles.searchSlot}>
                <SearchInput
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={isRtl ? 'تصفية المعاملات...' : 'Filter transactions...'}
                  aria-label={isRtl ? 'تصفية المعاملات' : 'Filter transactions'}
                  size="sm"
                  disabled={disabled}
                  data-testid="filter-bar-search"
                />
              </div>

              <FilterBarGroup>
                {FACETS.map((facet) => {
                  const isActive = activeFacetIds.includes(facet.id);
                  const triggerLabel = isRtl ? facet.triggerAr : facet.triggerEn;
                  return (
                    <FilterBarItem
                      key={facet.id}
                      active={isActive}
                      count={isActive ? 1 : 0}
                      icon={<Icon name={facet.icon} size={14} />}
                      disabled={disabled}
                      onClick={() => handleToggleFacet(facet.id)}
                      data-testid={`filter-item-${facet.id}`}
                    >
                      {triggerLabel}
                    </FilterBarItem>
                  );
                })}
              </FilterBarGroup>
            </FilterBarMain>

            <FilterBarTags data-testid="filter-bar-tags">
              {activeFacets.map((facet) => {
                const cat = isRtl ? facet.categoryAr : facet.categoryEn;
                const val = isRtl ? facet.valueAr : facet.valueEn;
                return (
                  <FilterBarTag
                    key={facet.id}
                    category={cat}
                    label={val}
                    disabled={disabled}
                    onRemove={() => handleRemoveFacet(facet.id)}
                    removeAriaLabel={
                      isRtl ? `إزالة مرشح ${cat}: ${val}` : `Remove filter ${cat}: ${val}`
                    }
                    data-testid={`filter-tag-${facet.id}`}
                  />
                );
              })}

              {hasActiveFilters ? (
                <FilterBarClear
                  disabled={disabled}
                  onClear={handleClearAll}
                  data-testid="filter-bar-clear"
                >
                  {isRtl ? 'مسح الكل' : 'Clear all'}
                </FilterBarClear>
              ) : (
                <span className={styles.emptyFiltersHint}>
                  {isRtl ? 'لا توجد مرشحات نشطة' : 'No active filters applied'}
                </span>
              )}

              <FilterBarSummary data-testid="filter-bar-summary">{summaryText}</FilterBarSummary>
            </FilterBarTags>
          </FilterBar>
        </div>
      </div>
    </GalleryStudioLayout>
  );
}
