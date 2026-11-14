import type { Metadata } from 'next';
import { SpinnerGallery } from '@/components/patterns/spinner-gallery';
import { defaultMessages, translate } from '@/i18n';
import { getServerI18nState } from '../../i18n-server';

export async function generateMetadata(): Promise<Metadata> {
  const { locale } = await getServerI18nState('en');
  return {
    title: translate(defaultMessages, locale, 'common.studio.spinnerTitle'),
    description: translate(defaultMessages, locale, 'common.studio.spinnerSubtitle'),
  };
}

export default function SpinnerGalleryPage() {
  return <SpinnerGallery />;
}
