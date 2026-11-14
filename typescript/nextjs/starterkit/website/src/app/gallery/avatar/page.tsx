import type { Metadata } from 'next';
import { AvatarGallery } from '@/components/patterns/avatar-gallery';
import { defaultMessages, translate } from '@/i18n';
import { getServerI18nState } from '../../i18n-server';

export async function generateMetadata(): Promise<Metadata> {
  const { locale } = await getServerI18nState('en');
  return {
    title: translate(defaultMessages, locale, 'common.studio.avatarTitle'),
    description: translate(defaultMessages, locale, 'common.studio.avatarSubtitle'),
  };
}

export default function AvatarGalleryPage() {
  return <AvatarGallery />;
}
