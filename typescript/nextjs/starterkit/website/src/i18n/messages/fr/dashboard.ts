import type { DashboardMessages } from '../en/dashboard';

export const dashboard = {
  overview: {
    title: 'Aperçu du système',
    subtitle:
      'Bienvenue sur le moteur de mise en page du kit de démarrage de tableau de bord sans marque avec support natif RTL et LTR.',
  },
  metrics: {
    totalUsers: 'Total des utilisateurs',
    activeSessions: 'Sessions actives',
    monthlyRevenue: 'Revenu mensuel',
    thisMonth: 'ce mois-ci',
    peakLoad: 'charge de pointe',
    updatedToday: "Mis à jour aujourd'hui",
  },
  bidi: {
    title: 'Gestion de texte bidirectionnel (Bidi)',
    trackingCode: 'Code de suivi de compte',
    supportLine: 'Ligne directe du support',
    description:
      'Isolé avec <bdi> pour garantir une ponctuation parfaite dans n’importe quelle direction de lecture.',
  },
  nav: {
    overview: 'Aperçu',
    dashboard: 'Tableau de bord',
    analytics: 'Analytique',
    reports: 'Rapports',
    management: 'Gestion',
    customers: 'Clients',
    orders: 'Commandes',
    products: 'Produits',
    preferences: 'Préférences',
    team: 'Équipe',
    settings: 'Paramètres',
  },
} satisfies DashboardMessages;
