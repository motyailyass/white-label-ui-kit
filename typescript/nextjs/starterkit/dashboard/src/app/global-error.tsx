'use client';

import localFont from 'next/font/local';
import { ErrorState } from '@/components/patterns';
import { type SupportedLocale, getDirectionForLocale, isSupportedLocale } from '@/i18n';
import { getCookie } from '@/lib/cookie';
import { I18nProvider, ThemeScript } from '@/providers';
import '../styles/globals.css';
import styles from './global-error.module.css';

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

export interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

function resolveInitialLocale(): SupportedLocale {
  const cookieLocale = getCookie('locale');
  return isSupportedLocale(cookieLocale) ? cookieLocale : 'en';
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  const initialLocale = resolveInitialLocale();
  const direction = getDirectionForLocale(initialLocale);

  return (
    <html
      lang={initialLocale}
      dir={direction}
      className={`${geistSans.variable} ${geistMono.variable} ${notoSansArabic.variable}`}
      suppressHydrationWarning
    >
      <head>
        <ThemeScript />
      </head>
      <body className={styles.errorBody}>
        <main className={styles.errorMain}>
          <I18nProvider initialLocale={initialLocale}>
            <ErrorState error={error} onRetry={reset} />
          </I18nProvider>
        </main>
      </body>
    </html>
  );
}
