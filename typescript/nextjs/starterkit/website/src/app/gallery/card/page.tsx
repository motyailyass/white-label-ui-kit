import type { Metadata } from 'next';
import { CardGallery } from '@/components/patterns/card-gallery';
import { defaultMessages, translate } from '@/i18n';
import { getServerI18nState } from '../../i18n-server';

export async function generateMetadata(): Promise<Metadata> {
  const { locale } = await getServerI18nState('en');
  return {
    title: translate(defaultMessages, locale, 'common.studio.cardTitle'),
    description: translate(defaultMessages, locale, 'common.studio.cardSubtitle'),
  };
}

export default function CardGalleryPage() {
  return <CardGallery />;
}
