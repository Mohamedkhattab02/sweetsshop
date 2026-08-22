import { Platform, StyleSheet } from 'react-native';

const webOnly = <T extends object>(styles: T) => (Platform.OS === 'web' ? styles : {});

/**
 * Shared page widths keep the web app feeling intentional on large screens
 * while leaving the native layouts untouched.
 */
export const responsive = StyleSheet.create({
  page: webOnly({
    width: '100%',
    maxWidth: 1240,
    alignSelf: 'center',
    paddingHorizontal: 32,
  }),
  mediumPage: webOnly({
    width: '100%',
    maxWidth: 1040,
    alignSelf: 'center',
    paddingHorizontal: 32,
  }),
  narrowPage: webOnly({
    width: '100%',
    maxWidth: 820,
    alignSelf: 'center',
    paddingHorizontal: 32,
  }),
});
