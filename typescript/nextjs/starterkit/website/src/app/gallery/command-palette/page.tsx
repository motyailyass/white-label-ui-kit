import type { Metadata } from 'next';
import { CommandPaletteGallery } from '@/components/patterns/command-palette-gallery';
import { defaultMessages, translate } from '@/i18n';
import { getServerI18nState } from '../../i18n-server';

export async function generateMetadata(): Promise<Metadata> {
  const { locale } = await getServerI18nState('en');
  return {
    title: translate(defaultMessages, locale, 'common.studio.commandPaletteTitle'),
    description: translate(defaultMessages, locale, 'common.studio.commandPaletteSubtitle'),
  };
}

export default function CommandPaletteGalleryPage() {
  return <CommandPaletteGallery />;
}
