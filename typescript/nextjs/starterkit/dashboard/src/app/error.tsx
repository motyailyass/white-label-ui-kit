'use client';

import { ErrorState } from '@/components/patterns';

export interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function RootError({ error, reset }: ErrorProps) {
  return (
    <main
      style={{
        display: 'flex',
        minHeight: '100vh',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'var(--color-bg-base)',
      }}
    >
      <ErrorState error={error} onRetry={reset} />
    </main>
  );
}
