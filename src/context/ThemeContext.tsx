import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

export type AtlasTheme = 'atlas-dark' | 'enterprise-steel' | 'midnight-emerald' | 'enterprise-white';

interface ThemeContextType {
  theme: AtlasTheme;
  setTheme: (theme: AtlasTheme) => void;
  toggleTheme: () => void;
  cycleTheme: () => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = 'salience_atlas_theme';

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<AtlasTheme>(() => {
    if (typeof window === 'undefined') return 'atlas-dark';
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    if (saved === 'enterprise-white' || saved === 'atlas-dark' || saved === 'enterprise-steel' || saved === 'midnight-emerald') {
      return saved;
    }
    return 'atlas-dark';
  });

  useEffect(() => {
    try {
      const root = document.documentElement;
      root.setAttribute('data-theme', theme);
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch (e) {
      console.warn('Could not persist theme preference:', e);
    }
  }, [theme]);

  const setTheme = (newTheme: AtlasTheme) => {
    setThemeState(newTheme);
  };

  const toggleTheme = () => {
    setThemeState(prev => (prev === 'atlas-dark' ? 'enterprise-white' : 'atlas-dark'));
  };

  const cycleTheme = () => {
    const themes: AtlasTheme[] = ['atlas-dark', 'enterprise-steel', 'midnight-emerald', 'enterprise-white'];
    setThemeState(current => themes[(themes.indexOf(current) + 1) % themes.length]);
  };

  const isDark = theme !== 'enterprise-white';

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme, cycleTheme, isDark }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useAtlasTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useAtlasTheme must be used within a ThemeProvider');
  }
  return ctx;
}
