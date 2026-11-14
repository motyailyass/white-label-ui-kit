'use client';

import type React from 'react';
import {
  Avatar,
  type AvatarShape,
  type AvatarSize,
  type AvatarStatus,
} from '@/components/ui/avatar';
import { cn } from '@/lib/cn';
import styles from './sidebar.module.css';

export interface SidebarAvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  name: string;
  email?: string;
  role?: string;
  avatarUrl?: string;
  initials?: string;
  size?: AvatarSize;
  shape?: AvatarShape;
  status?: AvatarStatus;
  statusAriaLabel?: string;
  trailing?: React.ReactNode;
  /**
   * Host-agnostic Image component slot (e.g. Next.js Image, custom optimized image component).
   */
  imageComponent?: React.ElementType;
}

export function SidebarAvatar({
  name,
  email,
  role,
  avatarUrl,
  initials,
  size = 'md',
  shape = 'circle',
  status,
  statusAriaLabel,
  trailing,
  imageComponent: ImageComponent,
  className,
  ...props
}: SidebarAvatarProps) {
  const subtitle = email ?? role;

  return (
    <div className={cn(styles.avatar, className)} {...props}>
      <Avatar
        size={size}
        shape={shape}
        src={avatarUrl}
        name={name}
        initials={initials}
        status={status}
        statusAriaLabel={statusAriaLabel}
        imageComponent={ImageComponent}
      />
      <div className={styles.avatarInfo}>
        <div className={styles.avatarName}>{name}</div>
        {subtitle && <div className={styles.avatarSub}>{subtitle}</div>}
      </div>
      {trailing && <div className={styles.avatarTrailing}>{trailing}</div>}
    </div>
  );
}
