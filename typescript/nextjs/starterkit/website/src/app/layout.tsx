import React from 'react';
import '../styles/globals.css';
import { I18nProvider, getI18nServerState } from '@/lib/i18n';
import { ThemeProvider, ThemeScript } from '@/lib/theme';

export const metadata = {
  title: 'Tokyo Wireframe - Website Starter Kit',
  description:
    'A non-branded UI kit and website starter kit built from scratch with native RTL & LTR.',
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // Read initial locale and direction from cookies on the server to prevent any first-paint layout shift/flash
  const { locale, direction } = await getI18nServerState('en', 'ltr');

  return (
    <html lang={locale} dir={direction} suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body>
        <ThemeProvider defaultTheme="system">
          <I18nProvider initialLocale={locale} initialDirection={direction}>
            {children}
          </I18nProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
