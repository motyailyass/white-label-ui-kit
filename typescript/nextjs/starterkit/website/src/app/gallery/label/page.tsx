import type { Metadata } from 'next';
import { LabelGallery } from '@/components/patterns/label-gallery';
import { defaultMessages, translate } from '@/i18n';
import { getServerI18nState } from '../../i18n-server';

export async function generateMetadata(): Promise<Metadata> {
  const { locale } = await getServerI18nState('en');
  return {
    title: translate(defaultMessages, locale, 'common.studio.labelTitle'),
    description: translate(defaultMessages, locale, 'common.studio.labelSubtitle'),
  };
}

export default function LabelGalleryPage() {
  return <LabelGallery />;
}
