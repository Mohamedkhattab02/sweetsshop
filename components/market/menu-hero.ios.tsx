/** iOS menu introduction: airy typography over a reactive Liquid Glass card. */

import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';

import { GlassSurface } from '@/components/ui/glass-surface';
import { AppIcon } from '@/components/ui/app-icon';
import { IOSColors } from '@/constants/ios-colors';

export function MenuHero() {
  return (
    <GlassSurface
      variant="clear"
      interactive
      tintColor="rgba(255, 149, 0, 0.13)"
      style={styles.container}>
      <View style={styles.glow} />
      <View style={styles.iconCircle}>
        <AppIcon name="sparkle" size={26} color={IOSColors.accent} />
      </View>
      <View style={styles.copy}>
        <Text style={styles.eyebrow}>NOUR SWEETS · SMALL BATCHES</Text>
        <Text style={styles.title}>A little piece of home</Text>
        <Text style={styles.subtitle}>Classic Arabic sweets, made fresh for sharing.</Text>
      </View>
    </GlassSurface>
  );
}

const styles = StyleSheet.create({
  container: {
    minHeight: 142,
    borderRadius: 28,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    overflow: 'hidden',
  },
  glow: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    right: -46,
    top: -56,
    backgroundColor: 'rgba(255, 149, 0, 0.14)',
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 149, 0, 0.16)',
  },
  copy: {
    flex: 1,
    gap: 4,
  },
  eyebrow: {
    color: IOSColors.accent,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  title: {
    color: IOSColors.label,
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: -0.4,
  },
  subtitle: {
    color: IOSColors.secondaryLabel,
    fontSize: 15,
    lineHeight: 20,
  },
});
