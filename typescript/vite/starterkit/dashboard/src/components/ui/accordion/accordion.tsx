'use client';

import {
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useId,
  useMemo,
  useState,
  type ButtonHTMLAttributes,
  type ElementType,
  type HTMLAttributes,
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode,
} from 'react';
import { Icon } from '@/components/icons';
import { cn } from '@/lib/cn';
import type { ControlSize, ControlSizingProps } from '../control-sizing';
import styles from './accordion.module.css';

export type AccordionType = 'single' | 'multiple';
export type AccordionVariant = 'default' | 'enclosed' | 'flush';
export type AccordionSize = ControlSize;
export type AccordionChevronPosition = 'start' | 'end';
export type AccordionHeadingElement = 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'div';

/* =============================================================================
   Contexts
   ============================================================================= */

interface AccordionContextValue {
  isItemExpanded: (value: string) => boolean;
  toggleItem: (value: string) => void;
  variant: AccordionVariant;
  size?: AccordionSize;
  touchTarget?: ControlSizingProps['touchTarget'];
  chevronPosition: AccordionChevronPosition;
  baseId: string;
}

const AccordionContext = createContext<AccordionContextValue | null>(null);

function useAccordionContext(componentName: string): AccordionContextValue {
  const context = useContext(AccordionContext);
  if (!context) {
    throw new Error(`<${componentName}> must be used within an <Accordion> container.`);
  }
  return context;
}

interface AccordionItemContextValue {
  value: string;
  isExpanded: boolean;
  disabled: boolean;
  triggerId: string;
  contentId: string;
}

const AccordionItemContext = createContext<AccordionItemContextValue | null>(null);

function useAccordionItemContext(componentName: string): AccordionItemContextValue {
  const context = useContext(AccordionItemContext);
  if (!context) {
    throw new Error(`<${componentName}> must be used within an <AccordionItem>.`);
  }
  return context;
}

/* =============================================================================
   Accordion Root Component
   ============================================================================= */

export interface AccordionBaseProps extends HTMLAttributes<HTMLDivElement> {
  /** Visual style variant. Defaults to 'default' */
  variant?: AccordionVariant;

  /**
   * Explicit sizing scale for accordion triggers and content.
   * When omitted, consumes the local product default (--control-*-default).
   */
  size?: AccordionSize;

  /**
   * Touch interaction target policy ('auto' on coarse pointers or 'comfortable' always >= 48px).
   */
  touchTarget?: ControlSizingProps['touchTarget'];

  /** Position of the expansion chevron indicator. Defaults to 'end' */
  chevronPosition?: AccordionChevronPosition;
}

export interface AccordionSingleProps extends AccordionBaseProps {
  /** Single disclosure mode where at most one item can be open */
  type?: 'single';

  /** Controlled value for single mode */
  value?: string;

  /** Uncontrolled initial value for single mode */
  defaultValue?: string;

  /** Callback fired when the expanded item changes in single mode */
  onValueChange?: (value: string) => void;

  /** Whether an open item can be collapsed by clicking it again. Defaults to true */
  collapsible?: boolean;
}

export interface AccordionMultipleProps extends AccordionBaseProps {
  /** Multiple disclosure mode where multiple items can be open concurrently */
  type: 'multiple';

  /** Controlled values array for multiple mode */
  value?: string[];

  /** Uncontrolled initial values array for multiple mode */
  defaultValue?: string[];

  /** Callback fired when the expanded items change in multiple mode */
  onValueChange?: (value: string[]) => void;

  /** Collapsible is always true in multiple mode */
  collapsible?: never;
}

export type AccordionProps = AccordionSingleProps | AccordionMultipleProps;

