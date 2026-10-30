import { cookies } from 'next/headers';
import {
  Direction,
  SupportedLocale,
  getDirectionForLocale,
  isSupportedLocale,
} from '@/i18n';

export interface ServerI18nState {
  locale: SupportedLocale;
  direction: Direction;
}

/**
 * Server-only helper to read initial locale and direction from Next.js request cookies.
 * Prevents FOUC/flash of wrong direction/layout during SSR before hydration.
 * Direction is strictly derived from the validated SupportedLocale.
 */
export async function getServerI18nState(
  defaultLocale: SupportedLocale = 'en',
): Promise<ServerI18nState> {
  let locale: SupportedLocale = defaultLocale;
  try {
    const cookieStore = await cookies();
    const cookieLocale = cookieStore.get('locale')?.value;
    if (isSupportedLocale(cookieLocale)) {
      locale = cookieLocale;
    }
  } catch {
    // Non-request or build-time context
  }

  return {
    locale,
    direction: getDirectionForLocale(locale),
  };
}
