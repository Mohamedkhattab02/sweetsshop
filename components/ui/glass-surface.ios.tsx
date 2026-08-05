/**
 * iOS: Liquid Glass.
 *
 * Three tiers, best first:
 *   1. iOS 26+ — a real `GlassView`, the system Liquid Glass material that
 *      refracts and specular-highlights whatever scrolls beneath it.
 *   2. Older iOS — `BlurView` with a system material. Not Liquid Glass, but
 *      still the native vibrancy look rather than a flat Material card.
 *   3. Reduce Transparency turned on — a solid fill, because the user has
 *      asked the system for exactly that.
 *
 * `isGlassEffectAPIAvailable` is checked alongside `isLiquidGlassAvailable`
 * because some iOS 26 betas ship the design without the API and crash on use.
 */

import { BlurView } from 'expo-blur';
import { GlassView, isGlassEffectAPIAvailable, isLiquidGlassAvailable } from 'expo-glass-effect';
import { useEffect, useState } from 'react';
import { AccessibilityInfo, StyleSheet, View, useColorScheme } from 'react-native';

import type { GlassSurfaceProps } from '@/components/ui/glass-surface.types';

export type { GlassSurfaceProps };

export const supportsLiquidGlass = isLiquidGlassAvailable() && isGlassEffectAPIAvailable();

export function GlassSurface({
  children,
  style,
  variant = 'regular',
  tintColor,
  interactive = false,
}: GlassSurfaceProps) {
  const scheme = useColorScheme();
  const [reduceTransparency, setReduceTransparency] = useState(false);

  useEffect(() => {
    let active = true;
    AccessibilityInfo.isReduceTransparencyEnabled().then((enabled) => {
      if (active) setReduceTransparency(enabled);
    });
    const subscription = AccessibilityInfo.addEventListener(
      'reduceTransparencyChanged',
      setReduceTransparency
    );
    return () => {
      active = false;
      subscription.remove();
    };
  }, []);

  if (reduceTransparency) {
    const solid = scheme === 'dark' ? '#1C1C1E' : '#F2F2F7';
    return <View style={[{ backgroundColor: tintColor ?? solid }, style]}>{children}</View>;
  }

  if (supportsLiquidGlass) {
    return (
      <GlassView
        glassEffectStyle={variant}
        tintColor={tintColor}
        isInteractive={interactive}
        style={style}>
        {children}
      </GlassView>
    );
  }

  return (
    <BlurView
      intensity={variant === 'clear' ? 40 : 70}
      tint={scheme === 'dark' ? 'systemThickMaterialDark' : 'systemThickMaterialLight'}
      // Blur does not clip to a border radius on its own.
      style={[styles.clipped, style]}>
      {tintColor ? <View style={[StyleSheet.absoluteFill, { backgroundColor: tintColor }]} /> : null}
      {children}
    </BlurView>
  );
}

const styles = StyleSheet.create({
  clipped: {
    overflow: 'hidden',
  },
});