export const Accordion = forwardRef<HTMLDivElement, AccordionProps>(function Accordion(props, ref) {
  const {
    type = 'single',
    variant = 'default',
    size,
    touchTarget = 'auto',
    chevronPosition = 'end',
    className,
    children,
    onKeyDown,
    value: _value,
    defaultValue: _defaultValue,
    onValueChange: _onValueChange,
    collapsible: _collapsible,
    ...rest
  } = props as AccordionBaseProps & {
    type?: 'single' | 'multiple';
    value?: unknown;
    defaultValue?: unknown;
    onValueChange?: unknown;
    collapsible?: unknown;
    id?: string;
  };

  const generatedId = useId();
  const baseId = rest.id ?? generatedId;

  // Single mode state
  const singleProps = props as AccordionSingleProps;
  const isSingleControlled = singleProps.value !== undefined;
  const singleOnValueChange = singleProps.onValueChange;
  const singleCollapsible = singleProps.collapsible !== false;
  const [uncontrolledSingleValue, setUncontrolledSingleValue] = useState<string>(
    singleProps.defaultValue ?? '',
  );
  const activeSingleValue = isSingleControlled
    ? (singleProps.value ?? '')
    : uncontrolledSingleValue;

  // Multiple mode state
  const multipleProps = props as AccordionMultipleProps;
  const isMultipleControlled = multipleProps.value !== undefined;
  const multipleOnValueChange = multipleProps.onValueChange;
  const [uncontrolledMultipleValues, setUncontrolledMultipleValues] = useState<string[]>(
    multipleProps.defaultValue ?? [],
  );
  const activeMultipleValues = useMemo<string[]>(
    () => (isMultipleControlled ? (multipleProps.value ?? []) : uncontrolledMultipleValues),
    [isMultipleControlled, multipleProps.value, uncontrolledMultipleValues],
  );

  const isItemExpanded = useCallback(
    (itemValue: string): boolean => {
      if (type === 'multiple') {
        return activeMultipleValues.includes(itemValue);
      }
      return activeSingleValue === itemValue;
    },
    [type, activeMultipleValues, activeSingleValue],
  );

  const toggleItem = useCallback(
    (itemValue: string) => {
      if (type === 'multiple') {
        const next = activeMultipleValues.includes(itemValue)
          ? activeMultipleValues.filter((v) => v !== itemValue)
          : [...activeMultipleValues, itemValue];

        if (!isMultipleControlled) {
          setUncontrolledMultipleValues(next);
        }
        multipleOnValueChange?.(next);
      } else {
        const isCurrentlyOpen = activeSingleValue === itemValue;
        let next = itemValue;
        if (isCurrentlyOpen) {
          next = singleCollapsible ? '' : itemValue;
        }

        if (!isSingleControlled) {
          setUncontrolledSingleValue(next);
        }
        singleOnValueChange?.(next);
      }
    },
    [
      type,
      activeMultipleValues,
      activeSingleValue,
      isMultipleControlled,
      isSingleControlled,
      singleCollapsible,
      multipleOnValueChange,
      singleOnValueChange,
    ],
  );

  // WAI-ARIA keyboard roving focus scoped strictly to direct owning triggers
  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(e);
    if (e.defaultPrevented) return;

    const accordionElement = e.currentTarget;
    const triggers = Array.from(
      accordionElement.querySelectorAll<HTMLButtonElement>(
        'button[data-accordion-trigger]:not([disabled]):not([aria-disabled="true"])',
      ),
    ).filter((trigger) => trigger.closest('[data-accordion-root]') === accordionElement);

    if (triggers.length === 0) return;

    const currentFocusedIndex = triggers.findIndex((trigger) => trigger === document.activeElement);

    if (currentFocusedIndex === -1) return;

    let nextIndex = -1;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      nextIndex = (currentFocusedIndex + 1) % triggers.length;
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      nextIndex = (currentFocusedIndex - 1 + triggers.length) % triggers.length;
    } else if (e.key === 'Home') {
      e.preventDefault();
      nextIndex = 0;
    } else if (e.key === 'End') {
      e.preventDefault();
      nextIndex = triggers.length - 1;
    }

    if (nextIndex !== -1 && triggers[nextIndex]) {
      triggers[nextIndex].focus();
    }
  };

  const contextValue = useMemo<AccordionContextValue>(
    () => ({
      isItemExpanded,
      toggleItem,
      variant,
      size,
      touchTarget,
      chevronPosition,
      baseId,
    }),
    [isItemExpanded, toggleItem, variant, size, touchTarget, chevronPosition, baseId],
  );

  return (
    <AccordionContext.Provider value={contextValue}>
      <div
        ref={ref}
        data-accordion-root="true"
        data-variant={variant}
        data-size={size}
        data-touch-target={touchTarget}
        onKeyDown={handleKeyDown}
        className={cn(styles.root, styles[`root_${variant}`], className)}
        {...rest}
      >
        {children}
      </div>
    </AccordionContext.Provider>
  );
});

Accordion.displayName = 'Accordion';

/* =============================================================================
   AccordionItem Component
   ============================================================================= */

export interface AccordionItemProps extends HTMLAttributes<HTMLDivElement> {
  /** Unique value identifying this disclosure item */
  value: string;

  /** Whether this individual item is disabled */
  disabled?: boolean;
}

