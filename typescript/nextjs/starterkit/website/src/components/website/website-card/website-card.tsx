import { forwardRef, type ComponentPropsWithoutRef } from 'react';
import { cn } from '@/lib/cn';
import styles from './website-card.module.css';

export interface WebsiteCardProps extends ComponentPropsWithoutRef<'article'> {
  elevation?: 'none' | 'raised' | 'floating';
}

export const WebsiteCard = forwardRef<HTMLElement, WebsiteCardProps>(function WebsiteCard(
  { elevation = 'none', className, children, ...props },
  ref,
) {
  return (
    <article {...props} ref={ref} className={cn(styles.card, className)} data-elevation={elevation}>
      {children}
    </article>
  );
});

WebsiteCard.displayName = 'WebsiteCard';
