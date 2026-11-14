import type { Metadata } from 'next';
import { ToastGallery } from '@/components/patterns/toast-gallery';
import { defaultMessages, translate } from '@/i18n';
import { getServerI18nState } from '../../i18n-server';

export async function generateMetadata(): Promise<Metadata> {
  const { locale } = await getServerI18nState('en');
  return {
    title: translate(defaultMessages, locale, 'common.studio.toastTitle'),
    description: translate(defaultMessages, locale, 'common.studio.toastSubtitle'),
  };
}

export default function ToastGalleryPage() {
  return <ToastGallery />;
}
