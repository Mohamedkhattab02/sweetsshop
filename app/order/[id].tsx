/**
 * Order confirmation, shown after checkout.
 *
 * The cart has already been emptied by this point, so this screen reads the
 * order out of the order history by id.
 */

import { useLocalSearchParams, useRouter } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Button, Divider, Surface, Text, useTheme } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppIcon } from '@/components/ui/app-icon';
import { iconSource } from '@/components/ui/icon-source';
import { ScreenHeader, useScreenHeaderInset } from '@/components/ui/screen-header';
import type { IconName } from '@/constants/icons';
import { formatPrice, getMarketStatus } from '@/constants/market';
import { useCart } from '@/store/cart';

export default function OrderConfirmationScreen() {
  const theme = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const headerInset = useScreenHeaderInset();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getOrderById } = useCart();

  const order = getOrderById(id);
  const status = getMarketStatus();

  if (!order) {
    return (
      <View style={[styles.screen, { backgroundColor: theme.colors.background }]}>
        <ScreenHeader
          title="Order"
          actions={[{ icon: 'close', label: 'Close', onPress: () => router.navigate('/') }]}
        />
        <View style={[styles.missing, { paddingTop: headerInset }]}>
          <Text variant="titleMedium">We could not find that order.</Text>
          <Button mode="contained-tonal" onPress={() => router.navigate('/')}>
            Back to the menu
          </Button>
        </View>
      </View>
    );
  }

  const { customer } = order;
  const placedAt = new Date(order.placedAt);

  return (
    <View style={[styles.screen, { backgroundColor: theme.colors.background }]}>
      <ScreenHeader
        title="Order confirmed"
        actions={[
          {
            icon: 'close',
            label: 'Close and return to the menu',
            onPress: () => router.navigate('/'),
          },
        ]}
      />

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: headerInset + 16, paddingBottom: insets.bottom + 32 },
        ]}>
        <View style={styles.hero}>
          <View style={[styles.checkCircle, { backgroundColor: theme.colors.primaryContainer }]}>
            <AppIcon name="check" size={48} color={theme.colors.onPrimaryContainer} />
          </View>
          <Text variant="headlineSmall" style={styles.centered}>
            Thanks, {customer.name.split(' ')[0]}!
          </Text>
          <Text
            variant="bodyMedium"
            style={[styles.centered, { color: theme.colors.onSurfaceVariant }]}>
            {status.isOpen
              ? 'Your sweets order is with our kitchen. We will call to confirm it shortly.'
              : `The shop is closed right now, so we will start your order when it reopens. ${status.message.replace('Closed · ', '')}.`}
          </Text>
          <Surface
            elevation={0}
            style={[styles.reference, { backgroundColor: theme.colors.secondaryContainer }]}>
            <Text variant="labelLarge" style={{ color: theme.colors.onSecondaryContainer }}>
              Order {order.reference}
            </Text>
          </Surface>
        </View>

        {/* ------------------------------ Items ----------------------------- */}
        <Surface
          elevation={0}
          style={[styles.card, { backgroundColor: theme.colors.surfaceVariant }]}>
          <Text variant="titleMedium">
            {`${order.itemCount} ${order.itemCount === 1 ? 'item' : 'items'}`}
          </Text>
          {order.lines.map((line) => (
            <View key={line.product.id} style={styles.line}>
              <Text variant="bodyMedium" style={styles.lineName} numberOfLines={1}>
                {`${line.quantity} × ${line.product.name}`}
              </Text>
              <Text variant="bodyMedium">{formatPrice(line.product.price * line.quantity)}</Text>
            </View>
          ))}
          <Divider style={styles.divider} />
          <View style={styles.line}>
            <Text variant="titleMedium">Total</Text>
            <Text variant="titleLarge" style={{ color: theme.colors.primary }}>
              {formatPrice(order.total)}
            </Text>
          </View>
        </Surface>

        {/* ----------------------------- Details ---------------------------- */}
        <Surface
          elevation={0}
          style={[styles.card, { backgroundColor: theme.colors.surfaceVariant }]}>
          <Text variant="titleMedium">
            {customer.address ? 'Delivery details' : 'Collection details'}
          </Text>

          <DetailRow icon="person" label="Name" value={customer.name} />
          <DetailRow icon="phone" label="Phone" value={customer.phone} />
          <DetailRow
            icon="address"
            label={customer.address ? 'Address' : 'Collection'}
            value={customer.address ?? 'Collect at Nour Sweets'}
          />
          <DetailRow
            icon="clock"
            label="Placed"
            value={placedAt.toLocaleString(undefined, {
              dateStyle: 'medium',
              timeStyle: 'short',
            })}
          />
        </Surface>

        <Button
          mode="contained"
          icon={iconSource('store')}
          onPress={() => router.navigate('/')}
          contentStyle={styles.ctaContent}
          style={styles.cta}>
          Back to the menu
        </Button>
      </ScrollView>
    </View>
  );
}

function DetailRow({ icon, label, value }: { icon: IconName; label: string; value: string }) {
  const theme = useTheme();
  return (
    <View style={styles.detailRow}>
      <AppIcon
        name={icon}
        size={20}
        color={theme.colors.onSurfaceVariant}
        style={styles.detailIcon}
      />
      <View style={styles.detailText}>
        <Text variant="labelMedium" style={{ color: theme.colors.onSurfaceVariant }}>
          {label}
        </Text>
        <Text variant="bodyLarge">{value}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    padding: 16,
    gap: 16,
  },
  missing: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    padding: 24,
  },
  hero: {
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
  },
  checkCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  centered: {
    textAlign: 'center',
  },
  reference: {
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginTop: 4,
  },
  card: {
    borderRadius: 20,
    padding: 16,
    gap: 10,
  },
  line: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  lineName: {
    flex: 1,
  },
  divider: {
    marginVertical: 2,
  },
  detailRow: {
    flexDirection: 'row',
    gap: 12,
  },
  detailIcon: {
    marginTop: 4,
  },
  detailText: {
    flex: 1,
  },
  cta: {
    marginTop: 4,
  },
  ctaContent: {
    paddingVertical: 6,
  },
});
