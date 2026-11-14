'use client';

import {
  type CSSProperties,
  type ComponentPropsWithRef,
  type ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useState,
} from 'react';
import { cn } from '@/lib/cn';
import styles from './progress.module.css';

export type ProgressSize = 'sm' | 'md' | 'lg';
export type ProgressVariant = 'default' | 'success' | 'warning' | 'danger';

interface ProgressIndicatorStyle extends CSSProperties {
  '--_progress-scale'?: string;
}

interface ProgressContextValue {
  labelId: string;
  registerLabel: (mounted: boolean) => void;
}

const ProgressContext = createContext<ProgressContextValue | null>(null);

/* =============================================================================
   Progress (All-in-one & Compound Parent)
   ============================================================================= */

export interface ProgressProps extends ComponentPropsWithRef<'div'> {
  /** Numeric progress value. When null, undefined, or non-finite, the bar enters indeterminate mode. */
  value?: number | null;
  /** Minimum boundary value. Defaults to 0. */
  min?: number;
  /** Maximum boundary value. Defaults to 100. */
  max?: number;
  /** Track thickness density. Defaults to 'md'. */
  size?: ProgressSize;
  /** Semantic status color. Defaults to 'default'. */
  variant?: ProgressVariant;
  /** Accessible string label or visible text. */
  label?: ReactNode;
  /** Whether to render percentage or custom valueText readout. Defaults to false. */
  showValue?: boolean;
  /** Custom accessible text for screen readers and optional visible readout. */
  valueText?: string;
  /** Custom class for the indicator element. */
  indicatorClassName?: string;
}

export function Progress({
  value,
  min = 0,
  max = 100,
  size = 'md',
  variant = 'default',
  label,
  showValue = false,
  valueText,
  className,
  indicatorClassName,
  children,
  ref,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledByProp,
  ...props
}: ProgressProps) {
  const generatedLabelId = useId();
  const [hasCompoundLabel, setHasCompoundLabel] = useState(false);

  const registerLabel = useCallback((mounted: boolean) => {
    setHasCompoundLabel(mounted);
  }, []);

  const hasValidRange = Number.isFinite(min) && Number.isFinite(max) && max > min;
  const isIndeterminate = value === null || value === undefined || !Number.isFinite(value);

  const clampedValue = !isIndeterminate
    ? hasValidRange
      ? Math.min(Math.max(value, min), max)
      : min
    : undefined;

  const percentage =
    !isIndeterminate && clampedValue !== undefined
      ? hasValidRange
        ? Math.round(((clampedValue - min) / (max - min)) * 100)
        : 0
      : undefined;

  const formattedValue = valueText ?? (percentage !== undefined ? `${percentage}%` : undefined);
  const sizeClass = styles[`size_${size}`];
  const variantClass = styles[`variant_${variant}`];
  const hasHeader = Boolean(label || (showValue && formattedValue));

  const effectiveAriaLabelledBy =
    ariaLabelledByProp ??
    (!ariaLabel && (Boolean(label) || hasCompoundLabel) ? generatedLabelId : undefined);

  const contextValue = useMemo(
    () => ({
      labelId: generatedLabelId,
      registerLabel,
    }),
    [generatedLabelId, registerLabel],
  );

  const indicatorStyle: ProgressIndicatorStyle | undefined =
    percentage !== undefined ? { '--_progress-scale': String(percentage / 100) } : undefined;

  return (
    <ProgressContext.Provider value={contextValue}>
      <div
        ref={ref}
        role="progressbar"
        aria-label={ariaLabel}
        aria-labelledby={effectiveAriaLabelledBy}
        aria-valuenow={clampedValue}
        aria-valuemin={!isIndeterminate ? min : undefined}
        aria-valuemax={!isIndeterminate ? max : undefined}
        aria-valuetext={formattedValue}
        aria-busy={isIndeterminate ? 'true' : undefined}
        data-size={size}
        data-variant={variant}
        data-state={isIndeterminate ? 'indeterminate' : 'determinate'}
        className={cn(styles.root, className)}
        {...props}
      >
        {hasHeader && (
          <div className={styles.headerRow}>
            {label && (
              <span id={generatedLabelId} className={styles.label}>
                {label}
              </span>
            )}
            {showValue && formattedValue && (
              <span className={styles.valueText} aria-hidden="true">
                {formattedValue}
              </span>
            )}
          </div>
        )}

        <div className={cn(styles.track, sizeClass)}>
          <div
            className={cn(
              styles.indicator,
              variantClass,
              isIndeterminate && styles.indicator_indeterminate,
              indicatorClassName,
            )}
            style={indicatorStyle}
          />
        </div>

        {children}
      </div>
    </ProgressContext.Provider>
  );
}

/* =============================================================================
   Compound Sub-Components
   ============================================================================= */

export interface ProgressLabelProps extends ComponentPropsWithRef<'span'> {
  children?: ReactNode;
}

export function ProgressLabel({ className, children, id, ref, ...props }: ProgressLabelProps) {
  const ctx = useContext(ProgressContext);
  const resolvedId = id ?? ctx?.labelId;
  const registerLabel = ctx?.registerLabel;

  useEffect(() => {
    if (!registerLabel || id) return;
    registerLabel(true);
    return () => registerLabel(false);
  }, [registerLabel, id]);

  return (
    <span ref={ref} id={resolvedId} className={cn(styles.label, className)} {...props}>
      {children}
    </span>
  );
}

export interface ProgressValueProps extends ComponentPropsWithRef<'span'> {
  children?: ReactNode;
}

export function ProgressValue({ className, children, ref, ...props }: ProgressValueProps) {
  return (
    <span ref={ref} aria-hidden="true" className={cn(styles.valueText, className)} {...props}>
      {children}
    </span>
  );
}
