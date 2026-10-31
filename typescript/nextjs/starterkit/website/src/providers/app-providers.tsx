'use client';

import type React from 'react';
import type { SupportedLocale } from '@/i18n';
import { I18nProvider } from './i18n-provider';
import { type Theme, ThemeProvider } from './theme-provider';

export interface AppProvidersProps {
  children: React.ReactNode;
  initialLocale?: SupportedLocale;
  defaultTheme?: Theme;
  onLocaleChange?: (locale: SupportedLocale) => void;
}

export function AppProviders({
  children,
  initialLocale = 'en',
  defaultTheme = 'system',
  onLocaleChange,
}: AppProvidersProps) {
  return (
    <ThemeProvider defaultTheme={defaultTheme}>
      <I18nProvider initialLocale={initialLocale} onLocaleChange={onLocaleChange}>
        {children}
      </I18nProvider>
    </ThemeProvider>
  );
}
