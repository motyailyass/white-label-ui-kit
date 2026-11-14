import type { Metadata } from 'next';
import { PaginationGallery } from '@/components/patterns/pagination-gallery';
import { defaultMessages, translate } from '@/i18n';
import { getServerI18nState } from '../../i18n-server';

export async function generateMetadata(): Promise<Metadata> {
  const { locale } = await getServerI18nState('en');
  return {
    title: translate(defaultMessages, locale, 'common.studio.paginationTitle'),
    description: translate(defaultMessages, locale, 'common.studio.paginationSubtitle'),
  };
}

export default function PaginationGalleryPage() {
  return <PaginationGallery />;
}
