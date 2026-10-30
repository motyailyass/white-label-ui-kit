import { cookies } from 'next/headers';
import { type Direction, getDirectionForLocale, type Locale } from '@/i18n';

export interface ServerI18nState {
  locale: Locale;
  direction: Direction;
}

/**
 * Server-only helper to read initial locale and direction from Next.js request cookies.
 * Prevents FOUC/flash of wrong direction/layout during SSR before hydration.
 */
export async function getServerI18nState(
  defaultLocale: Locale = 'en',
  defaultDirection?: Direction,
): Promise<ServerI18nState> {
  try {
    const cookieStore = await cookies();
    const cookieLocale =
      cookieStore.get('locale')?.value || cookieStore.get('NEXT_LOCALE')?.value || defaultLocale;
    const cookieDir = cookieStore.get('dir')?.value as Direction | undefined;
    const direction: Direction =
      cookieDir === 'rtl' || cookieDir === 'ltr'
        ? cookieDir
        : defaultDirection || getDirectionForLocale(cookieLocale);

    return {
      locale: cookieLocale,
      direction,
    };
  } catch {
    return {
      locale: defaultLocale,
      direction: defaultDirection || getDirectionForLocale(defaultLocale),
    };
  }
}
