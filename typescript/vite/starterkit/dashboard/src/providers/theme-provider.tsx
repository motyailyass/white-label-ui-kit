'use client';

import type React from 'react';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

export type Theme = 'light' | 'dark' | 'system';
export type ResolvedTheme = 'light' | 'dark';

export interface ThemeContextValue {
  theme: Theme;
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
  attribute?: string;
}

function getSystemTheme(): ResolvedTheme {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function ThemeProvider({
  children,
  defaultTheme = 'system',
  storageKey = 'theme',
  attribute = 'data-theme',
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(defaultTheme);
  const [systemTheme, setSystemTheme] = useState<ResolvedTheme>('light');
  // Render-aware restoration state: false during initial render effect closure to guarantee zero intermediate DOM writes
  const [isRestored, setIsRestored] = useState(false);

  // Phase 1: Initialize theme from storage or system on client mount
  useEffect(() => {
    let resolvedInitialTheme: Theme = defaultTheme;

    try {
      const stored = localStorage.getItem(storageKey) as Theme | null;
      if (stored === 'light' || stored === 'dark' || stored === 'system') {
        resolvedInitialTheme = stored;
      }
    } catch {
      // Storage unavailable (e.g. sandboxed iframe or private browsing)
    }

    const currentSysTheme = getSystemTheme();
    setSystemTheme(currentSysTheme);
    setThemeState(resolvedInitialTheme);

    // If the document attribute was not pre-set by ThemeScript, apply it now
    if (typeof document !== 'undefined') {
      const currentAttr = document.documentElement.getAttribute(attribute);
      const effectiveTheme: ResolvedTheme =
        resolvedInitialTheme === 'system' ? currentSysTheme : resolvedInitialTheme;

      if (!currentAttr) {
        document.documentElement.setAttribute(attribute, effectiveTheme);
      }
    }

    // Schedule transition to restored phase (triggers re-render with restored state before any persistence write)
    setIsRestored(true);
  }, [attribute, defaultTheme, storageKey]);

  // Listen to system preference changes when theme === 'system'
  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      setSystemTheme(e.matches ? 'dark' : 'light');
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const resolvedTheme: ResolvedTheme = theme === 'system' ? systemTheme : theme;

  // Phase 2: Apply theme to document element and persist ONLY after state is restored
  useEffect(() => {
    if (!isRestored) return;
    if (typeof document === 'undefined') return;

    const root = document.documentElement;
    if (root.getAttribute(attribute) !== resolvedTheme) {
      root.setAttribute(attribute, resolvedTheme);
    }

    try {
      localStorage.setItem(storageKey, theme);
    } catch {
      // Storage unavailable
    }
  }, [isRestored, theme, resolvedTheme, attribute, storageKey]);

  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => {
      if (prev === 'light') return 'dark';
      if (prev === 'dark') return 'light';
      return resolvedTheme === 'dark' ? 'light' : 'dark';
    });
  }, [resolvedTheme]);

  const value = useMemo(
    () => ({
      theme,
      resolvedTheme,
      setTheme,
      toggleTheme,
    }),
    [theme, resolvedTheme, setTheme, toggleTheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a <ThemeProvider>');
  }
  return context;
}

/**
 * Injects a synchronous inline script to eliminate flash of unstyled theme (FOUC).
 */
export function ThemeScript({
  storageKey = 'theme',
  attribute = 'data-theme',
  defaultTheme = 'system',
}: {
  storageKey?: string;
  attribute?: string;
  defaultTheme?: Theme;
} = {}) {
  const safeStorageKey = JSON.stringify(storageKey);
  const safeAttribute = JSON.stringify(attribute);
  const safeDefaultTheme = JSON.stringify(defaultTheme);

  const scriptContent = `(function() {
    try {
      var storageKey = ${safeStorageKey};
      var attribute = ${safeAttribute};
      var defaultTheme = ${safeDefaultTheme};
      var stored = localStorage.getItem(storageKey);
      var theme = (stored === 'light' || stored === 'dark' || stored === 'system') ? stored : defaultTheme;
      var resolved = theme;
      if (theme === 'system') {
        resolved = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      }
      document.documentElement.setAttribute(attribute, resolved);
    } catch (e) {}
  })();`;

  return <script dangerouslySetInnerHTML={{ __html: scriptContent }} />;
}
