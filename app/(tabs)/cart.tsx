/**
 * The cart page — everything the customer has selected, with a summary bar
 * pinned above the tab bar that leads into checkout.
 */

import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { Appbar, Button, Dialog, Divider, Portal, Surface, Text, useTheme } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CartLineRow } from '@/components/market/cart-line-row';
import { formatPrice, getMarketStatus } from '@/constants/market';
import { useCart } from '@/store/cart';

export default function CartScreen() {
  const theme = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { lines, itemCount, subtotal, isEmpty, setQuantity, removeFromCart, clearCart } = useCart();
  const [confirmClear, setConfirmClear] = useState(false);

  const status = getMarketStatus();

  return (
    <View style={[styles.screen, { backgroundColor: theme.colors.background }]}>
      <Appbar.Header elevated={false} style={{ backgroundColor: theme.colors.background }}>
        {/* MD3 top app bars have no subtitle slot, so the item count goes in
            the title rather than a `subtitle` prop (which Paper ignores in v3). */}
        <Appbar.Content
          title={isEmpty ? 'Your cart' : `Your cart · ${itemCount}`}
        />
        {!isEmpty ? (
          <Appbar.Action
            icon="delete-sweep-outline"
            accessibilityLabel="Empty the cart"
            onPress={() => setConfirmClear(true)}
          />
        ) : null}
      </Appbar.Header>

      {isEmpty ? (
        <View style={styles.empty}>
          <MaterialCommunityIcons
            name="cart-outline"
            size={72}
            color={theme.colors.onSurfaceVariant}
          />
          <Text variant="titleMedium">Your cart is empty</Text>
          <Text
            variant="bodyMedium"
            style={[styles.emptyBody, { color: theme.colors.onSurfaceVariant }]}>
            Browse the market and tap the cart button on any product to add it here.
          </Text>
          <Button mode="contained" icon="storefront-outline" onPress={() => router.navigate('/')}>
            Browse the market
          </Button>
        </View>
      ) : (
        <>
          <FlatList
            data={lines}
            keyExtractor={(line) => line.product.id}
            contentContainerStyle={styles.listContent}
            ItemSeparatorComponent={() => <Divider />}
            renderItem={({ item }) => (
              <CartLineRow
                line={item}
                onChangeQuantity={(quantity) => setQuantity(item.product.id, quantity)}
                onRemove={() => removeFromCart(item.product.id)}
                onPress={() => router.push(`/product/${item.product.id}`)}
              />
            )}
          />

          <Surface
            elevation={3}
            style={[styles.summary, { paddingBottom: insets.bottom > 0 ? 12 : 16 }]}>
            <View style={styles.summaryRow}>
              <Text variant="bodyLarge" style={{ color: theme.colors.onSurfaceVariant }}>
                {`Total (${itemCount} ${itemCount === 1 ? 'item' : 'items'})`}
              </Text>
              <Text variant="headlineSmall" style={{ color: theme.colors.primary }}>
                {formatPrice(subtotal)}
              </Text>
            </View>

            {!status.isOpen ? (
              <View style={styles.notice}>
                <MaterialCommunityIcons
                  name="information-outline"
                  size={18}
                  color={theme.colors.onSurfaceVariant}
                />
                <Text
                  variant="bodySmall"
                  style={[styles.noticeText, { color: theme.colors.onSurfaceVariant }]}>
                  {`The market is closed right now — your order will be prepared when it reopens. ${status.message.replace('Closed · ', '')}.`}
                </Text>
              </View>
            ) : null}

            <Button
              mode="contained"
              icon="clipboard-check-outline"
              onPress={() => router.push('/checkout')}
              contentStyle={styles.checkoutContent}>
              Proceed to checkout
            </Button>
          </Surface>
        </>
      )}

      <Portal>
        <Dialog visible={confirmClear} onDismiss={() => setConfirmClear(false)}>
          <Dialog.Icon icon="delete-sweep-outline" />
          <Dialog.Title style={styles.dialogTitle}>Empty your cart?</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium">
              This removes all {itemCount} {itemCount === 1 ? 'item' : 'items'} from your cart.
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setConfirmClear(false)}>Keep them</Button>
            <Button
              onPress={() => {
                clearCart();
                setConfirmClear(false);
              }}>
              Empty cart
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    padding: 32,
  },
  emptyBody: {
    textAlign: 'center',
    marginBottom: 8,
  },
  summary: {
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 12,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  notice: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'flex-start',
  },
  noticeText: {
    flex: 1,
  },
  checkoutContent: {
    paddingVertical: 6,
  },
  dialogTitle: {
    textAlign: 'center',
  },
});
