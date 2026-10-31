import type { Metadata } from 'next';
import localFont from 'next/font/local';
import type React from 'react';
import { defaultMessages, translate } from '@/i18n';
import { ThemeScript } from '@/providers';
import '../styles/globals.css';
import { AppProvidersBridge } from './app-providers-bridge';
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

export async function generateMetadata(): Promise<Metadata> {
  const { locale } = await getServerI18nState('en');
  return {
    title: translate(defaultMessages, locale, 'website.meta.title'),
    description: translate(defaultMessages, locale, 'website.meta.description'),
  };
}

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
        <AppProvidersBridge initialLocale={locale}>{children}</AppProvidersBridge>
      </body>
    </html>
  );
}
