'use client';

import type { ComponentPropsWithRef, ElementType, ReactNode } from 'react';
import { Icon } from '@/components/icons';
import { cn } from '@/lib/cn';
import styles from './breadcrumb.module.css';

export type BreadcrumbSize = 'sm' | 'md' | 'lg';

function mergeBlankTargetRel(rel: string | undefined): string {
  const tokens = new Set((rel ?? '').split(/\s+/).filter(Boolean));
  tokens.add('noopener');
  tokens.add('noreferrer');
  return Array.from(tokens).join(' ');
}

/* =============================================================================
   Breadcrumb Root
   ============================================================================= */

export interface BreadcrumbProps extends ComponentPropsWithRef<'nav'> {
  /** Accessible label for the navigation landmark. Required for WCAG 1.3.1 */
  'aria-label': string;

  /** Density sizing scale. Defaults to 'md' */
  size?: BreadcrumbSize;

  /** Additional CSS class names */
  className?: string;

  /** Children nodes (BreadcrumbList) */
  children?: ReactNode;
}

export function Breadcrumb({
  'aria-label': ariaLabel,
  size = 'md',
  className,
  children,
  ref,
  ...props
}: BreadcrumbProps) {
  return (
    <nav
      ref={ref}
      aria-label={ariaLabel}
      data-size={size}
      className={cn(styles.nav, className)}
      {...props}
    >
      {children}
    </nav>
  );
}

/* =============================================================================
   BreadcrumbList
   ============================================================================= */

export interface BreadcrumbListProps extends ComponentPropsWithRef<'ol'> {
  children?: ReactNode;
  className?: string;
}

export function BreadcrumbList({ className, children, ref, ...props }: BreadcrumbListProps) {
  return (
    <ol ref={ref} className={cn(styles.list, className)} {...props}>
      {children}
    </ol>
  );
}

/* =============================================================================
   BreadcrumbItem
   ============================================================================= */

export interface BreadcrumbItemProps extends ComponentPropsWithRef<'li'> {
  children?: ReactNode;
  className?: string;
}

export function BreadcrumbItem({ className, children, ref, ...props }: BreadcrumbItemProps) {
  return (
    <li ref={ref} className={cn(styles.item, className)} {...props}>
      {children}
    </li>
  );
}

/* =============================================================================
   BreadcrumbLink
   ============================================================================= */

export interface BreadcrumbLinkProps extends ComponentPropsWithRef<'a'> {
  /** Polymorphic element tag (e.g. Next.js Link). Defaults to 'a' */
  as?: ElementType;

  /** Link target URL */
  href?: string;

  children?: ReactNode;
  className?: string;
}

export function BreadcrumbLink({
  as: Component = 'a',
  className,
  children,
  target,
  rel,
  ref,
  ...props
}: BreadcrumbLinkProps) {
  const safeRel = target === '_blank' ? mergeBlankTargetRel(rel) : rel;

  return (
    <Component
      ref={ref}
      target={target}
      rel={safeRel}
      className={cn(styles.link, className)}
      {...props}
    >
      {children}
    </Component>
  );
}

/* =============================================================================
   BreadcrumbPage
   ============================================================================= */

export interface BreadcrumbPageProps extends ComponentPropsWithRef<'span'> {
  children?: ReactNode;
  className?: string;
}

export function BreadcrumbPage({ className, children, ref, ...props }: BreadcrumbPageProps) {
  return (
    <span ref={ref} aria-current="page" className={cn(styles.page, className)} {...props}>
      {children}
    </span>
  );
}

/* =============================================================================
   BreadcrumbSeparator
   ============================================================================= */

export interface BreadcrumbSeparatorProps extends ComponentPropsWithRef<'li'> {
  children?: ReactNode;
  className?: string;
}

export function BreadcrumbSeparator({
  className,
  children,
  ref,
  ...props
}: BreadcrumbSeparatorProps) {
  return (
    <li
      ref={ref}
      role="presentation"
      aria-hidden="true"
      className={cn(styles.separator, className)}
      {...props}
    >
      {children ?? <Icon name="chevron-right" size={14} />}
    </li>
  );
}

/* =============================================================================
   BreadcrumbEllipsis
   ============================================================================= */

export interface BreadcrumbEllipsisProps extends ComponentPropsWithRef<'span'> {
  /** Optional accessible label when used inside an assistive-announced slot or button. */
  label?: string;
  children?: ReactNode;
  className?: string;
}

export function BreadcrumbEllipsis({
  label,
  children,
  className,
  ref,
  ...props
}: BreadcrumbEllipsisProps) {
  return (
    <span
      ref={ref}
      role={label ? undefined : 'presentation'}
      aria-hidden={label ? undefined : 'true'}
      className={cn(styles.ellipsis, className)}
      {...props}
    >
      <span aria-hidden={label ? 'true' : undefined}>{children ?? '\u2026'}</span>
      {label && <span className={styles.visuallyHidden}>{label}</span>}
    </span>
  );
}
