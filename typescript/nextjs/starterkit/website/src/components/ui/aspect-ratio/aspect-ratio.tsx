'use client';

import {
  type CSSProperties,
  type ComponentPropsWithoutRef,
  type ReactNode,
  forwardRef,
} from 'react';
import { cn } from '@/lib/cn';
import styles from './aspect-ratio.module.css';

export interface AspectRatioProps extends ComponentPropsWithoutRef<'div'> {
  ratio?: number | string;
  children: ReactNode;
  className?: string;
  'data-testid'?: string;
}

export const AspectRatio = forwardRef<HTMLDivElement, AspectRatioProps>(function AspectRatio(
  { ratio = 16 / 9, children, className, style, 'data-testid': testId, ...rest },
  ref,
) {
  const formattedRatio = typeof ratio === 'number' ? `${ratio}` : ratio.trim().replace(':', ' / ');

  const customStyle: CSSProperties & { '--aspect-ratio'?: string } = {
    '--aspect-ratio': formattedRatio,
    ...style,
  };

  return (
    <div
      ref={ref}
      className={cn(styles.root, className)}
      style={customStyle}
      data-testid={testId}
      data-ratio={formattedRatio}
      {...rest}
    >
      <div className={styles.content}>{children}</div>
    </div>
  );
});
