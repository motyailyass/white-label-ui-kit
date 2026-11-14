import type { Metadata } from 'next';
import { BreadcrumbGallery } from '@/components/patterns/breadcrumb-gallery';
import { defaultMessages, translate } from '@/i18n';
import { getServerI18nState } from '../../i18n-server';

export async function generateMetadata(): Promise<Metadata> {
  const { locale } = await getServerI18nState('en');
  return {
    title: translate(defaultMessages, locale, 'common.studio.breadcrumbTitle'),
    description: translate(defaultMessages, locale, 'common.studio.breadcrumbSubtitle'),
  };
}

export default function BreadcrumbGalleryPage() {
  return <BreadcrumbGallery />;
}
