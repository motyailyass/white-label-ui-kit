import type { MessageShape } from '../../types';

export const common = {
  theme: 'Theme',
  direction: 'Direction',
  toggleTheme: 'Toggle theme',
  toggleDirection: 'Toggle direction',
  search: 'Search...',
  close: 'Close',
  back: 'Back',
  next: 'Next',
  save: 'Save',
  cancel: 'Cancel',
  language: 'Language',
  retry: 'Try again',
  goHome: 'Go to Home',
  status: 'Status',
  lastModified: 'Last Modified',
} as const;

export type CommonMessages = MessageShape<typeof common>;
