'use client';

import React from 'react';
import { cn } from '@/lib/cn';
import { useI18n } from '@/providers/i18n-provider';
import { Icon } from '@/components/icons';
import styles from './language-switcher.module.css';

export interface LanguageSwitcherProps {
  className?: string;
  showIcon?: boolean;
}

export const supportedLocales = [
  { code: 'en', label: 'English (LTR)', short: 'EN' },
  { code: 'fr', label: 'Français (LTR)', short: 'FR' },
  { code: 'ar', label: 'العربية (RTL)', short: 'AR' },
] as const;

/**
 * Connected Language Switcher pattern.
 * Calls useI18n() and allows switching between locales.
 * Changes to locale automatically derive layout direction (ar -> rtl, en/fr -> ltr).
 */
export function LanguageSwitcher({ className, showIcon = true }: LanguageSwitcherProps) {
  const { locale, setLocale, t } = useI18n();

  return (
    <div className={cn(styles.container, className)}>
      <label
        htmlFor="language-switcher-select"
        className="sr-only"
        style={{
          position: 'absolute',
          width: 1,
          height: 1,
          padding: 0,
          margin: -1,
          overflow: 'hidden',
          clip: 'rect(0, 0, 0, 0)',
          border: 0,
        }}
      >
        {t('common.language', 'Language')}
      </label>
      <select
        id="language-switcher-select"
        value={locale}
        onChange={(e) => setLocale(e.target.value)}
        className={styles.select}
        aria-label={t('common.language', 'Language')}
      >
        {supportedLocales.map((loc) => (
          <option key={loc.code} value={loc.code}>
            {loc.label}
          </option>
        ))}
      </select>
      {showIcon && (
        <span className={styles.icon} aria-hidden="true">
          <Icon name="chevron-down" size={12} />
        </span>
      )}
    </div>
  );
}
