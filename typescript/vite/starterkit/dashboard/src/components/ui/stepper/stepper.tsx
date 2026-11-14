'use client';

import {
  type ComponentPropsWithoutRef,
  type ReactNode,
  createContext,
  forwardRef,
  useContext,
} from 'react';
import { Icon } from '@/components/icons';
import { cn } from '@/lib/cn';
import styles from './stepper.module.css';

export type StepStatus = 'complete' | 'current' | 'upcoming';
export type StepperOrientation = 'horizontal' | 'vertical';
export type StepperSize = 'sm' | 'md' | 'lg';

interface StepperContextValue {
  activeStep: number;
  orientation: StepperOrientation;
  size: StepperSize;
  clickable: boolean;
  onStepClick?: (stepIndex: number) => void;
}

const StepperContext = createContext<StepperContextValue | null>(null);

function useStepperContext() {
  const ctx = useContext(StepperContext);
  if (!ctx) {
    throw new Error('Stepper compound components must be rendered inside <Stepper>');
  }
  return ctx;
}

interface StepItemContextValue {
  stepIndex: number;
  status: StepStatus;
  disabled: boolean;
}

const StepItemContext = createContext<StepItemContextValue | null>(null);

function useStepItemContext() {
  const ctx = useContext(StepItemContext);
  if (!ctx) {
    throw new Error('Step subcomponents must be rendered inside <Step>');
  }
  return ctx;
}

export interface StepperProps extends ComponentPropsWithoutRef<'ol'> {
  activeStep?: number;
  orientation?: StepperOrientation;
  size?: StepperSize;
  clickable?: boolean;
  onStepClick?: (stepIndex: number) => void;
  children: ReactNode;
  className?: string;
  'data-testid'?: string;
}

export const Stepper = forwardRef<HTMLOListElement, StepperProps>(function Stepper(
  {
    activeStep = 0,
    orientation = 'horizontal',
    size = 'md',
    clickable = false,
    onStepClick,
    children,
    className,
    'data-testid': testId,
    ...rest
  },
  ref,
) {
  return (
    <StepperContext.Provider
      value={{
        activeStep,
        orientation,
        size,
        clickable,
        onStepClick,
      }}
    >
      <ol
        ref={ref}
        role="list"
        data-orientation={orientation}
        data-size={size}
        className={cn(
          styles.root,
          styles[`root_${orientation}`],
          styles[`root_${size}`],
          className,
        )}
        data-testid={testId}
        {...rest}
      >
        {children}
      </ol>
    </StepperContext.Provider>
  );
});

Stepper.displayName = 'Stepper';

export interface StepProps extends ComponentPropsWithoutRef<'li'> {
  stepIndex: number;
  status?: StepStatus;
  disabled?: boolean;
  children: ReactNode;
  className?: string;
  'data-testid'?: string;
}

export const Step = forwardRef<HTMLLIElement, StepProps>(function Step(
  {
    stepIndex,
    status: explicitStatus,
    disabled = false,
    children,
    className,
    'data-testid': testId,
    ...rest
  },
  ref,
) {
  const { activeStep, orientation, clickable, onStepClick } = useStepperContext();

  const status: StepStatus =
    explicitStatus ??
    (stepIndex < activeStep ? 'complete' : stepIndex === activeStep ? 'current' : 'upcoming');

  const isCurrent = status === 'current';
  const isInteractive = clickable;

  const handleClick = () => {
    if (clickable && !disabled && onStepClick) {
      onStepClick(stepIndex);
    }
  };

  return (
    <StepItemContext.Provider value={{ stepIndex, status, disabled }}>
      <li
        ref={ref}
        data-status={status}
        data-step={stepIndex}
        aria-current={isCurrent ? 'step' : undefined}
        className={cn(styles.step, styles[`step_${orientation}`], className)}
        data-testid={testId}
        {...rest}
      >
        {isInteractive ? (
          <button
            type="button"
            className={styles.stepButton}
            onClick={handleClick}
            disabled={disabled}
            aria-disabled={disabled ? 'true' : undefined}
          >
            {children}
          </button>
        ) : (
          <div className={styles.stepStatic}>{children}</div>
        )}
      </li>
    </StepItemContext.Provider>
  );
});

Step.displayName = 'Step';

export interface StepIndicatorProps extends ComponentPropsWithoutRef<'span'> {
  children?: ReactNode;
  className?: string;
}

export const StepIndicator = forwardRef<HTMLSpanElement, StepIndicatorProps>(function StepIndicator(
  { children, className, ...rest },
  ref,
) {
  const { size } = useStepperContext();
  const { stepIndex, status } = useStepItemContext();

  return (
    <span
      ref={ref}
      aria-hidden="true"
      className={cn(
        styles.indicator,
        styles[`indicator_${size}`],
        styles[`indicator_${status}`],
        className,
      )}
      {...rest}
    >
      {children ??
        (status === 'complete' ? (
          <Icon name="check" size={size === 'sm' ? 14 : size === 'lg' ? 20 : 16} />
        ) : (
          stepIndex + 1
        ))}
    </span>
  );
});

StepIndicator.displayName = 'StepIndicator';

export interface StepLabelGroupProps extends ComponentPropsWithoutRef<'div'> {
  children: ReactNode;
  className?: string;
}

export const StepLabelGroup = forwardRef<HTMLDivElement, StepLabelGroupProps>(
  function StepLabelGroup({ children, className, ...rest }, ref) {
    return (
      <div ref={ref} className={cn(styles.labelGroup, className)} {...rest}>
        {children}
      </div>
    );
  },
);

StepLabelGroup.displayName = 'StepLabelGroup';

export interface StepTitleProps extends ComponentPropsWithoutRef<'span'> {
  children: ReactNode;
  className?: string;
}

export const StepTitle = forwardRef<HTMLSpanElement, StepTitleProps>(function StepTitle(
  { children, className, ...rest },
  ref,
) {
  const { size } = useStepperContext();
  const { status } = useStepItemContext();

  return (
    <span
      ref={ref}
      className={cn(styles.title, styles[`title_${size}`], styles[`title_${status}`], className)}
      {...rest}
    >
      {children}
    </span>
  );
});

StepTitle.displayName = 'StepTitle';

export interface StepDescriptionProps extends ComponentPropsWithoutRef<'span'> {
  children: ReactNode;
  className?: string;
}

export const StepDescription = forwardRef<HTMLSpanElement, StepDescriptionProps>(
  function StepDescription({ children, className, ...rest }, ref) {
    return (
      <span ref={ref} className={cn(styles.description, className)} {...rest}>
        {children}
      </span>
    );
  },
);

StepDescription.displayName = 'StepDescription';

export interface StepSeparatorProps extends ComponentPropsWithoutRef<'div'> {
  complete?: boolean;
  className?: string;
}

export const StepSeparator = forwardRef<HTMLDivElement, StepSeparatorProps>(function StepSeparator(
  { complete: explicitComplete, className, ...rest },
  ref,
) {
  const { orientation } = useStepperContext();
  const { status } = useStepItemContext();
  const isComplete = explicitComplete ?? status === 'complete';

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className={cn(
        styles[`separator_${orientation}`],
        isComplete && styles[`separator_${orientation}_complete`],
        className,
      )}
      {...rest}
    />
  );
});

StepSeparator.displayName = 'StepSeparator';
