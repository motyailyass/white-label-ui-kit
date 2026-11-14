import type { Metadata } from 'next';
import { StepperGallery } from '@/components/patterns/stepper-gallery';
import { defaultMessages, translate } from '@/i18n';
import { getServerI18nState } from '../../i18n-server';

export async function generateMetadata(): Promise<Metadata> {
  const { locale } = await getServerI18nState('en');
  return {
    title: translate(defaultMessages, locale, 'common.studio.stepperTitle'),
    description: translate(defaultMessages, locale, 'common.studio.stepperSubtitle'),
  };
}

export default function StepperGalleryPage() {
  return <StepperGallery />;
}
