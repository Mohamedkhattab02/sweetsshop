/** iOS menu introduction: an image-led Liquid Glass shop card. */

import { Image } from 'expo-image';
import { StyleSheet, Text, View } from 'react-native';

import { GlassSurface } from '@/components/ui/glass-surface';

const SHOP_HERO_IMAGE = require('../../assets/images/nour-sweets-shop-hero.png');

export function MenuHero() {
  return (
    <GlassSurface
      variant="clear"
      interactive
      tintColor="rgba(255, 149, 0, 0.06)"
      style={styles.container}>
      <Image
        source={SHOP_HERO_IMAGE}
        contentFit="cover"
        accessibilityLabel="Nour Sweets Arabic sweets shop"
        style={styles.image}
      />
      <View style={styles.overlay} />
      <View className="absolute inset-0 justify-end p-5">
        <Text style={styles.eyebrow}>NOUR SWEETS · SMALL BATCHES</Text>
        <Text style={styles.title}>Made for sharing</Text>
        <Text style={styles.subtitle}>Levantine classics, prepared fresh today.</Text>
      </View>
    </GlassSurface>
  );
}

const styles = StyleSheet.create({
  container: {
    minHeight: 182,
    borderRadius: 28,
    overflow: 'hidden',
    position: 'relative',
  },
  image: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: 'rgba(20, 12, 4, 0.28)',
  },
  eyebrow: {
    color: 'rgba(255,255,255,0.82)',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.4,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 27,
    fontWeight: '700',
    letterSpacing: -0.4,
    marginTop: 4,
  },
  subtitle: {
    color: 'rgba(255,255,255,0.86)',
    fontSize: 15,
    lineHeight: 20,
    marginTop: 3,
  },
});
