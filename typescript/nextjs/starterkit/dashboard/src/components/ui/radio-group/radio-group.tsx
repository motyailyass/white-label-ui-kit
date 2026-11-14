'use client';

import {
  type ChangeEvent,
  type ComponentPropsWithoutRef,
  type ReactNode,
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useId,
  useState,
} from 'react';
import { cn } from '@/lib/cn';
import type { ControlSize } from '../control-sizing';
import { Radio, type RadioProps } from '../radio';
import styles from './radio-group.module.css';

interface RadioGroupContextValue {
  name: string;
  value?: string;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
  size?: ControlSize;
}

const RadioGroupContext = createContext<RadioGroupContextValue | null>(null);

function useRadioGroupContext() {
  const ctx = useContext(RadioGroupContext);
  if (!ctx) {
    throw new Error('RadioGroupItem must be rendered inside <RadioGroup>');
  }
  return ctx;
}

/* -------------------------------------------------------------------------- */
/* RadioGroup (Root)                                                          */
/* -------------------------------------------------------------------------- */

export interface RadioGroupProps extends Omit<ComponentPropsWithoutRef<'div'>, 'onChange'> {
  name?: string;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
  size?: ControlSize;
  orientation?: 'vertical' | 'horizontal';
  children: ReactNode;
  className?: string;
  'data-testid'?: string;
}

export const RadioGroup = forwardRef<HTMLDivElement, RadioGroupProps>(function RadioGroup(
  {
    name: callerName,
    value: controlledValue,
    defaultValue,
    onValueChange,
    disabled = false,
    size,
    orientation = 'vertical',
    children,
    className,
    'data-testid': testId,
    ...rest
  },
  ref,
) {
  const generatedName = useId();
  const groupName = callerName ?? `radio-group-${generatedName}`;

  const isControlled = controlledValue !== undefined;
  const [uncontrolledValue, setUncontrolledValue] = useState<string | undefined>(defaultValue);
  const activeValue = isControlled ? controlledValue : uncontrolledValue;

  const handleValueChange = useCallback(
    (nextVal: string) => {
      if (!isControlled) {
        setUncontrolledValue(nextVal);
      }
      onValueChange?.(nextVal);
    },
    [isControlled, onValueChange],
  );

  return (
    <RadioGroupContext.Provider
      value={{
        name: groupName,
        value: activeValue,
        onValueChange: handleValueChange,
        disabled,
        size,
      }}
    >
      <div
        ref={ref}
        role="radiogroup"
        aria-orientation={orientation}
        data-orientation={orientation}
        className={cn(styles.group, className)}
        data-testid={testId}
        {...rest}
      >
        {children}
      </div>
    </RadioGroupContext.Provider>
  );
});

RadioGroup.displayName = 'RadioGroup';

/* -------------------------------------------------------------------------- */
/* RadioGroupItem                                                             */
/* -------------------------------------------------------------------------- */

export interface RadioGroupItemProps extends Omit<RadioProps, 'name' | 'checked' | 'onChange'> {
  value: string;
  children?: ReactNode;
  label?: ReactNode;
  className?: string;
  'data-testid'?: string;
}

export const RadioGroupItem = forwardRef<HTMLInputElement, RadioGroupItemProps>(
  function RadioGroupItem(
    {
      value,
      children,
      label,
      disabled: itemDisabled,
      size: itemSize,
      className,
      id: callerId,
      'data-testid': testId,
      ...rest
    },
    ref,
  ) {
    const generatedId = useId();
    const inputId = callerId ?? `radio-item-${generatedId}`;

    const {
      name: groupName,
      value: groupValue,
      onValueChange,
      disabled: groupDisabled,
      size: groupSize,
    } = useRadioGroupContext();

    const isDisabled = itemDisabled ?? groupDisabled;
    const resolvedSize = itemSize ?? groupSize;
    const isChecked = groupValue === value;

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
      if (e.target.checked) {
        onValueChange?.(value);
      }
    };

    const labelContent = children ?? label;

    if (!labelContent) {
      return (
        <Radio
          ref={ref}
          id={inputId}
          name={groupName}
          value={value}
          checked={isChecked}
          disabled={isDisabled}
          size={resolvedSize}
          onChange={handleChange}
          className={className}
          data-testid={testId}
          {...rest}
        />
      );
    }

    return (
      <label
        htmlFor={inputId}
        className={cn(styles.itemWrapper, className)}
        data-disabled={isDisabled ? 'true' : undefined}
      >
        <Radio
          ref={ref}
          id={inputId}
          name={groupName}
          value={value}
          checked={isChecked}
          disabled={isDisabled}
          size={resolvedSize}
          onChange={handleChange}
          data-testid={testId}
          {...rest}
        />
        <span className={styles.label}>{labelContent}</span>
      </label>
    );
  },
);

RadioGroupItem.displayName = 'RadioGroupItem';
