import { Platform, StyleSheet } from 'react-native';

const webOnly = <T extends object>(styles: T) => (Platform.OS === 'web' ? styles : {});

export const breakpoints = {
  compactPhone: 360,
  phone: 600,
  desktop: 980,
} as const;

/**
 * Keeps usable space on very small phones while gradually restoring the
 * generous desktop gutters used by the web design.
 */
export function getPageGutter(width: number) {
  if (Platform.OS !== 'web') return 20;
  if (width < breakpoints.compactPhone) return 12;
  if (width < breakpoints.phone) return 16;
  if (width < breakpoints.desktop) return 24;
  if (width < 1280) return 32;
  return 40;
}

/**
 * Shared page widths keep the web app feeling intentional on large screens
 * while leaving the native layouts untouched.
 */
export const responsive = StyleSheet.create({
  page: webOnly({
    width: '100%',
    maxWidth: 1360,
    alignSelf: 'center',
    paddingHorizontal: 20,
  }),
  mediumPage: webOnly({
    width: '100%',
    maxWidth: 1120,
    alignSelf: 'center',
    paddingHorizontal: 20,
  }),
  narrowPage: webOnly({
    width: '100%',
    maxWidth: 880,
    alignSelf: 'center',
    paddingHorizontal: 20,
  }),
});
