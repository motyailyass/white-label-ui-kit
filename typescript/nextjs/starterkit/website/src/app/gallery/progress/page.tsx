import type { Metadata } from 'next';
import { ProgressGallery } from '@/components/patterns/progress-gallery';
import { defaultMessages, translate } from '@/i18n';
import { getServerI18nState } from '../../i18n-server';

export async function generateMetadata(): Promise<Metadata> {
  const { locale } = await getServerI18nState('en');
  return {
    title: translate(defaultMessages, locale, 'common.studio.progressTitle'),
    description: translate(defaultMessages, locale, 'common.studio.progressSubtitle'),
  };
}

export default function ProgressGalleryPage() {
  return <ProgressGallery />;
}
