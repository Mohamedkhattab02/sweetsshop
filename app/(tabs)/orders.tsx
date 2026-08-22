import { useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppIcon } from '@/components/ui/app-icon';
import { GSPressable } from '@/components/ui/gluestack';
import { ModernHeader } from '@/components/ui/modern-header';
import { colors, fonts, radii, shadow } from '@/constants/design';
import { formatPrice } from '@/constants/market';
import { responsive } from '@/constants/responsive';
import type { DeliveryStatus, Order, OrderStatus } from '@/store/cart';
import { useCart } from '@/store/cart';

const statusLabels: Record<OrderStatus, string> = {
  pending: 'Awaiting confirmation',
  accepted: 'Confirmed',
  preparing: 'Being prepared',
  ready: 'Ready for collection',
  completed: 'Completed',
  declined: 'Declined',
};

const statusColors: Record<OrderStatus, { background: string; text: string }> = {
  pending: { background: '#FFF0D8', text: '#A66B20' },
  accepted: { background: colors.sage, text: colors.ink },
  preparing: { background: '#E3EEF7', text: '#3C6C92' },
  ready: { background: '#E8DDF4', text: '#76518F' },
  completed: { background: colors.cloud, text: colors.inkSoft },
  declined: { background: '#FBE1DE', text: colors.danger },
};
const deliveryLabels: Record<DeliveryStatus, string> = { unassigned: 'Finding a courier', claimed: 'Courier assigned', picked_up: 'Picked up', on_the_way: 'On the way', delivered: 'Delivered' };

