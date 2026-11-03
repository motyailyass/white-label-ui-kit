import type { Metadata } from 'next';
import { PopoverGallery } from '@/components/patterns/popover-gallery';
import { defaultMessages, translate } from '@/i18n';
import { getServerI18nState } from '../../i18n-server';

export async function generateMetadata(): Promise<Metadata> {
  const { locale } = await getServerI18nState('en');
  return {
    title: translate(defaultMessages, locale, 'common.popoverGallery.metaTitle'),
    description: translate(defaultMessages, locale, 'common.popoverGallery.metaDescription'),
  };
}

export default function PopoverGalleryPage() {
  return <PopoverGallery />;
}
