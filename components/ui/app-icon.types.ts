/**
 * Shared prop contract for the platform-split `AppIcon`.
 *
 * `tsc` only ever typechecks whichever variant Metro resolves for the current
 * platform, so both implementations import this type to stay in step.
 */

import type { ColorValue, StyleProp, ViewStyle } from 'react-native';

import type { IconName, IconToken } from '@/constants/icons';

export type AppIconProps = {
  /** A token name from `ICONS`, or a token object (used for category icons). */
  name: IconName | IconToken;
  size?: number;
  /** `ColorValue`, not `string`, so iOS screens can pass `PlatformColor(...)`. */
  color?: ColorValue;
  style?: StyleProp<ViewStyle>;
};
