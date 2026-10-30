import { cookies } from 'next/headers';
import { getDirectionForLocale } from './formatters';
import { Direction, Locale } from './types';

export interface I18nServerState {
  locale: Locale;
  direction: Direction;
}

/**
 * Reads initial locale and direction from request cookies on the server.
 * Guarantees zero flash of wrong direction/layout (FOUC) on the first paint.
 */
export async function getI18nServerState(
  defaultLocale = 'en',
  defaultDirection?: Direction,
): Promise<I18nServerState> {
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
    // In non-request or build-time environments
    return {
      locale: defaultLocale,
      direction: defaultDirection || getDirectionForLocale(defaultLocale),
    };
  }
}
