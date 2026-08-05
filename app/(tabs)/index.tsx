/**
 * Main page — the market itself.
 *
 * Top to bottom: the navigation bar, the opening-hours banner, the multi-select
 * category filter, and the product grid for whatever categories are selected.
 *
 * On iOS the header is a floating Liquid Glass bar, so the grid scrolls
 * underneath it and the list is offset by `useScreenHeaderInset()`. On Android
 * the Material top app bar is opaque and in flow, and that inset is 0.
 */

import { useRouter } from 'expo-router';
import { FlatList, StyleSheet, View } from 'react-native';
import { AnimatedFAB, Button, Text, useTheme } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useMemo, useState } from 'react';

import { CategoryFilter } from '@/components/market/category-filter';
import { OpenHoursCard } from '@/components/market/open-hours-card';
import { ProductCard } from '@/components/market/product-card';
import { iconSource } from '@/components/ui/icon-source';
import { ScreenHeader, useScreenHeaderInset } from '@/components/ui/screen-header';
import { useCart } from '@/store/cart';
import { useProducts, type Product } from '@/store/products';

/** Grid cells are `flex: 1`, so an odd count needs a filler to stop the last
 *  card stretching across the full row. */
const FILLER = 'grid-filler' as const;
type GridItem = Product | typeof FILLER;

export default function MarketScreen() {
  const theme = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const headerInset = useScreenHeaderInset(true);
  const [fabExtended, setFabExtended] = useState(true);
  const { itemCount } = useCart();

  const {
    visibleProducts,
    selectedCategories,
    toggleCategory,
    clearCategories,
    countByCategory,
    products,
  } = useProducts();

  const isFiltered = selectedCategories.length > 0;

  const gridData = useMemo<GridItem[]>(
    () =>
      visibleProducts.length % 2 === 1 ? [...visibleProducts, FILLER] : [...visibleProducts],
    [visibleProducts]
  );

  return (
    <View style={[styles.screen, { backgroundColor: theme.colors.background }]}>
      <ScreenHeader
        title="Green Lane Market"
        large
        actions={[
          {
            icon: itemCount > 0 ? 'cartFilled' : 'cart',
            label: itemCount > 0 ? `Open the cart, ${itemCount} items` : 'Open the cart, empty',
            onPress: () => router.navigate('/cart'),
            badge: itemCount,
          },
        ]}
      />

      <FlatList
        data={gridData}
        keyExtractor={(item, index) => (item === FILLER ? `filler-${index}` : item.id)}
        numColumns={2}
        columnWrapperStyle={styles.column}
        contentContainerStyle={[
          styles.listContent,
          { paddingTop: headerInset + 8, paddingBottom: insets.bottom + 96 },
        ]}
        showsVerticalScrollIndicator={false}
        // Collapse the FAB while scrolling so it never hides a product.
        onScroll={({ nativeEvent }) => setFabExtended(nativeEvent.contentOffset.y <= 8)}
        scrollEventThrottle={32}
        ListHeaderComponent={
          <View style={styles.header}>
            <View style={styles.headerPadded}>
              <OpenHoursCard />
            </View>

            <CategoryFilter
              selected={selectedCategories}
              onToggle={toggleCategory}
              onClear={clearCategories}
              counts={countByCategory}
            />

            <View style={[styles.headerPadded, styles.resultRow]}>
              <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                {isFiltered
                  ? `${visibleProducts.length} of ${products.length} products`
                  : `${products.length} products in the market`}
              </Text>
              {isFiltered ? (
                <Button compact mode="text" onPress={clearCategories}>
                  Clear filter
                </Button>
              ) : null}
            </View>
          </View>
        }
        renderItem={({ item }) =>
          item === FILLER ? (
            <View style={styles.filler} />
          ) : (
            <ProductCard product={item} onPress={() => router.push(`/product/${item.id}`)} />
          )
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text variant="titleMedium" style={styles.emptyTitle}>
              Nothing in these categories yet
            </Text>
            <Text
              variant="bodyMedium"
              style={[styles.emptyBody, { color: theme.colors.onSurfaceVariant }]}>
              Pick different categories, or add the first product yourself.
            </Text>
            <Button mode="contained-tonal" onPress={() => router.navigate('/add')}>
              Add a product
            </Button>
          </View>
        }
      />

      <AnimatedFAB
        icon={iconSource('plus')}
        label="Add product"
        extended={fabExtended}
        onPress={() => router.navigate('/add')}
        accessibilityLabel="Add a new product to the market"
        style={[styles.fab, { bottom: insets.bottom + 16 }]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 16,
  },
  header: {
    gap: 20,
    marginBottom: 16,
    // Cancel the list padding so the chip row can scroll edge to edge.
    marginHorizontal: -16,
  },
  headerPadded: {
    paddingHorizontal: 16,
  },
  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 36,
  },
  column: {
    gap: 12,
    marginBottom: 12,
  },
  filler: {
    flex: 1,
  },
  empty: {
    alignItems: 'center',
    gap: 8,
    paddingVertical: 48,
    paddingHorizontal: 24,
  },
  emptyTitle: {
    textAlign: 'center',
  },
  emptyBody: {
    textAlign: 'center',
    marginBottom: 8,
  },
  fab: {
    position: 'absolute',
    right: 16,
  },
});
