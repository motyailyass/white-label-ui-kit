import type { MessageShape } from '../../types';

export const common = {
  theme: 'Theme',
  direction: 'Direction',
  toggleTheme: 'Toggle theme',
  toggleDirection: 'Toggle direction',
  toggleNavigation: 'Toggle navigation menu',
  breadcrumbs: 'Breadcrumbs',
  light: 'Light',
  dark: 'Dark',
  system: 'System',
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
  filter: 'Filter',
  exportReport: 'Export Report',
  loading: 'Loading...',
} as const;

export type CommonMessages = MessageShape<typeof common>;
