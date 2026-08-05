/**
 * Bridges our semantic icon tokens into React Native Paper's `icon` prop.
 *
 * Paper accepts a render function as an icon source, so routing it through
 * `AppIcon` means Paper buttons, chips and app bar actions pick up SF Symbols
 * on iOS and Material glyphs on Android without any call site knowing.
 */

import { AppIcon } from '@/components/ui/app-icon';
import type { IconName, IconToken } from '@/constants/icons';

export function iconSource(name: IconName | IconToken) {
  const PaperIcon = ({ size, color }: { size: number; color: string }) => (
    <AppIcon name={name} size={size} color={color} />
  );
  PaperIcon.displayName = 'PaperIcon';
  return PaperIcon;
}
