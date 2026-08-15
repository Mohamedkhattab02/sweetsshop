/**
 * Product detail — opened by tapping a card in the market grid.
 */

import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import {
  Button,
  Chip,
  Divider,
  IconButton,
  Snackbar,
  Text,
  useTheme,
} from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppIcon } from '@/components/ui/app-icon';
import { iconSource } from '@/components/ui/icon-source';
import { ScreenHeader, useScreenHeaderInset } from '@/components/ui/screen-header';
import { formatPrice, getCategory, getMarketStatus } from '@/constants/market';
import { MAX_QUANTITY_PER_LINE, useCart } from '@/store/cart';
import { useProducts } from '@/store/products';

export default function ProductDetailScreen() {
  const theme = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const headerInset = useScreenHeaderInset();
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
        <ScreenHeader title="Sweet" onBack={() => router.back()} />
        <View style={styles.missing}>
          <Text variant="titleMedium">This sweet is no longer on the menu.</Text>
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
  const maxAvailable = Math.min(MAX_QUANTITY_PER_LINE, product.stockQuantity);

  const handleAddToCart = () => {
    addToCart(product, quantity);
    setSnackbar(
      `${quantity} × ${product.name} ${quantity === 1 ? 'was' : 'were'} added to your cart.`
    );
    setQuantity(1);
  };

  return (
    <View style={[styles.screen, { backgroundColor: theme.colors.background }]}>
      <ScreenHeader
        title={product.name}
        onBack={() => router.back()}
        actions={[
          {
            icon: itemCount > 0 ? 'cartFilled' : 'cart',
            label: `Open the cart, ${itemCount} items`,
            onPress: () => router.navigate('/cart'),
            badge: itemCount,
          },
        ]}
      />

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: headerInset + 16, paddingBottom: insets.bottom + 32 },
        ]}>
        <View style={styles.heroWrapper}>
          {showPlaceholder ? (
            <View style={[styles.hero, { backgroundColor: theme.colors.secondaryContainer }]}>
              <AppIcon name={category.icon} size={72} color={theme.colors.onSecondaryContainer} />
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
            <Chip icon={iconSource(category.icon)} compact mode="flat">
              {category.label}
            </Chip>
            {product.isNew ? (
              <Chip icon={iconSource('sparkle')} compact mode="flat">
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

          {product.weight ? (
            <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
              {product.weight}
            </Text>
          ) : null}

          {product.description ? (
            <Text variant="bodyLarge" style={styles.description}>
              {product.description}
            </Text>
          ) : null}

          <Divider style={styles.divider} />

          <View style={styles.statusRow}>
            <AppIcon
              name={status.isOpen ? 'storeOpen' : 'storeClosed'}
              size={22}
              color={status.isOpen ? theme.colors.primary : theme.colors.error}
            />
            <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
              {status.message}
            </Text>
          </View>

          <View style={styles.statusRow}>
            <AppIcon
              name={product.available && product.stockQuantity > 0 ? 'checkCircle' : 'info'}
              size={22}
              color={product.available && product.stockQuantity > 0 ? theme.colors.primary : theme.colors.error}
            />
            <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
              {product.available && product.stockQuantity > 0
                ? `${product.stockQuantity} available for today`
                : 'Currently sold out — check back soon'}
            </Text>
          </View>

          {alreadyInCart > 0 ? (
            <View style={styles.statusRow}>
              <AppIcon name="cartAdded" size={22} color={theme.colors.primary} />
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
                icon={iconSource('minus')}
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
                icon={iconSource('plus')}
                mode="outlined"
                size={18}
                disabled={quantity >= maxAvailable}
                onPress={() =>
                  setQuantity((value) => Math.min(maxAvailable, value + 1))
                }
                accessibilityLabel="Increase quantity"
              />
            </View>
          </View>

          <Button
            mode="contained"
            icon={iconSource('cartAdd')}
            onPress={handleAddToCart}
            disabled={!product.available || product.stockQuantity <= 0}
            contentStyle={styles.ctaContent}
            style={styles.cta}>
            {`Add to cart · ${formatPrice(product.price * quantity)}`}
          </Button>

          <Button mode="text" icon={iconSource('store')} onPress={() => router.back()}>
            Keep browsing sweets
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
