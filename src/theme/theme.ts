import { DarkTheme, DefaultTheme, Theme as NavigationTheme } from '@react-navigation/native';

import { ThemePreference } from '../storage/galleryStorage';

export type AppColors = {
  background: string;
  surface: string;
  surfaceAlt: string;
  surfaceRaised: string;
  text: string;
  textSoft: string;
  muted: string;
  border: string;
  primary: string;
  primaryText: string;
  primarySoft: string;
  accent: string;
  accentSoft: string;
  danger: string;
  dangerText: string;
  success: string;
  warning: string;
  shadow: string;
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
  background: '#f4f5f2',
  surface: '#ffffff',
  surfaceAlt: '#eef1ed',
  surfaceRaised: '#fbfbf8',
  text: '#111312',
  textSoft: '#303735',
  muted: '#66726e',
  border: '#d9ded8',
  primary: '#101513',
  primaryText: '#ffffff',
  primarySoft: '#e3ebe6',
  accent: '#087f6d',
  accentSoft: '#d8f2eb',
  danger: '#e95f58',
  dangerText: '#1e0504',
  success: '#15875f',
  warning: '#b67808',
  shadow: 'rgba(20, 28, 24, 0.14)',
};

const darkColors: AppColors = {
  background: '#0f1110',
  surface: '#181b1a',
  surfaceAlt: '#232826',
  surfaceRaised: '#1f2422',
  text: '#f5f7f4',
  textSoft: '#d8dfdb',
  muted: '#9ba7a2',
  border: '#303835',
  primary: '#f7faf6',
  primaryText: '#101513',
  primarySoft: '#28342f',
  accent: '#45d2b6',
  accentSoft: '#123b34',
  danger: '#ff7770',
  dangerText: '#220807',
  success: '#6fe0a4',
  warning: '#f2b64b',
  shadow: 'rgba(0, 0, 0, 0.42)',
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
