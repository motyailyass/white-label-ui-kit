'use client';

import { useId } from 'react';
import type { ControlSizingProps } from '@/components/ui';
import { Select } from '@/components/ui/select';
import { getDirectionForLocale, type SupportedLocale } from '@/i18n';
import { cn } from '@/lib/cn';
import { useI18n } from '@/providers';
import styles from './language-switcher.module.css';

export interface LanguageSwitcherProps extends ControlSizingProps {
  id?: string;
  className?: string;
  showIcon?: boolean;
}

export const supportedLocales: readonly {
  code: SupportedLocale;
  label: string;
}[] = [
  { code: 'en', label: 'English' },
  { code: 'fr', label: 'Français' },
  { code: 'ar', label: 'العربية' },
] as const;

/**
 * Connected Language Switcher pattern.
 * Reuses the shared Select primitive while binding useI18n() locale state.
 * Changes to locale automatically derive layout direction (ar -> rtl, en/fr -> ltr).
 */
export function LanguageSwitcher({
  id,
  size,
  touchTarget = 'auto',
  className,
  showIcon = true,
}: LanguageSwitcherProps) {
  const generatedId = useId();
  const selectId = id ?? generatedId;
  const { locale, setLocale, t } = useI18n();

  return (
    <div className={cn(styles.container, className)}>
      <label htmlFor={selectId} className="sr-only">
        {t('common.language')}
      </label>
      <Select
        id={selectId}
        size={size}
        touchTarget={touchTarget}
        showIcon={showIcon}
        value={locale}
        onChange={(e) => setLocale(e.target.value as SupportedLocale)}
        aria-label={t('common.language')}
        className={styles.select}
        data-testid="language-switcher-select"
      >
        {supportedLocales.map((loc) => (
          <option
            key={loc.code}
            value={loc.code}
            lang={loc.code}
            dir={getDirectionForLocale(loc.code)}
          >
            {loc.label}
          </option>
        ))}
      </Select>
    </div>
  );
}
