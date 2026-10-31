'use client';

import { ErrorState } from '@/components/patterns';

export interface DashboardErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function DashboardError({ error, reset }: DashboardErrorProps) {
  return <ErrorState error={error} onRetry={reset} headingAs="h2" />;
}
