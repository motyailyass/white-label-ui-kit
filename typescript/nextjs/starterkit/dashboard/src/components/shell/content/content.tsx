'use client';

import type React from 'react';
import { cn } from '@/lib/cn';
import styles from './content.module.css';

/* -------------------------------------------------------------------------- */
/*                                   Content                                  */
/* -------------------------------------------------------------------------- */

export interface ContentProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode;
}

export function Content({ className, children, ...props }: ContentProps) {
  return (
    <div className={cn(styles.content, className)} {...props}>
      {children}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                                 ContentBody                                */
/* -------------------------------------------------------------------------- */

export interface ContentBodyProps extends React.HTMLAttributes<HTMLDivElement> {
  layout?: 'boxed' | 'compact' | 'full';
  children: React.ReactNode;
}

export function ContentBody({ layout = 'full', className, children, ...props }: ContentBodyProps) {
  return (
    <div className={cn(styles.body, className)} data-layout={layout} {...props}>
      {children}
    </div>
  );
}
