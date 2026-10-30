/**
 * Safe cookie manipulation utilities for client-side persistence with SSR compatibility.
 */

export function setCookie(name: string, value: string, maxAge = 31536000): void {
  if (typeof document === 'undefined') return;
  try {
    // oxlint-disable-next-line eslint-plugin-unicorn/no-document-cookie
    // eslint-disable-next-line eslint-plugin-unicorn/no-document-cookie
    document.cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)}; path=/; max-age=${maxAge}; SameSite=Lax`;
  } catch {
    // Cookie store unavailable
  }
}

export function getCookie(name: string): string | undefined {
  if (typeof document === 'undefined') return undefined;
  try {
    const cookies = document.cookie.split(';');
    for (const cookie of cookies) {
      const [key, val] = cookie.trim().split('=');
      if (key === encodeURIComponent(name)) {
        return decodeURIComponent(val || '');
      }
    }
  } catch {
    // Cookie store unavailable
  }
  return undefined;
}
