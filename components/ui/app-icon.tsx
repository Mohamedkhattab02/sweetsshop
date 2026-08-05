/**
 * Android / web icon renderer: Material Community Icons.
 *
 * The iOS build resolves `app-icon.ios.tsx` instead, which draws the same
 * semantic tokens as SF Symbols. Callers only ever name the meaning.
 */

import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import type { StyleProp, TextStyle } from 'react-native';

import { ICONS, type IconName, type IconToken } from '@/constants/icons';
import type { AppIconProps } from '@/components/ui/app-icon.types';

export type { AppIconProps };

const resolve = (name: IconName | IconToken): IconToken =>
  typeof name === 'string' ? ICONS[name] : name;

export function AppIcon({ name, size = 24, color, style }: AppIconProps) {
  return (
    <MaterialCommunityIcons
      name={resolve(name).md as never}
      size={size}
      color={color}
      style={style as StyleProp<TextStyle>}
    />
  );
}
