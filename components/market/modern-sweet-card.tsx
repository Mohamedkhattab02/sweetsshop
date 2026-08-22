import { Image } from 'expo-image';
import { useState } from 'react';
import { Platform, StyleSheet, Text, View, useWindowDimensions, type GestureResponderEvent } from 'react-native';

import { AppIcon } from '@/components/ui/app-icon';
import { GSPressable } from '@/components/ui/gluestack';
import { colors, radii, shadow } from '@/constants/design';
import { formatPrice, getCategory } from '@/constants/market';
import { useCart } from '@/store/cart';
import type { Product } from '@/store/products';

type Props = {
  product: Product;
  onPress: () => void;
  compact?: boolean;
};

export function ModernSweetCard({ product, onPress, compact = false }: Props) {
  const { width } = useWindowDimensions();
  const [failed, setFailed] = useState(false);
  const [hovered, setHovered] = useState(false);
  const { addToCart, getQuantity } = useCart();
  const category = getCategory(product.category);
  const inCart = getQuantity(product.id);
  const cardWidth = compact ? Math.min(width * 0.43, Platform.OS === 'web' ? 220 : 190) : Platform.OS === 'web' ? undefined : (width - 48) / 2;

  return (
    <GSPressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Open ${product.name}`}
      className="active:opacity-80"
      onHoverIn={() => setHovered(true)}
      onHoverOut={() => setHovered(false)}
      style={[styles.card, compact && styles.compactCard, shadow.card, hovered && Platform.OS === 'web' && styles.cardHovered, cardWidth ? { width: cardWidth } : null] as never}>
      <View style={styles.imageWrap}>
        {product.image && !failed ? (
          <Image
            source={{ uri: product.image }}
            style={StyleSheet.absoluteFill}
            contentFit="cover"
            transition={220}
            onError={() => setFailed(true)}
            accessibilityLabel={product.name}
          />
        ) : (
          <View style={[styles.placeholder, { backgroundColor: colors.sage }]}>
            <AppIcon name={category.icon} size={38} color={colors.ink} />
          </View>
        )}

        <View style={styles.badgeRow}>
          {product.isNew ? (
            <View style={[styles.badge, { backgroundColor: colors.coral }]}>
              <Text style={styles.badgeText}>NEW</Text>
            </View>
          ) : null}
          {!product.available ? (
            <View style={[styles.badge, { backgroundColor: colors.ink }]}>
              <Text style={styles.badgeText}>SOLD OUT</Text>
            </View>
          ) : null}
        </View>

        <GSPressable
          onPress={(event: GestureResponderEvent) => {
            event.stopPropagation();
            addToCart(product);
          }}
          disabled={!product.available || product.stockQuantity < 1}
          accessibilityRole="button"
          accessibilityLabel={`Add ${product.name} to cart`}
          className="active:scale-95"
          style={[styles.addButton, !product.available && styles.disabledButton] as never}>
          <AppIcon name={inCart > 0 ? 'cartAdded' : 'plus'} size={18} color={colors.white} />
          {inCart > 0 ? (
            <View style={styles.countBubble}>
              <Text style={styles.countText}>{inCart}</Text>
            </View>
          ) : null}
        </GSPressable>
      </View>

      <View style={styles.content}>
        <Text numberOfLines={1} style={styles.category}>
          {category.label}
        </Text>
        <Text numberOfLines={2} style={styles.name}>
          {product.name}
        </Text>
        <View style={styles.priceRow}>
          <Text style={styles.price}>{formatPrice(product.price)}</Text>
          <Text style={styles.unit}>/{product.unit}</Text>
        </View>
      </View>
    </GSPressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: radii.card,
    padding: 8,
    overflow: 'hidden',
  },
  compactCard: {
    flexGrow: 0,
    flexShrink: 0,
  },
  cardHovered: {
    transform: [{ translateY: -5 }],
    shadowOpacity: 0.16,
    shadowRadius: 28,
    shadowOffset: { width: 0, height: 16 },
  },
  imageWrap: {
    aspectRatio: 1.06,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: colors.cloud,
    position: 'relative',
  },
  placeholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeRow: {
    position: 'absolute',
    left: 10,
    top: 10,
    flexDirection: 'row',
    gap: 5,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: radii.pill,
  },
  badgeText: {
    color: colors.white,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  addButton: {
    position: 'absolute',
    right: 10,
    bottom: 10,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledButton: {
    opacity: 0.45,
  },
  countBubble: {
    position: 'absolute',
    top: -5,
    right: -5,
    minWidth: 18,
    height: 18,
    paddingHorizontal: 4,
    borderRadius: 9,
    backgroundColor: colors.coral,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countText: {
    color: colors.white,
    fontSize: 10,
    fontWeight: '800',
  },
  content: {
    paddingHorizontal: 5,
    paddingTop: 12,
    paddingBottom: 6,
  },
  category: {
    color: colors.inkSoft,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.7,
    textTransform: 'uppercase',
  },
  name: {
    color: colors.ink,
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 20,
    minHeight: 40,
    marginTop: 4,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: 6,
  },
  price: {
    color: colors.coralDark,
    fontSize: 16,
    fontWeight: '800',
  },
  unit: {
    color: colors.inkSoft,
    fontSize: 11,
    marginLeft: 3,
  },
});
