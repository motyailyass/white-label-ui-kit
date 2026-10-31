import type { MessageShape } from '../../types';

export const errors = {
  genericTitle: 'Something went wrong',
  genericDescription: 'An unexpected error occurred while processing your request.',
  notFoundTitle: 'Page not found',
  notFoundDescription: 'The page you are looking for does not exist or has been moved.',
  retryAction: 'Try again',
  goHomeAction: 'Return to home',
  boundaryTitle: 'Component error',
  boundaryDescription: 'This section failed to load properly.',
} as const;

export type ErrorsMessages = MessageShape<typeof errors>;
