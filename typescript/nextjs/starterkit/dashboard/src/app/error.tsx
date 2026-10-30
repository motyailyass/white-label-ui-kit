'use client';

import { ErrorState } from '@/components/patterns';
import styles from './status-page.module.css';

export interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function RootError({ error, reset }: ErrorProps) {
  return (
    <main className={styles.statusContainer}>
      <ErrorState error={error} onRetry={reset} />
    </main>
  );
}
