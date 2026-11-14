'use client';

import {
  type ComponentPropsWithRef,
  createContext,
  type ElementType,
  type MouseEvent,
  type ReactNode,
  useContext,
  useMemo,
} from 'react';
import { Icon } from '@/components/icons';
import { cn } from '@/lib/cn';
import styles from './pagination.module.css';

export type PaginationSize = 'sm' | 'md' | 'lg';
export type PaginationShape = 'rounded' | 'pill';

function mergeBlankTargetRel(rel: string | undefined): string {
  const tokens = new Set((rel ?? '').split(/\s+/).filter(Boolean));
  tokens.add('noopener');
  tokens.add('noreferrer');
  return Array.from(tokens).join(' ');
}

interface PaginationContextValue {
  size: PaginationSize;
  shape: PaginationShape;
}

const PaginationContext = createContext<PaginationContextValue>({
  size: 'md',
  shape: 'rounded',
});

/* =============================================================================
   Pagination Root
   ============================================================================= */

export interface PaginationProps extends ComponentPropsWithRef<'nav'> {
  /** Localized accessible landmark label (required for WCAG 1.3.1) */
  'aria-label': string;
  /** Shared density size inherited by links, nav buttons, and ellipsis */
  size?: PaginationSize;
  /** Corner geometry inherited by links and navigation buttons ('rounded' uses --radius-control, 'pill' uses --radius-full) */
  shape?: PaginationShape;
  children?: ReactNode;
  className?: string;
}

export function Pagination({
  'aria-label': ariaLabel,
  size = 'md',
  shape = 'rounded',
  className,
  children,
  ref,
  ...props
}: PaginationProps) {
  const contextValue = useMemo(() => ({ size, shape }), [size, shape]);

  return (
    <PaginationContext.Provider value={contextValue}>
      <nav
        {...props}
        ref={ref}
        aria-label={ariaLabel}
        data-size={size}
        data-shape={shape}
        className={cn(styles.pagination, className)}
      >
        {children}
      </nav>
    </PaginationContext.Provider>
  );
}

/* =============================================================================
   Pagination Content
   ============================================================================= */

export interface PaginationContentProps extends ComponentPropsWithRef<'ul'> {
  children?: ReactNode;
  className?: string;
}

export function PaginationContent({ className, children, ref, ...props }: PaginationContentProps) {
  return (
    <ul {...props} ref={ref} className={cn(styles.content, className)}>
      {children}
    </ul>
  );
}

/* =============================================================================
   Pagination Item
   ============================================================================= */

export interface PaginationItemProps extends ComponentPropsWithRef<'li'> {
  children?: ReactNode;
  className?: string;
}

export function PaginationItem({ className, children, ref, ...props }: PaginationItemProps) {
  return (
    <li {...props} ref={ref} className={cn(styles.item, className)}>
      {children}
    </li>
  );
}

/* =============================================================================
   Pagination Link
   ============================================================================= */

export interface PaginationLinkProps extends ComponentPropsWithRef<'a'> {
  isActive?: boolean;
  size?: PaginationSize;
  shape?: PaginationShape;
  disabled?: boolean;
  as?: ElementType;
  type?: 'button' | 'submit' | 'reset';
  children?: ReactNode;
  className?: string;
}

export function PaginationLink({
  isActive = false,
  size,
  shape,
  disabled = false,
  as: Component = 'a',
  type,
  href,
  rel,
  target,
  role,
  tabIndex,
  onClick,
  className,
  children,
  ref,
  ...props
}: PaginationLinkProps) {
  const { size: inheritedSize, shape: inheritedShape } = useContext(PaginationContext);
  const resolvedSize = size ?? inheritedSize;
  const resolvedShape = shape ?? inheritedShape;
  const isButton = Component === 'button';
  const resolvedType = type ?? (isButton ? 'button' : undefined);
  const resolvedRel = isButton ? undefined : target === '_blank' ? mergeBlankTargetRel(rel) : rel;
  const resolvedRole = role ?? (Component === 'a' && disabled ? 'link' : undefined);

  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    if (disabled) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    onClick?.(e);
  };

  return (
    <Component
      {...props}
      ref={ref as never}
      type={resolvedType}
      href={disabled || isButton ? undefined : href}
      target={isButton ? undefined : target}
      rel={resolvedRel}
      role={resolvedRole}
      disabled={isButton ? disabled : undefined}
      aria-current={isActive ? 'page' : undefined}
      aria-disabled={disabled ? 'true' : undefined}
      tabIndex={disabled ? -1 : tabIndex}
      data-size={resolvedSize}
      data-shape={resolvedShape}
      data-active={isActive ? 'true' : undefined}
      data-disabled={disabled ? 'true' : undefined}
      onClick={handleClick}
      className={cn(
        styles.link,
        styles[`size_${resolvedSize}`],
        resolvedShape === 'pill' && styles.shape_pill,
        isActive && styles.link_active,
        disabled && styles.link_disabled,
        className,
      )}
    >
      {children}
    </Component>
  );
}

/* =============================================================================
   Pagination Previous & Next
   ============================================================================= */

export type PaginationDirectionControlProps = Omit<PaginationLinkProps, 'children'> &
  (
    | { label: string; children?: ReactNode }
    | { label?: string; children: ReactNode; 'aria-label': string }
  );

interface PaginationDirectionConfig {
  iconName: 'chevron-left' | 'chevron-right';
  iconPosition: 'start' | 'end';
}

function renderPaginationDirectionControl(
  {
    label,
    className,
    children,
    'aria-label': ariaLabel,
    ref,
    ...props
  }: PaginationDirectionControlProps,
  { iconName, iconPosition }: PaginationDirectionConfig,
) {
  const content = children ?? label;
  const textNode = content != null && content !== '' ? <span>{content}</span> : null;
  const iconNode = <Icon name={iconName} size={16} aria-hidden="true" />;

  return (
    <PaginationLink
      {...props}
      ref={ref}
      aria-label={ariaLabel ?? label}
      className={cn(styles.navButton, className)}
    >
      {iconPosition === 'start' ? (
        <>
          {iconNode}
          {textNode}
        </>
      ) : (
        <>
          {textNode}
          {iconNode}
        </>
      )}
    </PaginationLink>
  );
}

export type PaginationPreviousProps = PaginationDirectionControlProps;

export function PaginationPrevious(props: PaginationPreviousProps) {
  return renderPaginationDirectionControl(props, {
    iconName: 'chevron-left',
    iconPosition: 'start',
  });
}

export type PaginationNextProps = PaginationDirectionControlProps;

export function PaginationNext(props: PaginationNextProps) {
  return renderPaginationDirectionControl(props, {
    iconName: 'chevron-right',
    iconPosition: 'end',
  });
}

/* =============================================================================
   Pagination Ellipsis
   ============================================================================= */

export interface PaginationEllipsisProps extends ComponentPropsWithRef<'span'> {
  /** Localized screen-reader announcement for collapsed pages */
  label: string;
  size?: PaginationSize;
}

export function PaginationEllipsis({
  label,
  size,
  className,
  ref,
  ...props
}: PaginationEllipsisProps) {
  const { size: inheritedSize } = useContext(PaginationContext);
  const resolvedSize = size ?? inheritedSize;

  return (
    <span
      {...props}
      ref={ref}
      data-size={resolvedSize}
      className={cn(styles.ellipsis, styles[`size_${resolvedSize}`], className)}
    >
      <span aria-hidden="true">&#8230;</span>
      <span className={styles.srOnly}>{label}</span>
    </span>
  );
}
