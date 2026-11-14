import { afterEach, describe, expect, it, vi } from 'vitest';
import { proxy } from './proxy';

const REWRITE_HEADER = 'x-middleware-rewrite';

describe('proxy fixture gate', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('passes requests through outside production', () => {
    const response = proxy(new Request('http://localhost/gallery'));
    expect(response.headers.get(REWRITE_HEADER)).toBeNull();
  });

  it('rewrites gallery and sizing fixture requests away from their routes in production', () => {
    vi.stubEnv('NODE_ENV', 'production');

    for (const path of ['/gallery', '/gallery/dialog', '/sizing-fixture']) {
      const response = proxy(new Request(`http://localhost${path}`));
      expect(response.headers.get(REWRITE_HEADER)).toBe('http://localhost/__gated__');
    }
  });

  it('passes requests through in production when fixtures are explicitly enabled', () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('ENABLE_TEST_FIXTURES', 'true');

    const response = proxy(new Request('http://localhost/gallery'));
    expect(response.headers.get(REWRITE_HEADER)).toBeNull();
  });
});
