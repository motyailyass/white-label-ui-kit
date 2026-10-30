import { describe, expect, it } from 'vitest';
import { isNavigationActive } from './use-active-navigation';

describe('isNavigationActive matching rules', () => {
  const allHrefs = ['/classic', '/classic/analytics', '/dual-sidebar', '/three-column'];

  it('marks exact match as active', () => {
    expect(isNavigationActive('/classic', '/classic', allHrefs)).toBe(true);
    expect(isNavigationActive('/classic/analytics', '/classic/analytics', allHrefs)).toBe(true);
  });

  it('does NOT mark ancestor active when a more specific exact sibling link is current', () => {
    // When visiting /classic/analytics, /classic/analytics should be active, but /classic should NOT
    expect(isNavigationActive('/classic/analytics', '/classic', allHrefs)).toBe(false);
    expect(isNavigationActive('/classic/analytics', '/classic/analytics', allHrefs)).toBe(true);
  });

  it('marks ancestor active for unlisted child sub-routes via segment boundary', () => {
    // When visiting an unlisted nested sub-page like /classic/analytics/detail
    expect(isNavigationActive('/classic/analytics/detail', '/classic/analytics', allHrefs)).toBe(
      true,
    );
  });

  it('never matches unrelated prefix without path segment boundary', () => {
    expect(isNavigationActive('/classic-other', '/classic', allHrefs)).toBe(false);
    expect(isNavigationActive('/classical', '/classic', allHrefs)).toBe(false);
  });
});