export const AccordionItem = forwardRef<HTMLDivElement, AccordionItemProps>(function AccordionItem(
  { value, disabled = false, className, children, ...props },
  ref,
) {
  const { isItemExpanded, variant, size, baseId } = useAccordionContext('AccordionItem');
  const isExpanded = isItemExpanded(value);

  const triggerId = `accordion-${baseId}-trigger-${value}`;
  const contentId = `accordion-${baseId}-content-${value}`;

  const itemContextValue = useMemo<AccordionItemContextValue>(
    () => ({
      value,
      isExpanded,
      disabled,
      triggerId,
      contentId,
    }),
    [value, isExpanded, disabled, triggerId, contentId],
  );

  return (
    <AccordionItemContext.Provider value={itemContextValue}>
      <div
        ref={ref}
        data-state={isExpanded ? 'open' : 'closed'}
        data-disabled={disabled ? 'true' : undefined}
        data-variant={variant}
        data-size={size}
        className={cn(
          styles.item,
          styles[`item_${variant}`],
          isExpanded && styles.itemOpen,
          disabled && styles.itemDisabled,
          className,
        )}
        {...props}
      >
        {children}
      </div>
    </AccordionItemContext.Provider>
  );
});

AccordionItem.displayName = 'AccordionItem';

/* =============================================================================
   AccordionHeader Component
   ============================================================================= */

export interface AccordionHeaderProps extends HTMLAttributes<HTMLHeadingElement> {
  /** Semantic HTML heading tag. Defaults to 'h3' */
  as?: AccordionHeadingElement;
}

export const AccordionHeader = forwardRef<HTMLHeadingElement, AccordionHeaderProps>(
  function AccordionHeader({ as = 'h3', className, children, ...props }, ref) {
    const Component = as as ElementType;

    return (
      <Component ref={ref} className={cn(styles.header, className)} {...props}>
        {children}
      </Component>
    );
  },
);

AccordionHeader.displayName = 'AccordionHeader';

/* =============================================================================
   AccordionTrigger Component
   ============================================================================= */

export interface AccordionTriggerProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Optional leading decorative icon element */
  startIcon?: ReactNode;
}

export const AccordionTrigger = forwardRef<HTMLButtonElement, AccordionTriggerProps>(
  function AccordionTrigger(
    { startIcon, className, children, onClick, type = 'button', ...props },
    ref,
  ) {
    const { toggleItem, chevronPosition, size, touchTarget } =
      useAccordionContext('AccordionTrigger');
    const { value, isExpanded, disabled, triggerId, contentId } =
      useAccordionItemContext('AccordionTrigger');

    const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
      onClick?.(e);
      if (disabled || e.defaultPrevented) return;
      toggleItem(value);
    };

    return (
      <button
        ref={ref}
        type={type}
        id={triggerId}
        aria-controls={contentId}
        aria-expanded={isExpanded}
        aria-disabled={disabled ? 'true' : undefined}
        disabled={disabled}
        data-accordion-trigger="true"
        data-state={isExpanded ? 'open' : 'closed'}
        data-size={size}
        data-touch-target={touchTarget}
        onClick={handleClick}
        className={cn(
          styles.trigger,
          size && styles[`trigger_${size}`],
          isExpanded && styles.triggerOpen,
          disabled && styles.triggerDisabled,
          className,
        )}
        {...props}
      >
        {chevronPosition === 'start' && (
          <span
            className={cn(styles.chevron, styles.chevronStart, isExpanded && styles.chevronOpen)}
            aria-hidden="true"
          >
            <Icon name="chevron-down" />
          </span>
        )}

        {startIcon && (
          <span className={styles.icon} aria-hidden="true">
            {startIcon}
          </span>
        )}

        <span className={styles.label}>{children}</span>

        {chevronPosition === 'end' && (
          <span
            className={cn(styles.chevron, styles.chevronEnd, isExpanded && styles.chevronOpen)}
            aria-hidden="true"
          >
            <Icon name="chevron-down" />
          </span>
        )}
      </button>
    );
  },
);

AccordionTrigger.displayName = 'AccordionTrigger';

/* =============================================================================
   AccordionContent Component
   ============================================================================= */

export interface AccordionContentProps extends HTMLAttributes<HTMLDivElement> {
  /** Whether to keep the content element mounted in DOM when collapsed. Defaults to true for smooth CSS animations. */
  forceMount?: boolean;
}

export const AccordionContent = forwardRef<HTMLDivElement, AccordionContentProps>(
  function AccordionContent({ forceMount = true, className, children, ...props }, ref) {
    const { isExpanded, triggerId, contentId } = useAccordionItemContext('AccordionContent');
    const { size } = useAccordionContext('AccordionContent');

    if (!isExpanded && !forceMount) {
      return null;
    }

    return (
      <div
        ref={ref}
        role="region"
        id={contentId}
        aria-labelledby={triggerId}
        hidden={!isExpanded}
        data-state={isExpanded ? 'open' : 'closed'}
        data-size={size}
        className={cn(
          styles.content,
          size && styles[`content_${size}`],
          isExpanded ? styles.contentOpen : styles.contentClosed,
          className,
        )}
        {...props}
      >
        <div className={styles.contentWrapper}>
          <div className={styles.contentInner}>{children}</div>
        </div>
      </div>
    );
  },
);

AccordionContent.displayName = 'AccordionContent';
