import type { Metadata } from 'next';
import { DataTableGallery } from '@/components/patterns/data-table-gallery';
import { defaultMessages, translate } from '@/i18n';
import { getServerI18nState } from '../../i18n-server';

export async function generateMetadata(): Promise<Metadata> {
  const { locale } = await getServerI18nState('en');
  return {
    title: translate(defaultMessages, locale, 'common.studio.dataTableTitle'),
    description: translate(defaultMessages, locale, 'common.studio.dataTableSubtitle'),
  };
}

export default function DataTableGalleryPage() {
  return <DataTableGallery />;
}
