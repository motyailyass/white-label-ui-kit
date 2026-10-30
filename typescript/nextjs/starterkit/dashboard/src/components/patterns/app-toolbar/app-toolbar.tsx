'use client';

import type React from 'react';
import { cn } from '@/lib/cn';
import { LanguageSwitcher } from '../language-switcher';
import { ThemeSwitcher } from '../theme-switcher';
import styles from './app-toolbar.module.css';

export interface AppToolbarProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
}

export function AppToolbar({ children, className, ...props }: AppToolbarProps) {
  return (
    <div className={cn(styles.toolbar, className)} {...props}>
      {children ?? (
        <>
          <LanguageSwitcher />
          <ThemeSwitcher />
        </>
      )}
    </div>
  );
}
