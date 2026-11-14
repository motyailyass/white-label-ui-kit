'use client';

import {
  type ChangeEvent,
  type ClipboardEvent,
  type ComponentPropsWithoutRef,
  type FocusEvent,
  type KeyboardEvent,
  type MouseEvent,
  forwardRef,
  useCallback,
  useId,
  useRef,
  useState,
} from 'react';
import type { AccessibleNameProps } from '@/lib/accessible-name';
import { cn } from '@/lib/cn';
import styles from './input-otp.module.css';

export type InputOtpSize = 'sm' | 'md' | 'lg';
export type InputOtpType = 'numeric' | 'alphanumeric';
export type InputOtpVariant = 'separated' | 'grouped';

interface InputOtpBaseProps
  extends Omit<ComponentPropsWithoutRef<'div'>, 'onChange' | 'aria-label' | 'aria-labelledby'> {
  length?: number;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  onComplete?: (value: string) => void;
  size?: InputOtpSize;
  variant?: InputOtpVariant;
  disabled?: boolean;
  error?: boolean;
  mask?: boolean;
  type?: InputOtpType;
  separatorIndex?: number;
  className?: string;
  'data-testid'?: string;
  /** Localized accessible name for each slot (1-based index). */
  slotAriaLabel: (index: number, total: number) => string;
  autoFocus?: boolean;
}

export type InputOtpProps = InputOtpBaseProps & AccessibleNameProps;

