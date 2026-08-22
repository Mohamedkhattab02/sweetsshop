/**
 * Material Design 3 theming for Nour Sweets.
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
  primary: '#B94730',
  onPrimary: '#FFFFFF',
  primaryContainer: '#F8D9D0',
  onPrimaryContainer: '#4A1710',
  secondary: '#50685A',
  onSecondary: '#FFFFFF',
  secondaryContainer: '#DDEBE2',
  onSecondaryContainer: '#1D3527',
  tertiary: '#7B6130',
  onTertiary: '#FFFFFF',
  tertiaryContainer: '#F6E8C8',
  onTertiaryContainer: '#2D2209',
  error: '#BA1A1A',
  onError: '#FFFFFF',
  errorContainer: '#FFDAD6',
  onErrorContainer: '#410002',
  background: '#F7F8F5',
  onBackground: '#1D2622',
  surface: '#FFFFFF',
  onSurface: '#1D2622',
  surfaceVariant: '#EEF2EF',
  onSurfaceVariant: '#68736D',
  outline: '#78837D',
  outlineVariant: '#DDE3DE',
  shadow: '#000000',
  scrim: '#000000',
  inverseSurface: '#2C3531',
  inverseOnSurface: '#EDF3EF',
  inversePrimary: '#FFB4A2',
  surfaceDisabled: 'rgba(26, 28, 24, 0.12)',
  onSurfaceDisabled: 'rgba(26, 28, 24, 0.38)',
  backdrop: 'rgba(29, 38, 34, 0.4)',
  elevation: {
    level0: 'transparent',
    level1: '#FBFCFA',
    level2: '#F5F7F4',
    level3: '#EFF3EF',
    level4: '#EAEFEB',
    level5: '#E5EBE7',
  },
};

const darkColors = {
  primary: '#FFB783',
  onPrimary: '#4E1E00',
  primaryContainer: '#6B3512',
  onPrimaryContainer: '#FFDCC3',
  secondary: '#D6C49A',
  onSecondary: '#392D13',
  secondaryContainer: '#52451F',
  onSecondaryContainer: '#F3E1B7',
  tertiary: '#F0B2CF',
  onTertiary: '#4E1D35',
  tertiaryContainer: '#6B344F',
  onTertiaryContainer: '#FFD9E8',
  error: '#FFB4AB',
  onError: '#690005',
  errorContainer: '#93000A',
  onErrorContainer: '#FFDAD6',
  background: '#211A16',
  onBackground: '#F4DED2',
  surface: '#211A16',
  onSurface: '#F4DED2',
  surfaceVariant: '#56483F',
  onSurfaceVariant: '#D8C8BD',
  outline: '#A08F84',
  outlineVariant: '#56483F',
  shadow: '#000000',
  scrim: '#000000',
  inverseSurface: '#F4DED2',
  inverseOnSurface: '#382D27',
  inversePrimary: '#8A4B22',
  surfaceDisabled: 'rgba(227, 227, 220, 0.12)',
  onSurfaceDisabled: 'rgba(227, 227, 220, 0.38)',
  backdrop: 'rgba(45, 50, 40, 0.4)',
  elevation: {
    level0: 'transparent',
    level1: '#2A211C',
    level2: '#30251F',
    level3: '#362A23',
    level4: '#3A2D25',
    level5: '#3E3028',
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
    sans: 'Manrope_400Regular',
    serif: 'DMSerifDisplay_400Regular',
    rounded: 'Manrope_600SemiBold',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'Manrope_400Regular',
    serif: 'DMSerifDisplay_400Regular',
    rounded: 'Manrope_600SemiBold',
    mono: 'monospace',
  },
  web: {
    sans: "'Manrope_400Regular', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    serif: "'DMSerifDisplay_400Regular', Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
