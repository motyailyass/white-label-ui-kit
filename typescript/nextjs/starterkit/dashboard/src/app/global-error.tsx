'use client';

import { ErrorState } from '@/components/patterns';
import { I18nProvider } from '@/providers/i18n-provider';
import '../styles/globals.css';
import styles from './global-error.module.css';

export interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  return (
    <html lang="en" dir="ltr">
      <body className={styles.errorBody}>
        <I18nProvider initialLocale="en">
          <ErrorState error={error} onRetry={reset} />
        </I18nProvider>
      </body>
    </html>
  );
}
