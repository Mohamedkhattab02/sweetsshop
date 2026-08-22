import { Platform, StyleSheet } from 'react-native';

const webOnly = <T extends object>(styles: T) => (Platform.OS === 'web' ? styles : {});

/**
 * Shared page widths keep the web app feeling intentional on large screens
 * while leaving the native layouts untouched.
 */
export const responsive = StyleSheet.create({
  page: webOnly({
    width: '100%',
    maxWidth: 1360,
    alignSelf: 'center',
    paddingHorizontal: 40,
  }),
  mediumPage: webOnly({
    width: '100%',
    maxWidth: 1120,
    alignSelf: 'center',
    paddingHorizontal: 40,
  }),
  narrowPage: webOnly({
    width: '100%',
    maxWidth: 880,
    alignSelf: 'center',
    paddingHorizontal: 40,
  }),
});
