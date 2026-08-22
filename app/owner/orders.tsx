import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppIcon } from '@/components/ui/app-icon';
import { GSPressable } from '@/components/ui/gluestack';
import { ModernHeader } from '@/components/ui/modern-header';
import { colors, radii, shadow } from '@/constants/design';
import { formatPrice } from '@/constants/market';
import { responsive } from '@/constants/responsive';
import type { DeliveryStatus, Order, OrderStatus } from '@/store/cart';
import { useCart } from '@/store/cart';

const filters: { id: 'all' | OrderStatus; label: string }[] = [
  { id: 'all', label: 'All orders' },
  { id: 'pending', label: 'To review' },
  { id: 'preparing', label: 'In kitchen' },
  { id: 'ready', label: 'Ready' },
];

const labels: Record<OrderStatus, string> = { pending: 'Needs review', accepted: 'Accepted', preparing: 'In kitchen', ready: 'Ready', completed: 'Completed', declined: 'Declined' };
const deliveryLabels: Record<DeliveryStatus, string> = { unassigned: 'Waiting for courier', claimed: 'Courier accepted', picked_up: 'Picked up', on_the_way: 'On the way', delivered: 'Handed to customer' };
const colorsByStatus: Record<OrderStatus, { bg: string; text: string }> = { pending: { bg: '#FFF0D8', text: '#A66B20' }, accepted: { bg: colors.sage, text: colors.ink }, preparing: { bg: '#E3EEF7', text: '#3C6C92' }, ready: { bg: '#E8DDF4', text: '#76518F' }, completed: { bg: colors.cloud, text: colors.inkSoft }, declined: { bg: '#FBE1DE', text: colors.danger } };

export default function OwnerOrdersScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { orders, pendingOrderCount, updateOrderStatus, unreadNotificationCount } = useCart();
  const [filter, setFilter] = useState<'all' | OrderStatus>('all');
  const visible = useMemo(() => filter === 'all' ? orders : orders.filter((order) => order.status === filter), [filter, orders]);
  const inKitchen = orders.filter((order) => order.status === 'accepted' || order.status === 'preparing').length;
  const ready = orders.filter((order) => order.status === 'ready').length;

  return (
    <View style={styles.screen}>
      <ModernHeader eyebrow="OWNER WORKSPACE" title="Orders" subtitle={pendingOrderCount ? `${pendingOrderCount} waiting for your review` : 'Your kitchen flow at a glance'} notificationCount={unreadNotificationCount('owner')} onNotifications={() => router.push('/notifications?audience=owner' as never)} onSwitchRole={() => router.replace('/role-selection' as never)} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.content, responsive.mediumPage, { paddingBottom: insets.bottom + 28 }]}>
        <View style={styles.flowSummary}>
          <FlowStat label="To review" value={pendingOrderCount} icon="checkout" tone="coral" />
          <View style={styles.flowDivider} />
          <FlowStat label="In kitchen" value={inKitchen} icon="clock" tone="gold" />
          <View style={styles.flowDivider} />
          <FlowStat label="Ready" value={ready} icon="checkCircle" tone="sage" />
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}>{filters.map((item) => <GSPressable key={item.id} onPress={() => setFilter(item.id)} style={[styles.filter, filter === item.id && styles.filterActive] as never}><Text style={[styles.filterText, filter === item.id && styles.filterTextActive]}>{item.label}{item.id === 'pending' && pendingOrderCount ? ` · ${pendingOrderCount}` : ''}</Text></GSPressable>)}</ScrollView>
        {visible.length === 0 ? <View style={styles.empty}><View style={styles.emptyIcon}><AppIcon name="checkout" size={27} color={colors.ink} /></View><Text style={styles.emptyTitle}>{orders.length === 0 ? 'The inbox is quiet' : 'Nothing in this view'}</Text><Text style={styles.emptyText}>{orders.length === 0 ? 'Customer orders will arrive here as soon as someone places one.' : 'Try another status filter to see more of the kitchen flow.'}</Text></View> : <View style={styles.list}>{visible.map((order, index) => <Animated.View key={order.id} entering={FadeInDown.delay(index * 55).duration(420)}><OwnerOrderCard order={order} onStatus={updateOrderStatus} onPress={() => router.push(`/order/${order.id}` as never)} /></Animated.View>)}</View>}
      </ScrollView>
    </View>
  );
}

function FlowStat({ label, value, icon, tone }: { label: string; value: number; icon: 'checkout' | 'clock' | 'checkCircle'; tone: 'coral' | 'gold' | 'sage' }) {
  const background = { coral: colors.cream, gold: '#FFF0D8', sage: colors.sage }[tone];
  return <View style={styles.flowStat}><View style={[styles.flowIcon, { backgroundColor: background }]}><AppIcon name={icon} size={18} color={colors.ink} /></View><View><Text style={styles.flowValue}>{value}</Text><Text style={styles.flowLabel}>{label}</Text></View></View>;
}

