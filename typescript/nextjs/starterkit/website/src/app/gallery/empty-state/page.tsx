import type { Metadata } from 'next';
import { EmptyStateGallery } from '@/components/patterns/empty-state-gallery';
import { defaultMessages, translate } from '@/i18n';
import { getServerI18nState } from '../../i18n-server';

export async function generateMetadata(): Promise<Metadata> {
  const { locale } = await getServerI18nState('en');
  return {
    title: translate(defaultMessages, locale, 'common.studio.emptyStateTitle'),
    description: translate(defaultMessages, locale, 'common.studio.emptyStateSubtitle'),
  };
}

export default function EmptyStateGalleryPage() {
  return <EmptyStateGallery />;
}
