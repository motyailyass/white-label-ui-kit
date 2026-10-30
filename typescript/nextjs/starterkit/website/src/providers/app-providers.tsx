'use client';

import React from 'react';
import { ThemeProvider, Theme } from './theme-provider';
import { I18nProvider } from './i18n-provider';
import { SupportedLocale } from '@/i18n';

export interface AppProvidersProps {
  children: React.ReactNode;
  initialLocale?: SupportedLocale;
  defaultTheme?: Theme;
}

export function AppProviders({
  children,
  initialLocale = 'en',
  defaultTheme = 'system',
}: AppProvidersProps) {
  return (
    <ThemeProvider defaultTheme={defaultTheme}>
      <I18nProvider initialLocale={initialLocale}>{children}</I18nProvider>
    </ThemeProvider>
  );
}
