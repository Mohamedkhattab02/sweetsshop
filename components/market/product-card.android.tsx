/**
 * Android product card: Material 3 elevated surface with clear content
 * hierarchy, a tonal add action, and a strong disabled state for stock.
 */

import { Image } from 'expo-image';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Badge, Card, IconButton, Surface, Text, useTheme } from 'react-native-paper';

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
  const inCart = getQuantity(product.id);
  const available = product.available && product.stockQuantity > 0;
  const showPlaceholder = !product.image || failed;

  return (
    <Card mode="elevated" style={styles.card} onPress={onPress} accessible accessibilityLabel={product.name}>
      <View className="bg-[#F1E8E1]" style={styles.imageWrapper}>
        {showPlaceholder ? (
          <View style={[styles.placeholder, { backgroundColor: theme.colors.secondaryContainer }]}>
            <AppIcon name={category.icon} size={44} color={theme.colors.onSecondaryContainer} />
          </View>
        ) : (
          <Image
            source={{ uri: product.image }}
            style={[styles.image, !available && styles.unavailableImage]}
            contentFit="cover"
            transition={200}
            accessibilityLabel={product.name}
            onError={() => setFailed(true)}
          />
        )}
        <View style={styles.badges}>
          {product.isNew ? (
            <Badge size={22} style={[styles.badge, { backgroundColor: theme.colors.primary }]}>
              New
            </Badge>
          ) : null}
          {!available ? (
            <Badge size={22} style={[styles.badge, { backgroundColor: theme.colors.error }]}>
              Sold out
            </Badge>
          ) : null}
        </View>
      </View>

      <Card.Content className="gap-1" style={styles.content}>
        <Text variant="labelSmall" style={{ color: theme.colors.primary }}>
          {category.label.toUpperCase()}
        </Text>
        <Text variant="titleMedium" numberOfLines={2} style={styles.name}>
          {product.name}
        </Text>
        {product.weight ? (
          <Text variant="bodySmall" numberOfLines={1} style={{ color: theme.colors.onSurfaceVariant }}>
            {product.weight}
          </Text>
        ) : null}
        <View style={styles.footer}>
          <View style={styles.priceBlock}>
            <Text variant="titleMedium" style={{ color: theme.colors.primary }}>
              {formatPrice(product.price)}
            </Text>
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
              {` / ${product.unit}`}
            </Text>
          </View>
          <Surface elevation={0} style={[styles.actionSurface, { backgroundColor: theme.colors.secondaryContainer }]}>
            <IconButton
              icon={iconSource(inCart > 0 ? 'cartAdded' : 'cartAdd')}
              size={20}
              iconColor={available ? theme.colors.onSecondaryContainer : theme.colors.onSurfaceDisabled}
              onPress={() => addToCart(product)}
              disabled={!available}
              accessibilityLabel={`Add ${product.name} to the cart`}
              style={styles.action}
            />
            {inCart > 0 ? (
              <Badge size={17} style={[styles.cartBadge, { backgroundColor: theme.colors.primary }]}>
                {inCart}
              </Badge>
            ) : null}
          </Surface>
        </View>
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    borderRadius: 20,
    overflow: 'hidden',
  },
  imageWrapper: {
    width: '100%',
    aspectRatio: 0.98,
    backgroundColor: '#F1E8E1',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  unavailableImage: {
    opacity: 0.52,
  },
  placeholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badges: {
    position: 'absolute',
    top: 8,
    left: 8,
    right: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  badge: {
    paddingHorizontal: 7,
  },
  content: {
    paddingTop: 12,
    paddingBottom: 14,
    gap: 4,
  },
  name: {
    minHeight: 48,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 5,
  },
  priceBlock: {
    flexDirection: 'row',
    alignItems: 'baseline',
    flexShrink: 1,
  },
  actionSurface: {
    width: 40,
    height: 40,
    borderRadius: 20,
    position: 'relative',
  },
  action: {
    margin: 0,
  },
  cartBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
  },
});
