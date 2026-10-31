import { common as arCommon } from './ar/common';
import { errors as arErrors } from './ar/errors';
import { website as arWebsite } from './ar/website';
import { type CommonMessages, common as enCommon } from './en/common';
import { type ErrorsMessages, errors as enErrors } from './en/errors';
import { type WebsiteMessages, website as enWebsite } from './en/website';
import { common as frCommon } from './fr/common';
import { errors as frErrors } from './fr/errors';
import { website as frWebsite } from './fr/website';

export { resolvePath, translate } from '../translate';

export interface LocaleMessages {
  common: CommonMessages;
  website: WebsiteMessages;
  errors: ErrorsMessages;
}

export const enMessages: LocaleMessages = {
  common: enCommon,
  website: enWebsite,
  errors: enErrors,
};

export const frMessages: LocaleMessages = {
  common: frCommon,
  website: frWebsite,
  errors: frErrors,
};

export const arMessages: LocaleMessages = {
  common: arCommon,
  website: arWebsite,
  errors: arErrors,
};

export const defaultMessages: Record<string, LocaleMessages> = {
  en: enMessages,
  fr: frMessages,
  ar: arMessages,
};
