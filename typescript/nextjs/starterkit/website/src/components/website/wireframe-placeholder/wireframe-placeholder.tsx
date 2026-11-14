import type React from 'react';
import { type ComponentPropsWithoutRef, forwardRef } from 'react';
import { Icon, type IconName } from '@/components/icons';
import { cn } from '@/lib/cn';
import styles from './wireframe-placeholder.module.css';

export interface WireframePlaceholderProps extends ComponentPropsWithoutRef<'div'> {
  aspectRatio?: string;
  iconName?: IconName;
  iconSize?: number;
  label?: string;
  rounded?: 'md' | 'lg' | 'xl' | '2xl' | 'feature' | 'full';
}

export const WireframePlaceholder = forwardRef<HTMLDivElement, WireframePlaceholderProps>(
  function WireframePlaceholder(
    {
      aspectRatio = '4 / 3',
      iconName = 'image',
      iconSize = 56,
      label,
      rounded = 'feature',
      className,
      style,
      children,
      ...props
    },
    ref,
  ) {
    return (
      <div
        ref={ref}
        className={cn(styles.placeholder, className)}
        data-rounded={rounded}
        style={{
          aspectRatio,
          ...style,
        }}
        {...props}
      >
        {children ?? (
          <div className={styles.inner}>
            <div className={styles.iconContainer} aria-hidden="true">
              <Icon name={iconName} size={iconSize} className={styles.icon} />
            </div>
            {label && <span className={styles.label}>{label}</span>}
          </div>
        )}
      </div>
    );
  },
);

WireframePlaceholder.displayName = 'WireframePlaceholder';
