'use client';

import React, {
  forwardRef,
  useEffect,
  useRef,
  useState,
  type HTMLAttributes,
  type ReactNode,
} from 'react';
import { Icon } from '@/components/icons';
import { cn } from '@/lib/cn';
import styles from './avatar.module.css';

export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
export type AvatarShape = 'circle' | 'rounded';
export type AvatarStatus = 'online' | 'offline' | 'away' | 'busy';

export interface AvatarProps extends HTMLAttributes<HTMLDivElement> {
  /** Remote image URL */
  src?: string;

  /** Alternative text for the image */
  alt?: string;

  /** Full name used for initials extraction and accessibility fallback */
  name?: string;

  /** Explicit 1-2 character initials override */
  initials?: string;

  /** Sizing scale step. Defaults to 'md' (40px) */
  size?: AvatarSize;

  /** Geometry: 'circle' (50%) or 'rounded' (--radius-control). Defaults to 'circle' */
  shape?: AvatarShape;

  /** Optional presence status indicator */
  status?: AvatarStatus;

  /** Accessible label for the presence status indicator */
  statusAriaLabel?: string;

  /** Optional host image slot for Next.js <Image> or Vite custom loaders */
  imageComponent?: React.ElementType;

  /** Custom fallback icon node override */
  fallbackIcon?: ReactNode;

  /** Additional CSS class names */
  className?: string;
}

export function extractInitials(name?: string, initials?: string): string {
  if (initials && initials.trim().length > 0) {
    return initials.trim().slice(0, 2).toUpperCase();
  }

  if (!name || name.trim().length === 0) {
    return '';
  }

  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) {
    return '';
  }

  if (parts.length === 1) {
    const single = Array.from(parts[0]);
    return single.slice(0, 2).join('').toUpperCase();
  }

  const first = Array.from(parts[0])[0] || '';
  const last = Array.from(parts[parts.length - 1])[0] || '';
  return `${first}${last}`.toUpperCase();
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

const statusClassMap: Record<AvatarStatus, string> = {
  online: styles.statusOnline,
  offline: styles.statusOffline,
  away: styles.statusAway,
  busy: styles.statusBusy,
};

export const Avatar = forwardRef<HTMLDivElement, AvatarProps>(function Avatar(
  {
    src,
    alt,
    name,
    initials: initialsProp,
    size = 'md',
    shape = 'circle',
    status,
    statusAriaLabel,
    imageComponent: ImageComponent,
    fallbackIcon,
    className,
    ...props
  },
  ref,
) {
  const [imageStatus, setImageStatus] = useState<'idle' | 'loading' | 'loaded' | 'error'>(
    src ? 'loading' : 'idle',
  );
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    setImageStatus(src ? 'loading' : 'idle');
  }, [src]);

  // Synchronously catch cached images where native onLoad doesn't fire
  useEffect(() => {
    if (src && imgRef.current) {
      if (imgRef.current.complete) {
        if (imgRef.current.naturalWidth > 0) {
          setImageStatus('loaded');
        } else {
          setImageStatus('error');
        }
      }
    }
  }, [src]);

  const computedInitials = extractInitials(name, initialsProp);
  const hasImage = Boolean(src) && imageStatus !== 'error';
  const effectiveAlt = alt !== undefined ? alt : name || '';

  return (
    <div
      ref={ref}
      data-size={size}
      data-shape={shape}
      className={cn(styles.avatar, sizeClassMap[size], shapeClassMap[shape], className)}
      {...props}
    >
      <div className={styles.surface}>
        {hasImage &&
          src &&
          (ImageComponent ? (
            <ImageComponent
              ref={imgRef}
              src={src}
              alt={effectiveAlt}
              className={styles.image}
              onLoad={() => setImageStatus('loaded')}
              onError={() => setImageStatus('error')}
            />
          ) : (
            // Any custom host or native <img> element
            <img
              ref={imgRef}
              src={src}
              alt={effectiveAlt}
              className={styles.image}
              onLoad={() => setImageStatus('loaded')}
              onError={() => setImageStatus('error')}
            />
          ))}

        {(!src || imageStatus === 'error') &&
          (computedInitials ? (
            <span className={styles.initials} aria-hidden={alt === '' ? true : undefined}>
              {computedInitials}
            </span>
          ) : (
            <span className={styles.fallbackIcon} aria-hidden="true">
              {fallbackIcon || <Icon name="anonymous" />}
            </span>
          ))}
      </div>

      {status && (
        <span
          className={cn(styles.status, statusClassMap[status])}
          role={statusAriaLabel ? 'status' : undefined}
          aria-label={statusAriaLabel}
          aria-hidden={statusAriaLabel ? undefined : 'true'}
        />
      )}
    </div>
  );
});

Avatar.displayName = 'Avatar';
