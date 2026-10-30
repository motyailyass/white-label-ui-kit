import type React from 'react';
import '../styles/globals.css';
import { AppProviders } from '@/providers';
import { ThemeScript } from '@/providers/theme-provider';
import { getServerI18nState } from './i18n-server';

import { siteConfig } from '@/fixtures/config/site';

export const metadata = {
  title: `${siteConfig.name} - Dashboard Starter Kit`,
  description: siteConfig.description,
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // Read initial locale and direction from cookies on the server to prevent RTL/LTR flash
  const { locale, direction } = await getServerI18nState('en');

  return (
    <html lang={locale} dir={direction} suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body>
        <AppProviders initialLocale={locale}>{children}</AppProviders>
      </body>
    </html>
  );
}
