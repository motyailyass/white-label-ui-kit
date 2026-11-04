'use client';

import {
  type ComponentPropsWithRef,
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode,
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Icon } from '@/components/icons';
import { cn } from '@/lib/cn';
import type { ControlSizingProps } from '../control-sizing';
import styles from './combobox.module.css';

export interface ComboboxOption {
  /** Unique value submitted with forms or events */
  value: string;
  /** Human-readable label displayed in input and listbox */
  label: string;
  /** Optional secondary text or description */
  description?: string;
  /** Optional icon rendered next to the option */
  icon?: ReactNode;
  /** Disables selection of this option */
  disabled?: boolean;
}

export interface ComboboxOptionGroup {
  /** Group title */
  label: string;
  /** Options belonging to this group */
  options: ComboboxOption[];
}

export type ComboboxItems = ComboboxOption[] | ComboboxOptionGroup[];

function isGrouped(items: ComboboxItems): items is ComboboxOptionGroup[] {
  return items.length > 0 && 'options' in items[0];
}

export interface ComboboxProps
  extends Omit<ComponentPropsWithRef<'input'>, 'size' | 'onChange' | 'value' | 'defaultValue'>,
    ControlSizingProps {
  /** List of flat options or grouped options */
  options: ComboboxItems;

  /** Controlled selected value */
  value?: string;

  /** Initial selected value for uncontrolled usage */
  defaultValue?: string;

  /** Callback fired when an option is selected or cleared */
  onValueChange?: (value: string, selectedOption: ComboboxOption | null) => void;

  /** Callback fired as the user types in the search input */
  onSearchChange?: (query: string) => void;

  /** Custom filter function; defaults to case-insensitive substring match on option label */
  filterFn?: (option: ComboboxOption, query: string) => boolean;

  /** Message displayed when search query matches zero options */
  emptyMessage?: ReactNode;

  /** Loading state displaying animated spinner and aria-busy */
  loading?: boolean;

  /** Error validation state */
  invalid?: boolean;

  /** Clear button visibility when a value is selected */
  clearable?: boolean;

  /** Localized accessible name for the clear button */
  clearAriaLabel?: string;

  /** Localized accessible name for the toggle popup button */
  toggleAriaLabel?: string;

  /** Optional leading icon inside the input */
  startIcon?: ReactNode;

  /** Maximum block height of the floating listbox */
  maxListHeight?: string;

  /** Optional className for the root wrapper box */
  wrapperClassName?: string;

  /** Optional className for the floating listbox popup */
  listboxClassName?: string;
}

