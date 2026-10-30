'use client';

import React from 'react';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { useTheme } from '@/providers/theme-provider';

export interface ThemeSwitcherProps {
  showLabel?: boolean;
  className?: string;
}

/**
 * Connected Theme Switcher component.
 * Connects useTheme() provider state to the pure ThemeToggle UI button.
 */
export function ThemeSwitcher({ showLabel = true, className }: ThemeSwitcherProps) {
  const { theme, resolvedTheme, toggleTheme } = useTheme();

  return (
    <ThemeToggle
      theme={theme}
      resolvedTheme={resolvedTheme}
      onToggle={toggleTheme}
      showLabel={showLabel}
      className={className}
    />
  );
}
