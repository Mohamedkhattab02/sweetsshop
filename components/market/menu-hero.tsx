/**
 * Android / web menu introduction.
 *
 * The hero is intentionally image-led: the shop itself communicates the
 * Arabic sweets experience better than a block of marketing copy.
 */

import { Image } from 'expo-image';
import { StyleSheet, Text, View } from 'react-native';
import { Surface, useTheme } from 'react-native-paper';

const SHOP_HERO_IMAGE = require('../../assets/images/nour-sweets-shop-hero.png');

export function MenuHero() {
  const theme = useTheme();

  return (
    <Surface
      elevation={1}
      style={[styles.container, { backgroundColor: theme.colors.primaryContainer }]}
      accessible
      accessibilityLabel="Nour Sweets Arabic sweets shop">
      <Image source={SHOP_HERO_IMAGE} contentFit="cover" style={styles.image} />
      <View style={styles.overlay} />
      <View className="absolute inset-0 justify-end p-5">
        <Text className="text-xs font-bold uppercase tracking-[1.5px] text-white/80">
          NOUR SWEETS · SMALL BATCHES
        </Text>
        <Text className="mt-1 text-2xl font-bold text-white">Made for sharing</Text>
        <Text className="mt-1 text-sm text-white/85">
          Levantine classics, prepared fresh today.
        </Text>
      </View>
    </Surface>
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
    backgroundColor: 'rgba(34, 20, 8, 0.08)',
  },
});
