import type { Metadata } from 'next';
import { SkeletonGallery } from '@/components/patterns/skeleton-gallery';
import { defaultMessages, translate } from '@/i18n';
import { getServerI18nState } from '../../i18n-server';

export async function generateMetadata(): Promise<Metadata> {
  const { locale } = await getServerI18nState('en');
  return {
    title: translate(defaultMessages, locale, 'common.studio.skeletonTitle'),
    description: translate(defaultMessages, locale, 'common.studio.skeletonSubtitle'),
  };
}

export default function SkeletonGalleryPage() {
  return <SkeletonGallery />;
}
