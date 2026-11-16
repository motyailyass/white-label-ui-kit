import { renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, expect, it } from 'vitest';
import { GalleryLinkProvider, useGalleryLinkComponent } from './gallery-link-context';
import type { StudioLinkComponent } from './gallery-studio';

const TestLink: StudioLinkComponent = ({ href, children }) => <a href={href}>{children}</a>;

function wrapper({ children }: { children: ReactNode }) {
  return <GalleryLinkProvider linkComponent={TestLink}>{children}</GalleryLinkProvider>;
}

describe('GalleryLinkProvider', () => {
  it('falls back to no host link without a provider', () => {
    const { result } = renderHook(() => useGalleryLinkComponent());
    expect(result.current).toBeNull();
  });

  it('exposes the injected host link component', () => {
    const { result } = renderHook(() => useGalleryLinkComponent(), { wrapper });
    expect(result.current).toBe(TestLink);
  });
});
