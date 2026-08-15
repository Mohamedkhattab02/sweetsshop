import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Button, Chip, Divider, Surface, Text, useTheme } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppIcon } from '@/components/ui/app-icon';
import { iconSource } from '@/components/ui/icon-source';
import { ScreenHeader, useScreenHeaderInset } from '@/components/ui/screen-header';
import { formatPrice } from '@/constants/market';
import type { Order, OrderStatus } from '@/store/cart';
import { useCart } from '@/store/cart';

const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'Waiting for approval',
  accepted: 'Accepted',
  preparing: 'In preparation',
  ready: 'Ready for collection',
  completed: 'Completed',
  declined: 'Declined',
};

const NEXT_STATUS: Partial<Record<OrderStatus, { status: OrderStatus; label: string }>> = {
  accepted: { status: 'preparing', label: 'Start preparing' },
  preparing: { status: 'ready', label: 'Mark ready' },
  ready: { status: 'completed', label: 'Mark completed' },
};

export default function IncomingOrdersScreen() {
  const theme = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const headerInset = useScreenHeaderInset();
  const { orders, pendingOrderCount, updateOrderStatus } = useCart();

  return (
    <View style={[styles.screen, { backgroundColor: theme.colors.background }]}>
      <ScreenHeader
        title="Incoming orders"
        actions={[{ icon: 'close', label: 'Close', onPress: () => router.navigate('/') }]}
      />

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: headerInset + 16, paddingBottom: insets.bottom + 32 },
        ]}
        showsVerticalScrollIndicator={false}>
        <Surface
          elevation={0}
          style={[styles.intro, { backgroundColor: theme.colors.primaryContainer }]}>
          <View style={styles.introIcon}>
            <AppIcon name="checkout" size={24} color={theme.colors.onPrimaryContainer} />
          </View>
          <View style={styles.introCopy}>
            <Text variant="titleMedium" style={{ color: theme.colors.onPrimaryContainer }}>
              Shop owner inbox
            </Text>
            <Text variant="bodyMedium" style={{ color: theme.colors.onPrimaryContainer }}>
              Review every order, confirm it, and move it through the kitchen workflow.
            </Text>
          </View>
          {pendingOrderCount > 0 ? (
            <Chip compact icon="bell-ring-outline" style={styles.pendingChip}>
              {pendingOrderCount} new
            </Chip>
          ) : null}
        </Surface>

        {orders.length === 0 ? (
          <Surface
            elevation={0}
            style={[styles.empty, { backgroundColor: theme.colors.surfaceVariant }]}>
            <AppIcon name="checkout" size={42} color={theme.colors.onSurfaceVariant} />
            <Text variant="titleMedium">No incoming orders yet</Text>
            <Text
              variant="bodyMedium"
              style={[styles.emptyCopy, { color: theme.colors.onSurfaceVariant }]}>
              New customer orders will appear here for the Nour Sweets team.
            </Text>
            <Button mode="contained-tonal" icon={iconSource('store')} onPress={() => router.navigate('/')}>
              Back to menu
            </Button>
          </Surface>
        ) : (
          orders.map((order) => (
            <OrderCard key={order.id} order={order} onStatusChange={updateOrderStatus} />
          ))
        )}
      </ScrollView>
    </View>
  );
}

function OrderCard({
  order,
  onStatusChange,
}: {
  order: Order;
  onStatusChange: (orderId: string, status: OrderStatus) => void;
}) {
  const theme = useTheme();
  const nextAction = NEXT_STATUS[order.status];
  const statusColor = order.status === 'declined' ? theme.colors.error : theme.colors.primary;
  const statusContainer = order.status === 'declined' ? theme.colors.errorContainer : theme.colors.secondaryContainer;
  const placedAt = new Date(order.placedAt);

  return (
    <Surface elevation={1} style={[styles.orderCard, { backgroundColor: theme.colors.surface }]}>
      <View style={styles.orderHeader}>
        <View style={styles.orderHeading}>
          <Text variant="titleMedium">{order.reference}</Text>
          <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
            {placedAt.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
          </Text>
        </View>
        <Chip compact textStyle={{ color: statusColor }} style={{ backgroundColor: statusContainer }}>
          {STATUS_LABELS[order.status]}
        </Chip>
      </View>

      <Divider />

      <View style={styles.customerRow}>
        <AppIcon name="person" size={20} color={theme.colors.primary} />
        <View style={styles.customerCopy}>
          <Text variant="bodyLarge">{order.customer.name}</Text>
          <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
            {order.customer.phone}
          </Text>
        </View>
        <View style={styles.fulfilment}>
          <AppIcon name={order.customer.address ? 'address' : 'store'} size={18} color={theme.colors.onSurfaceVariant} />
          <Text variant="labelMedium" style={{ color: theme.colors.onSurfaceVariant }}>
            {order.customer.address ? 'Delivery' : 'Collection'}
          </Text>
        </View>
      </View>

      {order.customer.address ? (
        <Text variant="bodyMedium" style={[styles.address, { color: theme.colors.onSurfaceVariant }]}>
          {order.customer.address}
        </Text>
      ) : null}

      <View style={styles.items}>
        <Text variant="labelLarge">Products</Text>
        {order.lines.map((line) => (
          <View key={line.product.id} style={styles.itemRow}>
            <Text variant="bodyMedium" style={styles.itemName} numberOfLines={2}>
              {line.quantity} × {line.product.name}
              {line.product.weight ? ` · ${line.product.weight}` : ''}
            </Text>
            <Text variant="bodyMedium">{formatPrice(line.product.price * line.quantity)}</Text>
          </View>
        ))}
      </View>

      <View style={styles.totalRow}>
        <Text variant="titleMedium">Total · {order.itemCount} items</Text>
        <Text variant="titleLarge" style={{ color: theme.colors.primary }}>
          {formatPrice(order.total)}
        </Text>
      </View>

      {order.status === 'pending' ? (
        <View style={styles.actions}>
          <Button
            mode="contained"
            icon={iconSource('check')}
            style={styles.actionButton}
            onPress={() => onStatusChange(order.id, 'accepted')}>
            Accept order
          </Button>
          <Button
            mode="outlined"
            textColor={theme.colors.error}
            style={styles.actionButton}
            onPress={() => onStatusChange(order.id, 'declined')}>
            Decline
          </Button>
        </View>
      ) : nextAction ? (
        <Button
          mode="contained-tonal"
          icon={iconSource('check')}
          onPress={() => onStatusChange(order.id, nextAction.status)}>
          {nextAction.label}
        </Button>
      ) : null}
    </Surface>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { padding: 16, gap: 16 },
  intro: {
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  introIcon: { paddingTop: 2 },
  introCopy: { flex: 1, gap: 4 },
  pendingChip: { marginTop: 2 },
  empty: {
    minHeight: 300,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 12,
  },
  emptyCopy: { textAlign: 'center', maxWidth: 300 },
  orderCard: { borderRadius: 22, padding: 16, gap: 14 },
  orderHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  orderHeading: { flex: 1, gap: 3 },
  customerRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  customerCopy: { flex: 1, gap: 2 },
  fulfilment: { alignItems: 'center', gap: 3 },
  address: { marginLeft: 30 },
  items: { gap: 9 },
  itemRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  itemName: { flex: 1 },
  totalRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  actions: { flexDirection: 'row', gap: 10 },
  actionButton: { flex: 1 },
});
