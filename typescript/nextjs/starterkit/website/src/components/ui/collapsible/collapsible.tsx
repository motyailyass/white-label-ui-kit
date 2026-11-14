'use client';

import {
  type ComponentPropsWithoutRef,
  type MouseEvent,
  type ReactNode,
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useId,
  useState,
} from 'react';
import { cn } from '@/lib/cn';
import styles from './collapsible.module.css';

interface CollapsibleContextValue {
  open: boolean;
  disabled: boolean;
  triggerId: string;
  contentId: string;
  toggle: () => void;
}

const CollapsibleContext = createContext<CollapsibleContextValue | null>(null);

function useCollapsibleContext() {
  const ctx = useContext(CollapsibleContext);
  if (!ctx) {
    throw new Error('Collapsible compound components must be rendered inside a Collapsible');
  }
  return ctx;
}

export interface CollapsibleProps extends ComponentPropsWithoutRef<'div'> {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  disabled?: boolean;
  children: ReactNode;
  className?: string;
  'data-testid'?: string;
}

export const Collapsible = forwardRef<HTMLDivElement, CollapsibleProps>(function Collapsible(
  {
    open: controlledOpen,
    defaultOpen = false,
    onOpenChange,
    disabled = false,
    children,
    className,
    'data-testid': testId,
    ...rest
  },
  ref,
) {
  const isControlled = controlledOpen !== undefined;
  const [uncontrolledOpen, setUncontrolledOpen] = useState<boolean>(defaultOpen);

  const isOpen = isControlled ? controlledOpen : uncontrolledOpen;
  const triggerId = useId();
  const contentId = useId();

  const toggle = useCallback(() => {
    if (disabled) return;
    const next = !isOpen;
    if (!isControlled) {
      setUncontrolledOpen(next);
    }
    onOpenChange?.(next);
  }, [disabled, isControlled, isOpen, onOpenChange]);

  return (
    <CollapsibleContext.Provider
      value={{
        open: isOpen,
        disabled,
        triggerId,
        contentId,
        toggle,
      }}
    >
      <div
        ref={ref}
        data-state={isOpen ? 'open' : 'closed'}
        data-disabled={disabled ? '' : undefined}
        className={cn(styles.root, className)}
        data-testid={testId}
        {...rest}
      >
        {children}
      </div>
    </CollapsibleContext.Provider>
  );
});

Collapsible.displayName = 'Collapsible';

export interface CollapsibleTriggerProps extends ComponentPropsWithoutRef<'button'> {
  children: ReactNode;
  className?: string;
  'data-testid'?: string;
}

export const CollapsibleTrigger = forwardRef<HTMLButtonElement, CollapsibleTriggerProps>(
  function CollapsibleTrigger(
    {
      id: explicitId,
      'aria-controls': explicitControls,
      children,
      className,
      onClick,
      disabled: itemDisabled,
      'data-testid': testId,
      ...rest
    },
    ref,
  ) {
    const {
      open,
      disabled: groupDisabled,
      triggerId: contextTriggerId,
      contentId,
      toggle,
    } = useCollapsibleContext();
    const isDisabled = groupDisabled || itemDisabled;
    const finalTriggerId = explicitId ?? contextTriggerId;
    const finalControls = explicitControls ?? contentId;

    const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
      if (isDisabled) return;
      toggle();
      onClick?.(e);
    };

    return (
      <button
        ref={ref}
        id={finalTriggerId}
        type="button"
        aria-expanded={open}
        aria-controls={finalControls}
        disabled={isDisabled}
        data-state={open ? 'open' : 'closed'}
        data-disabled={isDisabled ? '' : undefined}
        className={cn(styles.trigger, className)}
        onClick={handleClick}
        data-testid={testId}
        {...rest}
      >
        {children}
      </button>
    );
  },
);

CollapsibleTrigger.displayName = 'CollapsibleTrigger';

export interface CollapsibleContentProps extends ComponentPropsWithoutRef<'div'> {
  children: ReactNode;
  className?: string;
  'data-testid'?: string;
}

export const CollapsibleContent = forwardRef<HTMLDivElement, CollapsibleContentProps>(
  function CollapsibleContent(
    {
      id: explicitId,
      'aria-labelledby': explicitLabelledBy,
      children,
      className,
      'data-testid': testId,
      ...rest
    },
    ref,
  ) {
    const { open, contentId: contextContentId, triggerId } = useCollapsibleContext();
    const finalContentId = explicitId ?? contextContentId;
    const finalLabelledBy = explicitLabelledBy ?? triggerId;

    return (
      <div
        id={finalContentId}
        role="region"
        aria-labelledby={finalLabelledBy}
        hidden={!open}
        data-state={open ? 'open' : 'closed'}
        className={styles.contentWrapper}
      >
        <div
          ref={ref}
          className={cn(styles.contentInner, className)}
          data-testid={testId}
          {...rest}
        >
          {children}
        </div>
      </div>
    );
  },
);

CollapsibleContent.displayName = 'CollapsibleContent';
