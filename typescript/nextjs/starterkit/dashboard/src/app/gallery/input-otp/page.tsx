import type { Metadata } from 'next';
import { InputOtpGallery } from '@/components/patterns/input-otp-gallery';
import { defaultMessages, translate } from '@/i18n';
import { getServerI18nState } from '../../i18n-server';

export async function generateMetadata(): Promise<Metadata> {
  const { locale } = await getServerI18nState('en');
  return {
    title: translate(defaultMessages, locale, 'common.studio.inputOtpTitle'),
    description: translate(defaultMessages, locale, 'common.studio.inputOtpSubtitle'),
  };
}

export default function InputOtpGalleryPage() {
  return <InputOtpGallery />;
}
