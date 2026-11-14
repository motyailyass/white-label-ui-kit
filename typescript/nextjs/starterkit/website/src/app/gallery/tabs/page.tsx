import type { Metadata } from 'next';
import { TabsGallery } from '@/components/patterns/tabs-gallery';
import { defaultMessages, translate } from '@/i18n';
import { getServerI18nState } from '../../i18n-server';

export async function generateMetadata(): Promise<Metadata> {
  const { locale } = await getServerI18nState('en');
  return {
    title: translate(defaultMessages, locale, 'common.studio.tabsTitle'),
    description: translate(defaultMessages, locale, 'common.studio.tabsSubtitle'),
  };
}

export default function TabsGalleryPage() {
  return <TabsGallery />;
}
