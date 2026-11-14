'use client';

import type { ComponentPropsWithRef, ReactNode } from 'react';
import { Icon } from '@/components/icons';
import { cn } from '@/lib/cn';
import { ScrollArea } from '../scroll-area';
import styles from './data-table.module.css';

export type TableDensity = 'compact' | 'default' | 'comfortable';
export type TableSortDirection = 'ascending' | 'descending' | 'none';
export type TableCellAlign = 'start' | 'center' | 'end';

/* =============================================================================
   Table Container
   ============================================================================= */

export interface TableContainerProps extends ComponentPropsWithRef<'div'> {
  /** Constrains vertical height and enables scroll-pinning for a sticky TableHeader */
  stickyHeader?: boolean;
  /** Removes the standalone outer border and radius when embedded inside a Card shell */
  borderless?: boolean;
  /** Localized accessible label forwarded to the ScrollArea region landmark */
  scrollAreaLabel: string;
  children?: ReactNode;
}

export function TableContainer({
  stickyHeader = false,
  borderless = false,
  scrollAreaLabel,
  'aria-label': ariaLabel,
  className,
  children,
  ref,
  ...props
}: TableContainerProps) {
  return (
    <ScrollArea
      {...props}
      orientation={stickyHeader ? 'both' : 'horizontal'}
      viewportRef={ref}
      aria-label={ariaLabel ?? scrollAreaLabel}
      viewportClassName={cn(styles.viewport, stickyHeader && styles.stickyViewport)}
      data-sticky-header={stickyHeader ? 'true' : undefined}
      className={cn(styles.container, borderless && styles.container_borderless, className)}
    >
      {children}
    </ScrollArea>
  );
}

/* =============================================================================
   Table Root
   ============================================================================= */

export interface TableProps extends ComponentPropsWithRef<'table'> {
  density?: TableDensity;
  striped?: boolean;
  children?: ReactNode;
}

export function Table({
  density = 'default',
  striped = false,
  className,
  children,
  ref,
  ...props
}: TableProps) {
  return (
    <table
      {...props}
      ref={ref}
      data-density={density}
      data-striped={striped ? 'true' : undefined}
      className={cn(
        styles.table,
        styles[`density_${density}`],
        striped && styles.table_striped,
        className,
      )}
    >
      {children}
    </table>
  );
}

/* =============================================================================
   TableHeader
   ============================================================================= */

export interface TableHeaderProps extends ComponentPropsWithRef<'thead'> {
  sticky?: boolean;
  children?: ReactNode;
}

export function TableHeader({
  sticky = false,
  className,
  children,
  ref,
  ...props
}: TableHeaderProps) {
  return (
    <thead
      {...props}
      ref={ref}
      data-sticky={sticky ? 'true' : undefined}
      className={cn(styles.header, sticky && styles.stickyHeader, className)}
    >
      {children}
    </thead>
  );
}

/* =============================================================================
   TableBody
   ============================================================================= */

export interface TableBodyProps extends ComponentPropsWithRef<'tbody'> {
  children?: ReactNode;
}

export function TableBody({ className, children, ref, ...props }: TableBodyProps) {
  return (
    <tbody {...props} ref={ref} className={cn(styles.body, className)}>
      {children}
    </tbody>
  );
}

/* =============================================================================
   TableFooter
   ============================================================================= */

export interface TableFooterProps extends ComponentPropsWithRef<'tfoot'> {
  children?: ReactNode;
}

export function TableFooter({ className, children, ref, ...props }: TableFooterProps) {
  return (
    <tfoot {...props} ref={ref} className={cn(styles.footer, className)}>
      {children}
    </tfoot>
  );
}

/* =============================================================================
   TableRow
   ============================================================================= */

export interface TableRowProps extends ComponentPropsWithRef<'tr'> {
  selected?: boolean;
  interactive?: boolean;
  children?: ReactNode;
}

export function TableRow({
  selected = false,
  interactive = false,
  className,
  children,
  ref,
  ...props
}: TableRowProps) {
  return (
    <tr
      {...props}
      ref={ref}
      aria-selected={selected ? 'true' : undefined}
      data-state={selected ? 'selected' : undefined}
      data-interactive={interactive ? 'true' : undefined}
      className={cn(
        styles.row,
        selected && styles.row_selected,
        interactive && styles.row_interactive,
        className,
      )}
    >
      {children}
    </tr>
  );
}

/* =============================================================================
   TableHead
   ============================================================================= */

export interface TableHeadProps extends Omit<ComponentPropsWithRef<'th'>, 'align'> {
  align?: TableCellAlign;
  sortDirection?: TableSortDirection;
  onSort?: () => void;
  children?: ReactNode;
}

export function TableHead({
  align = 'start',
  sortDirection,
  onSort,
  scope = 'col',
  className,
  children,
  ref,
  ...props
}: TableHeadProps) {
  const isSortable = Boolean(onSort);

  return (
    <th
      {...props}
      ref={ref}
      scope={scope}
      aria-sort={sortDirection}
      className={cn(styles.headCell, styles[`align_${align}`], className)}
    >
      {isSortable ? (
        <button type="button" className={styles.sortButton} onClick={onSort}>
          <span>{children}</span>
          <span
            className={cn(
              styles.sortIcon,
              sortDirection && sortDirection !== 'none' && styles.sortIconActive,
            )}
          >
            {sortDirection === 'ascending' ? (
              <Icon name="arrow-up" size={12} aria-hidden="true" />
            ) : sortDirection === 'descending' ? (
              <Icon name="arrow-down" size={12} aria-hidden="true" />
            ) : (
              <span className={styles.sortStack} aria-hidden="true">
                <Icon name="chevron-up" size={10} />
                <Icon name="chevron-down" size={10} />
              </span>
            )}
          </span>
        </button>
      ) : (
        children
      )}
    </th>
  );
}

/* =============================================================================
   TableCell
   ============================================================================= */

export interface TableCellProps extends Omit<ComponentPropsWithRef<'td'>, 'align'> {
  align?: TableCellAlign;
  truncate?: boolean;
  children?: ReactNode;
}

export function TableCell({
  align = 'start',
  truncate = false,
  className,
  children,
  ref,
  ...props
}: TableCellProps) {
  return (
    <td
      {...props}
      ref={ref}
      className={cn(styles.cell, styles[`align_${align}`], truncate && styles.truncate, className)}
    >
      {children}
    </td>
  );
}

/* =============================================================================
   TableCaption
   ============================================================================= */

export interface TableCaptionProps extends ComponentPropsWithRef<'caption'> {
  children?: ReactNode;
}

export function TableCaption({ className, children, ref, ...props }: TableCaptionProps) {
  return (
    <caption {...props} ref={ref} className={cn(styles.caption, className)}>
      {children}
    </caption>
  );
}

/* =============================================================================
   TableEmpty
   ============================================================================= */

export interface TableEmptyProps extends ComponentPropsWithRef<'td'> {
  colSpan: number;
  /** Localized empty-state content displayed across all table columns */
  children: ReactNode;
}

export function TableEmpty({ colSpan, className, children, ref, ...props }: TableEmptyProps) {
  return (
    <TableRow>
      <td
        {...props}
        ref={ref}
        colSpan={colSpan}
        className={cn(styles.cell, styles.emptyCell, className)}
      >
        {children}
      </td>
    </TableRow>
  );
}
