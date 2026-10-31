'use client';

import { type ControlSizingProps, ThemeToggle } from '@/components/ui';
import { useI18n, useTheme } from '@/providers';

export interface ThemeSwitcherProps extends ControlSizingProps {
  showLabel?: boolean;
  className?: string;
}

/**
 * Connected Theme Switcher component.
 * Connects useTheme() and useI18n() providers to the pure ThemeToggle UI button.
 */
export function ThemeSwitcher({
  showLabel = true,
  size,
  touchTarget,
  className,
}: ThemeSwitcherProps) {
  const { theme, resolvedTheme, toggleTheme } = useTheme();
  const { t } = useI18n();

  return (
    <ThemeToggle
      size={size}
      touchTarget={touchTarget}
      theme={theme}
      resolvedTheme={resolvedTheme}
      onToggle={toggleTheme}
      showLabel={showLabel}
      lightLabel={t('common.light')}
      darkLabel={t('common.dark')}
      ariaLabel={t('common.toggleTheme')}
      className={className}
    />
  );
}
