'use client';

import React, { type ComponentPropsWithRef, forwardRef, type ReactNode, useId } from 'react';
import { cn } from '@/lib/cn';
import styles from './separator.module.css';

export type SeparatorOrientation = 'horizontal' | 'vertical';
export type SeparatorLabelAlign = 'start' | 'center' | 'end';

export interface SeparatorProps extends Omit<ComponentPropsWithRef<'div'>, 'children'> {
  /** Orientation of the divider. Defaults to 'horizontal' */
  orientation?: SeparatorOrientation;

  /** Whether the separator is purely decorative. If true, role="none". Defaults to true */
  decorative?: boolean;

  /** Optional text or element displayed within a horizontal divider */
  label?: ReactNode;

  /** Alignment of the optional label. Defaults to 'center' */
  labelAlign?: SeparatorLabelAlign;

  /** Optional children alias for horizontal label content */
  children?: ReactNode;

  /** Additional CSS class names */
  className?: string;
}

export const Separator = forwardRef<HTMLElement, SeparatorProps>(function Separator(
  {
    orientation = 'horizontal',
    decorative = true,
    label,
    labelAlign = 'center',
    className,
    children,
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledBy,
    ...props
  },
  ref,
) {
  const generatedLabelId = useId();
  const content = label ?? children;
  const isHorizontal = orientation === 'horizontal';

  // When label is supplied on horizontal orientation, render a composite flex container
  if (isHorizontal && content) {
    const resolvedLabelledBy = decorative
      ? ariaLabelledBy
      : ariaLabel
        ? undefined
        : (ariaLabelledBy ?? generatedLabelId);

    return (
      <div
        ref={ref as React.Ref<HTMLDivElement>}
        role={decorative ? 'none' : 'separator'}
        aria-orientation={decorative ? undefined : 'horizontal'}
        aria-label={ariaLabel}
        aria-labelledby={resolvedLabelledBy}
        data-orientation="horizontal"
        data-decorative={decorative ? 'true' : 'false'}
        data-label-align={labelAlign}
        className={cn(styles.withLabel, className)}
        {...props}
      >
        <span id={generatedLabelId} className={styles.label}>
          {content}
        </span>
      </div>
    );
  }

  if (isHorizontal) {
    return (
      <hr
        ref={ref as React.Ref<HTMLHRElement>}
        role={decorative ? 'none' : 'separator'}
        aria-orientation={decorative ? undefined : 'horizontal'}
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledBy}
        data-orientation="horizontal"
        data-decorative={decorative ? 'true' : 'false'}
        className={cn(styles.horizontal, className)}
        {...(props as ComponentPropsWithRef<'hr'>)}
      />
    );
  }

  return (
    <div
      ref={ref as React.Ref<HTMLDivElement>}
      role={decorative ? 'none' : 'separator'}
      aria-orientation={decorative ? undefined : 'vertical'}
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledBy}
      data-orientation="vertical"
      data-decorative={decorative ? 'true' : 'false'}
      className={cn(styles.vertical, className)}
      {...props}
    />
  );
});

Separator.displayName = 'Separator';