export default function CustomerOrdersScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { orders, unreadNotificationCount } = useCart();

  return (
    <View style={styles.screen}>
      <ModernHeader
        eyebrow="YOUR NOUR"
        title="Orders"
        subtitle="A little progress is on its way"
        notificationCount={unreadNotificationCount('customer')}
        onNotifications={() => router.push('/notifications?audience=customer' as never)}
        onSwitchRole={() => router.replace('/role-selection' as never)}
      />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.content, responsive.mediumPage, { paddingBottom: insets.bottom + 28 }]}>
        <View style={styles.heroCard}>
          <View style={styles.heroIcon}>
            <AppIcon name="sparkle" size={21} color={colors.gold} />
          </View>
          <View style={styles.heroCopy}>
            <Text style={styles.heroTitle}>Good things take a moment</Text>
            <Text style={styles.heroText}>We prepare every order with a little extra care.</Text>
          </View>
        </View>

        {orders.length === 0 ? (
          <View style={styles.emptyCard}>
            <View style={styles.emptyIcon}>
              <AppIcon name="checkout" size={27} color={colors.ink} />
            </View>
            <Text style={styles.emptyTitle}>Your order story starts here</Text>
            <Text style={styles.emptyText}>Choose something sweet and we’ll keep its journey here.</Text>
            <GSPressable
              onPress={() => router.replace('/(tabs)' as never)}
              accessibilityRole="button"
              style={styles.primaryButton as never}>
              <Text style={styles.primaryButtonText}>Explore the menu</Text>
              <AppIcon name="chevronDown" size={16} color={colors.white} style={styles.arrow} />
            </GSPressable>
          </View>
        ) : (
          <View style={styles.list}>
            <View style={styles.listHeading}>
              <Text style={styles.sectionTitle}>Your latest</Text>
              <Text style={styles.count}>{orders.length} orders</Text>
            </View>
            {orders.map((order, index) => (
              <Animated.View key={order.id} entering={FadeInDown.delay(index * 60).duration(450)}>
                <OrderCard order={order} onPress={() => router.push(`/order/${order.id}` as never)} />
              </Animated.View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

function OrderCard({ order, onPress }: { order: Order; onPress: () => void }) {
  const status = statusColors[order.status];
  const date = new Date(order.placedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });

  return (
    <GSPressable onPress={onPress} className="active:opacity-75" style={[styles.orderCard, shadow.card] as never}>
      <View style={styles.orderTop}>
        <View>
          <Text style={styles.reference}>{order.reference}</Text>
          <Text style={styles.date}>{date} · {order.itemCount} {order.itemCount === 1 ? 'item' : 'items'}</Text>
        </View>
        <View style={[styles.statusPill, { backgroundColor: status.background }]}>
          <Text style={[styles.statusText, { color: status.text }]}>{statusLabels[order.status]}</Text>
        </View>
      </View>
      <View style={styles.orderBottom}>
        <Text numberOfLines={1} style={styles.itemsText}>{order.lines.map((line) => line.product.name).join(' · ')}</Text>
        <Text style={styles.total}>{formatPrice(order.total)}</Text>
        <AppIcon name="chevronDown" size={15} color={colors.inkSoft} style={styles.arrow} />
      </View>
      {order.fulfillment === 'delivery' ? <View style={styles.deliveryRow}><AppIcon name="address" size={14} color={colors.coralDark} /><Text style={styles.deliveryText}>{order.courierName ?? 'Courier delivery'} · {deliveryLabels[order.deliveryStatus ?? 'unassigned']}</Text></View> : null}
    </GSPressable>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.paper },
  content: { paddingHorizontal: 20, paddingTop: 20, gap: 18 },
  heroCard: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.ink, borderRadius: 18, padding: 18 },
  heroIcon: { width: 44, height: 44, borderRadius: 16, backgroundColor: '#2B4840', alignItems: 'center', justifyContent: 'center' },
  heroCopy: { flex: 1, gap: 3 },
  heroTitle: { color: colors.white, fontFamily: fonts.bold, fontSize: 15 },
  heroText: { color: '#C5D2CB', fontFamily: fonts.medium, fontSize: 12, lineHeight: 18 },
  emptyCard: { alignItems: 'center', backgroundColor: colors.white, borderRadius: radii.card, borderWidth: 1, borderColor: colors.line, padding: 30, gap: 10, ...shadow.card },
  emptyIcon: { width: 60, height: 60, borderRadius: 22, backgroundColor: colors.sage, alignItems: 'center', justifyContent: 'center', marginBottom: 5 },
  emptyTitle: { color: colors.ink, fontFamily: fonts.extraBold, fontSize: 19, textAlign: 'center' },
  emptyText: { color: colors.inkSoft, fontFamily: fonts.medium, fontSize: 13, lineHeight: 20, textAlign: 'center', maxWidth: 290 },
  primaryButton: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: colors.coral, borderRadius: radii.button, paddingHorizontal: 15, paddingVertical: 12, marginTop: 6 },
  primaryButtonText: { color: colors.white, fontFamily: fonts.bold, fontSize: 12 },
  arrow: { transform: [{ rotate: '-90deg' }] },
  list: { gap: 11 },
  listHeading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 },
  sectionTitle: { color: colors.ink, fontFamily: fonts.extraBold, fontSize: 22 },
  count: { color: colors.inkSoft, fontFamily: fonts.medium, fontSize: 11 },
  orderCard: { backgroundColor: colors.white, borderRadius: radii.card, borderWidth: 1, borderColor: colors.line, padding: 16, gap: 15 },
  orderTop: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 },
  reference: { color: colors.ink, fontFamily: fonts.bold, fontSize: 15 },
  date: { color: colors.inkSoft, fontFamily: fonts.medium, fontSize: 11, marginTop: 3 },
  statusPill: { borderRadius: radii.pill, paddingHorizontal: 9, paddingVertical: 6, maxWidth: 145 },
  statusText: { fontFamily: fonts.bold, fontSize: 10, textAlign: 'center' },
  orderBottom: { flexDirection: 'row', alignItems: 'center', gap: 8, borderTopWidth: 1, borderTopColor: colors.line, paddingTop: 12 },
  itemsText: { color: colors.inkSoft, fontFamily: fonts.medium, fontSize: 12, flex: 1 },
  total: { color: colors.coralDark, fontFamily: fonts.extraBold, fontSize: 14 },
  deliveryRow: { flexDirection: 'row', alignItems: 'center', gap: 7, backgroundColor: colors.cream, borderRadius: 11, paddingHorizontal: 9, paddingVertical: 8 },
  deliveryText: { color: colors.inkSoft, fontFamily: fonts.medium, fontSize: 10, flex: 1 },
});
