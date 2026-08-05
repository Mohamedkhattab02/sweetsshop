/**
 * Shared prop contract for the platform-split `GlassSurface`.
 */

import type { ReactNode } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';

export type GlassSurfaceProps = {
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
  /**
   * `regular` is the frosted default. `clear` is the more transparent Liquid
   * Glass variant, for surfaces floating over imagery.
   */
  variant?: 'regular' | 'clear';
  /** Optional colour wash pulled through the glass. */
  tintColor?: string;
  /**
   * Set for glass that sits under a finger — Liquid Glass reacts to touch.
   * iOS fixes this at mount time, so it must not change for a given instance.
   */
  interactive?: boolean;
  /**
   * Android fallback only: the Material elevation level used when there is no
   * glass to render.
   */
  androidElevation?: 0 | 1 | 2 | 3 | 4 | 5;
  /**
   * Android fallback only: background colour for the Material surface. Ignored
   * on iOS, where the glass provides its own material.
   */
  androidBackgroundColor?: string;
};
