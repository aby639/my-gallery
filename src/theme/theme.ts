import { DarkTheme, DefaultTheme, Theme as NavigationTheme } from '@react-navigation/native';

import { ThemePreference } from '../storage/galleryStorage';

export type AppColors = {
  background: string;
  surface: string;
  surfaceAlt: string;
  text: string;
  muted: string;
  border: string;
  primary: string;
  primaryText: string;
  accent: string;
  danger: string;
  success: string;
};

export type AppTheme = {
  colors: AppColors;
  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    xxl: number;
  };
  radius: {
    sm: number;
    md: number;
  };
};

const shared = {
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    xxl: 32,
  },
  radius: {
    sm: 6,
    md: 8,
  },
};

const lightColors: AppColors = {
  background: '#f7f7f8',
  surface: '#ffffff',
  surfaceAlt: '#eceff1',
  text: '#141414',
  muted: '#65707a',
  border: '#dfe3e7',
  primary: '#111111',
  primaryText: '#ffffff',
  accent: '#0f766e',
  danger: '#b42318',
  success: '#138a50',
};

const darkColors: AppColors = {
  background: '#101010',
  surface: '#1a1a1a',
  surfaceAlt: '#262626',
  text: '#f5f5f5',
  muted: '#a6adb5',
  border: '#333333',
  primary: '#f5f5f5',
  primaryText: '#111111',
  accent: '#35c5b4',
  danger: '#ff7a70',
  success: '#54d68a',
};

export const themes: Record<ThemePreference, AppTheme> = {
  light: {
    ...shared,
    colors: lightColors,
  },
  dark: {
    ...shared,
    colors: darkColors,
  },
};

export function getAppTheme(themePreference: ThemePreference): AppTheme {
  return themes[themePreference];
}

export function getNavigationTheme(themePreference: ThemePreference): NavigationTheme {
  const colors = themes[themePreference].colors;
  const base = themePreference === 'dark' ? DarkTheme : DefaultTheme;

  return {
    ...base,
    dark: themePreference === 'dark',
    colors: {
      ...base.colors,
      background: colors.background,
      border: colors.border,
      card: colors.surface,
      notification: colors.accent,
      primary: colors.primary,
      text: colors.text,
    },
  };
}
