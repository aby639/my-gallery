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
  background: '#f8f7fb',
  surface: '#ffffff',
  surfaceAlt: '#f0edf7',
  surfaceRaised: '#ffffff',
  text: '#17131f',
  textSoft: '#393141',
  muted: '#756f7d',
  border: '#e5ddea',
  primary: '#15111d',
  primaryText: '#ffffff',
  primarySoft: '#eee7f8',
  secondary: '#8a3ffc',
  secondaryText: '#ffffff',
  accent: '#ef476f',
  accentSoft: '#ffe6ee',
  warm: '#ff8a3d',
  warmSoft: '#fff0e4',
  cyan: '#21bfd0',
  cyanSoft: '#e4fbff',
  danger: '#ff6b6b',
  dangerText: '#240606',
  success: '#1b9a68',
  warning: '#c77915',
  shadow: 'rgba(38, 23, 54, 0.14)',
};

const darkColors: AppColors = {
  background: '#090a10',
  surface: '#12141d',
  surfaceAlt: '#1a1d29',
  surfaceRaised: '#151722',
  text: '#fbf8ff',
  textSoft: '#e2ddeb',
  muted: '#aaa4b6',
  border: '#2a2e3c',
  primary: '#f7f3ff',
  primaryText: '#11101a',
  primarySoft: '#241b32',
  secondary: '#a855f7',
  secondaryText: '#ffffff',
  accent: '#ff6f91',
  accentSoft: '#351725',
  warm: '#ff9954',
  warmSoft: '#352116',
  cyan: '#22d3ee',
  cyanSoft: '#0d2b32',
  danger: '#ff7373',
  dangerText: '#220807',
  success: '#66d9a6',
  warning: '#f8c15a',
  shadow: 'rgba(0, 0, 0, 0.48)',
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
