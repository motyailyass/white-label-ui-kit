'use client';

import {
  type ComponentPropsWithoutRef,
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
} from 'react';
import { Icon } from '@/components/icons';
import { cn } from '@/lib/cn';
import type { ControlSizingProps } from '../control-sizing';
import { Kbd } from '../kbd';
import styles from './search-input.module.css';

export type SearchInputVariant = 'default' | 'subtle' | 'flush';

export interface SearchInputProps
  extends Omit<ComponentPropsWithoutRef<'input'>, 'size' | 'type' | 'prefix'>,
    ControlSizingProps {
  /** Visual variant: 'default' (standard control border), 'subtle' (soft toolbar border), or 'flush' (borderless bottom-rule modal/header bar) */
  variant?: SearchInputVariant;
  /** Native input type override (defaults to 'search') */
  type?: 'search' | 'text';
  /** Optional class applied directly to the inner <input> element */
  inputClassName?: string;
  /** Optional keyboard shortcut string (e.g. '/') that automatically focuses the input when pressed */
  shortcut?: string;
  /** Custom icon slot to replace the default search icon */
  icon?: React.ReactNode;
  /** Trailing content slot (e.g. custom clear button or status) */
  suffix?: React.ReactNode;
  /** Emitted when search value changes */
  onSearch?: (value: string) => void;
}

export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(function SearchInput(
  {
    variant = 'default',
    type = 'search',
    size = 'sm',
    touchTarget = 'auto',
    shortcut,
    icon,
    suffix,
    className,
    inputClassName,
    value,
    placeholder,
    onChange,
    onSearch,
    ...props
  },
  forwardedRef,
) {
  const inputRef = useRef<HTMLInputElement>(null);
  useImperativeHandle(forwardedRef, () => inputRef.current as HTMLInputElement);

  // Global keyboard shortcut to focus the search input
  useEffect(() => {
    if (!shortcut) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      const isEditable =
        activeEl?.tagName === 'INPUT' ||
        activeEl?.tagName === 'TEXTAREA' ||
        (activeEl as HTMLElement)?.isContentEditable;

      if (e.key === shortcut && !isEditable) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcut]);

  return (
    <div
      className={cn(styles.wrapper, className)}
      data-variant={variant}
      data-size={size}
      data-touch-target={touchTarget}
    >
      <span className={styles.iconWrapper} aria-hidden="true">
        {icon ?? <Icon name="search" size={16} />}
      </span>

      <input
        {...props}
        ref={inputRef}
        type={type}
        value={value}
        placeholder={placeholder}
        className={cn(styles.input, inputClassName)}
        onChange={(e) => {
          onChange?.(e);
          onSearch?.(e.target.value);
        }}
      />

      {suffix ? (
        <span className={styles.suffix}>{suffix}</span>
      ) : shortcut ? (
        <Kbd size="md" variant="outline" className={styles.shortcut} aria-hidden="true">
          {shortcut}
        </Kbd>
      ) : null}
    </div>
  );
});

SearchInput.displayName = 'SearchInput';
