'use client';

import { createContext, type ReactNode, useContext } from 'react';
import type { StudioLinkComponent } from './gallery-studio';

// The host injects its router link (for example next/link) so the studio nav
// keeps client-side navigation and base-path handling without importing a
// framework inside components/patterns.
const GalleryLinkContext = createContext<StudioLinkComponent | null>(null);

export function GalleryLinkProvider({
  linkComponent,
  children,
}: {
  linkComponent: StudioLinkComponent;
  children: ReactNode;
}) {
  return (
    <GalleryLinkContext.Provider value={linkComponent}>{children}</GalleryLinkContext.Provider>
  );
}

export function useGalleryLinkComponent(): StudioLinkComponent | null {
  return useContext(GalleryLinkContext);
}
