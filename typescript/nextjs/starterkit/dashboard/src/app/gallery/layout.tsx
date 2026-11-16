import { notFound } from 'next/navigation';
import type { ReactNode } from 'react';
import { GalleryLinkBridge } from './gallery-link-bridge';

export default function GalleryLayout({ children }: { children: ReactNode }) {
  // Component studio belongs to development and test infrastructure.
  // Production builds never expose it unless explicitly enabled.
  if (process.env.NODE_ENV === 'production' && process.env.ENABLE_TEST_FIXTURES !== 'true') {
    notFound();
  }

  return <GalleryLinkBridge>{children}</GalleryLinkBridge>;
}
