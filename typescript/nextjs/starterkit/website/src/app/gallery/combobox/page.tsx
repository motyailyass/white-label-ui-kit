import type { Metadata } from 'next';
import { ComboboxGallery } from '@/components/patterns/combobox-gallery';
import { defaultMessages, translate } from '@/i18n';
import { getServerI18nState } from '../../i18n-server';

export async function generateMetadata(): Promise<Metadata> {
  const { locale } = await getServerI18nState('en');
  return {
    title: translate(defaultMessages, locale, 'common.studio.comboboxTitle'),
    description: translate(defaultMessages, locale, 'common.studio.comboboxSubtitle'),
  };
}

export default function WebsiteComboboxGalleryPage() {
  return <ComboboxGallery />;
}
