// src/context/ThemeContext.jsx
import { createContext, useState, useEffect, useContext } from 'react';

const ThemeContext = createContext();

export const themeColors = {
  indigo: {
    name: 'Indigo Classic',
    primary: 'indigo-600',
    primaryHover: 'indigo-700',
    primaryBg: 'bg-indigo-600',
    primaryBgHover: 'hover:bg-indigo-700',
    primaryBgActive: 'active:bg-indigo-800',
    primaryText: 'text-indigo-600',
    primaryBorder: 'border-indigo-600',
    primaryRing: 'focus:ring-indigo-500',
    gradient: 'from-indigo-500 to-violet-600',
    accentText: 'text-indigo-600 dark:text-indigo-400',
    accentHoverText: 'hover:text-indigo-800 dark:hover:text-indigo-300',
    progressBg: 'bg-gradient-to-r from-indigo-500 to-violet-650',
    countBadge: 'bg-indigo-700 text-indigo-100',
    tabActive: 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
  },
  emerald: {
    name: 'Emerald Forest',
    primary: 'emerald-600',
    primaryHover: 'emerald-700',
    primaryBg: 'bg-emerald-600',
    primaryBgHover: 'hover:bg-emerald-700',
    primaryBgActive: 'active:bg-emerald-800',
    primaryText: 'text-emerald-600',
    primaryBorder: 'border-emerald-600',
    primaryRing: 'focus:ring-emerald-500',
    gradient: 'from-emerald-500 to-teal-600',
    accentText: 'text-emerald-600 dark:text-emerald-400',
    accentHoverText: 'hover:text-emerald-800 dark:hover:text-emerald-300',
    progressBg: 'bg-gradient-to-r from-emerald-500 to-teal-650',
    countBadge: 'bg-emerald-700 text-emerald-100',
    tabActive: 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
  },
  rose: {
    name: 'Rose Gold Blush',
    primary: 'rose-600',
    primaryHover: 'rose-700',
    primaryBg: 'bg-rose-600',
    primaryBgHover: 'hover:bg-rose-700',
    primaryBgActive: 'active:bg-rose-800',
    primaryText: 'text-rose-600',
    primaryBorder: 'border-rose-600',
    primaryRing: 'focus:ring-rose-500',
    gradient: 'from-rose-500 to-pink-600',
    accentText: 'text-rose-600 dark:text-rose-400',
    accentHoverText: 'hover:text-rose-800 dark:hover:text-rose-300',
    progressBg: 'bg-gradient-to-r from-rose-500 to-pink-650',
    countBadge: 'bg-rose-700 text-rose-100',
    tabActive: 'bg-rose-600 text-white border-rose-600 shadow-sm'
  },
  amber: {
    name: 'Amber Sun',
    primary: 'amber-600',
    primaryHover: 'amber-700',
    primaryBg: 'bg-amber-600',
    primaryBgHover: 'hover:bg-amber-700',
    primaryBgActive: 'active:bg-amber-800',
    primaryText: 'text-amber-600',
    primaryBorder: 'border-amber-600',
    primaryRing: 'focus:ring-amber-500',
    gradient: 'from-amber-500 to-yellow-600',
    accentText: 'text-amber-600 dark:text-amber-400',
    accentHoverText: 'hover:text-amber-800 dark:hover:text-amber-300',
    progressBg: 'bg-gradient-to-r from-amber-500 to-yellow-650',
    countBadge: 'bg-amber-700 text-amber-100',
    tabActive: 'bg-amber-600 text-white border-amber-600 shadow-sm'
  }
};

export function ThemeProvider({ children }) {
  const [themeName, setThemeName] = useState(() => {
    return localStorage.getItem('accentTheme') || 'indigo';
  });

  useEffect(() => {
    localStorage.setItem('accentTheme', themeName);
  }, [themeName]);

  const activeColors = themeColors[themeName] || themeColors.indigo;

  return (
    <ThemeContext.Provider value={{ themeName, setThemeName, activeColors }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
