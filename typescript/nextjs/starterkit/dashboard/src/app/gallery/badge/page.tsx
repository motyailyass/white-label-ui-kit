import type { Metadata } from 'next';
import { BadgeGallery } from '@/components/patterns/badge-gallery';
import { defaultMessages, translate } from '@/i18n';
import { getServerI18nState } from '../../i18n-server';

export async function generateMetadata(): Promise<Metadata> {
  const { locale } = await getServerI18nState('en');
  return {
    title: translate(defaultMessages, locale, 'common.studio.badgeTitle'),
    description: translate(defaultMessages, locale, 'common.studio.badgeSubtitle'),
  };
}

export default function BadgeGalleryPage() {
  return <BadgeGallery />;
}
