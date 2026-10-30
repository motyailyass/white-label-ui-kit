export const siteConfig = {
  name: 'Control Hub',
  description: 'Production System Dashboard Starter Kit',
  defaultLocale: 'en' as const,
  locales: ['en', 'fr', 'ar'] as const,
};

export const demoLayoutConfig = {
  dualSidebar: {
    secondaryTitle: 'Workspace',
    secondarySubtitle: 'Engineering Team',
    pageTitle: 'Dual Sidebar',
    pageDescription: 'Two-tiered primary icon rail and nested sub-tree navigation',
  },
  threeColumn: {
    pageTitle: 'Three Column',
    pageDescription: 'Layout with persistent contextual inspector panel',
    inspectorTitle: 'Properties & Details',
    inspectorDescription: 'Selected object attributes',
  },
  classic: {
    pageTitle: 'Classic Layout',
    pageDescription: 'Single-tier primary navigation with collapsible sidebar',
  },
};
