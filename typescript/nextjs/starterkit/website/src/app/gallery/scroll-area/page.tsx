import type { Metadata } from 'next';
import { ScrollAreaGallery } from '@/components/patterns/scroll-area-gallery';
import { defaultMessages, translate } from '@/i18n';
import { getServerI18nState } from '../../i18n-server';

export async function generateMetadata(): Promise<Metadata> {
  const { locale } = await getServerI18nState('en');
  return {
    title: translate(defaultMessages, locale, 'common.studio.scrollAreaTitle'),
    description: translate(defaultMessages, locale, 'common.studio.scrollAreaSubtitle'),
  };
}

export default function ScrollAreaGalleryPage() {
  return <ScrollAreaGallery />;
}
