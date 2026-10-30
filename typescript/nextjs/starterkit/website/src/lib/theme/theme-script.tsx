import React from 'react';

export interface ThemeScriptProps {
  storageKey?: string;
  attribute?: string;
  defaultTheme?: string;
}

/**
 * ThemeScript injects a synchronous inline script to set the theme attribute
 * on <html> before the page renders, eliminating any flash of unstyled theme (FOUC).
 */
export function ThemeScript({
  storageKey = 'theme',
  attribute = 'data-theme',
  defaultTheme = 'system',
}: ThemeScriptProps) {
  const scriptContent = `(function() {
    try {
      var storageKey = '${storageKey}';
      var attribute = '${attribute}';
      var defaultTheme = '${defaultTheme}';
      var theme = localStorage.getItem(storageKey) || defaultTheme;
      var resolved = theme;
      if (theme === 'system') {
        resolved = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      }
      document.documentElement.setAttribute(attribute, resolved);
    } catch (e) {}
  })();`;

  return <script dangerouslySetInnerHTML={{ __html: scriptContent }} />;
}
