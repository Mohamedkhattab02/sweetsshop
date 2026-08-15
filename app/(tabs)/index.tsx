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
import { FlatList, Platform, StyleSheet, View } from 'react-native';
import { AnimatedFAB, Button, Text, useTheme } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useMemo, useState } from 'react';

import { CategoryFilter } from '@/components/market/category-filter';
import { MenuHero } from '@/components/market/menu-hero';
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
  const { itemCount, pendingOrderCount } = useCart();
  // iOS NativeTabs overlays the bottom of the route. Keep the floating action
  // button and the final product row above that system bar.
  const bottomTabClearance = Platform.OS === 'ios' ? Math.max(insets.bottom + 64, 96) : 0;
  // The route is registered in the root stack; this cast keeps navigation
  // working while Expo's generated typed-route file catches up with new files.
  const openOwnerInbox = () => router.navigate('/orders' as never);

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
        title="mahroum Sweets"
        large
        actions={[
          {
            icon: 'checkout',
            label:
              pendingOrderCount > 0
                ? `Open incoming orders, ${pendingOrderCount} waiting`
                : 'Open incoming orders',
            onPress: openOwnerInbox,
            badge: pendingOrderCount,
          },
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
          {
            paddingTop: headerInset + 8,
            paddingBottom:
              Platform.OS === 'ios' ? bottomTabClearance + 24 : insets.bottom + 96,
          },
        ]}
        showsVerticalScrollIndicator={false}
        // Collapse the FAB while scrolling so it never hides a product.
        onScroll={({ nativeEvent }) => setFabExtended(nativeEvent.contentOffset.y <= 8)}
        scrollEventThrottle={32}
        ListHeaderComponent={
          <View style={styles.header}>
            <View style={styles.headerPadded}>
              <MenuHero />
            </View>
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
                  ? `${visibleProducts.length} of ${products.length} sweets`
                  : `${products.length} sweets on today’s menu`}
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
              Try another sweet category, or add a new house favorite.
            </Text>
            <Button mode="contained-tonal" onPress={() => router.navigate('/add')}>
              Add a sweet
            </Button>
          </View>
        }
      />

      <AnimatedFAB
        icon={iconSource('plus')}
        label="Add a sweet"
        extended={fabExtended}
        onPress={() => router.navigate('/add')}
        accessibilityLabel="Add a new sweet to the menu"
        style={[styles.fab, { bottom: Platform.OS === 'ios' ? bottomTabClearance : insets.bottom + 16 }]}
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
