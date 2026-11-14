import type { Metadata } from 'next';
import { NavigationMenuGallery } from '@/components/patterns/navigation-menu-gallery';
import { defaultMessages, translate } from '@/i18n';
import { getServerI18nState } from '../../i18n-server';

export async function generateMetadata(): Promise<Metadata> {
  const { locale } = await getServerI18nState('en');
  return {
    title: translate(defaultMessages, locale, 'common.studio.navigationMenuTitle'),
    description: translate(defaultMessages, locale, 'common.studio.navigationMenuSubtitle'),
  };
}

export default function NavigationMenuGalleryPage() {
  return <NavigationMenuGallery />;
}
