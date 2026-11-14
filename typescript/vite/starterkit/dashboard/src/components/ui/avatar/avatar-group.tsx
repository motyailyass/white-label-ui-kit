'use client';

import React, {
  Children,
  cloneElement,
  forwardRef,
  isValidElement,
  type HTMLAttributes,
  type ReactElement,
  type ReactNode,
} from 'react';
import { cn } from '@/lib/cn';
import { type AvatarProps, type AvatarShape, type AvatarSize } from './avatar';
import styles from './avatar.module.css';

export interface AvatarGroupProps extends HTMLAttributes<HTMLDivElement> {
  /** Collection of Avatar elements */
  children: ReactNode;

  /** Maximum number of avatars visible before truncating into a '+N' counter */
  max?: number;

  /** Uniform size applied across all children avatars in the group */
  size?: AvatarSize;

  /** Uniform shape applied across all children avatars in the group */
  shape?: AvatarShape;

  /** Accessible label for the overflow '+N' badge (caller-localized) */
  overflowAriaLabel?: string;

  /** Additional CSS class names */
  className?: string;
}

const sizeClassMap: Record<AvatarSize, string> = {
  xs: styles.sizeXs,
  sm: styles.sizeSm,
  md: styles.sizeMd,
  lg: styles.sizeLg,
  xl: styles.sizeXl,
  '2xl': styles.size2xl,
};

const shapeClassMap: Record<AvatarShape, string> = {
  circle: styles.shapeCircle,
  rounded: styles.shapeRounded,
};

export const AvatarGroup = forwardRef<HTMLDivElement, AvatarGroupProps>(function AvatarGroup(
  { children, max, size = 'md', shape = 'circle', overflowAriaLabel, className, ...props },
  ref,
) {
  const validChildren = Children.toArray(children).filter(isValidElement);
  const totalCount = validChildren.length;
  const hasMax = typeof max === 'number' && max > 0 && totalCount > max;
  const visibleChildren = hasMax ? validChildren.slice(0, max) : validChildren;
  const overflowCount = hasMax ? totalCount - max : 0;

  return (
    <div
      ref={ref}
      role="group"
      data-size={size}
      data-shape={shape}
      className={cn(styles.group, sizeClassMap[size], className)}
      {...props}
    >
      {visibleChildren.map((child, index) => {
        const childElement = child as ReactElement<AvatarProps>;
        return (
          <div key={childElement.key ?? index} className={styles.groupItem}>
            {cloneElement(childElement, {
              size: childElement.props.size ?? size,
              shape: childElement.props.shape ?? shape,
              className: cn(styles.groupedAvatar, childElement.props.className),
            })}
          </div>
        );
      })}

      {overflowCount > 0 && (
        <div className={styles.groupItem}>
          <div
            className={cn(
              styles.avatar,
              styles.overflowCounter,
              sizeClassMap[size],
              shapeClassMap[shape],
            )}
            aria-label={overflowAriaLabel}
          >
            <div className={styles.surface}>
              <span className={styles.initials} dir="ltr">
                +{overflowCount}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

AvatarGroup.displayName = 'AvatarGroup';
