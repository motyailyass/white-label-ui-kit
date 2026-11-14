import type { Metadata } from 'next';
import { StatCardGallery } from '@/components/patterns/stat-card-gallery';
import { defaultMessages, translate } from '@/i18n';
import { getServerI18nState } from '../../i18n-server';

export async function generateMetadata(): Promise<Metadata> {
  const { locale } = await getServerI18nState('en');
  return {
    title: translate(defaultMessages, locale, 'common.studio.statCardTitle'),
    description: translate(defaultMessages, locale, 'common.studio.statCardSubtitle'),
  };
}

export default function StatCardGalleryPage() {
  return <StatCardGallery />;
}
