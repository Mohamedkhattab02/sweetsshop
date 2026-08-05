/**
 * iOS icon renderer: SF Symbols.
 *
 * Using Apple's own symbol set — rather than Material glyphs — is the single
 * cheapest thing that makes the app read as native on iOS, since these are the
 * exact shapes the rest of the system draws.
 */

import { SymbolView } from 'expo-symbols';

import { ICONS, type IconName, type IconToken } from '@/constants/icons';
import type { AppIconProps } from '@/components/ui/app-icon.types';

export type { AppIconProps };

const resolve = (name: IconName | IconToken): IconToken =>
  typeof name === 'string' ? ICONS[name] : name;

export function AppIcon({ name, size = 24, color, style }: AppIconProps) {
  return (
    <SymbolView
      name={resolve(name).sf}
      size={size}
      tintColor={color}
      type="monochrome"
      weight="semibold"
      // SymbolView is a plain view, so it needs an explicit box to lay out in.
      style={[{ width: size, height: size }, style]}
    />
  );
}
