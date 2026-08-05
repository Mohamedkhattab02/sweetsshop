/**
 * Android / web: there is no Liquid Glass, and imitating it would look wrong
 * next to the rest of the system. Material 3 says a tonal, elevated surface,
 * so that is what this renders.
 *
 * iOS resolves `glass-surface.ios.tsx` instead.
 */

import { Surface } from 'react-native-paper';

import type { GlassSurfaceProps } from '@/components/ui/glass-surface.types';

export type { GlassSurfaceProps };

/** iOS-only capability, referenced by screens that adapt their layout. */
export const supportsLiquidGlass = false;

export function GlassSurface({
  children,
  style,
  androidElevation = 2,
  androidBackgroundColor,
}: GlassSurfaceProps) {
  return (
    <Surface
      elevation={androidElevation}
      style={[androidBackgroundColor ? { backgroundColor: androidBackgroundColor } : null, style]}>
      {children}
    </Surface>
  );
}
