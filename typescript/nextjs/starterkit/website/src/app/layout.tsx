import type React from 'react';
import '../styles/globals.css';
import { AppProviders } from '@/providers/app-providers';
import { ThemeScript } from '@/providers/theme-provider';
import { getServerI18nState } from './i18n-server';

export const metadata = {
  title: 'Tokyo Wireframe - Website Starter Kit',
  description:
    'A non-branded UI kit and website starter kit built from scratch with native RTL & LTR.',
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // Read initial locale and direction from cookies on the server to prevent any first-paint layout shift/flash
  const { locale, direction } = await getServerI18nState('en');

  return (
    <html lang={locale} dir={direction} suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body>
        <AppProviders initialLocale={locale} defaultTheme="system">
          {children}
        </AppProviders>
      </body>
    </html>
  );
}
