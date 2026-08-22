/**
 * iOS product card: a quiet Liquid Glass tile with native spacing, typography,
 * pressed-state motion, and a compact circular add control.
 */

import { Image } from 'expo-image';
import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';

import { AppIcon } from '@/components/ui/app-icon';
import { GlassSurface } from '@/components/ui/glass-surface';
import { formatPrice, getCategory } from '@/constants/market';
import { IOSColors } from '@/constants/ios-colors';
import { useCart } from '@/store/cart';
import type { Product } from '@/store/products';
import { useState } from 'react';

type Props = {
  product: Product;
  onPress?: () => void;
};

export function ProductCard({ product, onPress }: Props) {
  const [failed, setFailed] = useState(false);
  const { addToCart, getQuantity } = useCart();
  const category = getCategory(product.category);
  const inCart = getQuantity(product.id);
  const available = product.available && product.stockQuantity > 0;
  const showPlaceholder = !product.image || failed;

  return (
    <GlassSurface
      variant="regular"
      interactive
      tintColor={available ? 'rgba(255,255,255,0.08)' : 'rgba(118,118,128,0.12)'}
      style={styles.card}>
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={`${product.name}, ${formatPrice(product.price)}`}
        style={({ pressed }) => [styles.pressable, pressed && styles.pressed]}>
        <View className="bg-black/5" style={styles.imageWrapper}>
          {showPlaceholder ? (
            <View style={[styles.placeholder, !available && styles.unavailablePlaceholder]}>
              <AppIcon name={category.icon} size={38} color={IOSColors.secondaryLabel} />
            </View>
          ) : (
            <Image
              source={{ uri: product.image }}
              style={[styles.image, !available && styles.unavailableImage]}
              contentFit="cover"
              transition={220}
              accessibilityLabel={product.name}
              onError={() => setFailed(true)}
            />
          )}
          <View style={styles.badges}>
            {product.isNew ? <View style={styles.newBadge}><Text style={styles.badgeText}>New</Text></View> : null}
            {!available ? <View style={styles.soldBadge}><Text style={styles.soldText}>Sold out</Text></View> : null}
          </View>
        </View>

        <View className="gap-1" style={styles.content}>
          <Text style={styles.category}>{category.label.toUpperCase()}</Text>
          <Text style={styles.name} numberOfLines={2}>{product.name}</Text>
          {product.weight ? <Text style={styles.weight} numberOfLines={1}>{product.weight}</Text> : null}
          <View style={styles.footer}>
            <View style={styles.priceBlock}>
              <Text style={styles.price}>{formatPrice(product.price)}</Text>
              <Text style={styles.unit}>/ {product.unit}</Text>
            </View>
            <Pressable
              onPress={() => addToCart(product)}
              disabled={!available}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel={`Add ${product.name} to the cart`}
              style={({ pressed }) => [
                styles.addButton,
                !available && styles.disabledButton,
                pressed && styles.addPressed,
              ]}>
              <AppIcon name={inCart > 0 ? 'cartAdded' : 'cartAdd'} size={18} color="#FFFFFF" />
              {inCart > 0 ? <Text style={styles.cartCount}>{inCart}</Text> : null}
            </Pressable>
          </View>
        </View>
      </Pressable>
    </GlassSurface>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    borderRadius: 22,
    overflow: 'hidden',
  },
  pressable: {
    flex: 1,
  },
  pressed: {
    opacity: 0.72,
    transform: [{ scale: 0.985 }],
  },
  imageWrapper: {
    aspectRatio: 1,
    overflow: 'hidden',
    backgroundColor: 'rgba(118,118,128,0.12)',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  unavailableImage: {
    opacity: 0.48,
  },
  placeholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 149, 0, 0.10)',
  },
  unavailablePlaceholder: {
    opacity: 0.65,
  },
  badges: {
    position: 'absolute',
    top: 10,
    left: 10,
    right: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  newBadge: {
    borderRadius: 12,
    paddingHorizontal: 9,
    paddingVertical: 5,
    backgroundColor: IOSColors.accent,
  },
  soldBadge: {
    borderRadius: 12,
    paddingHorizontal: 9,
    paddingVertical: 5,
    backgroundColor: 'rgba(28,28,30,0.72)',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  soldText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },
  content: {
    padding: 13,
    gap: 4,
  },
  category: {
    color: IOSColors.secondaryLabel,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.7,
  },
  name: {
    color: IOSColors.label,
    fontSize: 16,
    lineHeight: 20,
    fontWeight: '700',
    minHeight: 40,
  },
  weight: {
    color: IOSColors.secondaryLabel,
    fontSize: 12,
    lineHeight: 16,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  priceBlock: {
    flexDirection: 'row',
    alignItems: 'baseline',
    flexShrink: 1,
  },
  price: {
    color: IOSColors.accent,
    fontSize: 17,
    fontWeight: '700',
  },
  unit: {
    color: IOSColors.secondaryLabel,
    fontSize: 11,
    marginLeft: 3,
  },
  addButton: {
    minWidth: 36,
    height: 36,
    borderRadius: 18,
    paddingHorizontal: 9,
    backgroundColor: IOSColors.accent,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },
  disabledButton: {
    backgroundColor: 'rgba(118,118,128,0.32)',
  },
  addPressed: {
    opacity: 0.65,
    transform: [{ scale: 0.92 }],
  },
  cartCount: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
});
