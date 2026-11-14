import type { Metadata } from 'next';
import { AccordionGallery } from '@/components/patterns/accordion-gallery';
import { defaultMessages, translate } from '@/i18n';
import { getServerI18nState } from '../../i18n-server';

export async function generateMetadata(): Promise<Metadata> {
  const { locale } = await getServerI18nState('en');
  return {
    title: translate(defaultMessages, locale, 'common.studio.accordionTitle'),
    description: translate(defaultMessages, locale, 'common.studio.accordionSubtitle'),
  };
}

export default function AccordionGalleryPage() {
  return <AccordionGallery />;
}
