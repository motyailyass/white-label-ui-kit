import { createRef } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableContainer,
  TableEmpty,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from './data-table';

describe('DataTable Primitive', () => {
  it('renders semantic table hierarchy, density, striped state, and accessible caption', () => {
    render(
      <TableContainer stickyHeader scrollAreaLabel="Records table">
        <Table density="compact" striped>
          <TableCaption>Invoice History</TableCaption>
          <TableHeader sticky>
            <TableRow>
              <TableHead>Invoice</TableHead>
              <TableHead>Status</TableHead>
              <TableHead align="end">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell truncate>INV-001</TableCell>
              <TableCell>Paid</TableCell>
              <TableCell align="end">$250.00</TableCell>
            </TableRow>
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell colSpan={2}>Total</TableCell>
              <TableCell align="end">$250.00</TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </TableContainer>,
    );

    const table = screen.getByRole('table');
    expect(table.getAttribute('data-density')).toBe('compact');
    expect(table.getAttribute('data-striped')).toBe('true');

    const viewport = table.parentElement;
    expect(viewport?.getAttribute('role')).toBe('region');
    expect(viewport?.getAttribute('data-orientation')).toBe('both');
    expect(viewport?.parentElement?.getAttribute('data-sticky-header')).toBe('true');

    const thead = table.querySelector('thead');
    expect(thead?.getAttribute('data-sticky')).toBe('true');

    expect(screen.getByText('Invoice History')).toBeTruthy();
    expect(screen.getAllByRole('columnheader')).toHaveLength(3);
    expect(screen.getByText('INV-001')).toBeTruthy();
  });

  it('handles pointer and keyboard sortable column header interactions with aria-hidden icon', async () => {
    const user = userEvent.setup();
    const onSort = vi.fn();
    render(
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead sortDirection="ascending" onSort={onSort}>
              Customer Name
            </TableHead>
          </TableRow>
        </TableHeader>
      </Table>,
    );

    const sortTh = screen.getByRole('columnheader', { name: /Customer Name/ });
    expect(sortTh.getAttribute('aria-sort')).toBe('ascending');
    expect(sortTh.getAttribute('scope')).toBe('col');

    const sortBtn = screen.getByRole('button', { name: /Customer Name/ });
    expect(sortBtn.getAttribute('type')).toBe('button');
    expect(sortBtn.querySelector('[aria-hidden="true"]')).toBeTruthy();

    await user.click(sortBtn);
    await user.keyboard('{Enter}');
    expect(onSort).toHaveBeenCalledTimes(2);
  });

  it('applies row selection and interactive semantics', () => {
    render(
      <Table>
        <TableBody>
          <TableRow selected interactive>
            <TableCell>Selected Row</TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    );

    const row = screen.getByRole('row');
    expect(row.getAttribute('aria-selected')).toBe('true');
    expect(row.getAttribute('data-state')).toBe('selected');
    expect(row.getAttribute('data-interactive')).toBe('true');
  });

  it('renders localized empty state across all columns', () => {
    render(
      <Table>
        <TableBody>
          <TableEmpty colSpan={4}>No customers found matching filter.</TableEmpty>
        </TableBody>
      </Table>,
    );

    const emptyCell = screen.getByText('No customers found matching filter.');
    expect(emptyCell).toBeTruthy();
    expect(emptyCell.getAttribute('colspan')).toBe('4');
  });

  it('forwards ref props directly to all underlying DOM elements', () => {
    const containerRef = createRef<HTMLDivElement>();
    const tableRef = createRef<HTMLTableElement>();
    const headerRef = createRef<HTMLTableSectionElement>();
    const bodyRef = createRef<HTMLTableSectionElement>();
    const footerRef = createRef<HTMLTableSectionElement>();
    const rowRef = createRef<HTMLTableRowElement>();
    const headRef = createRef<HTMLTableCellElement>();
    const cellRef = createRef<HTMLTableCellElement>();
    const captionRef = createRef<HTMLTableCaptionElement>();
    const emptyRef = createRef<HTMLTableCellElement>();

    render(
      <TableContainer ref={containerRef} scrollAreaLabel="Records table">
        <Table ref={tableRef}>
          <TableCaption ref={captionRef}>Caption</TableCaption>
          <TableHeader ref={headerRef}>
            <TableRow>
              <TableHead ref={headRef}>Head</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody ref={bodyRef}>
            <TableRow ref={rowRef}>
              <TableCell ref={cellRef}>Cell</TableCell>
            </TableRow>
            <TableEmpty ref={emptyRef} colSpan={1}>
              Empty
            </TableEmpty>
          </TableBody>
          <TableFooter ref={footerRef}>
            <TableRow>
              <TableCell>Footer</TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </TableContainer>,
    );

    expect(containerRef.current instanceof HTMLDivElement).toBe(true);
    expect(containerRef.current?.getAttribute('role')).toBe('region');
    expect(tableRef.current instanceof HTMLTableElement).toBe(true);
    expect(headerRef.current instanceof HTMLTableSectionElement).toBe(true);
    expect(bodyRef.current instanceof HTMLTableSectionElement).toBe(true);
    expect(footerRef.current instanceof HTMLTableSectionElement).toBe(true);
    expect(rowRef.current instanceof HTMLTableRowElement).toBe(true);
    expect(headRef.current instanceof HTMLTableCellElement).toBe(true);
    expect(cellRef.current instanceof HTMLTableCellElement).toBe(true);
    expect(captionRef.current instanceof HTMLTableCaptionElement).toBe(true);
    expect(emptyRef.current instanceof HTMLTableCellElement).toBe(true);
  });

  it('composes ScrollArea with borderless support and neutral dual-chevron sort indicators', () => {
    const onSort = vi.fn();
    render(
      <TableContainer
        stickyHeader
        borderless
        scrollAreaLabel="Invoice records table"
        data-testid="table-wrap"
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead sortDirection="none" onSort={onSort}>
                Customer
              </TableHead>
            </TableRow>
          </TableHeader>
        </Table>
      </TableContainer>,
    );

    const wrap = screen.getByTestId('table-wrap');
    expect(wrap.getAttribute('data-sticky-header')).toBe('true');

    const viewport = screen.getByRole('region', { name: 'Invoice records table' });
    expect(viewport.getAttribute('data-orientation')).toBe('both');

    const sortBtn = screen.getByRole('button', { name: 'Customer' });
    expect(sortBtn.querySelectorAll('svg').length).toBe(2);
  });
});
