import { useRouter } from 'expo-router';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { Platform, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppIcon } from '@/components/ui/app-icon';
import { GSPressable } from '@/components/ui/gluestack';
import { ModernHeader } from '@/components/ui/modern-header';
import { colors, radii, shadow } from '@/constants/design';
import { formatPrice } from '@/constants/market';
import { responsive } from '@/constants/responsive';
import { useCart } from '@/store/cart';
import { useProducts } from '@/store/products';

export default function OwnerDashboardScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const desktop = Platform.OS === 'web' && width >= 1180;
  const { products } = useProducts();
  const { orders, pendingOrderCount, unreadNotificationCount } = useCart();
  const revenue = orders.filter((order) => order.status !== 'declined').reduce((sum, order) => sum + order.total, 0);
  const lowStock = products.filter((product) => product.stockQuantity > 0 && product.stockQuantity < 5).length;

  return (
    <View style={styles.screen}>
      <ModernHeader eyebrow="OWNER WORKSPACE" title="Good morning, User" subtitle="Here’s the sweet little picture today" notificationCount={unreadNotificationCount('owner')} onNotifications={() => router.push('/notifications?audience=owner' as never)} onSwitchRole={() => router.replace('/role-selection' as never)} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.content, responsive.page, { paddingBottom: insets.bottom + 28 }]}>
        <View style={[styles.overviewGrid, desktop && styles.overviewGridDesktop]}>
        <Animated.View entering={FadeInUp.duration(600)} style={[styles.missionCard, desktop && styles.missionCardDesktop]}>
          <View style={styles.missionTop}><View style={styles.statusPill}><View style={styles.liveDot} /><Text style={styles.statusText}>STORE ONLINE</Text></View><AppIcon name="sparkle" size={19} color={colors.gold} /></View>
          <Text style={[styles.missionTitle, desktop && styles.missionTitleDesktop]}>The counter is ready{`\n`}for a beautiful day.</Text>
          <Text style={styles.missionSub}>Keep the shelves full and the orders moving.</Text>
          <GSPressable onPress={() => router.push('/owner/catalog' as never)} style={styles.missionButton as never}><Text style={styles.missionButtonText}>Manage today’s menu</Text><AppIcon name="chevronDown" size={16} color={colors.ink} style={styles.arrow} /></GSPressable>
        </Animated.View>

        <View style={[styles.pulseColumn, desktop && styles.pulseColumnDesktop]}>
        <View style={styles.sectionHeading}><View><Text style={styles.kicker}>AT A GLANCE</Text><Text style={styles.title}>Today’s pulse</Text></View><Text style={styles.timestamp}>Updated just now</Text></View>
        <View style={styles.metricsGrid}>
          <MetricCard label="To review" value={String(pendingOrderCount)} helper="orders waiting" icon="checkout" tone="coral" />
          <MetricCard label="Revenue" value={formatPrice(revenue)} helper="all orders" icon="tag" tone="sage" />
          <MetricCard label="On the menu" value={String(products.length)} helper="sweet varieties" icon="store" tone="cream" />
          <MetricCard label="Low stock" value={String(lowStock)} helper="need attention" icon="info" tone="gold" />
        </View>

        <Animated.View entering={FadeInDown.delay(120).duration(500)} style={[styles.attentionCard, pendingOrderCount > 0 && styles.attentionHot]}>
          <View style={styles.attentionIcon}><AppIcon name={pendingOrderCount > 0 ? 'checkout' : 'checkCircle'} size={21} color={pendingOrderCount > 0 ? colors.coralDark : colors.ink} /></View>
          <View style={styles.attentionCopy}><Text style={styles.attentionTitle}>{pendingOrderCount > 0 ? `${pendingOrderCount} order${pendingOrderCount === 1 ? '' : 's'} need your eyes` : 'You’re all caught up'}</Text><Text style={styles.attentionText}>{pendingOrderCount > 0 ? 'Review, accept, and keep the kitchen moving.' : 'New orders will land here as customers shop.'}</Text></View>
          <GSPressable onPress={() => router.push('/owner/orders' as never)} style={styles.attentionArrow as never}><AppIcon name="chevronDown" size={17} color={colors.ink} style={styles.arrow} /></GSPressable>
        </Animated.View>
        </View>
        </View>

        <View style={[styles.lowerGrid, desktop && styles.lowerGridDesktop]}>
        <View style={styles.shortcutColumn}>
        <View style={styles.sectionHeading}><View><Text style={styles.kicker}>SHORTCUTS</Text><Text style={styles.title}>Make a move</Text></View></View>
        <View style={styles.quickGrid}><QuickAction icon="addProduct" label="Add sweet" sub="New to the counter" onPress={() => router.push('/owner/add-product' as never)} /><QuickAction icon="tag" label="Stock check" sub={`${lowStock} items low`} onPress={() => router.push('/owner/catalog' as never)} /><QuickAction icon="sparkle" label="Insights" sub="See what’s moving" onPress={() => router.push('/owner/analytics' as never)} /></View>
        </View>

        <View style={styles.ordersColumn}>
        <View style={styles.sectionHeading}><View><Text style={styles.kicker}>RECENTLY</Text><Text style={styles.title}>Latest orders</Text></View><GSPressable onPress={() => router.push('/owner/orders' as never)} style={styles.viewAll as never}><Text style={styles.viewAllText}>View all</Text></GSPressable></View>
        {orders.slice(0, 3).map((order, index) => <Animated.View key={order.id} entering={FadeInDown.delay(180 + index * 60).duration(450)}><RecentOrder reference={order.reference} customer={order.customer.name} total={order.total} status={order.status} onPress={() => router.push(`/order/${order.id}` as never)} /></Animated.View>)}
        {orders.length === 0 ? <View style={styles.noOrders}><Text style={styles.noOrdersText}>Your first order will appear here.</Text></View> : null}
        </View>
        </View>
      </ScrollView>
    </View>
  );
}