export const InputOtp = forwardRef<HTMLDivElement, InputOtpProps>(function InputOtp(
  {
    length = 6,
    value: controlledValue,
    defaultValue = '',
    onChange,
    onComplete,
    size = 'md',
    variant = 'separated',
    disabled = false,
    error = false,
    mask = false,
    type = 'numeric',
    separatorIndex,
    className,
    'data-testid': testId,
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledBy,
    slotAriaLabel,
    autoFocus = false,
    ...rest
  },
  ref,
) {
  const isControlled = controlledValue !== undefined;
  const [uncontrolledValue, setUncontrolledValue] = useState<string>(() =>
    defaultValue.slice(0, length),
  );

  const currentValue = isControlled ? (controlledValue || '').slice(0, length) : uncontrolledValue;

  const valueRef = useRef(currentValue);
  valueRef.current = currentValue;

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const containerId = useId();

  const updateValue = useCallback(
    (newVal: string) => {
      const sanitized = newVal.slice(0, length);
      valueRef.current = sanitized;
      if (!isControlled) {
        setUncontrolledValue(sanitized);
      }
      onChange?.(sanitized);
      if (sanitized.length === length) {
        onComplete?.(sanitized);
      }
    },
    [isControlled, length, onChange, onComplete],
  );

  const isValidChar = useCallback(
    (char: string) => {
      if (type === 'numeric') {
        return /^\d$/.test(char);
      }
      return /^[a-zA-Z0-9]$/.test(char);
    },
    [type],
  );

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>, index: number) => {
    const raw = e.target.value;
    const char = raw.slice(-1);

    if (!char || !isValidChar(char)) {
      return;
    }

    const valArr = valueRef.current.split('');
    while (valArr.length < length) {
      valArr.push('');
    }
    valArr[index] = char;
    const nextVal = valArr.join('').slice(0, length);
    valueRef.current = nextVal;
    updateValue(nextVal);

    // Advance to next slot if available
    if (index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>, index: number) => {
    const dirAttr = e.currentTarget.closest('[dir]')?.getAttribute('dir');
    const isRtl =
      dirAttr === 'rtl' ||
      (typeof window !== 'undefined' &&
        window.getComputedStyle(e.currentTarget).direction === 'rtl');

    if (isValidChar(e.key) && !e.ctrlKey && !e.metaKey && !e.altKey) {
      e.preventDefault();
      const valArr = valueRef.current.split('');
      while (valArr.length < length) {
        valArr.push('');
      }
      valArr[index] = e.key;
      const nextVal = valArr.join('').slice(0, length);
      valueRef.current = nextVal;
      updateValue(nextVal);

      if (index < length - 1) {
        inputRefs.current[index + 1]?.focus();
      }
      return;
    }

    if (e.key === 'Backspace') {
      e.preventDefault();
      const valArr = valueRef.current.split('');
      while (valArr.length < length) {
        valArr.push('');
      }

      if (valArr[index]) {
        valArr[index] = '';
        const nextVal = valArr.join('').trimEnd();
        valueRef.current = nextVal;
        updateValue(nextVal);
      } else if (index > 0) {
        valArr[index - 1] = '';
        const nextVal = valArr.join('').trimEnd();
        valueRef.current = nextVal;
        updateValue(nextVal);
        inputRefs.current[index - 1]?.focus();
      }
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      const targetIndex = isRtl ? index + 1 : index - 1;
      if (targetIndex >= 0 && targetIndex < length) {
        inputRefs.current[targetIndex]?.focus();
      }
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      const targetIndex = isRtl ? index - 1 : index + 1;
      if (targetIndex >= 0 && targetIndex < length) {
        inputRefs.current[targetIndex]?.focus();
      }
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text/plain').trim();
    const validChars = pasted.split('').filter(isValidChar);

    if (validChars.length === 0) return;

    const pastedStr = validChars.slice(0, length).join('');
    valueRef.current = pastedStr;
    updateValue(pastedStr);

    // Focus last filled index or first unfilled
    const nextFocus = Math.min(pastedStr.length, length - 1);
    inputRefs.current[nextFocus]?.focus();
  };

  const handleFocus = (e: FocusEvent<HTMLInputElement>, index: number) => {
    const firstEmptyIndex = Math.min(valueRef.current.length, length - 1);
    if (index > firstEmptyIndex) {
      inputRefs.current[firstEmptyIndex]?.focus();
      return;
    }
    e.target.select();
  };

  const handleClick = (e: MouseEvent<HTMLInputElement>, index: number) => {
    const firstEmptyIndex = Math.min(valueRef.current.length, length - 1);
    if (index > firstEmptyIndex) {
      e.preventDefault();
      inputRefs.current[firstEmptyIndex]?.focus();
    }
  };

  const sizeClass = size === 'sm' ? styles.sizeSm : size === 'lg' ? styles.sizeLg : styles.sizeMd;

  const isComplete = currentValue.length === length;

  const renderSlot = (index: number) => {
    const char = currentValue[index] || '';
    const slotLabel = slotAriaLabel(index + 1, length);

    return (
      <input
        key={index}
        ref={(node) => {
          inputRefs.current[index] = node;
        }}
        id={`${containerId}-slot-${index}`}
        type={mask ? 'password' : 'text'}
        inputMode={type === 'numeric' ? 'numeric' : 'text'}
        pattern={type === 'numeric' ? '[0-9]*' : undefined}
        autoComplete="one-time-code"
        maxLength={1}
        value={char}
        disabled={disabled}
        autoFocus={autoFocus && index === 0}
        aria-label={slotLabel}
        className={cn(styles.slot, sizeClass)}
        onChange={(e) => handleInputChange(e, index)}
        onKeyDown={(e) => handleKeyDown(e, index)}
        onPaste={handlePaste}
        onFocus={(e) => handleFocus(e, index)}
        onClick={(e) => handleClick(e, index)}
      />
    );
  };

  return (
    <div
      ref={ref}
      role="group"
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledBy}
      className={cn(styles.root, error && styles.error, className)}
      data-testid={testId}
      data-size={size}
      data-variant={variant}
      data-length={length}
      data-disabled={disabled ? 'true' : undefined}
      data-error={error ? 'true' : undefined}
      data-complete={isComplete ? 'true' : undefined}
      {...rest}
    >
      {variant === 'grouped' ? (
        separatorIndex !== undefined && separatorIndex > 0 && separatorIndex < length ? (
          <>
            <div className={styles.slotGroup}>
              {Array.from({ length: separatorIndex }).map((_, i) => renderSlot(i))}
            </div>
            <span className={styles.separator} data-separator="true" aria-hidden="true">
              —
            </span>
            <div className={styles.slotGroup}>
              {Array.from({ length: length - separatorIndex }).map((_, i) =>
                renderSlot(separatorIndex + i),
              )}
            </div>
          </>
        ) : (
          <div className={styles.slotGroup}>
            {Array.from({ length }).map((_, i) => renderSlot(i))}
          </div>
        )
      ) : (
        Array.from({ length }).map((_, index) => {
          const showSeparator = separatorIndex !== undefined && index === separatorIndex;
          return (
            <span key={index} className={styles.slotWrapper}>
              {showSeparator && (
                <span className={styles.separator} data-separator="true" aria-hidden="true">
                  —
                </span>
              )}
              {renderSlot(index)}
            </span>
          );
        })
      )}
    </div>
  );
});
