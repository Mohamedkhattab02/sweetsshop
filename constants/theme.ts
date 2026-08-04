/**
 * Material Design 3 theming for the market app.
 *
 * The colour scheme is a full M3 tonal palette generated from a fresh-produce
 * green source colour. React Native Paper v5 implements the Material 3 spec, so
 * these tokens drive every component (app bar, cards, chips, text fields, FAB).
 *
 * `adaptNavigationTheme` keeps React Navigation's own surfaces (stack headers,
 * tab bar background) in sync with the same palette.
 */

import { DarkTheme as NavigationDarkTheme, DefaultTheme as NavigationLightTheme } from '@react-navigation/native';
import { Platform } from 'react-native';
import { MD3DarkTheme, MD3LightTheme, adaptNavigationTheme } from 'react-native-paper';

const lightColors = {
  primary: '#386A20',
  onPrimary: '#FFFFFF',
  primaryContainer: '#B7F397',
  onPrimaryContainer: '#042100',
  secondary: '#55624C',
  onSecondary: '#FFFFFF',
  secondaryContainer: '#D9E7CB',
  onSecondaryContainer: '#131F0D',
  tertiary: '#19686A',
  onTertiary: '#FFFFFF',
  tertiaryContainer: '#A0EFF0',
  onTertiaryContainer: '#002020',
  error: '#BA1A1A',
  onError: '#FFFFFF',
  errorContainer: '#FFDAD6',
  onErrorContainer: '#410002',
  background: '#FDFCF5',
  onBackground: '#1A1C18',
  surface: '#FDFCF5',
  onSurface: '#1A1C18',
  surfaceVariant: '#E0E4D6',
  onSurfaceVariant: '#43483E',
  outline: '#73796D',
  outlineVariant: '#C3C8BB',
  shadow: '#000000',
  scrim: '#000000',
  inverseSurface: '#2F312C',
  inverseOnSurface: '#F1F1EA',
  inversePrimary: '#9CD67D',
  surfaceDisabled: 'rgba(26, 28, 24, 0.12)',
  onSurfaceDisabled: 'rgba(26, 28, 24, 0.38)',
  backdrop: 'rgba(45, 50, 40, 0.4)',
  elevation: {
    level0: 'transparent',
    level1: '#F2F5EA',
    level2: '#EDF2E4',
    level3: '#E7EEDE',
    level4: '#E5EDDC',
    level5: '#E1EAD8',
  },
};

const darkColors = {
  primary: '#9CD67D',
  onPrimary: '#0B3900',
  primaryContainer: '#205107',
  onPrimaryContainer: '#B7F397',
  secondary: '#BDCBB0',
  onSecondary: '#283420',
  secondaryContainer: '#3E4A36',
  onSecondaryContainer: '#D9E7CB',
  tertiary: '#84D3D4',
  onTertiary: '#003737',
  tertiaryContainer: '#004F50',
  onTertiaryContainer: '#A0EFF0',
  error: '#FFB4AB',
  onError: '#690005',
  errorContainer: '#93000A',
  onErrorContainer: '#FFDAD6',
  background: '#1A1C18',
  onBackground: '#E3E3DC',
  surface: '#1A1C18',
  onSurface: '#E3E3DC',
  surfaceVariant: '#43483E',
  onSurfaceVariant: '#C3C8BB',
  outline: '#8D9387',
  outlineVariant: '#43483E',
  shadow: '#000000',
  scrim: '#000000',
  inverseSurface: '#E3E3DC',
  inverseOnSurface: '#2F312C',
  inversePrimary: '#386A20',
  surfaceDisabled: 'rgba(227, 227, 220, 0.12)',
  onSurfaceDisabled: 'rgba(227, 227, 220, 0.38)',
  backdrop: 'rgba(45, 50, 40, 0.4)',
  elevation: {
    level0: 'transparent',
    level1: '#21261D',
    level2: '#262C21',
    level3: '#2B3126',
    level4: '#2C3327',
    level5: '#2F372A',
  },
};

export const MarketLightTheme = {
  ...MD3LightTheme,
  colors: { ...MD3LightTheme.colors, ...lightColors },
};

export const MarketDarkTheme = {
  ...MD3DarkTheme,
  colors: { ...MD3DarkTheme.colors, ...darkColors },
};

export type MarketTheme = typeof MarketLightTheme;

const { LightTheme: AdaptedLight, DarkTheme: AdaptedDark } = adaptNavigationTheme({
  reactNavigationLight: NavigationLightTheme,
  reactNavigationDark: NavigationDarkTheme,
  materialLight: MarketLightTheme,
  materialDark: MarketDarkTheme,
});

export const NavLightTheme = AdaptedLight;
export const NavDarkTheme = AdaptedDark;

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
