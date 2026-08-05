/**
 * Shared prop contract for the platform-split `ScreenHeader`.
 *
 * Screens describe a header semantically — a title, an optional back action and
 * a list of actions — and each platform draws it in its own idiom: a Material 3
 * top app bar on Android, a Liquid Glass navigation bar on iOS.
 */

import type { IconName } from '@/constants/icons';

export type HeaderAction = {
  icon: IconName;
  /** Accessibility label; the icon carries the meaning visually. */
  label: string;
  onPress: () => void;
  /** Renders a count bubble on the action, e.g. cart contents. */
  badge?: number;
};

export type ScreenHeaderProps = {
  title: string;
  /**
   * Top-level screens use a large title. This is an iOS affordance — Android
   * top app bars keep a single title size, so the flag is ignored there.
   */
  large?: boolean;
  onBack?: () => void;
  actions?: HeaderAction[];
};
