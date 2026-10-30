import type React from 'react';
import '../styles/globals.css';
import { AppProviders } from '@/providers';
import { ThemeScript } from '@/providers/theme-provider';
import { getServerI18nState } from './i18n-server';

export const metadata = {
  title: 'Control Hub - Dashboard Starter Kit',
  description: 'A non-branded software and dashboard starter kit.',
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // Read initial locale and direction from cookies on the server to prevent RTL/LTR flash
  const { locale, direction } = await getServerI18nState('en', 'ltr');

  return (
    <html lang={locale} dir={direction} suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body>
        <AppProviders initialLocale={locale} initialDirection={direction}>
          {children}
        </AppProviders>
      </body>
    </html>
  );
}
