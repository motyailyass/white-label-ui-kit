import type { ErrorsMessages } from '../en/errors';

export const errors = {
  genericTitle: 'Une erreur est survenue',
  genericDescription: "Une erreur inattendue s'est produite lors du traitement de votre demande.",
  notFoundTitle: 'Page introuvable',
  notFoundDescription: "La page que vous recherchez n'existe pas ou a été déplacée.",
  retryAction: 'Réessayer',
  goHomeAction: "Retour à l'accueil",
  boundaryTitle: 'Erreur du composant',
  boundaryDescription: 'Cette section n’a pas pu se charger correctement.',
} satisfies ErrorsMessages;
