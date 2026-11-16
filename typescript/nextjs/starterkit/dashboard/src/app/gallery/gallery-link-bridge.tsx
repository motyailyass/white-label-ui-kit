'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';
import { GalleryLinkProvider } from '@/components/patterns/gallery-studio';

// Client boundary: next/link is a client component, so it can only be passed
// to the provider from a client module, never from the server layout.
export function GalleryLinkBridge({ children }: { children: ReactNode }) {
  return <GalleryLinkProvider linkComponent={Link}>{children}</GalleryLinkProvider>;
}
