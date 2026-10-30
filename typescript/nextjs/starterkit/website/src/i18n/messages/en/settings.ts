import type { MessageShape } from '../../types';

export const settings = {
  title: 'Settings',
  description: 'Manage your application preferences and settings.',
  general: 'General',
  appearance: 'Appearance',
  language: 'Language & Region',
  notifications: 'Notifications',
} as const;

export type SettingsMessages = MessageShape<typeof settings>;
