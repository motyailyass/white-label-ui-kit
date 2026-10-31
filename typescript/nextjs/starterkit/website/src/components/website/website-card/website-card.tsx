import { type ComponentPropsWithoutRef, forwardRef } from 'react';
import { cn } from '@/lib/cn';
import styles from './website-card.module.css';

export interface WebsiteCardProps extends ComponentPropsWithoutRef<'article'> {
  as?: 'article' | 'div' | 'section';
  elevation?: 'none' | 'raised' | 'floating';
}

export const WebsiteCard = forwardRef<HTMLElement, WebsiteCardProps>(function WebsiteCard(
  { as = 'article', elevation = 'none', className, children, ...props },
  ref,
) {
  const Component = as;
  return (
    <Component
      {...props}
      // Safe polymorphic ref forwarding across HTML container tags (article | div | section)
      ref={ref as never}
      className={cn(styles.card, className)}
      data-elevation={elevation}
    >
      {children}
    </Component>
  );
});

WebsiteCard.displayName = 'WebsiteCard';
