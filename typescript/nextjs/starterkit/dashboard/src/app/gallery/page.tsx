import type { Metadata } from 'next';
import { GalleryHub } from '@/components/patterns/gallery-studio';
import { defaultMessages, translate } from '@/i18n';
import { getServerI18nState } from '../i18n-server';

export async function generateMetadata(): Promise<Metadata> {
  const { locale } = await getServerI18nState('en');
  return {
    title: translate(defaultMessages, locale, 'common.studio.hubMetaTitle'),
    description: translate(defaultMessages, locale, 'common.studio.hubMetaDescription'),
  };
}

export default function GalleryHubPage() {
  return <GalleryHub />;
}
