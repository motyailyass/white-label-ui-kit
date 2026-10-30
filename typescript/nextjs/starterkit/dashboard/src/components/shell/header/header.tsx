'use client';

import type React from 'react';
import { cn } from '@/lib/cn';
import styles from './header.module.css';

/* -------------------------------------------------------------------------- */
/*                                   Header                                   */
/* -------------------------------------------------------------------------- */

export interface HeaderProps extends React.HTMLAttributes<HTMLElement> {
  sticky?: boolean;
  density?: 'comfortable' | 'compact';
  children: React.ReactNode;
}

export function Header({
  sticky = true,
  density = 'comfortable',
  className,
  children,
  ...props
}: HeaderProps) {
  return (
    <header
      className={cn(styles.header, className)}
      data-sticky={sticky}
      data-density={density}
      {...props}
    >
      {children}
    </header>
  );
}

/* -------------------------------------------------------------------------- */
/*                                HeaderHeading                               */
/* -------------------------------------------------------------------------- */

export interface HeaderHeadingProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  description?: string;
  badge?: React.ReactNode;
}

export function HeaderHeading({
  title,
  description,
  badge,
  className,
  ...props
}: HeaderHeadingProps) {
  return (
    <div className={cn(styles.heading, className)} {...props}>
      <div className={styles.titleRow}>
        <h1 className={styles.title}>{title}</h1>
        {badge}
      </div>
      {description && <p className={styles.subtitle}>{description}</p>}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                             HeaderBreadcrumbs                              */
/* -------------------------------------------------------------------------- */

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface HeaderBreadcrumbsProps extends React.HTMLAttributes<HTMLElement> {
  items: BreadcrumbItem[];
  separator?: React.ReactNode;
}

export function HeaderBreadcrumbs({
  items,
  separator = '/',
  className,
  ...props
}: HeaderBreadcrumbsProps) {
  return (
    <nav aria-label="Breadcrumbs" className={className} {...props}>
      <ol className={styles.breadcrumbs}>
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={item.label} className={styles.breadcrumbItem}>
              {isLast ? (
                <span className={styles.breadcrumbCurrent} aria-current="page">
                  {item.label}
                </span>
              ) : (
                <>
                  <a href={item.href || '#'} className={styles.breadcrumbLink}>
                    {item.label}
                  </a>
                  <span className={styles.breadcrumbSeparator} aria-hidden="true">
                    {separator}
                  </span>
                </>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

/* -------------------------------------------------------------------------- */
/*                                HeaderToolbar                               */
/* -------------------------------------------------------------------------- */

export interface HeaderToolbarProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function HeaderToolbar({ className, children, ...props }: HeaderToolbarProps) {
  return (
    <div className={cn(styles.toolbar, className)} {...props}>
      {children}
    </div>
  );
}
