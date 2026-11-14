'use client';

import React, {
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useId,
  useMemo,
  useState,
  type ButtonHTMLAttributes,
  type HTMLAttributes,
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode,
} from 'react';
import { cn } from '@/lib/cn';
import styles from './tabs.module.css';

export type TabsVariant = 'line' | 'segment' | 'enclosed';
export type TabsOrientation = 'horizontal' | 'vertical';
export type TabsActivationMode = 'automatic' | 'manual';
export type TabsSize = 'sm' | 'md' | 'lg';

/* =============================================================================
   Tabs Context
   ============================================================================= */

interface TabsContextValue {
  value: string;
  onValueChange: (value: string) => void;
  orientation: TabsOrientation;
  variant: TabsVariant;
  size: TabsSize;
  activationMode: TabsActivationMode;
  baseId: string;
}

const TabsContext = createContext<TabsContextValue | null>(null);

function useTabsContext(componentName: string): TabsContextValue {
  const context = useContext(TabsContext);
  if (!context) {
    throw new Error(`<${componentName}> must be used within a <Tabs> container.`);
  }
  return context;
}

/* =============================================================================
   Tabs Root Component
   ============================================================================= */

export interface TabsProps extends HTMLAttributes<HTMLDivElement> {
  /** Controlled active tab value */
  value?: string;

  /** Initial active tab value for uncontrolled usage */
  defaultValue?: string;

  /** Callback fired when the active tab value changes */
  onValueChange?: (value: string) => void;

  /** Visual style variant. Defaults to 'line' */
  variant?: TabsVariant;

  /** Layout orientation. Defaults to 'horizontal' */
  orientation?: TabsOrientation;

  /** Keyboard activation mode. Defaults to 'automatic' */
  activationMode?: TabsActivationMode;

  /** Sizing scale for tab triggers. Defaults to 'md' */
  size?: TabsSize;
}

export const Tabs = forwardRef<HTMLDivElement, TabsProps>(function Tabs(
  {
    value: controlledValue,
    defaultValue,
    onValueChange,
    variant = 'line',
    orientation = 'horizontal',
    activationMode = 'automatic',
    size = 'md',
    className,
    children,
    ...props
  },
  ref,
) {
  const generatedId = useId();
  const baseId = props.id || generatedId;

  const [uncontrolledValue, setUncontrolledValue] = useState<string>(defaultValue || '');

  const isControlled = controlledValue !== undefined;
  const activeValue = isControlled ? controlledValue : uncontrolledValue;

  const handleValueChange = useCallback(
    (newValue: string) => {
      if (!isControlled) {
        setUncontrolledValue(newValue);
      }
      onValueChange?.(newValue);
    },
    [isControlled, onValueChange],
  );

  const contextValue = useMemo<TabsContextValue>(
    () => ({
      value: activeValue,
      onValueChange: handleValueChange,
      orientation,
      variant,
      size,
      activationMode,
      baseId,
    }),
    [activeValue, handleValueChange, orientation, variant, size, activationMode, baseId],
  );

  return (
    <TabsContext.Provider value={contextValue}>
      <div
        ref={ref}
        data-orientation={orientation}
        data-variant={variant}
        data-size={size}
        className={cn(styles.root, orientation === 'vertical' && styles.rootVertical, className)}
        {...props}
      >
        {children}
      </div>
    </TabsContext.Provider>
  );
});

Tabs.displayName = 'Tabs';

/* =============================================================================
   TabsList Component
   ============================================================================= */

export interface TabsListProps extends HTMLAttributes<HTMLDivElement> {
  /** Accessible label describing the purpose of this tablist */
  'aria-label'?: string;

  /** ID of an external element that labels this tablist */
  'aria-labelledby'?: string;

  /** Whether the tabs expand to fill 100% of the container width equally */
  fullWidth?: boolean;
}

