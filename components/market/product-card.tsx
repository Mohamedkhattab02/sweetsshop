/**
 * A single product tile in the market grid — a Material 3 outlined card.
 *
 * The image falls back to a tinted category glyph when it is missing or fails
 * to load, so uploaded products and offline runs still render cleanly.
 */

import { Image } from 'expo-image';
import { useState } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { Badge, Card, IconButton, Text, useTheme } from 'react-native-paper';

import { AppIcon } from '@/components/ui/app-icon';
import { iconSource } from '@/components/ui/icon-source';
import { formatPrice, getCategory } from '@/constants/market';
import { useCart } from '@/store/cart';
import type { Product } from '@/store/products';

type Props = {
  product: Product;
  onPress?: () => void;
};

export function ProductCard({ product, onPress }: Props) {
  const theme = useTheme();
  const [failed, setFailed] = useState(false);
  const { addToCart, getQuantity } = useCart();
  const category = getCategory(product.category);
  const showPlaceholder = !product.image || failed;
  const inCart = getQuantity(product.id);

  return (
    // iOS groups content into soft-cornered, borderless cards; Material 3 uses
    // an outline. Same component, each platform's shape language.
    <Card mode={Platform.OS === 'ios' ? 'elevated' : 'outlined'} style={styles.card} onPress={onPress}>
      <View style={styles.imageWrapper}>
        {showPlaceholder ? (
          <View
            style={[styles.placeholder, { backgroundColor: theme.colors.secondaryContainer }]}
            accessible
            accessibilityLabel={`${category.label} product image placeholder`}>
            <AppIcon
              name={category.icon}
              size={44}
              color={theme.colors.onSecondaryContainer}
            />
          </View>
        ) : (
          <Image
            source={{ uri: product.image }}
            style={styles.image}
            contentFit="cover"
            transition={200}
            accessibilityLabel={product.name}
            onError={() => setFailed(true)}
          />
        )}

        {product.isNew ? (
          <Badge
            style={[
              styles.badge,
              { backgroundColor: theme.colors.primary, color: theme.colors.onPrimary },
            ]}
            size={22}>
            New
          </Badge>
        ) : null}
      </View>

      <Card.Content style={styles.content}>
        <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>
          {category.label.toUpperCase()}
        </Text>
        <Text variant="titleSmall" numberOfLines={2} style={styles.name}>
          {product.name}
        </Text>
        <View style={styles.priceRow}>
          <View style={styles.priceText}>
            <Text variant="titleMedium" style={{ color: theme.colors.primary }}>
              {formatPrice(product.price)}
            </Text>
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
              {` / ${product.unit}`}
            </Text>
          </View>

          <View>
            <IconButton
              icon={iconSource(inCart > 0 ? 'cartAdded' : 'cartAdd')}
              mode="contained-tonal"
              size={18}
              style={styles.cartButton}
              onPress={() => addToCart(product)}
              accessibilityLabel={
                inCart > 0
                  ? `Add another ${product.name} to the cart. ${inCart} already in the cart.`
                  : `Add ${product.name} to the cart`
              }
            />
            {inCart > 0 ? (
              <Badge
                size={18}
                style={[
                  styles.cartBadge,
                  { backgroundColor: theme.colors.primary, color: theme.colors.onPrimary },
                ]}>
                {inCart}
              </Badge>
            ) : null}
          </View>
        </View>
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    overflow: 'hidden',
  },
  imageWrapper: {
    width: '100%',
    aspectRatio: 1,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: 8,
    right: 8,
    paddingHorizontal: 8,
  },
  content: {
    paddingTop: 10,
    paddingBottom: 14,
    gap: 2,
  },
  name: {
    minHeight: 38,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 2,
  },
  priceText: {
    flexDirection: 'row',
    alignItems: 'baseline',
    flexShrink: 1,
  },
  cartButton: {
    margin: 0,
  },
  cartBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
  },
});
