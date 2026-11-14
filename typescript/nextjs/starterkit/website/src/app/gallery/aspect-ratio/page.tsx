import type { Metadata } from 'next';
import { AspectRatioGallery } from '@/components/patterns/aspect-ratio-gallery';
import { defaultMessages, translate } from '@/i18n';
import { getServerI18nState } from '../../i18n-server';

export async function generateMetadata(): Promise<Metadata> {
  const { locale } = await getServerI18nState('en');
  return {
    title: translate(defaultMessages, locale, 'common.studio.aspectRatioTitle'),
    description: translate(defaultMessages, locale, 'common.studio.aspectRatioSubtitle'),
  };
}

export default function AspectRatioGalleryPage() {
  return <AspectRatioGallery />;
}