export const TabsList = forwardRef<HTMLDivElement, TabsListProps>(function TabsList(
  { fullWidth = false, className, children, onKeyDown, ...props },
  ref,
) {
  const { orientation, variant, activationMode, onValueChange } = useTabsContext('TabsList');

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(e);
    if (e.defaultPrevented) return;

    const listElement = e.currentTarget;
    const triggers = Array.from(
      listElement.querySelectorAll<HTMLButtonElement>(
        '[role="tab"]:not([disabled]):not([aria-disabled="true"])',
      ),
    );

    if (triggers.length === 0) return;

    const currentFocusedIndex = triggers.findIndex((trigger) => trigger === document.activeElement);

    if (currentFocusedIndex === -1) return;

    // Detect text direction for RTL-aware arrow key navigation (nearest [dir] wins)
    const dirElement = listElement.closest('[dir]');
    const isRtl = dirElement
      ? dirElement.getAttribute('dir') === 'rtl'
      : typeof window !== 'undefined'
        ? window.getComputedStyle(listElement).direction === 'rtl' ||
          document.documentElement.getAttribute('dir') === 'rtl'
        : false;

    let nextIndex = -1;

    if (orientation === 'horizontal') {
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        nextIndex = isRtl
          ? (currentFocusedIndex - 1 + triggers.length) % triggers.length
          : (currentFocusedIndex + 1) % triggers.length;
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        nextIndex = isRtl
          ? (currentFocusedIndex + 1) % triggers.length
          : (currentFocusedIndex - 1 + triggers.length) % triggers.length;
      }
    } else {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        nextIndex = (currentFocusedIndex + 1) % triggers.length;
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        nextIndex = (currentFocusedIndex - 1 + triggers.length) % triggers.length;
      }
    }

    if (e.key === 'Home') {
      e.preventDefault();
      nextIndex = 0;
    } else if (e.key === 'End') {
      e.preventDefault();
      nextIndex = triggers.length - 1;
    }

    if (nextIndex !== -1 && triggers[nextIndex]) {
      const nextTrigger = triggers[nextIndex];
      nextTrigger.focus();

      if (activationMode === 'automatic') {
        const nextValue = nextTrigger.getAttribute('data-value');
        if (nextValue) {
          onValueChange(nextValue);
        }
      }
    }
  };

  return (
    <div
      ref={ref}
      role="tablist"
      aria-orientation={orientation}
      tabIndex={-1}
      onKeyDown={handleKeyDown}
      className={cn(
        styles.list,
        styles[`list_${variant}`],
        orientation === 'vertical' && styles.listVertical,
        fullWidth && styles.listFullWidth,
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
});

TabsList.displayName = 'TabsList';

/* =============================================================================
   TabsTrigger (Tab) Component
   ============================================================================= */

export interface TabsTriggerProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Unique value identifying this tab (matches corresponding TabsContent value) */
  value: string;

  /** Whether this individual tab is disabled */
  disabled?: boolean;

  /** Optional leading icon node */
  startIcon?: ReactNode;

  /** Optional trailing icon node */
  endIcon?: ReactNode;
}

export const TabsTrigger = forwardRef<HTMLButtonElement, TabsTriggerProps>(function TabsTrigger(
  {
    value,
    disabled = false,
    startIcon,
    endIcon,
    className,
    children,
    onClick,
    onKeyDown,
    ...props
  },
  ref,
) {
  const {
    value: selectedValue,
    onValueChange,
    orientation,
    variant,
    size,
    activationMode,
    baseId,
  } = useTabsContext('TabsTrigger');

  const isSelected = selectedValue === value;
  const tabId = `tabs-${baseId}-tab-${value}`;
  const panelId = `tabs-${baseId}-panel-${value}`;

  const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
    onClick?.(e);
    if (disabled || e.defaultPrevented) return;
    onValueChange(value);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    onKeyDown?.(e);
    if (disabled || e.defaultPrevented) return;

    if (activationMode === 'manual' && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      onValueChange(value);
    }
  };

  return (
    <button
      ref={ref}
      type="button"
      role="tab"
      id={tabId}
      aria-controls={panelId}
      aria-selected={isSelected}
      aria-disabled={disabled ? 'true' : undefined}
      tabIndex={isSelected ? 0 : -1}
      disabled={disabled}
      data-value={value}
      data-state={isSelected ? 'active' : 'inactive'}
      data-orientation={orientation}
      data-variant={variant}
      data-size={size}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className={cn(
        styles.trigger,
        styles[`trigger_${variant}`],
        styles[`trigger_${size}`],
        isSelected && styles.triggerActive,
        disabled && styles.triggerDisabled,
        className,
      )}
      {...props}
    >
      {startIcon && (
        <span className={styles.icon} aria-hidden="true">
          {startIcon}
        </span>
      )}
      <span className={styles.label}>{children}</span>
      {endIcon && (
        <span className={styles.icon} aria-hidden="true">
          {endIcon}
        </span>
      )}
      {variant === 'line' && (
        <span
          className={cn(styles.indicator, isSelected && styles.indicatorActive)}
          aria-hidden="true"
        />
      )}
    </button>
  );
});

TabsTrigger.displayName = 'TabsTrigger';

/** Semantic alias for TabsTrigger */
export const Tab = TabsTrigger;

/* =============================================================================
   TabsContent (TabsPanel) Component
   ============================================================================= */

export interface TabsContentProps extends HTMLAttributes<HTMLDivElement> {
  /** Value matching the associated TabsTrigger value */
  value: string;

  /** Whether to keep the tab content mounted in the DOM when inactive (hidden via CSS) */
  forceMount?: boolean;
}

export const TabsContent = forwardRef<HTMLDivElement, TabsContentProps>(function TabsContent(
  { value, forceMount = false, className, children, ...props },
  ref,
) {
  const { value: selectedValue, baseId } = useTabsContext('TabsContent');

  const isSelected = selectedValue === value;
  const tabId = `tabs-${baseId}-tab-${value}`;
  const panelId = `tabs-${baseId}-panel-${value}`;

  if (!isSelected && !forceMount) {
    return null;
  }

  return (
    <div
      ref={ref}
      role="tabpanel"
      id={panelId}
      aria-labelledby={tabId}
      tabIndex={0}
      hidden={!isSelected}
      data-state={isSelected ? 'active' : 'inactive'}
      data-value={value}
      className={cn(styles.content, !isSelected && styles.contentHidden, className)}
      {...props}
    >
      {children}
    </div>
  );
});

TabsContent.displayName = 'TabsContent';

/** Semantic alias for TabsContent */
export const TabsPanel = TabsContent;
