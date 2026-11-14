'use client';

import {
  type AriaRole,
  type ComponentPropsWithoutRef,
  type CSSProperties,
  type ReactNode,
  forwardRef,
} from 'react';
import type { AccessibleNameProps } from '@/lib/accessible-name';
import { cn } from '@/lib/cn';
import styles from './scroll-area.module.css';

export type ScrollAreaOrientation = 'vertical' | 'horizontal' | 'both';

interface ScrollAreaBaseProps
  extends Omit<ComponentPropsWithoutRef<'div'>, 'aria-label' | 'aria-labelledby'> {
  orientation?: ScrollAreaOrientation;
  maxHeight?: number | string;
  maxWidth?: number | string;
  viewportRef?: React.Ref<HTMLDivElement>;
  viewportClassName?: string;
  viewportTabIndex?: number;
  children: ReactNode;
  className?: string;
  'data-testid'?: string;
}

/**
 * The scrollable viewport is focusable, so it needs an accessible name from the caller.
 * A purely presentational viewport (`viewportRole="presentation" | "none"`) is exempt.
 */
export type ScrollAreaProps = ScrollAreaBaseProps &
  (
    | (AccessibleNameProps & { viewportRole?: AriaRole })
    | {
        viewportRole: 'presentation' | 'none';
        'aria-label'?: string;
        'aria-labelledby'?: string;
      }
  );

export const ScrollArea = forwardRef<HTMLDivElement, ScrollAreaProps>(function ScrollArea(
  {
    orientation = 'vertical',
    maxHeight,
    maxWidth,
    viewportRef,
    viewportClassName,
    viewportTabIndex = 0,
    viewportRole = 'region',
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledBy,
    children,
    className,
    style,
    'data-testid': testId,
    ...rest
  },
  ref,
) {
  const maxBlock =
    maxHeight !== undefined
      ? typeof maxHeight === 'number'
        ? `${maxHeight}px`
        : maxHeight
      : style?.maxBlockSize;
  const maxInline =
    maxWidth !== undefined
      ? typeof maxWidth === 'number'
        ? `${maxWidth}px`
        : maxWidth
      : style?.maxInlineSize;

  const isPresentational = viewportRole === 'presentation' || viewportRole === 'none';

  const rootStyle: CSSProperties = {
    ...style,
    maxBlockSize: maxBlock,
    maxInlineSize: maxInline,
  };

  const viewportStyle: CSSProperties = {
    maxBlockSize: maxBlock,
    maxInlineSize: maxInline,
  };

  return (
    <div
      ref={ref}
      className={cn(styles.root, className)}
      style={rootStyle}
      data-testid={testId}
      {...rest}
    >
      <div
        ref={viewportRef}
        tabIndex={viewportTabIndex}
        role={viewportRole}
        aria-label={isPresentational ? undefined : ariaLabel}
        aria-labelledby={isPresentational ? undefined : ariaLabelledBy}
        data-orientation={orientation}
        style={viewportStyle}
        className={cn(styles.viewport, styles[`overflow_${orientation}`], viewportClassName)}
      >
        {children}
      </div>
    </div>
  );
});

ScrollArea.displayName = 'ScrollArea';

export interface ScrollAreaViewportProps extends ComponentPropsWithoutRef<'div'> {
  children: ReactNode;
  className?: string;
}

export const ScrollAreaViewport = forwardRef<HTMLDivElement, ScrollAreaViewportProps>(
  function ScrollAreaViewport({ children, className, ...rest }, ref) {
    return (
      <div ref={ref} className={cn(styles.viewport, className)} {...rest}>
        {children}
      </div>
    );
  },
);

ScrollAreaViewport.displayName = 'ScrollAreaViewport';

export interface ScrollBarProps extends ComponentPropsWithoutRef<'div'> {
  orientation?: 'vertical' | 'horizontal';
  className?: string;
}

export const ScrollBar = forwardRef<HTMLDivElement, ScrollBarProps>(function ScrollBar(
  { orientation = 'vertical', className, ...rest },
  ref,
) {
  return (
    <div
      ref={ref}
      aria-hidden="true"
      data-orientation={orientation}
      className={className}
      {...rest}
    />
  );
});

ScrollBar.displayName = 'ScrollBar';
