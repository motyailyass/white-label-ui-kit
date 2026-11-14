'use client';

import type { ComponentPropsWithRef, ElementType, ReactNode } from 'react';
import { Icon } from '@/components/icons';
import { cn } from '@/lib/cn';
import styles from './stat-card.module.css';

export type StatCardVariant = 'default' | 'raised' | 'subtle';
export type StatCardSize = 'sm' | 'md' | 'lg';
export type StatCardTrendDirection = 'up' | 'down' | 'neutral';

/* =============================================================================
   StatCard Root
   ============================================================================= */

export interface StatCardProps extends ComponentPropsWithRef<'div'> {
  /** Polymorphic container tag. Defaults to 'div' */
  as?: ElementType;

  /** Surface background variant. Defaults to 'default' */
  variant?: StatCardVariant;

  /** Density sizing scale. Defaults to 'md' */
  size?: StatCardSize;

  /** Additional CSS class names */
  className?: string;

  /** Children nodes */
  children?: ReactNode;
}

export function StatCard({
  as: Component = 'div',
  variant = 'default',
  size = 'md',
  className,
  children,
  ref,
  ...props
}: StatCardProps) {
  return (
    <Component
      ref={ref}
      data-variant={variant}
      data-size={size}
      className={cn(styles.root, styles[`root_${variant}`], className)}
      {...props}
    >
      {children}
    </Component>
  );
}

/* =============================================================================
   StatCardHeader
   ============================================================================= */

export interface StatCardHeaderProps extends ComponentPropsWithRef<'div'> {
  children?: ReactNode;
  className?: string;
}

export function StatCardHeader({ className, children, ref, ...props }: StatCardHeaderProps) {
  return (
    <div ref={ref} className={cn(styles.header, className)} {...props}>
      {children}
    </div>
  );
}

/* =============================================================================
   StatCardTitle
   ============================================================================= */

export interface StatCardTitleProps extends ComponentPropsWithRef<'span'> {
  /** Polymorphic element tag. Defaults to 'span' */
  as?: ElementType;

  children?: ReactNode;
  className?: string;
}

export function StatCardTitle({
  as: Component = 'span',
  className,
  children,
  ref,
  ...props
}: StatCardTitleProps) {
  return (
    <Component ref={ref} className={cn(styles.title, className)} {...props}>
      {children}
    </Component>
  );
}

/* =============================================================================
   StatCardIcon
   ============================================================================= */

export interface StatCardIconProps extends ComponentPropsWithRef<'span'> {
  children?: ReactNode;
  className?: string;
}

export function StatCardIcon({ className, children, ref, ...props }: StatCardIconProps) {
  return (
    <span ref={ref} aria-hidden="true" className={cn(styles.iconSlot, className)} {...props}>
      {children}
    </span>
  );
}

/* =============================================================================
   StatCardValue
   ============================================================================= */

export interface StatCardValueProps extends ComponentPropsWithRef<'div'> {
  children?: ReactNode;
  className?: string;
}

export function StatCardValue({ className, children, ref, ...props }: StatCardValueProps) {
  return (
    <div ref={ref} className={cn(styles.value, className)} {...props}>
      {children}
    </div>
  );
}

/* =============================================================================
   StatCardFooter
   ============================================================================= */

export interface StatCardFooterProps extends ComponentPropsWithRef<'div'> {
  children?: ReactNode;
  className?: string;
}

export function StatCardFooter({ className, children, ref, ...props }: StatCardFooterProps) {
  return (
    <div ref={ref} className={cn(styles.footer, className)} {...props}>
      {children}
    </div>
  );
}

/* =============================================================================
   StatCardTrend
   ============================================================================= */

export interface StatCardTrendProps extends ComponentPropsWithRef<'span'> {
  /** Direction of the trend change */
  direction?: StatCardTrendDirection;

  /** Optional custom trend indicator icon */
  icon?: ReactNode;

  /** Optional screen-reader semantic prefix for WCAG 1.4.1 non-color signal */
  label?: string;

  /** Whether to render as a pill badge with subtle tinted background */
  pill?: boolean;

  children?: ReactNode;
  className?: string;
}

export function StatCardTrend({
  direction = 'neutral',
  icon,
  label,
  pill = false,
  className,
  children,
  ref,
  ...props
}: StatCardTrendProps) {
  const defaultIcon =
    direction === 'up' ? (
      <Icon name="arrow-up" size={14} />
    ) : direction === 'down' ? (
      <Icon name="arrow-down" size={14} />
    ) : null;

  return (
    <span
      ref={ref}
      data-direction={direction}
      data-pill={pill ? 'true' : undefined}
      className={cn(
        styles.trend,
        styles[`trend_${direction}`],
        pill && styles.trendPill,
        className,
      )}
      {...props}
    >
      {icon ?? defaultIcon}
      {label && <span className={styles.visuallyHidden}>{label} </span>}
      <span>{children}</span>
    </span>
  );
}

/* =============================================================================
   StatCardDescription
   ============================================================================= */

export interface StatCardDescriptionProps extends ComponentPropsWithRef<'p'> {
  children?: ReactNode;
  className?: string;
}

export function StatCardDescription({
  className,
  children,
  ref,
  ...props
}: StatCardDescriptionProps) {
  return (
    <p ref={ref} className={cn(styles.description, className)} {...props}>
      {children}
    </p>
  );
}
