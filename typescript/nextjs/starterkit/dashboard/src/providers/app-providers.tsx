'use client';

import type React from 'react';
import type { Direction, Locale } from '@/i18n';
import { I18nProvider } from './i18n-provider';
import { type Theme, ThemeProvider } from './theme-provider';

export interface AppProvidersProps {
  children: React.ReactNode;
  initialLocale?: Locale;
  initialDirection?: Direction;
  defaultTheme?: Theme;
}

export function AppProviders({
  children,
  initialLocale = 'en',
  initialDirection = 'ltr',
  defaultTheme = 'system',
}: AppProvidersProps) {
  return (
    <ThemeProvider defaultTheme={defaultTheme}>
      <I18nProvider initialLocale={initialLocale} initialDirection={initialDirection}>
        {children}
      </I18nProvider>
    </ThemeProvider>
  );
}
