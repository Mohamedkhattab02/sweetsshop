/**
 * Product detail — opened by tapping a card in the market grid.
 */

import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import {
  Appbar,
  Button,
  Chip,
  Divider,
  IconButton,
  Snackbar,
  Text,
  useTheme,
} from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { formatPrice, getCategory, getMarketStatus } from '@/constants/market';
import { MAX_QUANTITY_PER_LINE, useCart } from '@/store/cart';
import { useProducts } from '@/store/products';

export default function ProductDetailScreen() {
  const theme = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getProductById } = useProducts();
  const { addToCart, getQuantity, itemCount } = useCart();
  const [failed, setFailed] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [snackbar, setSnackbar] = useState<string | null>(null);

  const product = getProductById(id);
  const status = getMarketStatus();

  if (!product) {
    return (
      <View style={[styles.screen, { backgroundColor: theme.colors.background }]}>
        <Appbar.Header elevated={false} style={{ backgroundColor: theme.colors.background }}>
          <Appbar.BackAction onPress={() => router.back()} />
          <Appbar.Content title="Product" />
        </Appbar.Header>
        <View style={styles.missing}>
          <Text variant="titleMedium">This product is no longer in the market.</Text>
          <Button mode="contained-tonal" onPress={() => router.back()}>
            Go back
          </Button>
        </View>
      </View>
    );
  }

  const category = getCategory(product.category);
  const showPlaceholder = !product.image || failed;
  const alreadyInCart = getQuantity(product.id);

  const handleAddToCart = () => {
    addToCart(product, quantity);
    setSnackbar(
      `${quantity} × ${product.name} ${quantity === 1 ? 'was' : 'were'} added to your cart.`
    );
    setQuantity(1);
  };

  return (
    <View style={[styles.screen, { backgroundColor: theme.colors.background }]}>
      <Appbar.Header elevated={false} style={{ backgroundColor: theme.colors.background }}>
        <Appbar.BackAction onPress={() => router.back()} accessibilityLabel="Back to the market" />
        <Appbar.Content title={product.name} />
        <Appbar.Action
          icon={itemCount > 0 ? 'cart' : 'cart-outline'}
          accessibilityLabel={`Open the cart, ${itemCount} items`}
          onPress={() => router.navigate('/cart')}
        />
      </Appbar.Header>

      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 32 }]}>
        <View style={styles.heroWrapper}>
          {showPlaceholder ? (
            <View style={[styles.hero, { backgroundColor: theme.colors.secondaryContainer }]}>
              <MaterialCommunityIcons
                name={category.icon as never}
                size={72}
                color={theme.colors.onSecondaryContainer}
              />
            </View>
          ) : (
            <Image
              source={{ uri: product.image }}
              style={styles.hero}
              contentFit="cover"
              transition={200}
              accessibilityLabel={product.name}
              onError={() => setFailed(true)}
            />
          )}
        </View>

        <View style={styles.body}>
          <View style={styles.chipRow}>
            <Chip icon={category.icon} compact mode="flat">
              {category.label}
            </Chip>
            {product.isNew ? (
              <Chip icon="star-four-points" compact mode="flat">
                Just added
              </Chip>
            ) : null}
          </View>

          <Text variant="headlineSmall">{product.name}</Text>

          <View style={styles.priceRow}>
            <Text variant="headlineMedium" style={{ color: theme.colors.primary }}>
              {formatPrice(product.price)}
            </Text>
            <Text variant="titleMedium" style={{ color: theme.colors.onSurfaceVariant }}>
              {` per ${product.unit}`}
            </Text>
          </View>

          {product.description ? (
            <Text variant="bodyLarge" style={styles.description}>
              {product.description}
            </Text>
          ) : null}

          <Divider style={styles.divider} />

          <View style={styles.statusRow}>
            <MaterialCommunityIcons
              name={status.isOpen ? 'store-check' : 'store-clock'}
              size={22}
              color={status.isOpen ? theme.colors.primary : theme.colors.error}
            />
            <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
              {status.message}
            </Text>
          </View>

          {alreadyInCart > 0 ? (
            <View style={styles.statusRow}>
              <MaterialCommunityIcons
                name="cart-check"
                size={22}
                color={theme.colors.primary}
              />
              <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                {`${alreadyInCart} already in your cart`}
              </Text>
            </View>
          ) : null}

          {/* ---------------------------- Quantity --------------------------- */}
          <View style={styles.quantityRow}>
            <Text variant="titleMedium">Quantity</Text>
            <View style={styles.stepper}>
              <IconButton
                icon="minus"
                mode="outlined"
                size={18}
                disabled={quantity <= 1}
                onPress={() => setQuantity((value) => Math.max(1, value - 1))}
                accessibilityLabel="Decrease quantity"
              />
              <Text variant="titleLarge" style={styles.quantityValue}>
                {quantity}
              </Text>
              <IconButton
                icon="plus"
                mode="outlined"
                size={18}
                disabled={quantity >= MAX_QUANTITY_PER_LINE}
                onPress={() =>
                  setQuantity((value) => Math.min(MAX_QUANTITY_PER_LINE, value + 1))
                }
                accessibilityLabel="Increase quantity"
              />
            </View>
          </View>

          <Button
            mode="contained"
            icon="cart-plus"
            onPress={handleAddToCart}
            contentStyle={styles.ctaContent}
            style={styles.cta}>
            {`Add to cart · ${formatPrice(product.price * quantity)}`}
          </Button>

          <Button mode="text" icon="storefront-outline" onPress={() => router.back()}>
            Keep shopping
          </Button>
        </View>
      </ScrollView>

      <Snackbar
        visible={snackbar !== null}
        onDismiss={() => setSnackbar(null)}
        duration={4000}
        action={{ label: 'View cart', onPress: () => router.navigate('/cart') }}>
        {snackbar}
      </Snackbar>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    gap: 20,
  },
  heroWrapper: {
    paddingHorizontal: 16,
  },
  hero: {
    width: '100%',
    aspectRatio: 1,
    maxHeight: 360,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    paddingHorizontal: 16,
    gap: 10,
  },
  missing: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    padding: 24,
  },
  chipRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  description: {
    marginTop: 4,
  },
  divider: {
    marginVertical: 8,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  quantityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityValue: {
    minWidth: 44,
    textAlign: 'center',
  },
  cta: {
    marginTop: 4,
  },
  ctaContent: {
    paddingVertical: 6,
  },
});
