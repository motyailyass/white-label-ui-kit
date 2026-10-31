'use client';

import { useRouter } from 'next/navigation';
import type React from 'react';
import { useCallback } from 'react';
import type { SupportedLocale } from '@/i18n';
import { AppProviders } from '@/providers';

export interface AppProvidersBridgeProps {
  children: React.ReactNode;
  initialLocale: SupportedLocale;
}

export function AppProvidersBridge({ children, initialLocale }: AppProvidersBridgeProps) {
  const router = useRouter();

  const handleLocaleChange = useCallback(() => {
    router.refresh();
  }, [router]);

  return (
    <AppProviders initialLocale={initialLocale} onLocaleChange={handleLocaleChange}>
      {children}
    </AppProviders>
  );
}
