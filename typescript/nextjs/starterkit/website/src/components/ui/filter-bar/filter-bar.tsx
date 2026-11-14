'use client';

import { type ComponentPropsWithoutRef, type ReactNode, forwardRef } from 'react';
import { Icon } from '@/components/icons';
import { cn } from '@/lib/cn';
import styles from './filter-bar.module.css';

export interface FilterBarProps extends ComponentPropsWithoutRef<'div'> {
  'aria-label'?: string;
  'data-testid'?: string;
}

export const FilterBar = forwardRef<HTMLDivElement, FilterBarProps>(function FilterBar(
  { 'aria-label': ariaLabel, children, className, 'data-testid': testId, ...rest },
  ref,
) {
  return (
    <div
      ref={ref}
      role="toolbar"
      aria-label={ariaLabel}
      className={cn(styles.root, className)}
      data-testid={testId}
      {...rest}
    >
      {children}
    </div>
  );
});

FilterBar.displayName = 'FilterBar';

export type FilterBarMainProps = ComponentPropsWithoutRef<'div'>;

export const FilterBarMain = forwardRef<HTMLDivElement, FilterBarMainProps>(function FilterBarMain(
  { children, className, ...rest },
  ref,
) {
  return (
    <div ref={ref} className={cn(styles.mainRow, className)} {...rest}>
      {children}
    </div>
  );
});

FilterBarMain.displayName = 'FilterBarMain';

export type FilterBarGroupProps = ComponentPropsWithoutRef<'div'>;

export const FilterBarGroup = forwardRef<HTMLDivElement, FilterBarGroupProps>(
  function FilterBarGroup({ children, className, ...rest }, ref) {
    return (
      <div ref={ref} className={cn(styles.filterGroup, className)} {...rest}>
        {children}
      </div>
    );
  },
);

FilterBarGroup.displayName = 'FilterBarGroup';

export interface FilterBarItemProps extends ComponentPropsWithoutRef<'button'> {
  active?: boolean;
  count?: number;
  icon?: ReactNode;
  'data-testid'?: string;
}

export const FilterBarItem = forwardRef<HTMLButtonElement, FilterBarItemProps>(
  function FilterBarItem(
    { active = false, count, icon, children, className, 'data-testid': testId, ...rest },
    ref,
  ) {
    return (
      <button
        ref={ref}
        type="button"
        aria-pressed={active}
        data-active={active ? 'true' : undefined}
        className={cn(styles.filterItem, className)}
        data-testid={testId}
        {...rest}
      >
        {icon ? (
          <span className={styles.itemIcon} aria-hidden="true">
            {icon}
          </span>
        ) : null}
        <span>{children}</span>
        {count !== undefined && count > 0 ? <span className={styles.badge}>{count}</span> : null}
      </button>
    );
  },
);

FilterBarItem.displayName = 'FilterBarItem';

export interface FilterBarTagsProps extends ComponentPropsWithoutRef<'div'> {
  'data-testid'?: string;
}

export const FilterBarTags = forwardRef<HTMLDivElement, FilterBarTagsProps>(function FilterBarTags(
  { children, className, 'data-testid': testId, ...rest },
  ref,
) {
  return (
    <div ref={ref} className={cn(styles.tagsRow, className)} data-testid={testId} {...rest}>
      {children}
    </div>
  );
});

FilterBarTags.displayName = 'FilterBarTags';

export interface FilterBarTagBaseProps extends ComponentPropsWithoutRef<'span'> {
  category?: string;
  label: string;
  disabled?: boolean;
  'data-testid'?: string;
}

/** A dismissible tag requires its localized accessible label. */
export type FilterBarTagProps = FilterBarTagBaseProps &
  (
    | { onRemove: () => void; removeAriaLabel: string }
    | { onRemove?: undefined; removeAriaLabel?: string }
  );

export const FilterBarTag = forwardRef<HTMLSpanElement, FilterBarTagProps>(function FilterBarTag(
  {
    category,
    label,
    onRemove,
    removeAriaLabel,
    disabled = false,
    className,
    'data-testid': testId,
    ...rest
  },
  ref,
) {
  return (
    <span
      ref={ref}
      data-disabled={disabled ? 'true' : undefined}
      className={cn(styles.tag, className)}
      data-testid={testId}
      {...rest}
    >
      {category ? <span className={styles.tagCategory}>{category}:</span> : null}
      <span className={styles.tagValue}>{label}</span>
      {onRemove && removeAriaLabel ? (
        <button
          type="button"
          disabled={disabled}
          className={styles.tagRemove}
          onClick={onRemove}
          aria-label={removeAriaLabel}
        >
          <Icon name="close" size={12} />
        </button>
      ) : null}
    </span>
  );
});

FilterBarTag.displayName = 'FilterBarTag';

export interface FilterBarClearProps extends Omit<ComponentPropsWithoutRef<'button'>, 'children'> {
  /** Localized label for the clear action. */
  children: ReactNode;
  onClear?: () => void;
  'data-testid'?: string;
}

export const FilterBarClear = forwardRef<HTMLButtonElement, FilterBarClearProps>(
  function FilterBarClear(
    { children, onClear, className, onClick, 'data-testid': testId, ...rest },
    ref,
  ) {
    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      onClear?.();
      onClick?.(e);
    };

    return (
      <button
        ref={ref}
        type="button"
        className={cn(styles.clearButton, className)}
        onClick={handleClick}
        data-testid={testId}
        {...rest}
      >
        {children}
      </button>
    );
  },
);

FilterBarClear.displayName = 'FilterBarClear';

export interface FilterBarSummaryProps extends ComponentPropsWithoutRef<'span'> {
  'data-testid'?: string;
}

export const FilterBarSummary = forwardRef<HTMLSpanElement, FilterBarSummaryProps>(
  function FilterBarSummary({ children, className, 'data-testid': testId, ...rest }, ref) {
    return (
      <span
        ref={ref}
        role="status"
        aria-live="polite"
        className={cn(styles.summary, className)}
        data-testid={testId}
        {...rest}
      >
        {children}
      </span>
    );
  },
);

FilterBarSummary.displayName = 'FilterBarSummary';
