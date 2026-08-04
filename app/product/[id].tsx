/**
 * Product detail — opened by tapping a card in the market grid.
 */

import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Appbar, Button, Chip, Divider, Text, useTheme } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { formatPrice, getCategory, getMarketStatus } from '@/constants/market';
import { useProducts } from '@/store/products';

export default function ProductDetailScreen() {
  const theme = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getProductById } = useProducts();
  const [failed, setFailed] = useState(false);

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

  return (
    <View style={[styles.screen, { backgroundColor: theme.colors.background }]}>
      <Appbar.Header elevated={false} style={{ backgroundColor: theme.colors.background }}>
        <Appbar.BackAction onPress={() => router.back()} accessibilityLabel="Back to the market" />
        <Appbar.Content title={product.name} />
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

          <Button
            mode="contained"
            icon="storefront-outline"
            onPress={() => router.back()}
            contentStyle={styles.ctaContent}
            style={styles.cta}>
            Back to the market
          </Button>
        </View>
      </ScrollView>
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
  cta: {
    marginTop: 12,
  },
  ctaContent: {
    paddingVertical: 6,
  },
});
