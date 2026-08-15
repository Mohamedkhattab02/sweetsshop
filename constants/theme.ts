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
  primary: '#8A4B22',
  onPrimary: '#FFFFFF',
  primaryContainer: '#FFDCC3',
  onPrimaryContainer: '#321200',
  secondary: '#6C5B3C',
  onSecondary: '#FFFFFF',
  secondaryContainer: '#F3E1B7',
  onSecondaryContainer: '#251A05',
  tertiary: '#8C5B73',
  onTertiary: '#FFFFFF',
  tertiaryContainer: '#FFD9E8',
  onTertiaryContainer: '#351020',
  error: '#BA1A1A',
  onError: '#FFFFFF',
  errorContainer: '#FFDAD6',
  onErrorContainer: '#410002',
  background: '#FFF9F4',
  onBackground: '#211A16',
  surface: '#FFF9F4',
  onSurface: '#211A16',
  surfaceVariant: '#F3E7DD',
  onSurfaceVariant: '#56483F',
  outline: '#85756B',
  outlineVariant: '#D8C8BD',
  shadow: '#000000',
  scrim: '#000000',
  inverseSurface: '#382D27',
  inverseOnSurface: '#FFEDE2',
  inversePrimary: '#FFB783',
  surfaceDisabled: 'rgba(26, 28, 24, 0.12)',
  onSurfaceDisabled: 'rgba(26, 28, 24, 0.38)',
  backdrop: 'rgba(45, 50, 40, 0.4)',
  elevation: {
    level0: 'transparent',
    level1: '#FFF3EA',
    level2: '#FFEEE4',
    level3: '#FBE8DB',
    level4: '#F9E4D6',
    level5: '#F6DFD0',
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
