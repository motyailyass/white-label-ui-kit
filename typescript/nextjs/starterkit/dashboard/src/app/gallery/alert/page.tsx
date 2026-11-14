import type { Metadata } from 'next';
import { AlertGallery } from '@/components/patterns/alert-gallery';
import { defaultMessages, translate } from '@/i18n';
import { getServerI18nState } from '../../i18n-server';

export async function generateMetadata(): Promise<Metadata> {
  const { locale } = await getServerI18nState('en');
  return {
    title: translate(defaultMessages, locale, 'common.studio.alertTitle'),
    description: translate(defaultMessages, locale, 'common.studio.alertSubtitle'),
  };
}

export default function AlertGalleryPage() {
  return <AlertGallery />;
}
