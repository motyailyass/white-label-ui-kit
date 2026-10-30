'use client';

import React from 'react';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { useTheme } from '@/providers/theme-provider';
import { useI18n } from '@/providers/i18n-provider';

export interface ThemeSwitcherProps {
  showLabel?: boolean;
  className?: string;
}

/**
 * Connected Theme Switcher component.
 * Connects useTheme() and useI18n() providers to the pure ThemeToggle UI button.
 */
export function ThemeSwitcher({ showLabel = true, className }: ThemeSwitcherProps) {
  const { theme, resolvedTheme, toggleTheme } = useTheme();
  let lightLabel = 'Light';
  let darkLabel = 'Dark';
  let ariaLabel: string | undefined;

  try {
    const { t } = useI18n();
    lightLabel = t('common.light');
    darkLabel = t('common.dark');
    ariaLabel = t('common.toggleTheme');
  } catch {
    // If used outside i18n provider, defaults to English
  }

  return (
    <ThemeToggle
      theme={theme}
      resolvedTheme={resolvedTheme}
      onToggle={toggleTheme}
      showLabel={showLabel}
      lightLabel={lightLabel}
      darkLabel={darkLabel}
      ariaLabel={ariaLabel}
      className={className}
    />
  );
}
