import type { CommonMessages } from '../en/common';

export const common = {
  theme: 'Thème',
  direction: 'Direction',
  toggleTheme: 'Changer de thème',
  toggleDirection: 'Changer de direction',
  toggleNavigation: 'Basculer le menu de navigation',
  breadcrumbs: "Fil d'Ariane",
  light: 'Clair',
  dark: 'Sombre',
  system: 'Système',
  search: 'Rechercher...',
  close: 'Fermer',
  back: 'Retour',
  next: 'Suivant',
  save: 'Enregistrer',
  cancel: 'Annuler',
  language: 'Langue',
  retry: 'Réessayer',
  goHome: "Aller à l'accueil",
  status: 'Statut',
  lastModified: 'Dernière modification',
  filter: 'Filtrer',
  exportReport: 'Exporter le rapport',
  loading: 'Chargement...',
  demo: 'Démo',
  submit: 'Envoyer',
  reset: 'Réinitialiser',
  refresh: 'Actualiser',
  delete: 'Supprimer',
  edit: 'Modifier',
  exportSuccess: 'Rapport exporté avec succès (démo)',
  simulatedSuccess: 'Opération simulée terminée avec succès',
  simulatedPending: 'Traitement de la demande...',
  gallery: {
    title: 'Galerie du composant Button',
    subtitle:
      'Vérification visuelle interactive et spécifications d’utilisation du composant Button en marque blanche.',
    overviewTitle: '1. Aperçu',
    overviewDesc:
      'Le bouton déclenche une action locale (enregistrer, envoyer, annuler, ouvrir un dialogue). Il est conçu sans bibliothèque UI tierce et s’adapte à tous les thèmes, directions et préréglages.',
    variantsTitle: '2. Variantes sémantiques',
    variantsDesc:
      'Cinq variantes sémantiques communiquent la hiérarchie visuelle sans figer de couleurs de marque.',
    sizesTitle: '3. Échelle de dimensionnement en 6 étapes',
    sizesDesc:
      'Les tailles explicites de xs à 2xl garantissent des dimensions minimales identiques sur tous les starters.',
    defaultsTitle: '4. Préréglages propres aux produits',
    defaultsDesc:
      'Lorsque la propriété size est omise, le bouton applique le préréglage du produit (Dashboard = md / 36px, Website = xl / 48px).',
    statesTitle: '5. États d’interaction',
    statesDesc:
      'Démonstration des états de repos, désactivé, chargement et indicateur de focus visible à fort contraste.',
    iconsTitle: '6. Emplacements d’icônes et actions icône seule',
    iconsDesc:
      'Les emplacements logiques startIcon et endIcon basculent automatiquement en RTL. Les boutons avec icône seule requièrent un aria-label localisé.',
    loadingTitle: '7. Chargement et stabilité dimensionnelle',
    loadingDesc:
      'Démonstration interactive du même bouton avant, pendant et après un chargement asynchrone sans décalage de mise en page.',
    formTitle: '8. Comportement de formulaire et sécurité',
    formDesc:
      'Le bouton utilise type="button" par défaut pour éviter les soumissions accidentelles. type="submit" déclenche la soumission du formulaire.',
    localizationTitle: '9. Localisation et étiquettes longues',
    localizationDesc:
      'Les boutons s’adaptent en anglais, français et arabe RTL, acceptant les textes longs sans troncature.',
    themeTitle: '10. Adaptation aux thèmes et marques',
    themeDesc:
      'Les jetons commutent dynamiquement entre les thèmes clair et sombre en préservant dimensions et contrastes.',
    responsiveTitle: '11. Cibles tactiles et réactivité',
    responsiveDesc:
      'Les appareils à pointeur grossier (tactile) étendent automatiquement les boutons compacts à une cible minimale de 48×48px.',
    usageTitle: '12. Exemples d’utilisation du code',
    usageDesc: 'Exemples courts, vérifiés et prêts à l’emploi pour les modèles de production.',
  },
} satisfies CommonMessages;
