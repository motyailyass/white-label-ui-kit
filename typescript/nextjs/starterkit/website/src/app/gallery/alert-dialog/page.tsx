import type { Metadata } from 'next';
import { AlertDialogGallery } from '@/components/patterns/alert-dialog-gallery';
import { defaultMessages, translate } from '@/i18n';
import { getServerI18nState } from '../../i18n-server';

export async function generateMetadata(): Promise<Metadata> {
  const { locale } = await getServerI18nState('en');
  return {
    title: translate(defaultMessages, locale, 'common.studio.alertDialogTitle'),
    description: translate(defaultMessages, locale, 'common.studio.alertDialogSubtitle'),
  };
}

export default function AlertDialogGalleryPage() {
  return <AlertDialogGallery />;
}
