import { NextResponse } from 'next/server';

export function proxy(request: Request) {
  if (process.env.NODE_ENV !== 'production' || process.env.ENABLE_TEST_FIXTURES === 'true') {
    return NextResponse.next();
  }

  // Rewrite to a path with no matching route. The 404 is resolved before the
  // root loading.tsx boundary can flush a 200 for the notFound() guards below.
  return NextResponse.rewrite(new URL('/__gated__', request.url));
}

export const config = {
  matcher: ['/gallery/:path*', '/sizing-fixture'],
};
