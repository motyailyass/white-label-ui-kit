import { common as arCommon } from './ar/common';
import { dashboard as arDashboard } from './ar/dashboard';
import { errors as arErrors } from './ar/errors';
import { settings as arSettings } from './ar/settings';
import { type CommonMessages, common as enCommon } from './en/common';
import { type DashboardMessages, dashboard as enDashboard } from './en/dashboard';
import { type ErrorsMessages, errors as enErrors } from './en/errors';
import { settings as enSettings, type SettingsMessages } from './en/settings';
import { common as frCommon } from './fr/common';
import { dashboard as frDashboard } from './fr/dashboard';
import { errors as frErrors } from './fr/errors';
import { settings as frSettings } from './fr/settings';

export { resolvePath, translate } from '../translate';

export interface LocaleMessages {
  common: CommonMessages;
  dashboard: DashboardMessages;
  settings: SettingsMessages;
  errors: ErrorsMessages;
}

export const enMessages: LocaleMessages = {
  common: enCommon,
  dashboard: enDashboard,
  settings: enSettings,
  errors: enErrors,
};

export const frMessages: LocaleMessages = {
  common: frCommon,
  dashboard: frDashboard,
  settings: frSettings,
  errors: frErrors,
};

export const arMessages: LocaleMessages = {
  common: arCommon,
  dashboard: arDashboard,
  settings: arSettings,
  errors: arErrors,
};

export const defaultMessages: Record<string, LocaleMessages> = {
  en: enMessages,
  fr: frMessages,
  ar: arMessages,
};
