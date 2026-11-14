'use client';

import {
  type CSSProperties,
  type KeyboardEvent,
  type PointerEvent,
  forwardRef,
  useCallback,
  useRef,
  useState,
} from 'react';
import type { AccessibleNameProps } from '@/lib/accessible-name';
import { cn } from '@/lib/cn';
import styles from './slider.module.css';

export type SliderSize = 'sm' | 'md' | 'lg';

export type SliderProps = SliderBaseProps & AccessibleNameProps;

interface SliderBaseProps {
  value?: number;
  defaultValue?: number;
  min?: number;
  max?: number;
  step?: number;
  onChange?: (value: number) => void;
  size?: SliderSize;
  disabled?: boolean;
  name?: string;
  className?: string;
  'data-testid'?: string;
  'aria-valuetext'?: string;
  formatValue?: (value: number) => string;
}

function clamp(val: number, min: number, max: number): number {
  return Math.min(Math.max(val, min), max);
}

function getDecimalPrecision(num: number): number {
  const str = String(num);
  const decimalIndex = str.indexOf('.');
  return decimalIndex === -1 ? 0 : str.length - decimalIndex - 1;
}

function roundToStep(val: number, min: number, step: number): number {
  const steps = Math.round((val - min) / step);
  const raw = min + steps * step;
  const precision = Math.max(getDecimalPrecision(step), getDecimalPrecision(min));
  return Number(raw.toFixed(precision));
}

export const Slider = forwardRef<HTMLDivElement, SliderProps>(function Slider(
  {
    value: controlledValue,
    defaultValue,
    min = 0,
    max = 100,
    step = 1,
    onChange,
    size = 'md',
    disabled = false,
    name,
    className,
    'data-testid': testId,
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledBy,
    'aria-valuetext': ariaValueText,
    formatValue,
  },
  ref,
) {
  const isControlled = controlledValue !== undefined;
  const [uncontrolledValue, setUncontrolledValue] = useState<number>(() => {
    const initial = defaultValue !== undefined ? defaultValue : min;
    return clamp(initial, min, max);
  });

  const currentValue = isControlled ? clamp(controlledValue, min, max) : uncontrolledValue;
  const valueRef = useRef(currentValue);
  valueRef.current = currentValue;

  const rootRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);

  const percentage = max > min ? clamp(((currentValue - min) / (max - min)) * 100, 0, 100) : 0;

  const updateValue = useCallback(
    (nextVal: number) => {
      const stepped = roundToStep(nextVal, min, step);
      const clamped = clamp(stepped, min, max);

      if (clamped !== valueRef.current) {
        valueRef.current = clamped;
        if (!isControlled) {
          setUncontrolledValue(clamped);
        }
        onChange?.(clamped);
      }
    },
    [isControlled, max, min, onChange, step],
  );

  const getValueFromPointer = useCallback(
    (clientX: number): number => {
      if (!rootRef.current) return valueRef.current;
      const rect = rootRef.current.getBoundingClientRect();
      if (rect.width <= 0) return valueRef.current;

      const isRtl = getComputedStyle(rootRef.current).direction === 'rtl';
      const offset = isRtl ? rect.right - clientX : clientX - rect.left;
      const fraction = clamp(offset / rect.width, 0, 1);
      return min + fraction * (max - min);
    },
    [max, min],
  );

  const handlePointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (disabled || e.button !== 0) return;
    isDragging.current = true;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);

    const nextVal = getValueFromPointer(e.clientX);
    updateValue(nextVal);
  };

  const handlePointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (!isDragging.current || disabled) return;
    const nextVal = getValueFromPointer(e.clientX);
    updateValue(nextVal);
  };

  const handlePointerUp = (e: PointerEvent<HTMLDivElement>) => {
    if (!isDragging.current) return;
    isDragging.current = false;
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // Ignored if capture was lost
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (disabled) return;
    const isRtl = rootRef.current ? getComputedStyle(rootRef.current).direction === 'rtl' : false;
    const current = valueRef.current;

    switch (e.key) {
      case 'ArrowRight':
      case 'ArrowUp':
        e.preventDefault();
        updateValue(current + (isRtl && e.key === 'ArrowRight' ? -step : step));
        break;
      case 'ArrowLeft':
      case 'ArrowDown':
        e.preventDefault();
        updateValue(current + (isRtl && e.key === 'ArrowLeft' ? step : -step));
        break;
      case 'PageUp':
        e.preventDefault();
        updateValue(current + step * 10);
        break;
      case 'PageDown':
        e.preventDefault();
        updateValue(current - step * 10);
        break;
      case 'Home':
        e.preventDefault();
        updateValue(min);
        break;
      case 'End':
        e.preventDefault();
        updateValue(max);
        break;
    }
  };

  const sizeClass = size === 'sm' ? styles.sizeSm : size === 'lg' ? styles.sizeLg : styles.sizeMd;

  const rangeStyle: CSSProperties = {
    inlineSize: `${percentage}%`,
  };

  const thumbStyle: CSSProperties = {
    insetInlineStart: `${percentage}%`,
  };

  const computedAriaValueText = ariaValueText ?? formatValue?.(currentValue);

  return (
    <div
      ref={(node) => {
        rootRef.current = node;
        if (typeof ref === 'function') ref(node);
        else if (ref) ref.current = node;
      }}
      className={cn(styles.root, sizeClass, disabled && styles.disabled, className)}
      data-size={size}
      data-disabled={disabled ? '' : undefined}
      data-testid={testId}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      {name ? <input type="hidden" name={name} value={currentValue} disabled={disabled} /> : null}

      <div className={styles.track}>
        <div className={styles.range} style={rangeStyle} />
      </div>

      <div
        role="slider"
        tabIndex={disabled ? -1 : 0}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={currentValue}
        aria-valuetext={computedAriaValueText}
        aria-orientation="horizontal"
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledBy}
        aria-disabled={disabled || undefined}
        className={styles.thumb}
        style={thumbStyle}
        onKeyDown={handleKeyDown}
      />
    </div>
  );
});