function OwnerOrderCard({ order, onStatus, onPress }: { order: Order; onStatus: (id: string, status: OrderStatus) => void; onPress: () => void }) {
  const status = colorsByStatus[order.status];
  const next: Partial<Record<OrderStatus, { status: OrderStatus; label: string }>> = { accepted: { status: 'preparing', label: 'Start preparing' }, preparing: { status: 'ready', label: 'Mark ready' }, ready: { status: 'completed', label: 'Complete order' } };
  const nextAction = order.fulfillment === 'delivery' && order.status === 'ready' && order.deliveryStatus !== 'delivered' ? undefined : next[order.status];
  return <View style={[styles.orderCard, shadow.card]}><GSPressable onPress={onPress} className="active:opacity-75" style={styles.orderPress as never}><View style={styles.orderTop}><View style={styles.orderCopy}><Text style={styles.customer}>{order.customer.name}</Text><Text style={styles.reference}>{order.reference} · {new Date(order.placedAt).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}</Text></View><View style={[styles.statusPill, { backgroundColor: status.bg }]}><Text style={[styles.statusText, { color: status.text }]}>{labels[order.status]}</Text></View></View><View style={styles.detailsRow}><Text style={styles.items} numberOfLines={1}>{order.lines.map((line) => `${line.quantity}× ${line.product.name}`).join(' · ')}</Text><Text style={styles.total}>{formatPrice(order.total)}</Text></View><View style={styles.fulfillmentRow}><AppIcon name={order.fulfillment === 'delivery' ? 'address' : 'store'} size={14} color={colors.coralDark} /><Text style={styles.fulfillmentText}>{order.fulfillment === 'delivery' ? `${order.courierName ?? 'Waiting for courier'} · ${deliveryLabels[order.deliveryStatus ?? 'unassigned']}` : 'Pickup at Nour counter'}</Text></View>{order.courierLocation ? <Text style={styles.locationText}>Live location: {order.courierLocation.latitude.toFixed(4)}, {order.courierLocation.longitude.toFixed(4)}</Text> : null}</GSPressable>{order.status === 'pending' ? <View style={styles.actions}><GSPressable onPress={() => onStatus(order.id, 'accepted')} style={styles.accept as never}><AppIcon name="check" size={15} color={colors.white} /><Text style={styles.acceptText}>Accept order</Text></GSPressable><GSPressable onPress={() => onStatus(order.id, 'declined')} style={styles.decline as never}><Text style={styles.declineText}>Decline</Text></GSPressable></View> : nextAction ? <GSPressable onPress={() => onStatus(order.id, nextAction.status)} style={styles.next as never}><Text style={styles.nextText}>{nextAction.label}</Text><AppIcon name="chevronDown" size={15} color={colors.ink} style={styles.arrow} /></GSPressable> : null}</View>;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.paper },
  content: { paddingHorizontal: 20, paddingTop: 8, gap: 15 },
  flowSummary: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.white, borderRadius: 22, padding: 13, ...shadow.card },
  flowStat: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
  flowIcon: { width: 38, height: 38, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  flowValue: { color: colors.ink, fontSize: 18, fontWeight: '900' },
  flowLabel: { color: colors.inkSoft, fontSize: 9, marginTop: 1 },
  flowDivider: { width: 1, height: 36, backgroundColor: colors.line },
  filters: { gap: 8, paddingRight: 20 },
  filter: { borderRadius: radii.pill, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.line, paddingHorizontal: 13, paddingVertical: 10 },
  filterActive: { backgroundColor: colors.ink, borderColor: colors.ink },
  filterText: { color: colors.inkSoft, fontSize: 11, fontWeight: '700' },
  filterTextActive: { color: colors.white },
  list: { gap: 11 },
  orderCard: { backgroundColor: colors.white, borderRadius: 21, padding: 14, gap: 13 },
  orderPress: { gap: 13 },
  orderTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 },
  orderCopy: { flex: 1, gap: 3 },
  customer: { color: colors.ink, fontSize: 15, fontWeight: '800' },
  reference: { color: colors.inkSoft, fontSize: 10 },
  statusPill: { borderRadius: radii.pill, paddingHorizontal: 9, paddingVertical: 6, maxWidth: 110 },
  statusText: { fontSize: 9, fontWeight: '800', textAlign: 'center' },
  detailsRow: { flexDirection: 'row', alignItems: 'center', gap: 9, borderTopWidth: 1, borderTopColor: colors.line, paddingTop: 11 },
  items: { color: colors.inkSoft, fontSize: 11, flex: 1 },
  total: { color: colors.coralDark, fontSize: 14, fontWeight: '900' },
  fulfillmentRow: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  fulfillmentText: { color: colors.inkSoft, fontSize: 10, flex: 1 },
  locationText: { color: colors.inkSoft, fontSize: 9, paddingLeft: 21 },
  actions: { flexDirection: 'row', gap: 8 },
  accept: { flex: 1, height: 42, borderRadius: 13, backgroundColor: colors.ink, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  acceptText: { color: colors.white, fontSize: 11, fontWeight: '800' },
  decline: { height: 42, borderRadius: 13, borderWidth: 1, borderColor: '#F0C2BC', paddingHorizontal: 14, alignItems: 'center', justifyContent: 'center' },
  declineText: { color: colors.coralDark, fontSize: 11, fontWeight: '800' },
  next: { height: 42, borderRadius: 13, backgroundColor: colors.sage, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  nextText: { color: colors.ink, fontSize: 11, fontWeight: '800' },
  arrow: { transform: [{ rotate: '-90deg' }] },
  empty: { alignItems: 'center', backgroundColor: colors.white, borderRadius: 24, padding: 28, gap: 9, ...shadow.card },
  emptyIcon: { width: 60, height: 60, borderRadius: 22, backgroundColor: colors.sage, alignItems: 'center', justifyContent: 'center' },
  emptyTitle: { color: colors.ink, fontSize: 18, fontWeight: '800' },
  emptyText: { color: colors.inkSoft, fontSize: 12, lineHeight: 18, textAlign: 'center', maxWidth: 270 },
});