export const Combobox = forwardRef<HTMLInputElement, ComboboxProps>(function Combobox(
  {
    options,
    value: controlledValue,
    defaultValue = '',
    onValueChange,
    onSearchChange,
    filterFn,
    emptyMessage,
    loading = false,
    invalid = false,
    disabled = false,
    clearable = false,
    clearAriaLabel = 'Clear selection',
    toggleAriaLabel = 'Toggle options',
    startIcon,
    size,
    touchTarget = 'auto',
    maxListHeight,
    wrapperClassName,
    listboxClassName,
    className,
    placeholder,
    id: propId,
    name,
    onKeyDown,
    onFocus,
    onBlur,
    ...props
  },
  forwardedRef,
) {
  const generatedId = useId();
  const inputId = propId ?? `combobox-input-${generatedId}`;
  const listboxId = `combobox-listbox-${generatedId}`;

  const inputRef = useRef<HTMLInputElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const listboxRef = useRef<HTMLUListElement | null>(null);

  useImperativeHandle(forwardedRef, () => inputRef.current as HTMLInputElement);

  // Flatten options for lookup and navigation
  const flatOptions = useMemo<ComboboxOption[]>(() => {
    if (isGrouped(options)) {
      return options.flatMap((group) => group.options);
    }
    return options;
  }, [options]);

  // Selected value state (controlled or uncontrolled)
  const isControlled = controlledValue !== undefined;
  const [internalValue, setInternalValue] = useState<string>(defaultValue);
  const selectedValue = isControlled ? controlledValue : internalValue;

  const selectedOption = useMemo(
    () => flatOptions.find((opt) => opt.value === selectedValue) ?? null,
    [flatOptions, selectedValue],
  );

  // Search input text state
  const [searchQuery, setSearchQuery] = useState<string>(selectedOption?.label ?? '');
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number>(-1);

  // Synchronize searchQuery when selected option changes from outside
  useEffect(() => {
    if (selectedOption) {
      setSearchQuery(selectedOption.label);
    } else if (!isControlled) {
      setSearchQuery('');
    }
  }, [selectedOption, isControlled]);

  // Default filter function: case-insensitive label substring
  const defaultFilter = useCallback((opt: ComboboxOption, query: string) => {
    return opt.label.toLowerCase().includes(query.toLowerCase());
  }, []);

  const activeFilterFn = filterFn ?? defaultFilter;

  // Filtered items (preserving groups if grouped)
  const filteredItems = useMemo<ComboboxItems>(() => {
    if (!searchQuery.trim()) return options;

    if (isGrouped(options)) {
      return options
        .map((group) => ({
          ...group,
          options: group.options.filter((opt) => activeFilterFn(opt, searchQuery)),
        }))
        .filter((group) => group.options.length > 0);
    }

    return options.filter((opt) => activeFilterFn(opt, searchQuery));
  }, [options, searchQuery, activeFilterFn]);

  // Flattened filtered options for linear index navigation
  const visibleOptions = useMemo<ComboboxOption[]>(() => {
    if (isGrouped(filteredItems)) {
      return filteredItems.flatMap((group) => group.options);
    }
    return filteredItems;
  }, [filteredItems]);

  // Outside click listener
  useEffect(() => {
    if (!isOpen) return;

    function handlePointerDown(e: PointerEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setActiveIndex(-1);
        // Reset query text to selected option label
        if (selectedOption) {
          setSearchQuery(selectedOption.label);
        } else {
          setSearchQuery('');
        }
      }
    }

    window.addEventListener('pointerdown', handlePointerDown);
    return () => window.removeEventListener('pointerdown', handlePointerDown);
  }, [isOpen, selectedOption]);

  // Scroll active option into view
  useEffect(() => {
    if (!isOpen || activeIndex < 0 || !listboxRef.current) return;
    const activeEl = listboxRef.current.querySelector<HTMLElement>(
      `[data-combobox-index="${activeIndex}"]`,
    );
    if (activeEl && typeof activeEl.scrollIntoView === 'function') {
      activeEl.scrollIntoView({ block: 'nearest' });
    }
  }, [isOpen, activeIndex]);

  const selectOption = useCallback(
    (option: ComboboxOption) => {
      if (option.disabled) return;
      if (!isControlled) {
        setInternalValue(option.value);
      }
      setSearchQuery(option.label);
      setIsOpen(false);
      setActiveIndex(-1);
      onValueChange?.(option.value, option);
      inputRef.current?.focus();
    },
    [isControlled, onValueChange],
  );

  const clearSelection = useCallback(
    (e: MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation();
      if (!isControlled) {
        setInternalValue('');
      }
      setSearchQuery('');
      setIsOpen(false);
      setActiveIndex(-1);
      onValueChange?.('', null);
      inputRef.current?.focus();
    },
    [isControlled, onValueChange],
  );

  // Keyboard navigation
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    onKeyDown?.(e);
    if (disabled) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
        // Highlight first enabled option
        const firstEnabled = visibleOptions.findIndex((opt) => !opt.disabled);
        setActiveIndex(firstEnabled);
      } else {
        // Move to next enabled option
        let next = activeIndex + 1;
        while (next < visibleOptions.length && visibleOptions[next]?.disabled) {
          next++;
        }
        if (next < visibleOptions.length) {
          setActiveIndex(next);
        }
      }
      return;
    }

    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (isOpen) {
        let prev = activeIndex - 1;
        while (prev >= 0 && visibleOptions[prev]?.disabled) {
          prev--;
        }
        if (prev >= 0) {
          setActiveIndex(prev);
        }
      }
      return;
    }

    if (e.key === 'Enter') {
      if (isOpen && activeIndex >= 0 && activeIndex < visibleOptions.length) {
        e.preventDefault();
        const candidate = visibleOptions[activeIndex];
        if (candidate && !candidate.disabled) {
          selectOption(candidate);
        }
      }
      return;
    }

    if (e.key === 'Escape') {
      if (isOpen) {
        e.preventDefault();
        e.stopPropagation(); // Avoid closing outer dialogs
        setIsOpen(false);
        setActiveIndex(-1);
        if (selectedOption) {
          setSearchQuery(selectedOption.label);
        }
      }
      return;
    }

    if (e.key === 'Tab') {
      if (isOpen) {
        setIsOpen(false);
        setActiveIndex(-1);
        if (selectedOption) {
          setSearchQuery(selectedOption.label);
        }
      }
      return;
    }

    if (e.key === 'Home' && isOpen) {
      e.preventDefault();
      const firstEnabled = visibleOptions.findIndex((opt) => !opt.disabled);
      if (firstEnabled >= 0) setActiveIndex(firstEnabled);
      return;
    }

    if (e.key === 'End' && isOpen) {
      e.preventDefault();
      for (let i = visibleOptions.length - 1; i >= 0; i--) {
        if (!visibleOptions[i]?.disabled) {
          setActiveIndex(i);
          break;
        }
      }
    }
  };

  const handleInputChange = (query: string) => {
    setSearchQuery(query);
    if (!isOpen) {
      setIsOpen(true);
    }
    setActiveIndex(-1);
    onSearchChange?.(query);
  };

  const activeOptionId =
    isOpen && activeIndex >= 0 && visibleOptions[activeIndex]
      ? `${listboxId}-option-${activeIndex}`
      : undefined;

  let flatIndexCounter = 0;

  return (
    <div
      ref={containerRef}
      className={cn(styles.wrapper, wrapperClassName)}
      data-size={size}
      data-touch-target={touchTarget}
    >
      {/* Hidden native input for standard form integration */}
      {name && <input type="hidden" name={name} value={selectedValue} />}

      <div
        className={cn(
          styles.inputContainer,
          invalid && styles.invalid,
          disabled && styles.disabled,
          isOpen && styles.focused,
        )}
      >
        {startIcon && <span className={styles.startIcon}>{startIcon}</span>}

        <input
          {...props}
          ref={inputRef}
          id={inputId}
          type="text"
          value={searchQuery}
          disabled={disabled}
          placeholder={placeholder}
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={isOpen}
          aria-controls={isOpen ? listboxId : undefined}
          aria-activedescendant={activeOptionId}
          aria-invalid={invalid || undefined}
          aria-busy={loading || undefined}
          data-size={size}
          data-touch-target={touchTarget}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={(e) => {
            onFocus?.(e);
            if (!disabled) setIsOpen(true);
          }}
          onBlur={onBlur}
          onKeyDown={handleKeyDown}
          className={cn(styles.input, className)}
        />

        <div className={styles.endActions}>
          {loading && (
            <span className={styles.spinner} aria-hidden="true">
              <Icon name="loader" />
            </span>
          )}

          {clearable && !!selectedValue && !disabled && (
            <button
              type="button"
              tabIndex={-1}
              aria-label={clearAriaLabel}
              onClick={clearSelection}
              className={styles.actionButton}
            >
              <Icon name="cancel" />
            </button>
          )}

          <button
            type="button"
            tabIndex={-1}
            disabled={disabled}
            aria-label={toggleAriaLabel}
            aria-expanded={isOpen}
            onClick={() => {
              if (disabled) return;
              inputRef.current?.focus();
              setIsOpen((prev) => !prev);
            }}
            className={cn(styles.actionButton, styles.chevronButton, isOpen && styles.chevronOpen)}
          >
            <Icon name="chevron-down" />
          </button>
        </div>
      </div>

      {isOpen && (
        <ul
          ref={listboxRef}
          id={listboxId}
          role="listbox"
          tabIndex={-1}
          style={maxListHeight ? { maxBlockSize: maxListHeight } : undefined}
          className={cn(styles.listbox, listboxClassName)}
        >
          {visibleOptions.length === 0 ? (
            <li role="presentation" className={styles.emptyMessage}>
              {emptyMessage ?? 'No options found'}
            </li>
          ) : isGrouped(filteredItems) ? (
            filteredItems.map((group) => {
              const groupId = `${listboxId}-group-${group.label}`;
              return (
                <li key={group.label} role="presentation" className={styles.group}>
                  <div id={groupId} className={styles.groupLabel}>
                    {group.label}
                  </div>
                  <ul role="group" aria-labelledby={groupId} className={styles.groupList}>
                    {group.options.map((opt) => {
                      const currentIndex = flatIndexCounter++;
                      const isSelected = opt.value === selectedValue;
                      const isActive = currentIndex === activeIndex;
                      const optionId = `${listboxId}-option-${currentIndex}`;

                      return (
                        <li
                          key={opt.value}
                          id={optionId}
                          role="option"
                          aria-selected={isSelected}
                          aria-disabled={opt.disabled || undefined}
                          data-combobox-index={currentIndex}
                          className={cn(
                            styles.option,
                            isActive && styles.optionActive,
                            isSelected && styles.optionSelected,
                            opt.disabled && styles.optionDisabled,
                          )}
                          onMouseDown={(e) => {
                            e.preventDefault(); // Prevent input blur
                            selectOption(opt);
                          }}
                          onMouseEnter={() => {
                            if (!opt.disabled) setActiveIndex(currentIndex);
                          }}
                        >
                          <div className={styles.optionContent}>
                            {opt.icon && <span className={styles.optionIcon}>{opt.icon}</span>}
                            <div className={styles.optionTextGroup}>
                              <span className={styles.optionLabel}>{opt.label}</span>
                              {opt.description && (
                                <span className={styles.optionDescription}>{opt.description}</span>
                              )}
                            </div>
                          </div>
                          {isSelected && (
                            <span className={styles.checkIcon} aria-hidden="true">
                              <Icon name="check" />
                            </span>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </li>
              );
            })
          ) : (
            (filteredItems as ComboboxOption[]).map((opt) => {
              const currentIndex = flatIndexCounter++;
              const isSelected = opt.value === selectedValue;
              const isActive = currentIndex === activeIndex;
              const optionId = `${listboxId}-option-${currentIndex}`;

              return (
                <li
                  key={opt.value}
                  id={optionId}
                  role="option"
                  aria-selected={isSelected}
                  aria-disabled={opt.disabled || undefined}
                  data-combobox-index={currentIndex}
                  className={cn(
                    styles.option,
                    isActive && styles.optionActive,
                    isSelected && styles.optionSelected,
                    opt.disabled && styles.optionDisabled,
                  )}
                  onMouseDown={(e) => {
                    e.preventDefault(); // Prevent input blur
                    selectOption(opt);
                  }}
                  onMouseEnter={() => {
                    if (!opt.disabled) setActiveIndex(currentIndex);
                  }}
                >
                  <div className={styles.optionContent}>
                    {opt.icon && <span className={styles.optionIcon}>{opt.icon}</span>}
                    <div className={styles.optionTextGroup}>
                      <span className={styles.optionLabel}>{opt.label}</span>
                      {opt.description && (
                        <span className={styles.optionDescription}>{opt.description}</span>
                      )}
                    </div>
                  </div>
                  {isSelected && (
                    <span className={styles.checkIcon} aria-hidden="true">
                      <Icon name="check" />
                    </span>
                  )}
                </li>
              );
            })
          )}
        </ul>
      )}
    </div>
  );
});

Combobox.displayName = 'Combobox';
