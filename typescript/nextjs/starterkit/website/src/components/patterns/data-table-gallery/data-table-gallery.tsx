'use client';

import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import { Icon } from '@/components/icons';
import {
  Badge,
  type BadgeVariant,
  Button,
  Card,
  Checkbox,
  Dropdown,
  DropdownContent,
  DropdownItem,
  DropdownTrigger,
  EmptyState,
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  SearchInput,
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableContainer,
  type TableDensity,
  TableEmpty,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
  type TableSortDirection,
} from '@/components/ui';
import {
  BidiText,
  defaultMessages,
  formatCurrency,
  formatDate,
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
import styles from './data-table-gallery.module.css';

export interface DataTableGalleryProps {
  linkComponent?: StudioLinkComponent;
}

type InvoiceStatus = 'paid' | 'pending' | 'failed';

interface InvoiceRow {
  id: string;
  customer: string;
  email: string;
  status: InvoiceStatus;
  amount: number;
  currency: string;
  date: string;
}

const STATUS_BADGE_VARIANTS: Record<InvoiceStatus, BadgeVariant> = {
  paid: 'success',
  pending: 'warning',
  failed: 'danger',
};

const INVOICE_DATASET: readonly InvoiceRow[] = [
  {
    id: 'INV-1001',
    customer: 'Acme Corporation',
    email: 'billing@acme.com',
    status: 'paid',
    amount: 3450.0,
    currency: 'USD',
    date: '2026-11-01',
  },
  {
    id: 'INV-1002',
    customer: 'Globex Industries',
    email: 'finance@globex.io',
    status: 'pending',
    amount: 1200.5,
    currency: 'USD',
    date: '2026-11-02',
  },
  {
    id: 'INV-1003',
    customer: 'Soylent Health',
    email: 'ap@soylent.org',
    status: 'paid',
    amount: 890.0,
    currency: 'USD',
    date: '2026-11-03',
  },
  {
    id: 'INV-1004',
    customer: 'Initech Systems',
    email: 'peter@initech.co',
    status: 'failed',
    amount: 450.0,
    currency: 'USD',
    date: '2026-11-04',
  },
  {
    id: 'INV-1005',
    customer: 'Umbrella Biometrics',
    email: 'accounts@umbrella.tech',
    status: 'paid',
    amount: 6780.25,
    currency: 'USD',
    date: '2026-11-05',
  },
  {
    id: 'INV-1006',
    customer: 'Stark Manufacturing',
    email: 'invoices@stark.com',
    status: 'paid',
    amount: 14200.0,
    currency: 'USD',
    date: '2026-11-06',
  },
  {
    id: 'INV-1007',
    customer: 'Wayne Logistics',
    email: 'bruce@waynecorp.com',
    status: 'pending',
    amount: 5120.75,
    currency: 'USD',
    date: '2026-11-07',
  },
  {
    id: 'INV-1008',
    customer: 'Cyberdyne AI',
    email: 'pay@cyberdyne.net',
    status: 'failed',
    amount: 2890.0,
    currency: 'USD',
    date: '2026-11-08',
  },
  {
    id: 'INV-1009',
    customer: 'Massive Dynamic',
    email: 'admin@massivedynamic.org',
    status: 'paid',
    amount: 9340.5,
    currency: 'USD',
    date: '2026-11-09',
  },
  {
    id: 'INV-1010',
    customer: 'Hooli Cloud Services',
    email: 'accounts@hooli.com',
    status: 'paid',
    amount: 1875.0,
    currency: 'USD',
    date: '2026-11-10',
  },
  {
    id: 'INV-1011',
    customer: 'Pied Piper Audio',
    email: 'richard@piedpiper.com',
    status: 'pending',
    amount: 340.0,
    currency: 'USD',
    date: '2026-11-11',
  },
  {
    id: 'INV-1012',
    customer: 'Aperture Science',
    email: 'glados@aperture.lab',
    status: 'paid',
    amount: 8200.0,
    currency: 'USD',
    date: '2026-11-12',
  },
  {
    id: 'INV-1013',
    customer: 'Black Mesa Research',
    email: 'freeman@blackmesa.gov',
    status: 'failed',
    amount: 4120.0,
    currency: 'USD',
    date: '2026-11-13',
  },
  {
    id: 'INV-1014',
    customer: 'Tyrell Replicants',
    email: 'finance@tyrell.corp',
    status: 'paid',
    amount: 11500.0,
    currency: 'USD',
    date: '2026-11-14',
  },
  {
    id: 'INV-1015',
    customer: 'Weyland-Yutani Corp',
    email: 'cargo@weyland.com',
    status: 'pending',
    amount: 7650.0,
    currency: 'USD',
    date: '2026-11-15',
  },
  {
    id: 'INV-1016',
    customer: 'Oscorp Chemical',
    email: 'norman@oscorp.io',
    status: 'paid',
    amount: 3890.2,
    currency: 'USD',
    date: '2026-11-16',
  },
  {
    id: 'INV-1017',
    customer: 'Dunder Mifflin Paper',
    email: 'michael@dundermifflin.com',
    status: 'paid',
    amount: 620.0,
    currency: 'USD',
    date: '2026-11-17',
  },
  {
    id: 'INV-1018',
    customer: 'Wonka Confections',
    email: 'charlie@wonka.factory',
    status: 'pending',
    amount: 2150.0,
    currency: 'USD',
    date: '2026-11-18',
  },
  {
    id: 'INV-1019',
    customer: 'Gekko & Co Capital',
    email: 'gordon@gekko.wallst',
    status: 'paid',
    amount: 19400.0,
    currency: 'USD',
    date: '2026-11-19',
  },
  {
    id: 'INV-1020',
    customer: 'Prestige Worldwide',
    email: 'dale@prestige.com',
    status: 'failed',
    amount: 150.0,
    currency: 'USD',
    date: '2026-11-20',
  },
  {
    id: 'INV-1021',
    customer: 'Nakatomi Trading',
    email: 'takagi@nakatomi.tokyo',
    status: 'paid',
    amount: 8840.0,
    currency: 'USD',
    date: '2026-11-21',
  },
  {
    id: 'INV-1022',
    customer: 'Bluth Development',
    email: 'michael@bluthco.com',
    status: 'pending',
    amount: 990.0,
    currency: 'USD',
    date: '2026-11-22',
  },
  {
    id: 'INV-1023',
    customer: 'Krusty Burger Holdings',
    email: 'krusty@krustyburger.com',
    status: 'paid',
    amount: 1340.0,
    currency: 'USD',
    date: '2026-11-23',
  },
  {
    id: 'INV-1024',
    customer: 'Monsters Energy Inc',
    email: 'sulley@monsters.city',
    status: 'paid',
    amount: 4890.0,
    currency: 'USD',
    date: '2026-11-24',
  },
  {
    id: 'INV-1025',
    customer: 'Vandelay Industries',
    email: 'art@vandelay.latex',
    status: 'pending',
    amount: 720.0,
    currency: 'USD',
    date: '2026-11-25',
  },
];

export function DataTableGallery({ linkComponent }: DataTableGalleryProps) {
  const { t, locale, direction } = useI18n();
  const pageSizeTriggerId = useId();
  const tableViewportRef = useRef<HTMLDivElement>(null);

  // Visual Controls
  const [specimenDir, setSpecimenDir] = useState<'ltr' | 'rtl'>(direction);
  const [density, setDensity] = useState<TableDensity>('default');
  const [striped, setStriped] = useState<boolean>(false);
  const [stickyHeader, setStickyHeader] = useState<boolean>(false);
  const [showFooter, setShowFooter] = useState<boolean>(false);
  const [showEmptyState, setShowEmptyState] = useState<boolean>(false);

  // Data Filtering, Sorting & Pagination State
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortColumn, setSortColumn] = useState<'customer' | 'amount' | null>(null);
  const [sortDirection, setSortDirection] = useState<TableSortDirection>('none');
  const [pageSize, setPageSize] = useState<number>(5);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [selectedIds, setSelectedIds] = useState<string[]>(['INV-1001']);
  const [exportedCount, setExportedCount] = useState<number | null>(null);

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
    setDensity('default');
    setStriped(false);
    setStickyHeader(false);
    setShowFooter(false);
    setShowEmptyState(false);
    setSearchQuery('');
    setSortColumn(null);
    setSortDirection('none');
    setPageSize(5);
    setCurrentPage(1);
    setSelectedIds(['INV-1001']);
    setExportedCount(null);
  }, [direction]);

  const dirOptions: readonly StudioSegmentedOption<'ltr' | 'rtl'>[] = useMemo(
    () => [
      { value: 'ltr', label: t('common.studio.specimenDirLtr'), testId: 'data-table-dir-ltr' },
      { value: 'rtl', label: t('common.studio.specimenDirRtl'), testId: 'data-table-dir-rtl' },
    ],
    [t],
  );

  const densityOptions: readonly StudioSegmentedOption<TableDensity>[] = useMemo(
    () => [
      {
        value: 'compact',
        label: t('common.studio.dataTableDensityCompact'),
        testId: 'data-table-density-compact',
      },
      {
        value: 'default',
        label: t('common.studio.dataTableDensityDefault'),
        testId: 'data-table-density-default',
      },
      {
        value: 'comfortable',
        label: t('common.studio.dataTableDensityComfortable'),
        testId: 'data-table-density-comfortable',
      },
    ],
    [t],
  );

  const toggleSort = useCallback(
    (column: 'customer' | 'amount') => {
      if (sortColumn !== column) {
        setSortColumn(column);
        setSortDirection('ascending');
      } else if (sortDirection === 'ascending') {
        setSortDirection('descending');
      } else if (sortDirection === 'descending') {
        setSortColumn(null);
        setSortDirection('none');
      } else {
        setSortDirection('ascending');
      }
      setCurrentPage(1);
      setExportedCount(null);
    },
    [sortColumn, sortDirection],
  );

  const filteredSortedData = useMemo(() => {
    if (showEmptyState) return [];

    let result = INVOICE_DATASET;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (row) =>
          row.customer.toLowerCase().includes(q) ||
          row.email.toLowerCase().includes(q) ||
          row.id.toLowerCase().includes(q),
      );
    }

    if (sortColumn && sortDirection !== 'none') {
      result = [...result].sort((a, b) => {
        const valA = a[sortColumn];
        const valB = b[sortColumn];
        if (typeof valA === 'string' && typeof valB === 'string') {
          return sortDirection === 'ascending'
            ? valA.localeCompare(valB)
            : valB.localeCompare(valA);
        }
        if (typeof valA === 'number' && typeof valB === 'number') {
          return sortDirection === 'ascending' ? valA - valB : valB - valA;
        }
        return 0;
      });
    }

    return result;
  }, [searchQuery, sortColumn, sortDirection, showEmptyState]);

  const totalEntries = filteredSortedData.length;
  const totalPages = Math.max(1, Math.ceil(totalEntries / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);

  const startIndex = (safeCurrentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalEntries);
  const currentPagedRows = useMemo(
    () => filteredSortedData.slice(startIndex, endIndex),
    [filteredSortedData, startIndex, endIndex],
  );

  const pageSubtotal = useMemo(
    () => currentPagedRows.reduce((acc, row) => acc + row.amount, 0),
    [currentPagedRows],
  );

  const pageRowIds = useMemo(() => currentPagedRows.map((r) => r.id), [currentPagedRows]);
  const isPageAllSelected =
    pageRowIds.length > 0 && pageRowIds.every((id) => selectedIds.includes(id));
  const isPageSomeSelected =
    pageRowIds.some((id) => selectedIds.includes(id)) && !isPageAllSelected;

  const handleSelectPage = useCallback(() => {
    setExportedCount(null);
    if (isPageAllSelected) {
      setSelectedIds((prev) => prev.filter((id) => !pageRowIds.includes(id)));
    } else {
      setSelectedIds((prev) => Array.from(new Set([...prev, ...pageRowIds])));
    }
  }, [isPageAllSelected, pageRowIds]);

  const toggleRowSelect = useCallback((id: string) => {
    setExportedCount(null);
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  }, []);

  const pageNumbers = useMemo(() => {
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    const pages: (number | 'ellipsis')[] = [1];
    if (safeCurrentPage > 3) pages.push('ellipsis');
    const start = Math.max(2, safeCurrentPage - 1);
    const end = Math.min(totalPages - 1, safeCurrentPage + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    if (safeCurrentPage < totalPages - 2) pages.push('ellipsis');
    pages.push(totalPages);
    return pages;
  }, [safeCurrentPage, totalPages]);

  const getStatusLabel = useCallback(
    (status: InvoiceStatus) => {
      switch (status) {
        case 'paid':
          return specimenT('common.studio.dataTableStatusPaid');
        case 'pending':
          return specimenT('common.studio.dataTableStatusPending');
        case 'failed':
          return specimenT('common.studio.dataTableStatusFailed');
      }
    },
    [specimenT],
  );

  const specGroups: StudioSpecGroup[] = useMemo(
    () => [
      {
        title: t('common.studio.dataTableSpecGroupMetrics'),
        items: [
          {
            label: t('common.studio.dataTableSpecActivePage'),
            value: `${safeCurrentPage} / ${totalPages}`,
          },
          {
            label: t('common.studio.dataTableSpecVisibleRows'),
            value: `${currentPagedRows.length} / ${totalEntries}`,
          },
          {
            label: t('common.studio.dataTableSpecSelectedTotal'),
            value: `${selectedIds.length} ${
              selectedIds.length === 1
                ? t('common.studio.dataTableRowSingular')
                : t('common.studio.dataTableRowPlural')
            }`,
          },
          { label: t('common.studio.dataTableSpecDensity'), value: density },
          {
            label: t('common.studio.dataTableSpecStriped'),
            value: striped ? t('common.studio.dataTableYes') : t('common.studio.dataTableNo'),
          },
          {
            label: t('common.studio.dataTableSpecStickyHeader'),
            value: stickyHeader ? t('common.studio.dataTableYes') : t('common.studio.dataTableNo'),
          },
        ],
      },
      {
        title: t('common.studio.dataTableSpecGroupA11y'),
        items: [
          {
            label: t('common.studio.dataTableSpecLandmark'),
            value: t('common.studio.dataTableSpecLandmarkVal'),
          },
          {
            label: t('common.studio.dataTableSpecPagination'),
            value: t('common.studio.dataTableSpecPaginationVal'),
          },
          {
            label: t('common.studio.dataTableSpecSort'),
            value: sortColumn
              ? `${sortColumn} (${sortDirection})`
              : t('common.studio.dataTableSpecSortNone'),
          },
        ],
      },
    ],
    [
      currentPagedRows.length,
      density,
      safeCurrentPage,
      selectedIds.length,
      sortColumn,
      sortDirection,
      stickyHeader,
      striped,
      t,
      totalEntries,
      totalPages,
    ],
  );

  const jsxSnippet = useMemo(() => {
    const landmarkLabel = specimenT('common.studio.paginationLandmarkLabel');
    const colSelectAll = specimenT('common.studio.dataTableSelectAllLabel');
    const colCustomer = specimenT('common.studio.dataTableColCustomer');
    const colStatus = specimenT('common.studio.dataTableColStatus');
    const colAmount = specimenT('common.studio.dataTableColAmount');
    const emptyMsg = specimenT('common.studio.dataTableEmptyMessage');
    const emptyTitle = specimenT('common.studio.dataTableEmptyTitle');
    const resetLabel = specimenT('common.studio.dataTableResetFilters');
    const subtotalLabel = specimenT('common.studio.dataTableSubtotalLabel');
    const footerBlock = showFooter
      ? `\n    <TableFooter>\n      <TableRow>\n        <TableCell colSpan={3}>${subtotalLabel}</TableCell>\n        <TableCell align="end">{formatCurrency(pageSubtotal, 'USD', locale)}</TableCell>\n      </TableRow>\n    </TableFooter>`
      : '';

    return `<Card padding="none">
  <TableContainer borderless${stickyHeader ? ' stickyHeader' : ''} scrollAreaLabel={t('table.scrollLabel')}>
    <Table density="${density}"${striped ? ' striped' : ''}>
      <TableHeader${stickyHeader ? ' sticky' : ''}>
        <TableRow>
          <TableHead>
            <Checkbox
              checked={isPageAllSelected}
              indeterminate={isPageSomeSelected}
              onChange={handleSelectPage}
              aria-label="${colSelectAll}"
            />
          </TableHead>
          <TableHead
            sortDirection="${sortColumn === 'customer' ? sortDirection : 'none'}"
            onSort={() => toggleSort('customer')}
          >
            ${colCustomer}
          </TableHead>
          <TableHead>${colStatus}</TableHead>
          <TableHead
            align="end"
            sortDirection="${sortColumn === 'amount' ? sortDirection : 'none'}"
            onSort={() => toggleSort('amount')}
          >
            ${colAmount}
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {currentPagedRows.length === 0 ? (
          <TableEmpty colSpan={4}>
            <EmptyState
              size="sm"
              variant="borderless"
              title="${emptyTitle}"
              description="${emptyMsg}"
              actions={<Button variant="secondary" size="sm" onClick={resetFilters}>${resetLabel}</Button>}
            />
          </TableEmpty>
        ) : (
          currentPagedRows.map((row) => (
            <TableRow key={row.id} selected={selectedIds.includes(row.id)} interactive>
              <TableCell>
                <Checkbox checked={selectedIds.includes(row.id)} onChange={() => toggleRowSelect(row.id)} />
              </TableCell>
              <TableCell>{row.customer}</TableCell>
              <TableCell>
                <Badge size="sm" variant={STATUS_BADGE_VARIANTS[row.status]}>
                  {getStatusLabel(row.status)}
                </Badge>
              </TableCell>
              <TableCell align="end">{formatCurrency(row.amount, row.currency, locale)}</TableCell>
            </TableRow>
          ))
        )}
      </TableBody>${footerBlock}
    </Table>
  </TableContainer>

  {/* Footer: <Dropdown> page-size menu + <Pagination> (hidden when 0 entries) */}
  {totalEntries > 0 && (
    <Pagination aria-label="${landmarkLabel}" size="sm">
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            as="button"
            type="button"
            label="${specimenT('common.studio.paginationPrevLabel')}"
            disabled={${safeCurrentPage <= 1}}
            onClick={() => setCurrentPage(p => p - 1)}
          />
        </PaginationItem>
        {pageNumbers.map((page, idx) => (
          <PaginationItem key={page === 'ellipsis' ? \`e-\${idx}\` : page}>
            {page === 'ellipsis' ? (
              <PaginationEllipsis label="${specimenT('common.studio.paginationMorePagesLabel')}" />
            ) : (
              <PaginationLink as="button" type="button" isActive={${safeCurrentPage} === page} onClick={() => setCurrentPage(page)}>
                {page}
              </PaginationLink>
            )}
          </PaginationItem>
        ))}
        <PaginationItem>
          <PaginationNext
            as="button"
            type="button"
            label="${specimenT('common.studio.paginationNextLabel')}"
            disabled={${safeCurrentPage >= totalPages}}
            onClick={() => setCurrentPage(p => p + 1)}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  )}
</Card>`;
  }, [
    density,
    safeCurrentPage,
    showFooter,
    sortColumn,
    sortDirection,
    specimenT,
    stickyHeader,
    striped,
    totalPages,
  ]);

  const aiPrompt = useMemo(
    () =>
      `Build an accessible DataTable with connected Pagination and SearchInput: density="${density}", striped=${striped}, stickyHeader=${stickyHeader}, pageSize=${pageSize}, RTL-safe start/end alignment, Arabic typography tracking, and locale-formatted currency/dates.`,
    [density, striped, stickyHeader, pageSize],
  );

  const specimenRowLabel =
    selectedIds.length === 1
      ? specimenT('common.studio.dataTableRowSingular')
      : specimenT('common.studio.dataTableRowPlural');

  return (
    <GalleryStudioLayout
      activeRoute="data-table"
      title={t('common.studio.dataTableTitle')}
      subtitle={t('common.studio.dataTableSubtitle')}
      testId="data-table-studio"
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
            label={t('common.studio.dataTableDensityLabel')}
            value={density}
            columns={3}
            onChange={setDensity}
            options={densityOptions}
          />

          <StudioToggleRow
            label={t('common.studio.dataTableToggleStriped')}
            checked={striped}
            onCheckedChange={setStriped}
            testId="toggle-table-striped"
          />

          <StudioToggleRow
            label={t('common.studio.dataTableToggleSticky')}
            checked={stickyHeader}
            onCheckedChange={setStickyHeader}
            testId="toggle-table-sticky"
          />

          <StudioToggleRow
            label={t('common.studio.dataTableToggleFooter')}
            checked={showFooter}
            onCheckedChange={setShowFooter}
            testId="toggle-table-footer"
          />

          <StudioToggleRow
            label={t('common.studio.dataTableToggleEmpty')}
            checked={showEmptyState}
            onCheckedChange={setShowEmptyState}
            testId="toggle-table-empty"
          />
        </>
      }
      inspector={
        <GalleryCodeInspector
          aiPrompt={aiPrompt}
          jsxCode={jsxSnippet}
          cssCode={null}
          jsxFileName="data-table-with-pagination.tsx"
          cssFileName="data-table.module.css"
          specGroups={specGroups}
        />
      }
    >
      <div
        className={styles.stageWrapper}
        data-testid="data-table-canvas"
        dir={specimenDir}
        lang={specimenLangAttr}
      >
        <Card padding="none" className={styles.tableCard}>
          {/* Table Toolbar with Live Search */}
          <div className={styles.tableToolbar}>
            <div className={styles.toolbarLeft}>
              <div className={styles.searchInputWrapper}>
                <SearchInput
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                    setExportedCount(null);
                  }}
                  placeholder={specimenT('common.studio.dataTableSearchPlaceholder')}
                  aria-label={specimenT('common.studio.dataTableSearchAriaLabel')}
                  size="sm"
                  data-testid="data-table-search"
                />
              </div>
              {totalEntries > 0 && (
                <div className={styles.selectionCount} data-testid="data-table-selection-count">
                  <span>{specimenT('common.studio.dataTableSelectedLabel')}: </span>
                  <span className={styles.selectionBold}>
                    <BidiText dir="ltr">
                      {formatNumber(selectedIds.length, specimenLocale)}
                    </BidiText>{' '}
                    {specimenRowLabel}
                  </span>
                </div>
              )}
            </div>

            <div className={styles.toolbarActions}>
              {totalEntries > 0 && selectedIds.length > 0 && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setSelectedIds([]);
                    setExportedCount(null);
                  }}
                  data-testid="data-table-clear-selection"
                >
                  {specimenT('common.studio.dataTableClearSelection')}
                </Button>
              )}
              <Button
                variant="primary"
                size="sm"
                disabled={totalEntries === 0}
                onClick={() => setExportedCount(selectedIds.length || totalEntries)}
                data-testid="data-table-export-btn"
              >
                {specimenT('common.studio.dataTableExportCsv')}
              </Button>
            </div>
          </div>

          {exportedCount !== null && (
            <div
              className={styles.exportNotice}
              role="status"
              data-testid="data-table-export-status"
            >
              {specimenT('common.studio.dataTableExportFeedbackPrefix')}{' '}
              <BidiText dir="ltr">{formatNumber(exportedCount, specimenLocale)}</BidiText>{' '}
              {specimenT('common.studio.dataTableExportFeedbackSuffix')}
            </div>
          )}

          {/* Live Table Instance */}
          <TableContainer
            ref={tableViewportRef}
            borderless
            stickyHeader={stickyHeader}
            scrollAreaLabel={specimenT('common.studio.dataTableScrollLabel')}
            data-testid="data-table-container"
          >
            <Table density={density} striped={striped} data-testid="specimen-data-table">
              <TableCaption className={styles.srOnly}>
                {specimenT('common.studio.dataTableCaptionPrefix')} (
                <BidiText dir="ltr">{formatNumber(totalEntries, specimenLocale)}</BidiText>{' '}
                {specimenT('common.studio.dataTableCaptionSuffix')}).
              </TableCaption>
              <TableHeader sticky={stickyHeader}>
                <TableRow>
                  <TableHead className={styles.checkboxCol}>
                    <Checkbox
                      checked={isPageAllSelected}
                      indeterminate={isPageSomeSelected}
                      onChange={handleSelectPage}
                      aria-label={specimenT('common.studio.dataTableSelectAllLabel')}
                      data-testid="data-table-select-all"
                    />
                  </TableHead>
                  <TableHead>{specimenT('common.studio.dataTableColInvoiceId')}</TableHead>
                  <TableHead
                    sortDirection={sortColumn === 'customer' ? sortDirection : 'none'}
                    onSort={() => toggleSort('customer')}
                  >
                    {specimenT('common.studio.dataTableColCustomer')}
                  </TableHead>
                  <TableHead>{specimenT('common.studio.dataTableColStatus')}</TableHead>
                  <TableHead
                    align="end"
                    sortDirection={sortColumn === 'amount' ? sortDirection : 'none'}
                    onSort={() => toggleSort('amount')}
                  >
                    {specimenT('common.studio.dataTableColAmount')}
                  </TableHead>
                  <TableHead align="end">{specimenT('common.studio.dataTableColDate')}</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {currentPagedRows.length === 0 ? (
                  <TableEmpty colSpan={6} data-testid="data-table-empty">
                    <EmptyState
                      size="sm"
                      variant="borderless"
                      className={styles.tableEmptyState}
                      icon={<Icon name="search" size={18} aria-hidden="true" />}
                      title={specimenT('common.studio.dataTableEmptyTitle')}
                      description={specimenT('common.studio.dataTableEmptyMessage')}
                      actions={
                        <Button
                          variant="secondary"
                          size="sm"
                          data-testid="data-table-reset-filters"
                          onClick={() => {
                            setShowEmptyState(false);
                            setSearchQuery('');
                            setCurrentPage(1);
                            setExportedCount(null);
                          }}
                        >
                          {specimenT('common.studio.dataTableResetFilters')}
                        </Button>
                      }
                    />
                  </TableEmpty>
                ) : (
                  currentPagedRows.map((row) => {
                    const isSelected = selectedIds.includes(row.id);
                    return (
                      <TableRow
                        key={row.id}
                        selected={isSelected}
                        interactive
                        onClick={() => toggleRowSelect(row.id)}
                        data-testid={`data-table-row-${row.id}`}
                      >
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          <Checkbox
                            checked={isSelected}
                            onChange={() => toggleRowSelect(row.id)}
                            aria-label={`${specimenT('common.studio.dataTableSelectRowPrefix')} ${row.id}`}
                          />
                        </TableCell>
                        <TableCell className={styles.monoCell}>
                          <BidiText dir="ltr">{row.id}</BidiText>
                        </TableCell>
                        <TableCell>
                          <div className={styles.customerStack}>
                            <span className={styles.customerName}>
                              <BidiText dir="ltr">{row.customer}</BidiText>
                            </span>
                            <span className={styles.customerEmail}>
                              <BidiText dir="ltr">{row.email}</BidiText>
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge size="sm" variant={STATUS_BADGE_VARIANTS[row.status]}>
                            {getStatusLabel(row.status)}
                          </Badge>
                        </TableCell>
                        <TableCell align="end" className={styles.monoCell}>
                          <BidiText dir="ltr">
                            {formatCurrency(row.amount, row.currency, specimenLocale)}
                          </BidiText>
                        </TableCell>
                        <TableCell align="end" className={styles.dateCell}>
                          {formatDate(row.date, specimenLocale)}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>

              {showFooter && currentPagedRows.length > 0 && (
                <TableFooter>
                  <TableRow>
                    <TableCell colSpan={4}>
                      {specimenT('common.studio.dataTableSubtotalLabel')} (
                      <BidiText dir="ltr">
                        {formatNumber(currentPagedRows.length, specimenLocale)}
                      </BidiText>{' '}
                      {specimenT('common.studio.dataTableEntriesSuffix')})
                    </TableCell>
                    <TableCell align="end" className={styles.monoCell}>
                      <BidiText dir="ltr">
                        {formatCurrency(pageSubtotal, 'USD', specimenLocale)}
                      </BidiText>
                    </TableCell>
                    <TableCell />
                  </TableRow>
                </TableFooter>
              )}
            </Table>
          </TableContainer>

          {/* Integrated Pagination Bar */}
          <div className={styles.paginationFooter}>
            <div className={styles.paginationMeta}>
              <span>
                {specimenT('common.studio.dataTableShowingLabel')}{' '}
                <strong>
                  <BidiText dir="ltr">
                    {formatNumber(totalEntries === 0 ? 0 : startIndex + 1, specimenLocale)}
                  </BidiText>
                </strong>{' '}
                {specimenT('common.studio.dataTableShowingToLabel')}{' '}
                <strong>
                  <BidiText dir="ltr">{formatNumber(endIndex, specimenLocale)}</BidiText>
                </strong>{' '}
                {specimenT('common.studio.dataTableShowingOfLabel')}{' '}
                <strong>
                  <BidiText dir="ltr">{formatNumber(totalEntries, specimenLocale)}</BidiText>
                </strong>{' '}
                {specimenT('common.studio.dataTableEntriesSuffix')}
              </span>

              <div className={styles.pageSizeControl}>
                <label htmlFor={pageSizeTriggerId} className={styles.pageSizeLabel}>
                  {specimenT('common.studio.dataTableRowsPerPageLabel')}:
                </label>
                <Dropdown dir={specimenDir} placement="top-start">
                  <DropdownTrigger asChild>
                    <Button
                      id={pageSizeTriggerId}
                      variant="secondary"
                      size="sm"
                      endIcon={<Icon name="chevron-down" aria-hidden="true" />}
                      className={styles.pageSizeButton}
                      data-testid="data-table-page-size"
                    >
                      <BidiText dir="ltr">{formatNumber(pageSize, specimenLocale)}</BidiText>
                    </Button>
                  </DropdownTrigger>
                  <DropdownContent
                    minWidth={88}
                    aria-label={specimenT('common.studio.dataTablePageSizeLabel')}
                  >
                    {[5, 10, 20].map((sizeOption) => (
                      <DropdownItem
                        key={sizeOption}
                        className={styles.pageSizeOption}
                        data-testid={`data-table-page-size-${sizeOption}`}
                        endIcon={
                          pageSize === sizeOption ? (
                            <Icon name="check" size={14} aria-hidden="true" />
                          ) : undefined
                        }
                        onSelect={() => {
                          setPageSize(sizeOption);
                          setCurrentPage(1);
                          tableViewportRef.current?.scrollTo?.({ top: 0 });
                        }}
                      >
                        <BidiText dir="ltr">{formatNumber(sizeOption, specimenLocale)}</BidiText>
                      </DropdownItem>
                    ))}
                  </DropdownContent>
                </Dropdown>
              </div>
            </div>

            {totalEntries > 0 && (
              <Pagination
                aria-label={specimenT('common.studio.paginationLandmarkLabel')}
                size="sm"
                className={styles.footerPagination}
              >
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      as="button"
                      type="button"
                      label={specimenT('common.studio.paginationPrevLabel')}
                      disabled={safeCurrentPage <= 1}
                      onClick={() => {
                        setCurrentPage((p) => Math.max(1, p - 1));
                        tableViewportRef.current?.scrollTo?.({ top: 0 });
                      }}
                      data-testid="data-table-prev-page"
                    />
                  </PaginationItem>

                  {pageNumbers.map((page, idx) => (
                    <PaginationItem key={page === 'ellipsis' ? `ellipsis-${idx}` : page}>
                      {page === 'ellipsis' ? (
                        <PaginationEllipsis
                          label={specimenT('common.studio.paginationMorePagesLabel')}
                        />
                      ) : (
                        <PaginationLink
                          as="button"
                          type="button"
                          isActive={safeCurrentPage === page}
                          onClick={() => {
                            setCurrentPage(page);
                            tableViewportRef.current?.scrollTo?.({ top: 0 });
                          }}
                          data-testid={`data-table-page-${page}`}
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
                      disabled={safeCurrentPage >= totalPages}
                      onClick={() => {
                        setCurrentPage((p) => Math.min(totalPages, p + 1));
                        tableViewportRef.current?.scrollTo?.({ top: 0 });
                      }}
                      data-testid="data-table-next-page"
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            )}
          </div>
        </Card>
      </div>
    </GalleryStudioLayout>
  );
}
