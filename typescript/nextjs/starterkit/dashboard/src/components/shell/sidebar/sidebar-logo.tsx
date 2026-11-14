'use client';

import type React from 'react';
import { cn } from '@/lib/cn';
import styles from './sidebar.module.css';

export interface SidebarLogoProps extends React.HTMLAttributes<HTMLElement> {
  icon?: React.ReactNode;
  title: string;
  subtitle?: string;
  href?: string;
  trailing?: React.ReactNode;
  /**
   * Host-agnostic Link slot (e.g. Next.js Link, TanStack Router Link, Vite <a>, or 'button').
   */
  as?: React.ElementType;
}

export function SidebarLogo({
  icon,
  title,
  subtitle,
  href = '/',
  trailing,
  as: Component = 'a',
  className,
  ...props
}: SidebarLogoProps) {
  const isButton = Component === 'button';
  return (
    <Component
      {...(isButton ? { type: 'button' as const } : { href: href ?? '/' })}
      className={cn(styles.logo, className)}
      {...props}
    >
      <span className={styles.logoIcon}>{icon || title.charAt(0).toUpperCase()}</span>
      <div className={styles.logoText}>
        <div className={styles.logoTitle}>{title}</div>
        {subtitle && <div className={styles.logoSubtitle}>{subtitle}</div>}
      </div>
      {trailing && <span className={styles.logoTrailing}>{trailing}</span>}
    </Component>
  );
}
