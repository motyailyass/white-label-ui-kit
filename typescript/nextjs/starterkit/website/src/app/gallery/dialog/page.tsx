import type { Metadata } from 'next';
import { DialogGallery } from '@/components/patterns/dialog-gallery';
import { defaultMessages, translate } from '@/i18n';
import { getServerI18nState } from '../../i18n-server';

export async function generateMetadata(): Promise<Metadata> {
  const { locale } = await getServerI18nState('en');
  return {
    title: translate(defaultMessages, locale, 'common.dialogGallery.metaTitle'),
    description: translate(defaultMessages, locale, 'common.dialogGallery.metaDescription'),
  };
}

export default function WebsiteDialogGalleryPage() {
  return <DialogGallery />;
}
