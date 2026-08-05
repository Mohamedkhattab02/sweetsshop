/**
 * iOS semantic system colours.
 *
 * `PlatformColor` resolves to the real UIKit dynamic colours, so these track
 * light/dark mode, increased contrast and vibrancy exactly the way the rest of
 * the system does — which is the point of looking native rather than merely
 * looking different.
 *
 * IMPORTANT: this module must only ever be imported from `.ios.tsx` files.
 * `PlatformColor('label')` throws on Android, and these calls run at module
 * scope.
 */

import { PlatformColor } from 'react-native';

export const IOSColors = {
  /** The market's green, but Apple's system green so it matches iOS tinting. */
  accent: PlatformColor('systemGreen'),
  label: PlatformColor('label'),
  secondaryLabel: PlatformColor('secondaryLabel'),
  tertiaryLabel: PlatformColor('tertiaryLabel'),
  separator: PlatformColor('separator'),
  badge: PlatformColor('systemRed'),
  groupedBackground: PlatformColor('systemGroupedBackground'),
  secondaryGroupedBackground: PlatformColor('secondarySystemGroupedBackground'),
  fill: PlatformColor('secondarySystemFill'),
};