function MetricCard({ label, value, helper, icon, tone }: { label: string; value: string; helper: string; icon: 'checkout' | 'tag' | 'store' | 'info'; tone: 'coral' | 'sage' | 'cream' | 'gold' }) {
  const toneColor = { coral: colors.cream, sage: colors.sage, cream: colors.cloud, gold: '#FFF0D8' }[tone];
  return <View style={styles.metric}><View style={[styles.metricIcon, { backgroundColor: toneColor }]}><AppIcon name={icon} size={17} color={colors.ink} /></View><Text style={styles.metricLabel}>{label}</Text><Text style={styles.metricValue}>{value}</Text><Text style={styles.metricHelper}>{helper}</Text></View>;
}

function QuickAction({ icon, label, sub, onPress }: { icon: 'addProduct' | 'tag' | 'sparkle'; label: string; sub: string; onPress: () => void }) {
  return <GSPressable onPress={onPress} className="active:opacity-75" style={styles.quickAction as never}><View style={styles.quickIcon}><AppIcon name={icon} size={19} color={colors.coralDark} /></View><Text style={styles.quickLabel}>{label}</Text><Text style={styles.quickSub}>{sub}</Text></GSPressable>;
}

function RecentOrder({ reference, customer, total, status, onPress }: { reference: string; customer: string; total: number; status: string; onPress: () => void }) {
  return <GSPressable onPress={onPress} className="active:opacity-75" style={styles.recentOrder as never}><View style={styles.avatar}><Text style={styles.avatarText}>{customer.charAt(0).toUpperCase()}</Text></View><View style={styles.recentCopy}><Text style={styles.recentName}>{customer}</Text><Text style={styles.recentMeta}>{reference} · {status}</Text></View><Text style={styles.recentTotal}>{formatPrice(total)}</Text><AppIcon name="chevronDown" size={14} color={colors.inkSoft} style={styles.arrow} /></GSPressable>;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.paper },
  content: { paddingHorizontal: 20, paddingTop: 8, gap: 18 },
  overviewGrid: { gap: 18 },
  overviewGridDesktop: { flexDirection: 'row', alignItems: 'stretch', gap: 22, paddingTop: 16 },
  missionCard: { backgroundColor: colors.ink, borderRadius: 25, padding: 19, gap: 9, ...shadow.floating },
  missionCardDesktop: { flex: 0.72, minHeight: 325, justifyContent: 'flex-end', padding: 28, borderRadius: 29 },
  pulseColumn: { gap: 18 },
  pulseColumnDesktop: { flex: 1.28 },
  missionTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  statusPill: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#2B4840', borderRadius: radii.pill, paddingHorizontal: 9, paddingVertical: 6 },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#9DE4AD' },
  statusText: { color: '#D3E9DA', fontSize: 9, fontWeight: '900', letterSpacing: 1 },
  missionTitle: { color: colors.white, fontFamily: 'Georgia', fontSize: 29, lineHeight: 31, fontWeight: '700', marginTop: 8, letterSpacing: -0.5 },
  missionTitleDesktop: { fontSize: 39, lineHeight: 41, letterSpacing: -1.1 },
  missionSub: { color: '#B8C9C0', fontSize: 12, marginBottom: 4 },
  missionButton: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: colors.gold, borderRadius: 14, paddingHorizontal: 13, paddingVertical: 10 },
  missionButtonText: { color: colors.ink, fontSize: 11, fontWeight: '800' },
  arrow: { transform: [{ rotate: '-90deg' }] },
  sectionHeading: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: 1 },
  kicker: { color: colors.coralDark, fontSize: 10, fontWeight: '900', letterSpacing: 1.4, marginBottom: 4 },
  title: { color: colors.ink, fontSize: 22, fontWeight: '800', letterSpacing: -0.5 },
  timestamp: { color: colors.inkSoft, fontSize: 10, paddingBottom: 3 },
  metricsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 11 },
  metric: { width: Platform.OS === 'web' ? '47%' : '48%', flexGrow: 1, minHeight: 127, backgroundColor: colors.white, borderRadius: 20, padding: 13, ...shadow.card },
  metricIcon: { width: 33, height: 33, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 9 },
  metricLabel: { color: colors.inkSoft, fontSize: 11 },
  metricValue: { color: colors.ink, fontSize: 23, fontWeight: '900', marginTop: 2 },
  metricHelper: { color: colors.inkSoft, fontSize: 10, marginTop: 2 },
  attentionCard: { flexDirection: 'row', alignItems: 'center', gap: 11, backgroundColor: colors.sage, borderRadius: 20, padding: 13 },
  attentionHot: { backgroundColor: colors.cream },
  attentionIcon: { width: 39, height: 39, borderRadius: 14, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center' },
  attentionCopy: { flex: 1, gap: 3 },
  attentionTitle: { color: colors.ink, fontSize: 13, fontWeight: '800' },
  attentionText: { color: colors.inkSoft, fontSize: 10, lineHeight: 15 },
  attentionArrow: { width: 30, height: 30, alignItems: 'center', justifyContent: 'center' },
  lowerGrid: { gap: 18 },
  lowerGridDesktop: { flexDirection: 'row', alignItems: 'flex-start', gap: 22 },
  shortcutColumn: { flex: 0.82, gap: 12 },
  ordersColumn: { flex: 1.18, gap: 10 },
  quickGrid: { flexDirection: 'row', gap: 10 },
  quickAction: { flex: 1, minHeight: 112, backgroundColor: colors.white, borderRadius: 19, padding: 11, ...shadow.card },
  quickIcon: { width: 32, height: 32, borderRadius: 11, backgroundColor: colors.cream, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  quickLabel: { color: colors.ink, fontSize: 12, fontWeight: '800' },
  quickSub: { color: colors.inkSoft, fontSize: 9, lineHeight: 13, marginTop: 3 },
  viewAll: { padding: 5 },
  viewAllText: { color: colors.coralDark, fontSize: 12, fontWeight: '800' },
  recentOrder: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: colors.white, borderRadius: 18, padding: 11, ...shadow.card },
  avatar: { width: 37, height: 37, borderRadius: 13, backgroundColor: colors.sage, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: colors.ink, fontSize: 14, fontWeight: '900' },
  recentCopy: { flex: 1, gap: 3 },
  recentName: { color: colors.ink, fontSize: 12, fontWeight: '800' },
  recentMeta: { color: colors.inkSoft, fontSize: 10 },
  recentTotal: { color: colors.coralDark, fontSize: 13, fontWeight: '800' },
  noOrders: { backgroundColor: colors.white, borderRadius: 18, padding: 18 },
  noOrdersText: { color: colors.inkSoft, fontSize: 12, textAlign: 'center' },
});
