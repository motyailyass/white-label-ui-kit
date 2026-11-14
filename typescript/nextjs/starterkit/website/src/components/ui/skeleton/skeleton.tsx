'use client';

import type { ComponentPropsWithRef, CSSProperties, ElementType } from 'react';
import { cn } from '@/lib/cn';
import styles from './skeleton.module.css';

export type SkeletonVariant = 'text' | 'circular' | 'rectangular' | 'rounded';
export type SkeletonAnimation = 'pulse' | 'wave' | 'none';

export interface SkeletonProps extends ComponentPropsWithRef<'div'> {
  /** Visual shape of the placeholder. Defaults to 'text' */
  variant?: SkeletonVariant;

  /** Animation style. Defaults to 'pulse' */
  animation?: SkeletonAnimation;

  /** Width override as CSS value (e.g., '100px', '50%', 40) */
  width?: string | number;

  /** Height override as CSS value (e.g., '20px', '2rem', 20) */
  height?: string | number;

  /** Polymorphic element tag. Defaults to 'span' for text, 'div' for surfaces */
  as?: ElementType;

  /** Additional CSS class names */
  className?: string;
}

const variantClassMap: Record<SkeletonVariant, string> = {
  text: styles.variantText,
  circular: styles.variantCircular,
  rectangular: styles.variantRectangular,
  rounded: styles.variantRounded,
};

const animationClassMap: Record<SkeletonAnimation, string | undefined> = {
  pulse: styles.animationPulse,
  wave: styles.animationWave,
  none: undefined,
};

/**
 * Low-fidelity decorative loading placeholder primitive.
 * Sets aria-hidden="true" by default and mitigates animations under prefers-reduced-motion.
 */
export function Skeleton({
  variant = 'text',
  animation = 'pulse',
  width,
  height,
  as,
  className,
  style,
  'aria-hidden': ariaHidden,
  ref,
  ...props
}: SkeletonProps) {
  const Component = as ?? (variant === 'text' ? 'span' : 'div');

  const hasCustomDimensions = width !== undefined || height !== undefined;
  const customProperties: CSSProperties | undefined =
    style || hasCustomDimensions
      ? {
          ...style,
          ...(width !== undefined && {
            ['--_sk-width' as string]: typeof width === 'number' ? `${width}px` : width,
          }),
          ...(height !== undefined && {
            ['--_sk-height' as string]: typeof height === 'number' ? `${height}px` : height,
          }),
        }
      : undefined;

  return (
    <Component
      ref={ref}
      aria-hidden={ariaHidden ?? 'true'}
      data-variant={variant}
      data-animation={animation}
      className={cn(
        styles.skeleton,
        variantClassMap[variant],
        animationClassMap[animation],
        className,
      )}
      style={customProperties}
      {...props}
    />
  );
}
