'use client';

import {
  type ComponentPropsWithoutRef,
  type ReactNode,
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useState,
} from 'react';
import { cn } from '@/lib/cn';
import type { ControlSize } from '../control-sizing';
import { Toggle, type ToggleProps, type ToggleVariant } from '../toggle';
import styles from './toggle-group.module.css';

interface ToggleGroupContextValue {
  type: 'single' | 'multiple';
  value: string | string[];
  onItemToggle: (itemValue: string) => void;
  size?: ControlSize;
  variant?: ToggleVariant;
  disabled?: boolean;
}

const ToggleGroupContext = createContext<ToggleGroupContextValue | null>(null);

function useToggleGroupContext() {
  const ctx = useContext(ToggleGroupContext);
  if (!ctx) {
    throw new Error('ToggleGroupItem must be used within a ToggleGroup');
  }
  return ctx;
}

export interface ToggleGroupBaseProps extends Omit<ComponentPropsWithoutRef<'div'>, 'onChange'> {
  size?: ControlSize;
  variant?: ToggleVariant;
  disabled?: boolean;
  joined?: boolean;
  children: ReactNode;
  className?: string;
  'data-testid'?: string;
  'aria-label'?: string;
}

export interface ToggleGroupSingleProps extends ToggleGroupBaseProps {
  type?: 'single';
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
}

export interface ToggleGroupMultipleProps extends ToggleGroupBaseProps {
  type: 'multiple';
  value?: string[];
  defaultValue?: string[];
  onValueChange?: (value: string[]) => void;
}

export type ToggleGroupProps = ToggleGroupSingleProps | ToggleGroupMultipleProps;

export const ToggleGroup = forwardRef<HTMLDivElement, ToggleGroupProps>(
  function ToggleGroup(props, ref) {
    const {
      type = 'single',
      value: controlledValue,
      defaultValue,
      onValueChange,
      size = 'md',
      variant = 'default',
      disabled = false,
      joined = true,
      children,
      className,
      'data-testid': testId,
      'aria-label': ariaLabel,
      ...rest
    } = props as ToggleGroupBaseProps & {
      type?: 'single' | 'multiple';
      value?: string | string[];
      defaultValue?: string | string[];
      onValueChange?: ((val: string) => void) | ((val: string[]) => void);
    };
    const isControlled = controlledValue !== undefined;
    const [uncontrolledValue, setUncontrolledValue] = useState<string | string[]>(() => {
      if (defaultValue !== undefined) return defaultValue;
      return type === 'multiple' ? [] : '';
    });

    const activeValue = isControlled ? controlledValue! : uncontrolledValue;

    const handleItemToggle = useCallback(
      (itemValue: string) => {
        if (type === 'single') {
          const next = activeValue === itemValue ? '' : itemValue;
          if (!isControlled) {
            setUncontrolledValue(next);
          }
          (onValueChange as ((val: string) => void) | undefined)?.(next);
        } else {
          const currentArr = Array.isArray(activeValue) ? activeValue : [];
          const next = currentArr.includes(itemValue)
            ? currentArr.filter((v) => v !== itemValue)
            : [...currentArr, itemValue];

          if (!isControlled) {
            setUncontrolledValue(next);
          }
          (onValueChange as ((val: string[]) => void) | undefined)?.(next);
        }
      },
      [activeValue, isControlled, onValueChange, type],
    );

    return (
      <ToggleGroupContext.Provider
        value={{
          type,
          value: activeValue,
          onItemToggle: handleItemToggle,
          size,
          variant,
          disabled,
        }}
      >
        <div
          ref={ref}
          role="group"
          aria-label={ariaLabel}
          className={cn(styles.root, joined && styles.joined, className)}
          data-testid={testId}
          {...rest}
        >
          {children}
        </div>
      </ToggleGroupContext.Provider>
    );
  },
);

export interface ToggleGroupItemProps extends Omit<ToggleProps, 'value'> {
  value: string;
}

export const ToggleGroupItem = forwardRef<HTMLButtonElement, ToggleGroupItemProps>(
  function ToggleGroupItem({ value: itemValue, disabled: itemDisabled, children, ...rest }, ref) {
    const {
      type,
      value,
      onItemToggle,
      size,
      variant,
      disabled: groupDisabled,
    } = useToggleGroupContext();

    const isPressed =
      type === 'single' ? value === itemValue : Array.isArray(value) && value.includes(itemValue);

    const isDisabled = groupDisabled || itemDisabled;

    return (
      <Toggle
        ref={ref}
        size={size}
        variant={variant}
        disabled={isDisabled}
        pressed={isPressed}
        onPressedChange={() => onItemToggle(itemValue)}
        {...rest}
      >
        {children}
      </Toggle>
    );
  },
);
