/**
 * Upload a new product.
 *
 * Name, category, price and image are all required; inline errors appear once
 * the user has tried to submit, and the product is pushed straight into the
 * in-memory store so it shows up on the market page immediately.
 *
 * The form body is platform-split — Material 3 on Android, an inset-grouped
 * form on iOS — while `useAddProductForm` keeps the rules identical on both.
 * Each form paints its own background, so nothing iOS-only is imported here.
 */

import { StyleSheet, View } from 'react-native';
import { useTheme } from 'react-native-paper';

import { AddProductForm } from '@/components/market/add-product-form';
import { ScreenHeader } from '@/components/ui/screen-header';

export default function AddProductScreen() {
  const theme = useTheme();

  return (
    <View style={[styles.screen, { backgroundColor: theme.colors.background }]}>
      <ScreenHeader title="Add a product" large />
      <AddProductForm />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
});
