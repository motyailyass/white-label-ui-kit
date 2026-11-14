'use client';

import React, {
  forwardRef,
  type ElementType,
  type HTMLAttributes,
  type KeyboardEvent,
} from 'react';
import { cn } from '@/lib/cn';
import styles from './card.module.css';

export type CardVariant = 'default' | 'subtle' | 'raised' | 'interactive';
export type CardPadding = 'none' | 'sm' | 'md' | 'lg';
export type CardElement = 'div' | 'article' | 'section' | 'aside';
export type CardHeadingElement = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'span';
export type CardFooterAlign = 'end' | 'between' | 'start' | 'stretch';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /** Visual surface variant. Defaults to 'default' */
  variant?: CardVariant;

  /** Internal padding density scale. Defaults to 'md' */
  padding?: CardPadding;

  /** Whether the card is interactive (clickable with hover, active, and focus rings) */
  interactive?: boolean;

  /** HTML element tag rendered for the card root. Defaults to 'div' */
  as?: CardElement;
}

export interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
  /** Whether to render a subtle bottom dividing line */
  divider?: boolean;
}

export interface CardTitleProps extends HTMLAttributes<HTMLHeadingElement> {
  /** Heading semantic tag. Defaults to 'h3' */
  as?: CardHeadingElement;
}

export type CardDescriptionProps = HTMLAttributes<HTMLParagraphElement>;

export type CardContentProps = HTMLAttributes<HTMLDivElement>;

export interface CardFooterProps extends HTMLAttributes<HTMLDivElement> {
  /** Whether to render a subtle top dividing line */
  divider?: boolean;

  /**
   * Alignment of footer actions. Follows international UX guidelines:
   * - 'end': Primary actions aligned to reading edge (Default standard).
   * - 'between': Split layout with auxiliary metadata on start and actions on end.
   * - 'start': Start-aligned links or editorial actions.
   * - 'stretch': Full-width block buttons spanning 100% of footer width.
   */
  align?: CardFooterAlign;
}

const variantClassMap: Record<CardVariant, string> = {
  default: styles.variantDefault,
  subtle: styles.variantSubtle,
  raised: styles.variantRaised,
  interactive: styles.variantInteractive,
};

const paddingClassMap: Record<CardPadding, string> = {
  none: styles.paddingNone,
  sm: styles.paddingSm,
  md: styles.paddingMd,
  lg: styles.paddingLg,
};

const footerAlignClassMap: Record<CardFooterAlign, string> = {
  end: styles.footerAlignEnd,
  between: styles.footerAlignBetween,
  start: styles.footerAlignStart,
  stretch: styles.footerAlignStretch,
};

/* =============================================================================
   Card Root Container
   ============================================================================= */

export const Card = forwardRef<HTMLDivElement, CardProps>(function Card(
  {
    variant = 'default',
    padding = 'md',
    interactive = false,
    as = 'div',
    className,
    onClick,
    onKeyDown,
    tabIndex,
    role,
    children,
    ...props
  },
  ref,
) {
  const Component = as as ElementType;
  const isInteractive = interactive || variant === 'interactive';

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    const isNestedInteractive =
      target !== e.currentTarget &&
      Boolean(
        target.closest('button, a[href], input, select, textarea, [role="button"], [role="link"]'),
      );

    if (isInteractive && !isNestedInteractive && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      onClick?.(e as unknown as React.MouseEvent<HTMLDivElement>);
    }
    onKeyDown?.(e);
  };

  return (
    <Component
      ref={ref}
      data-variant={variant}
      data-padding={padding}
      data-interactive={isInteractive ? 'true' : undefined}
      tabIndex={isInteractive ? (tabIndex ?? 0) : tabIndex}
      role={isInteractive ? (role ?? 'button') : role}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      className={cn(
        styles.card,
        variantClassMap[variant],
        paddingClassMap[padding],
        isInteractive && styles.interactive,
        className,
      )}
      {...props}
    >
      {children}
    </Component>
  );
});

Card.displayName = 'Card';

/* =============================================================================
   CardHeader Compartment
   ============================================================================= */

export const CardHeader = forwardRef<HTMLDivElement, CardHeaderProps>(function CardHeader(
  { divider = false, className, children, ...props },
  ref,
) {
  return (
    <div
      ref={ref}
      data-divider={divider ? 'true' : undefined}
      className={cn(styles.header, divider && styles.headerDivider, className)}
      {...props}
    >
      {children}
    </div>
  );
});

CardHeader.displayName = 'CardHeader';

/* =============================================================================
   CardTitle Component
   ============================================================================= */

export const CardTitle = forwardRef<HTMLHeadingElement, CardTitleProps>(function CardTitle(
  { as = 'h3', className, children, ...props },
  ref,
) {
  const Component = as as ElementType;
  return (
    <Component ref={ref} className={cn(styles.title, className)} {...props}>
      {children}
    </Component>
  );
});

CardTitle.displayName = 'CardTitle';

/* =============================================================================
   CardDescription Component
   ============================================================================= */

export const CardDescription = forwardRef<HTMLParagraphElement, CardDescriptionProps>(
  function CardDescription({ className, children, ...props }, ref) {
    return (
      <p ref={ref} className={cn(styles.description, className)} {...props}>
        {children}
      </p>
    );
  },
);

CardDescription.displayName = 'CardDescription';

/* =============================================================================
   CardContent Compartment
   ============================================================================= */

export const CardContent = forwardRef<HTMLDivElement, CardContentProps>(function CardContent(
  { className, children, ...props },
  ref,
) {
  return (
    <div ref={ref} className={cn(styles.content, className)} {...props}>
      {children}
    </div>
  );
});

CardContent.displayName = 'CardContent';

/* =============================================================================
   CardFooter Compartment
   ============================================================================= */

export const CardFooter = forwardRef<HTMLDivElement, CardFooterProps>(function CardFooter(
  { divider = false, align = 'end', className, children, ...props },
  ref,
) {
  return (
    <div
      ref={ref}
      data-divider={divider ? 'true' : undefined}
      data-align={align}
      className={cn(
        styles.footer,
        footerAlignClassMap[align],
        divider && styles.footerDivider,
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
});

CardFooter.displayName = 'CardFooter';
