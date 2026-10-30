'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { setCookie } from '@/lib/cookie';
import { ResolvedTheme, Theme, ThemeContextValue } from './types';

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
  attribute?: string;
}

function getSystemTheme(): ResolvedTheme {
  if (typeof window === 'undefined') return 'light';
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

  // Initialize theme from storage or system on client mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(storageKey) as Theme | null;
      if (stored === 'light' || stored === 'dark' || stored === 'system') {
        setThemeState(stored);
      }
    } catch {
      // Storage unavailable or disabled
    }
    setSystemTheme(getSystemTheme());
  }, [storageKey]);

  // Listen to system preference changes
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      setSystemTheme(e.matches ? 'dark' : 'light');
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const resolvedTheme: ResolvedTheme = theme === 'system' ? systemTheme : theme;

  // Apply theme to document element and persist
  useEffect(() => {
    if (typeof document === 'undefined') return;

    const root = document.documentElement;
    root.setAttribute(attribute, resolvedTheme);

    try {
      localStorage.setItem(storageKey, theme);
      // Also persist to cookie for SSR hydration consistency
      setCookie(storageKey, theme);
    } catch {
      // Storage unavailable
    }
  }, [theme, resolvedTheme, attribute, storageKey]);

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
    return {
      theme: 'system',
      resolvedTheme: 'light',
      setTheme: () => {},
      toggleTheme: () => {},
    };
  }
  return context;
}
