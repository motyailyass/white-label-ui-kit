import type React from 'react';
import localFont from 'next/font/local';
import '../styles/globals.css';
import { AppProviders } from '@/providers/app-providers';
import { ThemeScript } from '@/providers/theme-provider';
import { getServerI18nState } from './i18n-server';

const geistSans = localFont({
  src: '../styles/fonts/geist/Geist-Variable.woff2',
  variable: '--font-geist-sans',
  display: 'swap',
  weight: '100 900',
});

const geistMono = localFont({
  src: '../styles/fonts/geist/GeistMono-Variable.woff2',
  variable: '--font-geist-mono',
  display: 'swap',
  weight: '100 900',
});

const notoSansArabic = localFont({
  src: '../styles/fonts/noto-sans-arabic/NotoSansArabic-Variable.woff2',
  variable: '--font-noto-arabic',
  display: 'swap',
  weight: '100 900',
});

export const metadata = {
  title: 'Tokyo Wireframe - Website Starter Kit',
  description:
    'A non-branded UI kit and website starter kit built from scratch with native RTL & LTR.',
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // Read initial locale and direction from cookies on the server to prevent any first-paint layout shift/flash
  const { locale, direction } = await getServerI18nState('en');

  return (
    <html
      lang={locale}
      dir={direction}
      className={`${geistSans.variable} ${geistMono.variable} ${notoSansArabic.variable}`}
      suppressHydrationWarning
    >
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
