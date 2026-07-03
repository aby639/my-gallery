import { DarkTheme, DefaultTheme, Theme as NavigationTheme } from '@react-navigation/native';

import { ThemePreference } from '../storage/galleryStorage';

export type AppColors = {
  background: string;
  backgroundAlt: string;
  surface: string;
  surfaceAlt: string;
  surfaceRaised: string;
  surfaceGlass: string;
  text: string;
  textSoft: string;
  muted: string;
  border: string;
  borderSoft: string;
  primary: string;
  primaryText: string;
  primarySoft: string;
  secondary: string;
  secondaryText: string;
  accent: string;
  accentSoft: string;
  warm: string;
  warmSoft: string;
  cyan: string;
  cyanSoft: string;
  danger: string;
  dangerText: string;
  success: string;
  warning: string;
  shadow: string;
  overlay: string;
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
  background: '#faf8fb',
  backgroundAlt: '#f1edf3',
  surface: '#ffffff',
  surfaceAlt: '#f3eef4',
  surfaceRaised: '#ffffff',
  surfaceGlass: 'rgba(255, 255, 255, 0.78)',
  text: '#171018',
  textSoft: '#443846',
  muted: '#7a707d',
  border: '#e7dce7',
  borderSoft: '#f0e8ef',
  primary: '#a855f7',
  primaryText: '#ffffff',
  primarySoft: '#f1e4ff',
  secondary: '#fb7185',
  secondaryText: '#ffffff',
  accent: '#ec6380',
  accentSoft: '#ffe9ee',
  warm: '#f59b62',
  warmSoft: '#fff0e7',
  cyan: '#21bfd0',
  cyanSoft: '#e4fbff',
  danger: '#ff6b6b',
  dangerText: '#240606',
  success: '#1b9a68',
  warning: '#c77915',
  shadow: 'rgba(35, 22, 38, 0.14)',
  overlay: 'rgba(17, 10, 18, 0.55)',
};

const darkColors: AppColors = {
  background: '#090a10',
  backgroundAlt: '#111019',
  surface: '#14121a',
  surfaceAlt: '#1d1822',
  surfaceRaised: '#17141d',
  surfaceGlass: 'rgba(23, 20, 29, 0.76)',
  text: '#fff7fb',
  textSoft: '#e7dce8',
  muted: '#b8acba',
  border: '#322a38',
  borderSoft: '#25202a',
  primary: '#ddb7ff',
  primaryText: '#211326',
  primarySoft: '#2b1837',
  secondary: '#ffb2b9',
  secondaryText: '#ffffff',
  accent: '#ff7b92',
  accentSoft: '#351923',
  warm: '#ffab6e',
  warmSoft: '#342216',
  cyan: '#22d3ee',
  cyanSoft: '#102b30',
  danger: '#ff7373',
  dangerText: '#220807',
  success: '#66d9a6',
  warning: '#f8c15a',
  shadow: 'rgba(0, 0, 0, 0.48)',
  overlay: 'rgba(4, 4, 8, 0.62)',
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
