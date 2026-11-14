'use client';

import {
  type ComponentPropsWithoutRef,
  type ElementType,
  type ReactNode,
  createContext,
  forwardRef,
  useContext,
} from 'react';
import { cn } from '@/lib/cn';
import styles from './empty-state.module.css';

export type EmptyStateSize = 'sm' | 'md' | 'lg';
export type EmptyStateVariant = 'default' | 'dashed' | 'subtle' | 'borderless';
export type EmptyStateIconVariant = 'surface' | 'ghost';

const SIZE_CLASSES: Record<EmptyStateSize, string> = {
  sm: styles.sizeSm,
  md: styles.sizeMd,
  lg: styles.sizeLg,
};

const VARIANT_CLASSES: Record<EmptyStateVariant, string> = {
  default: styles.variantDefault,
  dashed: styles.variantDashed,
  subtle: styles.variantSubtle,
  borderless: styles.variantBorderless,
};

const ICON_SIZE_CLASSES: Record<EmptyStateSize, string> = {
  sm: styles.iconSizeSm,
  md: styles.iconSizeMd,
  lg: styles.iconSizeLg,
};

const TITLE_SIZE_CLASSES: Record<EmptyStateSize, string> = {
  sm: styles.titleSizeSm,
  md: styles.titleSizeMd,
  lg: styles.titleSizeLg,
};

const DESCRIPTION_SIZE_CLASSES: Record<EmptyStateSize, string> = {
  sm: styles.descriptionSizeSm,
  md: styles.descriptionSizeMd,
  lg: styles.descriptionSizeLg,
};

function hasRenderableSlot(slot: ReactNode): boolean {
  return slot !== undefined && slot !== null && slot !== false;
}

interface EmptyStateContextValue {
  size: EmptyStateSize;
}

const EmptyStateContext = createContext<EmptyStateContextValue>({
  size: 'md',
});

function useEmptyStateContext(): EmptyStateContextValue {
  return useContext(EmptyStateContext);
}

export interface EmptyStateProps extends Omit<ComponentPropsWithoutRef<'div'>, 'title'> {
  size?: EmptyStateSize;
  variant?: EmptyStateVariant;
  icon?: ReactNode;
  iconVariant?: EmptyStateIconVariant;
  title?: ReactNode;
  titleAs?: ElementType;
  description?: ReactNode;
  actions?: ReactNode;
  'data-testid'?: string;
}

export const EmptyState = forwardRef<HTMLDivElement, EmptyStateProps>(function EmptyState(
  {
    size = 'md',
    variant = 'default',
    icon,
    iconVariant = 'surface',
    title,
    titleAs,
    description,
    actions,
    children,
    className,
    role = 'status',
    'aria-live': ariaLive,
    'data-testid': testId,
    ...rest
  },
  ref,
) {
  const resolvedAriaLive = ariaLive ?? (role === 'status' ? 'polite' : undefined);

  return (
    <EmptyStateContext.Provider value={{ size }}>
      <div
        ref={ref}
        role={role}
        aria-live={resolvedAriaLive}
        data-variant={variant}
        data-size={size}
        className={cn(styles.root, VARIANT_CLASSES[variant], SIZE_CLASSES[size], className)}
        data-testid={testId}
        {...rest}
      >
        {hasRenderableSlot(icon) ? (
          <EmptyStateIcon variant={iconVariant}>{icon}</EmptyStateIcon>
        ) : null}
        {hasRenderableSlot(title) ? <EmptyStateTitle as={titleAs}>{title}</EmptyStateTitle> : null}
        {hasRenderableSlot(description) ? (
          <EmptyStateDescription>{description}</EmptyStateDescription>
        ) : null}
        {hasRenderableSlot(actions) ? <EmptyStateActions>{actions}</EmptyStateActions> : null}
        {children}
      </div>
    </EmptyStateContext.Provider>
  );
});

export interface EmptyStateIconProps extends ComponentPropsWithoutRef<'div'> {
  variant?: EmptyStateIconVariant;
  children: ReactNode;
  'data-testid'?: string;
}

export const EmptyStateIcon = forwardRef<HTMLDivElement, EmptyStateIconProps>(
  function EmptyStateIcon(
    { variant = 'surface', children, className, 'data-testid': testId, ...rest },
    ref,
  ) {
    const { size } = useEmptyStateContext();
    const variantClass = variant === 'ghost' ? styles.iconGhost : undefined;

    return (
      <div
        ref={ref}
        aria-hidden="true"
        className={cn(styles.iconWrapper, ICON_SIZE_CLASSES[size], variantClass, className)}
        data-testid={testId}
        {...rest}
      >
        {children}
      </div>
    );
  },
);

export interface EmptyStateTitleProps extends ComponentPropsWithoutRef<'h3'> {
  as?: ElementType;
  children: ReactNode;
  'data-testid'?: string;
}

export const EmptyStateTitle = forwardRef<HTMLHeadingElement, EmptyStateTitleProps>(
  function EmptyStateTitle(
    { as: Tag = 'h3', children, className, 'data-testid': testId, ...rest },
    ref,
  ) {
    const { size } = useEmptyStateContext();

    return (
      <Tag
        ref={ref}
        className={cn(styles.title, TITLE_SIZE_CLASSES[size], className)}
        data-testid={testId}
        {...rest}
      >
        {children}
      </Tag>
    );
  },
);

export interface EmptyStateDescriptionProps extends ComponentPropsWithoutRef<'p'> {
  children: ReactNode;
  'data-testid'?: string;
}

export const EmptyStateDescription = forwardRef<HTMLParagraphElement, EmptyStateDescriptionProps>(
  function EmptyStateDescription({ children, className, 'data-testid': testId, ...rest }, ref) {
    const { size } = useEmptyStateContext();

    return (
      <p
        ref={ref}
        className={cn(styles.description, DESCRIPTION_SIZE_CLASSES[size], className)}
        data-testid={testId}
        {...rest}
      >
        {children}
      </p>
    );
  },
);

export interface EmptyStateActionsProps extends ComponentPropsWithoutRef<'div'> {
  children: ReactNode;
  'data-testid'?: string;
}

export const EmptyStateActions = forwardRef<HTMLDivElement, EmptyStateActionsProps>(
  function EmptyStateActions({ children, className, 'data-testid': testId, ...rest }, ref) {
    return (
      <div ref={ref} className={cn(styles.actions, className)} data-testid={testId} {...rest}>
        {children}
      </div>
    );
  },
);
